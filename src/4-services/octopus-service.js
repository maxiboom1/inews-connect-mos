import sqlService from "./sql-service.js";
import cache from "../2-cache/cache.js";
import ackService from "./ack-service.js";
import logger from "../3-utilities/logger.js";
import itemsService from "./items-service.js";
import deleteManager from "../3-utilities/delete-manager.js";
import normalize from "../3-utilities/normalize.js";
import appConfig from "../3-utilities/app-config.js";

const prependSeparator = appConfig.prependSeparator;
const prependStringForEmptyPageNumber = appConfig.prependStringForEmptyPageNumber;


// MOS 2.8.5
class OctopusProcessor {
    
    // Triggered from roList, appendStory and insertStory
    async handleNewStory(story) {        
    
        // Add props to story
        story = await this.constructStory(story);
        
        // Store story in DB, and save assigned uid
        story.uid = await sqlService.addDbStory(story);

        // Clear meta form story items, and save story to cache
        await cache.saveStory(normalize.removeItemsMeta(story));
        
        // Save Items of the story to DB
        await itemsService.registerItems(story);

        // Update last updates to story and rundown
        await sqlService.rundownLastUpdate(story.roID);

        logger(`[STORY] Registering new story to {${story.roID}}: {${story.storySlug}}`);
        
    }

    async insertStory(msg) {
        const roID = msg.mos.roStoryInsert.roID;
        const targetStoryID = msg.mos.roStoryInsert.storyID; // the inserted story is ABOVE this story
        const story = msg.mos.roStoryInsert.story;

        const targetOrd = await sqlService.getStoryOrdByStoryID(targetStoryID);// Why use sql and not cache?? need to chack this
        const storyIDsArr = await cache.getSortedStoriesIdArrByOrd(roID, targetOrd);            

        for(let i = 0; i<storyIDsArr.length; i++){
            const newStoryOrder = targetOrd + i + 1;
            await cache.modifyStoryOrd(roID, storyIDsArr[i], newStoryOrder);
            await sqlService.modifyBbStoryOrd(roID, storyIDsArr[i], newStoryOrder);                 
        }

        story.ord = targetOrd;
        story.roID = roID;
        
        // Store new story and its items
        await this.handleNewStory(story); 
        ackService.sendAck(roID);
    }

    // Done, Alex.
    async appendStory(msg) {
        const roID = msg.mos.roStoryAppend.roID; 
        const story = msg.mos.roStoryAppend.story; 
        story.roID = roID;
        const storiesLength = await cache.getRundownLength(story.roID);            
        story.ord = storiesLength === 0? 0: storiesLength;        
        
        // If for some reason item is missing
        if(!story.item) {
            ackService.sendAck(roID);
            logger("[STORY] Ignored - empty storyAppend report", "yellow");
            return;
        }

        // Store new story and its items
        await this.handleNewStory(story); 
        ackService.sendAck(roID);
    }    
    
    async deleteStoriesHandler(msg){
        const roID = msg.mos.roStoryDelete.roID;
        // Handle case when more than 1 story deleted
        const deletedArr = Array.isArray(msg.mos.roStoryDelete.storyID) ? msg.mos.roStoryDelete.storyID: [msg.mos.roStoryDelete.storyID];
        
        for(const deletedID of deletedArr){
            const stories = await cache.getRundown(roID); 
            await this.deleteStory(roID, stories, deletedID);
        }

        // Update rundown last update
        await sqlService.rundownLastUpdate(roID);
        // Send ack to mos
        ackService.sendAck(roID);
 
    }
    
    // Done, Alex.
    async deleteStory(roID, stories, deletedID) {
        const deletedOrd = stories[deletedID].ord;

        // Run over all stories in RD, delete/reorder 
        for (const storyID in stories) {
            const currentOrd = stories[storyID].ord;

            if(currentOrd < deletedOrd ) continue;
            
            if(currentOrd === deletedOrd){
                await deleteManager.deleteItemByStoryUid(roID, deletedID ,stories[deletedID].uid);
                await cache.deleteStory(roID, deletedID);
                await sqlService.deleteStory(roID, stories[storyID].uid);
                logger(`[STORY] Story {${stories[storyID].name}} has been deleted, and all included items delete scheduled.`);

            } else { 
                // decrement story id in sql and cache
                await cache.modifyStoryOrd(roID, storyID, currentOrd-1);
                await sqlService.modifyBbStoryOrd(roID, storyID, currentOrd-1); 
            }
        }
    }
    
    // Done, Alex.
    async moveMultiple(msg) {
        const roID = msg.mos.roStoryMoveMultiple.roID;
        const ids = msg.mos.roStoryMoveMultiple.storyID;

        const targetID = String(ids[ids.length - 1] ?? "");
        const moveIDs = ids.slice(0, -1).map(String); // keep message order

        // Load current rundown as { [storyID]: { storyID, ord, ... } }
        const stories = await cache.getRundown(roID);

        // Build current list ordered by ord
        const currentList = Object.values(stories)
            .sort((a, b) => a.ord - b.ord)
            .map(s => String(s.storyID));

        // Validate: drop duplicates and non-existent IDs, keep message order
        const seen = new Set();
        const toMove = moveIDs.filter(id => {
            if (seen.has(id)) return false;
            if (!currentList.includes(id)) return false;
            seen.add(id);
            return true;
        });

        // Nothing to do
        if (toMove.length === 0) {
            ackService.sendAck(roID);
            return;
        }

        // Remove all toMove from currentList
        const remaining = currentList.filter(id => !toMove.includes(id));

        // Compute insertion index (after removals)
        let insertIndex;
        if (targetID === "") {
            insertIndex = remaining.length; // end of list
        } else {
            const idx = remaining.indexOf(targetID);
            // If target is missing (shouldn't happen unless malformed), fall back to end
            insertIndex = idx >= 0 ? idx : remaining.length;
        }

        // Construct the new list (MOS requires toMove in the exact order given)
        const newList = [
            ...remaining.slice(0, insertIndex),
            ...toMove,
            ...remaining.slice(insertIndex)
        ];

        // Write back only changed ords
        for (let i = 0; i < newList.length; i++) {
            const id = newList[i];
            const oldOrd = stories[id].ord;
            if (oldOrd !== i) {
            await this.modifyOrd(roID, id, i);
            }
        }

        ackService.sendAck(roID);
    }

    async replaceStory(msg){
        
        const m = String(msg.mos.roStoryReplace.story.storySlug).split(prependSeparator);
        
        const values = {
            storySlug:m[1],
            storyNum: m[0] === prependStringForEmptyPageNumber ? "": m[0],
            storyID:msg.mos.roStoryReplace.storyID,
            floating: 0
        };
        
        await sqlService.modifyDbStory(values);
        
        ackService.sendAck(msg.mos.roStoryReplace.roID);

    }

// ============================ Helper/common functions ============================ // 

    // Adds to story uid, production, normalizing item for array. Story obj must have "rundownStr" prop!
    async constructStory(story){
        
        if (story.item){
            story.item = Array.isArray(story.item) ? story.item : [story.item];
            // Run over items, and assign ord, also normalize type 1 and 2 (with or without <ncsItem>)
            for(let i = 0; i<story.item.length; i++){
                normalize.normalizeItem(story.item[i]);
                story.item[i].ord = i;
            }
        }
        
        const m = String(story.storySlug).split(prependSeparator);
        const rundownMeta = await cache.getRundownList(story.roID);
        story.roID = rundownMeta.roID;
        story.rundown = String(rundownMeta.uid);
        story.production = rundownMeta.production;
        story.storySlug = m[1];
        story.storyNum = m[0] === prependStringForEmptyPageNumber ? "": m[0];
        story.floating = 0;
        return story;
    }

    async modifyOrd(roID, storyID, ord){
        await cache.modifyStoryOrd(roID, storyID, ord);
        await sqlService.modifyBbStoryOrd(roID, storyID, ord); 
    }

}


const octopusService = new OctopusProcessor();

export default octopusService;
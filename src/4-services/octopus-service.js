import sqlService from "./sql-service.js";
import cache from "../2-cache/cache.js";
import ackService from "./ack-service.js";
import logger from "../3-utilities/logger.js";
import itemsService from "./items-service.js";
import deleteManager from "../3-utilities/delete-manager.js";
import normalize from "../3-utilities/normalize.js";

// MOS 2.8.5
class OctopusProcessor {
    
    // Triggered from roList incoming mos message, and from insert event
    async handleNewStory(story) {        
    
        // Add props to story
        story = await this.constructStory(story);
        
        // Store story in DB, and save assigned uid
        story.uid = await sqlService.addDbStory(story);

        // Create a deep copy of the story object
        const storyCopy = this.removeItemsMeta(story)

        // Clear meta form story items, and save story to cache
        await cache.saveStory(storyCopy);
        
        // Save Items of the story to DB
        await itemsService.registerItems(story);

        // Update last updates to story and rundown
        await sqlService.rundownLastUpdate(story.rundownStr);

        logger(`[STORY] Registering new story to {${story.rundownStr}}: {${story.storySlug}}`);
        
    }

    // Done, Alex.
    async appendStory(msg) {
        const roID = msg.mos.roStoryAppend.roID; 
        const story = msg.mos.roStoryAppend.story; 
        story.rundownStr = cache.getRundownSlugByRoID(roID);
        const storiesLength = await cache.getRundownLength(story.rundownStr);            
        story.ord = storiesLength === 0? 0: storiesLength;
        
        // Store new story and its items
        await this.handleNewStory(story); 
        ackService.sendAck(roID);
    }    
    // Done, Alex.
    async deleteStory(msg) {
        const roID = msg.mos.roStoryDelete.roID; // roID
        const rundownStr = cache.getRundownSlugByRoID(roID); // rundownSlug
        const sourceStoryID = msg.mos.roStoryDelete.storyID; // Deleted story
        const stories = await cache.getRundown(rundownStr); // Get copy of stories
        const deletedOrd = stories[sourceStoryID].ord;

        // Run over all stories in RD, delete/reorder 
        for (const storyID in stories) {
            const currentOrd = stories[storyID].ord;
            
            if(currentOrd < deletedOrd ) continue;
            
            if(currentOrd === deletedOrd){
                await deleteManager.deleteItemByStoryUid(rundownStr, sourceStoryID ,stories[sourceStoryID].uid);
                await cache.deleteStory(rundownStr, sourceStoryID);
                await sqlService.deleteStory(rundownStr, stories[storyID].uid);
                logger(`[STORY] Story {${stories[storyID].name}} has been deleted, and all included items delete scheduled.`);

            } else { 
                // decrement story id in sql and cache
                await cache.modifyStoryOrd(rundownStr, storyID, currentOrd-1);
                await sqlService.modifyBbStoryOrd(rundownStr, stories[storyID].uid, stories[storyID].name, currentOrd-1); 
            }
        }


        // Update rundown last update
        await sqlService.rundownLastUpdate(rundownStr);
        // Send ack to mos
        ackService.sendAck(roID);
    }

    // *************************************** Helper/common functions *************************************** // 

    // Adds to story uid, production, normalizing item for array. Story obj must have "rundownStr" prop!
    async constructStory(story){
        story.item = Array.isArray(story.item) ? story.item : [story.item];

        // Run over items, and assign ord, also normalize type 1 and 2 (with or without <ncsItem>)
        for(let i = 0; i<story.item.length; i++){
            normalize.normalizeItem(story.item[i]);
            story.item[i].ord = i;
        }

        const rundownMeta = await cache.getRundownList(story.rundownStr);
        story.roID = rundownMeta.roID;
        story.rundown = String(rundownMeta.uid);
        story.production = rundownMeta.production;
        story.storySlug = String(story.storySlug);
        story.floating = 0;
        return story;
    }
    
    async modifyOrd(rundownStr, storyID, storyUid,storyName, ord){
        await cache.modifyStoryOrd(rundownStr, storyID, ord);
        await sqlService.modifyBbStoryOrd(rundownStr, storyUid, storyName, ord); 
    }

    propsExtractor(msg){
        const roID = msg.mos.roStoryAppend.roID; 
        const rundownStr = cache.getRundownSlugByRoID(roID); 
        const targetStoryID = msg.mos.roElementAction.element_target.storyID;
        const story = msg.mos.roElementAction.element_source.story; 
        return {roID,rundownStr,targetStoryID,story}
    }

    removeItemsMeta(story){
        
        const storyCopy = JSON.parse(JSON.stringify(story));
         
        if (storyCopy.item && Array.isArray(storyCopy.item)) {
            storyCopy.item.forEach(item => {
                delete item.mosExternalMetadata.data;
                delete item.mosExternalMetadata.scripts;
                delete item.mosExternalMetadata.mosSchema;
                delete item.mosItemEditorProgID;
                delete item.mosItemBrowserProgID;
                delete item.objID;  
            });
        }
        return storyCopy;
    }


}


const octopusService = new OctopusProcessor();

export default octopusService;
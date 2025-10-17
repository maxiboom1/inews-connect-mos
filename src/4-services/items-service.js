import sqlService from "./sql-service.js";
import mosConnector from "../1-dal/mos-connector.js";
import mosCommands from "../3-utilities/mos-cmds.js";
import itemsHash from "../2-cache/items-hashmap.js";
import logger from "../3-utilities/logger.js";
import mosRouter from "./mos-router.js";
import ackService from "./ack-service.js";
import normalize from "../3-utilities/normalize.js";
import cache from "../2-cache/cache.js";
import deleteManager from "../3-utilities/delete-manager.js";

async function registerItems(story) {
    
    const { rundown, uid: storyUid } = story;
    
    let ord = 0;
    
    for (let el of story.item) {
        
        const item = constructItem(el, rundown, storyUid, ord);
        
        if (itemsHash.isUsed(item.uid)) {
            await handleDuplicateItem(item, story, el, ord);
        } else {
            await createNewItem(item, story,el);
        }
        
        ord++;
    }
}

// Done, Alex.
async function replaceItem(msg) {
    const m = msg.mos.roItemReplace;
    const item = constructItem(normalize.normalizeItem(msg.mos.roItemReplace.item));
    await sqlService.updateItem(item);
    await cache.itemUpdate(m.roID,m.storyID, m.itemID, m.item);
    const storyUid = await cache.getStoryUid(m.roID,m.storyID);
    
    // Update last updates
    await sqlService.rundownLastUpdate(m.roID);
    await sqlService.storyLastUpdate(storyUid);
    
    ackService.sendAck(msg.mos.roItemReplace.roID);
}

async function deleteItem(msg) {
    const { roID, storyID, itemID } = msg.mos.roItemDelete;
    
    const story = await cache.getStory(roID, storyID);
    
    //Find index of deleted item
    const idx = story.item.findIndex(i => i.itemID === itemID);
    
    //Removes the element (mutates the array) from stories.item and returns the removed item
    const removed = story.item.splice(idx, 1)[0];

    //Schedule item delete
    await deleteManager.deleteItem(removed.mosExternalMetadata.gfxItem);

    //Compact ord on remaining items
    story.item.sort((a, b) => a.ord - b.ord);
    story.item.forEach((it, i) => { it.ord = i; });

    story.roID      = roID;
    story.storySlug = story.name;
    story.storyNum  = story.number;
    
    await cache.saveStory(story);
    
    // last updates
    await sqlService.rundownLastUpdate(roID);
    await sqlService.storyLastUpdate(story.uid);

    ackService.sendAck(msg.mos.roItemDelete.roID);
}

async function createNewItem(item, story, el) { //Item: {uid, name, production, rundown, story, ord, template, data, scripts}
    
    const result = await sqlService.upsertItem(story.roID, item);
    
    if (result.success) {
        
        itemsHash.registerItem(result.uid); // Register item in hash
        
        // Item was exists in DB ==> Update item
        if(result.event === "update"){
            logger(`[ITEM] New Item {${item.name}} updated in {${story.roID}}`);
        } 

        // Item wasn't exist in DB ==> Restore item
        else if(result.event === "create"){
            logger(`[ITEM] New Item {${item.name}} restored in {${story.roID}}`);
            await sendMosItemReplace(story, el, result.uid, "NEW ITEM");
        }

    
    } else {
        logger(`[ITEM] OPPPS.. Failed to create/update ${item.uid}. Error details: ${result.error}`, "red");
    }

}

async function handleDuplicateItem(item, story, el, ord) {
    //const originalItem = await sqlService.getFullItem(item.uid);

    const duplicate = {
        name: item.name,
        production: item.production,
        rundown: story.rundown,
        story: story.uid,
        ord,
        template: item.template,
        data: item.data,
        scripts: item.scripts,
    };

    const assertedUid = await sqlService.storeNewDuplicate(duplicate);

    itemsHash.registerItem(assertedUid);

    await sendMosItemReplace(story, el, assertedUid, "DUPLICATE");
   
}

function constructItem(item, rundown, storyUid, ord) {
    return { 
        uid: item.mosExternalMetadata.gfxItem,
        name:item.itemSlug,
        production: item.mosExternalMetadata.gfxProduction,
        rundown, 
        story: storyUid, 
        ord,
        template: item.mosExternalMetadata.gfxTemplate,
        data:item.mosExternalMetadata.data,
        scripts: item.mosExternalMetadata.scripts,
        metadata:item.mosExternalMetadata.metadata
    };
}

async function sendMosItemReplace(story, el, assertedUid, action){
    
    const m = mosCommands.mosItemReplace(story, el, assertedUid); // Returns {replaceMosMessage,storyID}
    
    logger(`[ITEM] ${action}: Sending mosItemReplace for item {${assertedUid}}`,"blue");

    mosConnector.sendToClient(m.replaceMosMessage);
    
    // Wait for roAck for sended mosItemReplace
    try {
        await waitForRoAck();
    } catch (error) {
        logger(error.message, "red");
    }

}

function waitForRoAck(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const listener = (msg) => {
            if (msg.mos && msg.mos.roAck) {
                mosRouter.off('roAckMessage', listener);
                logger(`[ITEM] mosItemReplace ack'd`, "green");
                resolve();
            }
        };
        
        const timer = setTimeout(() => {
            mosRouter.off('roAckMessage', listener);
            reject(new Error(`[ITEM] Timeout waiting for roAck `));
        }, timeout);

        mosRouter.on('roAckMessage', listener);
    });
}

export default { registerItems , replaceItem, deleteItem};

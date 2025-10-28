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
    
    // Get deep copy of story (we will mutate it)
    const story = await cache.getStory(roID, storyID);
    
    // Find index of deleted item
    const idx = story.item.findIndex(i => i.itemID === itemID);
    
    // Removes the element (mutates the array) from stories.item and returns the removed item
    const removed = story.item.splice(idx, 1)[0];

    // Schedule item delete
    await deleteManager.deleteItem(removed.mosExternalMetadata.gfxItem);

    // Reindex + persist only shifted tail (idx..end)
    for (let i = idx; i < story.item.length; i++) {
        const it = story.item[i];
        it.ord = i;
        await sqlService.updateItemOrd(roID, it.mosExternalMetadata.gfxItem, i);
    }

    // Set roID, storySlug, storyNum props
    story.roID      = roID;
    story.storySlug = story.name;
    story.storyNum  = story.number;

    await cache.saveStory(story);
    
    // last updates
    await sqlService.rundownLastUpdate(roID);
    await sqlService.storyLastUpdate(story.uid);

    ackService.sendAck(msg.mos.roItemDelete.roID);
}

async function insertItem(msg) {
    const m = msg.mos.roItemInsert;
    const { roID, storyID } = m;
    const targetItemID = m.itemID;                 // insert BEFORE this ("" => append)
    const item = normalize.normalizeItem(m.item);  // iNEWS sends single item

    // 1) pull story (deep copy)
    const story = await cache.getStory(roID, storyID);
    story.roID = roID;
    // 2) compute insertion index
    let insertIdx;
    if (targetItemID === "" || targetItemID === undefined || targetItemID === null) {
        insertIdx = story.item.length;               // append
    } else {
        insertIdx = story.item.findIndex(i => i.itemID === targetItemID);
        if (insertIdx < 0) insertIdx = story.item.length; // if not found, append
    }

    // 3) resolve identity (NEW vs DUPLICATE vs UNIQUE) before we touch cache order
    const gfxIncoming = Number(item?.mosExternalMetadata?.gfxItem || 0);
    let assertedUid = gfxIncoming;

    // DEBUG
    //console.log("Inserted item: ", JSON.stringify(msg));
    //console.log("Cached Story: ", story);
    //console.log("Inserted item order: ", insertIdx);


    if (!gfxIncoming) {
        // NEW: no UID yet -> upsert to get a fresh UID
        const dbItem = constructItem(item, story.rundown, story.uid, insertIdx);
        const result = await sqlService.upsertItem(roID, dbItem); // expect {event, uid}
        assertedUid = result.uid;
        item.mosExternalMetadata.gfxItem = assertedUid;
        itemsHash.registerItem(assertedUid);
        await sendMosItemReplace(story, item, assertedUid, "NEW ITEM");
    } else if (itemsHash.isUsed(gfxIncoming)) {
        // DUPLICATE: clone to a fresh UID
        const dbItem = constructItem(item, story.rundown, story.uid, insertIdx);
        const duplicate = {
            name: dbItem.name,
            production: dbItem.production,
            rundown: story.rundown,
            story: story.uid,
            ord: insertIdx,
            template: dbItem.template,
            data: dbItem.data,
            scripts: dbItem.scripts,
        };
        assertedUid = await sqlService.storeNewDuplicate(duplicate);
        item.mosExternalMetadata.gfxItem = Number(assertedUid);
        itemsHash.registerItem(assertedUid);
        await sendMosItemReplace(story, item, assertedUid, "DUPLICATE");
    } else {
        // UNIQUE existing UID: just ensure it exists/updated in DB and register
        const dbItem = constructItem(item, story.rundown, story.uid, insertIdx);
        await sqlService.upsertItem(roID, dbItem);
        itemsHash.registerItem(dbItem.uid);
    }

    // 4) insert into story + reindex only tail (insertIdx..end) and persist ords
    story.item.splice(insertIdx, 0, item);
    for (let i = insertIdx; i < story.item.length; i++) {
        const it = story.item[i];
        it.ord = i;
        await sqlService.updateItemOrd(roID, it.mosExternalMetadata.gfxItem, i);
    }

    // 5) save back to cache (only item[] changed; provide fields saveStory expects)
    story.roID = roID;
    story.storySlug = story.name;
    story.storyNum = story.number;

    await cache.saveStory(normalize.removeItemsMeta(story));

    // 6) last updates + ack
    await sqlService.rundownLastUpdate(roID);
    await sqlService.storyLastUpdate(story.uid);
    ackService.sendAck(roID);
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
        uid: Number(item.mosExternalMetadata.gfxItem),
        name:String(item.itemSlug),
        production: Number(item.mosExternalMetadata.gfxProduction),
        rundown: Number(rundown), 
        story: Number(storyUid), 
        ord: Number(ord),
        template: Number(item.mosExternalMetadata.gfxTemplate),
        data:String(item.mosExternalMetadata.data),
        scripts: String(item.mosExternalMetadata.scripts)
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

export default { registerItems, replaceItem, deleteItem, insertItem};

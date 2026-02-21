import mosConnector from "../1-dal/mos-connector.js";
import mosMediaConnector from "../1-dal/mos-media-connector.js";
import sqlService from "./4-sql-service.js";
import cache from "../2-cache/cache.js";
import ackService from "./5-ack-service.js";
import logger from "../3-utilities/logger.js";
import mosCommands from "../3-utilities/mos-cmds.js";
import appConfig from "../3-utilities/app-config.js";
import storyService from "./2-story-service.js";
import logMessages from "../3-utilities/logger-messages.js";
import itemsHash from "../2-cache/items-hashmap.js";
import itemsService from "./3-items-service.js";
import storySyncService from "./7-story-sync.js";


// MOS 2.8.5
class AppProcessor {
    constructor() {
        this.roQueue = []; // Queue to store rundown IDs
        this.pendingRequest = false; // Flag to track if a request is in progress

        // Boot mechanism
        this.isBoot = false;
        this.deltaUpdates = [];
    }
    
    async initialize() {
        logMessages.appLoadedMessage();
        await sqlService.initialize();
        await mosConnector.connect();
        await mosMediaConnector.connect();
        //this.isBoot = true;
        logger("[BOOT] System BOOT Starting - during boot this app will delay ACK for story/item delta updates", "cyan");
        mosConnector.sendToClient(mosCommands.roReqAll());// Start point - sends roReqAll and server receives roListAll
    }
    
    async roListAll(msg) {
        if (msg.mos.roListAll === ""){
            logger("[RUNDOWN] NCS doesn't have active rundowns.","red");
            return;
        }
        const roArr = [].concat(msg.mos.roListAll.ro); // Normalize ro data

        for(const ro of roArr){
             const rundownStr = ro.roSlug;
             const roID = ro.roID;
             const {production, alias} = this.getProdByRundownStr(rundownStr);
             const uid = await sqlService.addDbRundown(rundownStr,roID,production, alias);
             await cache.initializeRundown(rundownStr,uid, production, roID);
             this.roQueue.push(ro.roID); // Add roID to queue
        }
        // Now, when cache is updated, hide unwatched rundowns in sql
        await sqlService.hideUnwatchedRundowns();
        
        // Start processing the queue
        this.processNextRoReq();
        
    }

    async processNextRoReq() {
        
        // If a request is in progress, just wait (boot still running)
        if (this.pendingRequest) {
            return;
        }
        
        // If queue finished -> boot end
        if (this.roQueue.length === 0) {
            logger("[BOOT] System BOOT Finished, pooling now the deltas", "cyan");
            this.isBoot = false;
            await this.flushDeltaUpdates();
            return;
        }

        this.pendingRequest = true; // Mark a request as in progress
        const roID = this.roQueue.shift(); // Get the next roID from the queue
        mosConnector.sendToClient(mosCommands.roReq(roID));
    }

    async roList(msg){
        // If we in storySync mode - pass it do sync handler and exit
        if(storySyncService.getSyncState() === true) {
            await storySyncService.roListHandler(msg);
            this.pendingRequest = false;
            this.processNextRoReq();
            return;
        }

        const roSlug = msg.mos.roList.roSlug;
        
        // Normalize `story` to always be an array, handling undefined properly (nested ternary)
        const stories = msg.mos.roList.story ? (Array.isArray(msg.mos.roList.story) ? msg.mos.roList.story : [msg.mos.roList.story]) : [];
        let ord = 0;  
        for(const story of stories){
            if(story.item === undefined) {
                logger("[STORY] Ignored - empty story report (Disable sending empty stories!)", "yellow");
                continue;
            }
            story.roID = roSlug; //Add ro
            // Append roID to story
            story.ord = ord; //Add ord to story
            await storyService.handleNewStory(story);
            
            ord++;
        }
        logger(`[RUNDOWN] Loaded rundown {${roSlug}}`);

        // Mark the current request as complete and process the next roReq
        this.pendingRequest = false;
        this.processNextRoReq();

    }

    async roCreate(msg){ 
        const rundownStr = msg.mos.roCreate.roSlug;
        const roID = msg.mos.roCreate.roID;
        const {production, alias} = this.getProdByRundownStr(rundownStr);

        // Register rundown in DB and cache
        const uid = await sqlService.addDbRundown(rundownStr,roID,production, alias);
        await cache.initializeRundown(rundownStr,uid, production, roID);

        // Normalize `story` to always be an array, handling undefined properly (nested ternary)
        const stories = msg.mos.roCreate.story ? (Array.isArray(msg.mos.roCreate.story) ? msg.mos.roCreate.story : [msg.mos.roCreate.story]) : [];
        let ord = 0;

        for(const story of stories){
            if(story.item === undefined) {
                logger("[STORY] Ignored - empty story report (Disable sending empty stories!)", "yellow");
                continue;
            }
            story.roID = rundownStr; //Add ro (keep same style as roList)
            story.ord = ord; //Add ord to story
            await storyService.handleNewStory(story);

            ord++;
        }

        logger(`[RUNDOWN] Loaded rundown {${rundownStr}}`);

        // Send ack to NCS (ONLY after processing)
        ackService.sendAck(roID);
        logger(`[RUNDOWN] New rundown registered  - {${rundownStr}}` );
        
    }

    async roDelete(msg){
        try{
            const {uid,rundownStr} = await cache.getRundownUidAndStrByRoID(msg.mos.roDelete.roID);
            
            // Delete rundown and its stories 
            await sqlService.deleteDbRundown(uid, rundownStr);
            await sqlService.deleteDbStoriesByRundownID(uid);
            
            //Delete item when user unmonitors rundown
            await this.deleteItemsOnUnmonitor(uid);

            // Delete rundown stories and items from cache
            await cache.deleteRundownFromCache(rundownStr);
            
            //Send ack to NCS
            ackService.sendAck(msg.mos.roDelete.roID);
            logger(`[RUNDOWN] {${rundownStr}} was deleted from anywhere!` );
        }catch(e){
            // Rundown not found yet (during boot) or already removed - ack anyway
            ackService.sendAck(msg.mos.roDelete.roID);
            logger(`[RUNDOWN] roDelete ignored (rundown not found yet): {${msg.mos.roDelete.roID}}`, "yellow");
        }

        
    }

    async roMetadataReplace(msg){
        const roID = msg.mos.roMetadataReplace.roID;
        const {rundownStr, uid} = await cache.getRundownUidAndStrByRoID(roID);
        
        if(rundownStr !== msg.mos.roMetadataReplace.roSlug){
            const newRundownStr = msg.mos.roMetadataReplace.roSlug;
            await sqlService.modifyRundownStr(uid, newRundownStr);
            await cache.modifyRundownStr(rundownStr, newRundownStr);
            logger(`[RUNDOWN] Rundown name changed to {${newRundownStr}}`);
        }
    }

    getProdByRundownStr(rundownStr) {
        const p = appConfig.rundowns;
        for (const key in p) {
            if (rundownStr.includes(key)) {
                return p[key];
            }
        }
        return p["default"];
    }
    
    async deleteItemsOnUnmonitor(rundownId){
        
        if(appConfig.keepSqlItems) return;
        
        // Get items uid array, that related to rundownId
        const itemsId = await sqlService.getItemsIdArrByRundownId(rundownId);
        // Clear hash for those items
        for(const id of itemsId){
            itemsHash.removeItem(id);
        }
        await sqlService.deleteDbItemsByRundownID(rundownId);
    }

    enqueueDelta(type, msg){
        this.deltaUpdates.push({type, msg});
    }

    async flushDeltaUpdates() {
        logger(`[BOOT] FLUSH START total=${this.deltaUpdates.length}`, "cyan");
        if (this.deltaUpdates.length === 0) {
            logger("[BOOT] No delta updates to process.", "cyan");
            return;
        }

        // IMPORTANT: snapshot + clear first (avoid losing deltas arriving during flush)
        const deltasToProcess = this.deltaUpdates;
        this.deltaUpdates = [];

        logger(`[BOOT] Processing ${deltasToProcess.length} delta updates...`, "cyan");

        for (const dd of deltasToProcess) {
            try {
                const d = deltasToProcess[0];
                switch (d.type) {
                    case "roMetadataReplace":
                        await this.roMetadataReplace(d.msg);
                        ackService.sendAck(d.msg.mos.roMetadataReplace.roID);
                        break;

                    case "roStoryAppend":
                        await storyService.appendStory(d.msg);
                        break;

                    case "roStoryReplace":
                        await storyService.replaceStory(d.msg);
                        break;

                    case "roStoryDelete":
                        await storyService.deleteStoriesHandler(d.msg);
                        break;

                    case "roStoryInsert":
                        await storyService.insertStory(d.msg);
                        break;

                    case "roStoryMoveMultiple":
                        await storyService.moveMultiple(d.msg);
                        break;

                    case "roItemInsert":
                        await itemsService.insertItem(d.msg);
                        break;

                    case "roItemDelete":
                        await itemsService.deleteItem(d.msg);
                        break;

                    case "roItemReplace":
                        await itemsService.replaceItem(d.msg);
                        break;

                    case "roCreate":
                        await this.roCreate(d.msg);
                        break;

                    case "roDelete":
                        await this.roDelete(d.msg);
                        break;

                    default:
                        logger(`[BOOT] Unknown delta type: ${d.type}`, "red");
                }
                break;
            } catch (err) {
                logger(`[BOOT] Error processing delta ${d.type}: ${err.message || err}`, "red");

                const roID = (d.msg && d.msg.mos) ? (
                    (d.msg.mos.roCreate && d.msg.mos.roCreate.roID) ||
                    (d.msg.mos.roDelete && d.msg.mos.roDelete.roID) ||
                    (d.msg.mos.roMetadataReplace && d.msg.mos.roMetadataReplace.roID) ||
                    (d.msg.mos.roItemReplace && d.msg.mos.roItemReplace.roID) ||
                    (d.msg.mos.roItemInsert && d.msg.mos.roItemInsert.roID) ||
                    (d.msg.mos.roItemDelete && d.msg.mos.roItemDelete.roID) ||
                    (d.msg.mos.roStoryInsert && d.msg.mos.roStoryInsert.roID) ||
                    (d.msg.mos.roStoryDelete && d.msg.mos.roStoryDelete.roID) ||
                    (d.msg.mos.roStoryReplace && d.msg.mos.roStoryReplace.roID) ||
                    (d.msg.mos.roStoryAppend && d.msg.mos.roStoryAppend.roID) ||
                    (d.msg.mos.roStoryMoveMultiple && d.msg.mos.roStoryMoveMultiple.roID)
                ) : null;

                if (roID) ackService.sendAck(roID);
            }
        }

        logger("[BOOT] Delta updates finished.", "cyan");

        // If new deltas arrived during processing, flush them too (no recursion risk)
        if (this.deltaUpdates.length > 0) {
            logger(`[BOOT] Detected ${this.deltaUpdates.length} new delta updates during flush. Flushing again...`, "yellow");
            await this.flushDeltaUpdates();
        }
    }    

}


const appProcessor = new AppProcessor();

export default appProcessor;
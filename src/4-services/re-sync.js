import mosConnector from "../1-dal/mos-connector.js";
import sqlService from "./sql-service.js";
import cache from "../2-cache/cache.js";
import logger from "../3-utilities/logger.js";
import mosCommands from "../3-utilities/mos-cmds.js";
import appConfig from "../3-utilities/app-config.js";
import itemsHash from "../2-cache/items-hashmap.js";

class ReSyncService {

    async deleteAllRundowns(){
        
        const rundowns = await cache.getRundowns(); 
        
        for(const r in rundowns){
            const roID =  rundowns[r].roID;
            const uid = rundowns[r].uid;
            
            // Delete rundown and its stories 
            await sqlService.deleteDbRundown(uid, roID);
            await sqlService.deleteDbStoriesByRundownID(uid);
            
            //Delete item when user unmonitors rundown
            await this.deleteItemsOnUnmonitor(uid);

            // Delete rundown stories and items from cache
            await cache.deleteRundownFromCache(roID);
            
            logger(`[RUNDOWN] {${roID}} was deleted from anywhere!` );
        }

        // Now, once we cleared everything, send roReqAll to get fresh state
        mosConnector.sendToClient(mosCommands.roReqAll());
        
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

}


const reSyncService = new ReSyncService();

export default reSyncService;
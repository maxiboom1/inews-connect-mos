import ackService from "./ack-service.js";
import logger from "../3-utilities/logger.js";
import octopusService from "./octopus-service.js";
import appProcessor from "./app-processor.js";
import findRoID from "../3-utilities/findRoID.js";
import appConfig from "../3-utilities/app-config.js";
import EventEmitter from 'events';
import itemsService from "./items-service.js";

const logMosIncomingMessages = appConfig.debug.showMos;

class MosRouter extends EventEmitter {
    
    async mosMessageProcessor(msg, port) {
    
        if(logMosIncomingMessages){
            logger(`[MOS-PROTOCOL-DEBUG] ${this.msgBuider(msg)}`,'yellow'); 
        }
        // double !! converts expression to boolean - so, 
        // if msg.mos.heartbeat exists - the !! convert it to "true"
        switch (true) {
            case !!msg.mos.listMachInfo:
                logger("NCS Machine Info: " + JSON.stringify(msg,null,2));
                break;
            case !!msg.mos.heartbeat:
                ackService.sendHeartbeat(port);
                break;
            case !!msg.mos.roMetadataReplace:
                await appProcessor.roMetadataReplace(msg);
                ackService.sendAck(msg.mos.roMetadataReplace.roID);
                break;              
            case msg.mos.roListAll !== undefined:
                logger(`[MOS] {${this.color("roListAll")}} are received from ${port}`);
                await appProcessor.roListAll(msg)
                break;
            case !!msg.mos.roList:
                logger(`[MOS] {${this.color("roList")}} are received from ${port}`);
                await appProcessor.roList(msg)
                break;
            case !!msg.mos.roCreate:
                logger(`[MOS] {${this.color("roCreate")}} are received from ${port}`);
                await appProcessor.roCreate(msg);
                break;
            case !!msg.mos.roReadyToAir:
                logger(`[MOS] {${this.color("roReadyToAir")}} are received from ${port}`);
                ackService.sendAck(msg.mos.roReadyToAir.roID);
                break;
            case !!msg.mos.roDelete:
                logger(`[MOS] {${this.color("roDelete")}} are received from ${port}`);
                await appProcessor.roDelete(msg);
                break; 
            
            // ****************** NEW ACTIONS ************************
            case !!msg.mos.roStorySend:
                logger(`[MOS] {${this.color("roStorySend")}} are received from ${port}`);
                ackService.sendAck(msg.mos.roStorySend.roID);
                break;            
            case !!msg.mos.roStoryAppend:
                logger(`[MOS] {${this.color("roStoryAppend")}} are received from ${port}`);
                await octopusService.appendStory(msg);
                break; 
            case !!msg.mos.roStoryReplace:
                logger(`[MOS] {${this.color("roStoryReplace")}} are received from ${port}`);
                octopusService.replaceStory(msg);
                break;             
            case !!msg.mos.roStoryDelete:
                logger(`[MOS] {${this.color("roStoryDelete")}} are received from ${port}`);
                await octopusService.deleteStoriesHandler(msg);
                break;                 
            case !!msg.mos.roStoryInsert:
                logger(`[MOS] {${this.color("roStoryInsert")}} are received from ${port}`);
                await octopusService.insertStory(msg);
                //ackService.sendAck(msg.mos.roStoryInsert.roID);
                break;  
            case !!msg.mos.roStoryMoveMultiple:
                logger(`[MOS] {${this.color("roStoryMoveMultiple ")}} are received from ${port}`);
                octopusService.moveMultiple(msg);
                break;  
            
            // Items events
            case !!msg.mos.roItemInsert:
                logger(`[MOS] {${this.color("roItemInsert")}} are received from ${port}`);
                ackService.sendAck(msg.mos.roItemInsert.roID);
                break;                              
            case !!msg.mos.roItemDelete:
                logger(`[MOS] {${this.color("roItemDelete")}} are received from ${port}`);
                await itemsService.deleteItem(msg);
                //ackService.sendAck(msg.mos.roItemDelete.roID);
                break; 
            case !!msg.mos.roItemReplace:
                logger(`[MOS] {${this.color("roItemReplace")}} are received from ${port}`);
                itemsService.replaceItem(msg);
                break;                             
            // ****************** roAck handling ************************
            case !!msg.mos.roAck:
                this.emit('roAckMessage', msg);// Emit the message, 
                break;      
            
            default:
                logger(`[MOS] Unknown MOS message: ${JSON.stringify(msg)}`,"red");
                const roID = findRoID(msg);
                if(roID){
                    ackService.sendAck(roID);
                    logger(`[MOS] Sent roAck for ${roID}`,"red");
            }
        }
        
    }

    color(msg, color = "yellow") { // Used to set color to MOS events in console
    
        const c = {
            yellow: "\x1b[33m",
            green: "\x1b[32m",
            dimmed: "\x1b[38;5;244m",
            reset: "\x1b[0m"
        }
        
        if(c[color] === undefined) color = "yellow";
    
        return c[color] + msg + c.reset;
    
    };

    logLine(){
        const d = this.color('\n-------------------------------------------------------\n');
        return d;
    }

    msgBuider(msg){
        return `${this.logLine()}${this.color(JSON.stringify(msg),"dimmed")}${this.logLine()}`;
    }
}

const mosRouter = new MosRouter();
export default mosRouter;
import mosRouter from "./0-mos-router.js";
import ackService from "../4-services/5-ack-service.js";
import logger from "../3-utilities/logger.js";
import appConfig from "../3-utilities/app-config.js";
import findRoID from "../3-utilities/findRoID.js";

class MosInterceptor {
    constructor() {
        this.isBooting = false;
        this.bootingRoID = "";

        // Array<{ msg, port, ts }>
        this.bootQueue = [];
        this.bootingRoIDsList = [];
        this.drainingBootQueue = false;
    }

    // Call on app start
    beginBoot() {
        if (!appConfig.bootInterceptor) {
            logger(`[INTERCEPTOR] Interceptor service disabled`, "red");
            return;
        }

        this.isBooting = true;
        logger(`[INTERCEPTOR] BOOT mode ON`, "cyan");
    }

    // Call on boot end
    async endBoot() {
        if (!appConfig.bootInterceptor) {
            logger(`[INTERCEPTOR] Interceptor service disabled`, "red");
            return;
        }
        this.isBooting = false;
        logger(`[INTERCEPTOR] BOOT mode OFF. draining queued msgs=${this.bootQueue.length}`, "cyan");
        await this._drainBootQueue();
    }

    // Filter mos that must pass immediately during boot
    _mustBypassEvenDuringBoot(msg) {
        
        if (!this.isBooting) return true; // If we are not in boot state - pass it as is
        
        if (msg?.mos?.roAck) return true; // If this is roAck message - pass it as is

        if(msg?.mos?.roList) return true; // If this is roList message - pass it as is

        if(msg?.mos?.roListAll) return true; // If this is roListAll message - pass it as is

        return false;
    }

    async handle(msg, port) {
    
        // Check if messages should bypass
        if (this._mustBypassEvenDuringBoot(msg)) {return mosRouter.mosMessageProcessor(msg, port);}
        
        const roID = findRoID(msg);
        const action = this._getBootAction(roID);
    
        if (action === "drop") {
            this._ackIfPossible(msg);
            logger(`[INTERCEPTOR] Message-dropped since rundown not loaded yet. roID=${roID}, Type=${this.detectType(msg)}`, "yellow");
            return;
        }
    
        if (action === "pass") {
            logger(`[INTERCEPTOR] Message-passed since rundown is loaded. roID=${roID}, Type=${this.detectType(msg)}`, "yellow");
            mosRouter.mosMessageProcessor(msg, port);
            return ;
        }
    
        // action === "queue"
        this._ackIfPossible(msg);
        this.bootQueue.push({ msg, port, ts: Date.now() });
    
        //logger(`[INTERCEPTOR] Message-queued. roID=${roID}, Type=${this.detectType(msg)}`, "cyan");
        return;
    }

    async _drainBootQueue() {
        if (this.drainingBootQueue) return;
        if (this.bootQueue.length === 0) return;

        this.drainingBootQueue = true;
        try {
            while (this.bootQueue.length > 0) {
                const { msg, port } = this.bootQueue.shift();
                await mosRouter.mosMessageProcessor(msg, port,"interceptor");
            }
        } catch (err) {
            logger(`[INTERCEPTOR] boot drain error: ${err?.message || err}`, "red");
        } finally {
            this.drainingBootQueue = false;
            logger(`[INTERCEPTOR] boot drain finished`, "cyan");
        }
    }

    //ACK the incoming MOS update
    _ackIfPossible(msg) {
        try {
            const mos = msg?.mos;
            if (!mos) return;

            // Most update types contain roID somewhere. Adjust if your ackService needs something else.
            if (mos.roItemReplace?.roID) return ackService.sendAck(mos.roItemReplace.roID);
            if (mos.roItemInsert?.roID) return ackService.sendAck(mos.roItemInsert.roID);
            if (mos.roItemDelete?.roID) return ackService.sendAck(mos.roItemDelete.roID);

            if (mos.roStoryAppend?.roID) return ackService.sendAck(mos.roStoryAppend.roID);
            if (mos.roStoryReplace?.roID) return ackService.sendAck(mos.roStoryReplace.roID);
            if (mos.roStoryDelete?.roID) return ackService.sendAck(mos.roStoryDelete.roID);
            if (mos.roStoryInsert?.roID) return ackService.sendAck(mos.roStoryInsert.roID);
            if (mos.roStoryMoveMultiple?.roID) return ackService.sendAck(mos.roStoryMoveMultiple.roID);

            if (mos.roMetadataReplace?.roID) return ackService.sendAck(mos.roMetadataReplace.roID);
            if (mos.roDelete?.roID) return ackService.sendAck(mos.roDelete.roID);
            if (mos.roReplace?.roID) return ackService.sendAck(mos.roReplace.roID);
            if (mos.roReadyToAir?.roID) return ackService.sendAck(mos.roReadyToAir.roID);

            // roList/roListAll typically do NOT require ack (per your description) — do nothing.
        } catch (err) {
            logger(`[INTERCEPTOR] ack failed: ${err?.message || err}`, "red");
        }
    }

    _getBootAction(roID) {
        const msgRoID = String(roID || "");
        const currentBootRoID = String(this.bootingRoID || "");
    
        // same rundown that is currently loading -> queue
        if (msgRoID === currentBootRoID) {return "queue";}
    
        // different rundown, but still waiting for its own roList -> drop
        if (this.bootingRoIDsList.includes(roID)) {return "drop";}
    
        // already loaded rundown -> pass immediately
        return "pass";
    }

    detectType(msg) {
        const m = msg?.mos || {};
        
        const keys = Object.keys(m).filter(k => k !== "mosID" && k !== "ncsID");
        return [keys[0] || "unknown"].join(",");
    }

    setBootingRoID(roID){this.bootingRoID = String(roID)}

    clearBootingRoID(){this.bootingRoID = ""}

    setBootingRoIDsList(roIDsArr){
        this.bootingRoIDsList = Array.isArray(roIDsArr) ? [...roIDsArr] : [];
    }

}

const mosInterceptor = new MosInterceptor();
export default mosInterceptor;
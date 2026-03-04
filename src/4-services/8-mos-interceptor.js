import mosRouter from "./0-mos-router.js";
import ackService from "../4-services/5-ack-service.js"; 
import logger from "../3-utilities/logger.js";
import appConfig from "../3-utilities/app-config.js";

class MosInterceptor {
  constructor() {
    this.isBooting = false;

    // global FIFO queue for boot period (preserves arrival sequence)
    // Array<{ msg, port, ts }>
    this.bootQueue = [];

    this.drainingBootQueue = false;
  }

  // Call on app start
  beginBoot() {
    if(!appConfig.bootInterceptor) {
      logger(`[INTERCEPTOR] Interceptor service disabled`, "red");
      return;
    }
    
    this.isBooting = true;
    logger(`[INTERCEPTOR] BOOT mode ON`, "cyan");
  }

  // Call when you print "[BOOT] System BOOT Finished"
  async endBoot() {
    if(!appConfig.bootInterceptor) {
      logger(`[INTERCEPTOR] Interceptor service disabled`, "red");
      return;
    }
    this.isBooting = false;
    logger(`[INTERCEPTOR] BOOT mode OFF. draining queued msgs=${this.bootQueue.length}`,"cyan");
    await this._drainBootQueue();
  }

  // Only thing that must pass immediately during boot
  _mustBypassEvenDuringBoot(msg) {
    return !!msg?.mos?.roAck || !!msg?.mos?.roListAll || !!msg?.mos?.roList;
  }

  // Try to ACK the incoming MOS update (best-effort)
  _ackIfPossible(msg) {
    try {
      const mos = msg?.mos;
      if (!mos) return;

      // Most update types contain roID somewhere. Adjust if your ackService needs something else.
      if (mos.roItemReplace?.roID) return ackService.sendAck(mos.roItemReplace.roID);
      if (mos.roItemInsert?.roID)  return ackService.sendAck(mos.roItemInsert.roID);
      if (mos.roItemDelete?.roID)  return ackService.sendAck(mos.roItemDelete.roID);

      if (mos.roStoryAppend?.roID)        return ackService.sendAck(mos.roStoryAppend.roID);
      if (mos.roStoryReplace?.roID)       return ackService.sendAck(mos.roStoryReplace.roID);
      if (mos.roStoryDelete?.roID)        return ackService.sendAck(mos.roStoryDelete.roID);
      if (mos.roStoryInsert?.roID)        return ackService.sendAck(mos.roStoryInsert.roID);
      if (mos.roStoryMoveMultiple?.roID)  return ackService.sendAck(mos.roStoryMoveMultiple.roID);

      if (mos.roMetadataReplace?.roID) return ackService.sendAck(mos.roMetadataReplace.roID);
      if (mos.roDelete?.roID)          return ackService.sendAck(mos.roDelete.roID);
      if (mos.roReplace?.roID)         return ackService.sendAck(mos.roReplace.roID);
      if (mos.roReadyToAir?.roID)      return ackService.sendAck(mos.roReadyToAir.roID);

      // roList/roListAll typically do NOT require ack (per your description) — do nothing.
    } catch (err) {
      logger(`[INTERCEPTOR] ack failed: ${err?.message || err}`, "red");
    }
  }

  async handle(msg, port) {
    // Always let roAck pass immediately (even during boot)
    if (this._mustBypassEvenDuringBoot(msg)) {
      return mosRouter.mosMessageProcessor(msg, port);
    }

    // BOOT MODE: ACK + QUEUE, do NOT process
    if (this.isBooting) {
      this._ackIfPossible(msg);

      this.bootQueue.push({ msg, port, ts: Date.now() });
      // optional: reduce log noise
      logger(`[INTERCEPTOR] boot-queued (fifo) type=${Object.keys(msg?.mos || {}).join(",")}`, "cyan");
      return;
    }

    // Normal operation (after boot): process immediately
    return mosRouter.mosMessageProcessor(msg, port);
  }

  async _drainBootQueue() {
    if (this.drainingBootQueue) return;
    if (this.bootQueue.length === 0) return;

    this.drainingBootQueue = true;
    try {
      while (this.bootQueue.length > 0) {
        const { msg, port } = this.bootQueue.shift();
        logger(`[INTERCEPTOR] draining type=${this.detectType(msg)}`, "magenta");
        await mosRouter.mosMessageProcessor(msg, port);
      }
    } catch (err) {
      logger(`[INTERCEPTOR] boot drain error: ${err?.message || err}`, "red");
    } finally {
      this.drainingBootQueue = false;
      logger(`[INTERCEPTOR] boot drain finished`, "cyan");
    } 
  }

  detectType(msg) {
    const m = msg?.mos || {};
    // match your log style: "mosID,ncsID,roItemReplace" etc.
    const keys = Object.keys(m).filter(k => k !== "mosID" && k !== "ncsID");
    return ["mosID", "ncsID", keys[0] || "unknown"].join(",");
  } 

}

const mosInterceptor = new MosInterceptor();
export default mosInterceptor;
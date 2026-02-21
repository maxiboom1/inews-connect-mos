import sqlService from "./4-sql-service.js";
import mosConnector from "../1-dal/mos-connector.js";
import mosCommands from "../3-utilities/mos-cmds.js";
import mosRouter from "./0-mos-router.js";

import cache from "../2-cache/cache.js";
import normalize from "../3-utilities/normalize.js";
import itemsHash from "../2-cache/items-hashmap.js";
import logger from "../3-utilities/logger.js";

class StorySyncSevice {

    constructor() {
        this.syncState = false;
        this.ctx = {}; // { itemUid, rundownUid, roID, storyUid, storyID }
    }

    getSyncState() { return this.syncState; }

    async storySync(itemUid) {
        const r = await sqlService.getStorySyncContextByItemUid(itemUid);
        if (!r) return { message: "Item N/A" };

        this.ctx = r;
        this.syncState = true;

        logger(`[STORY-SYNC] Start. itemUid=${itemUid} roID=${r.roID} storyID=${r.storyID} storyUid=${r.storyUid}`, "blue");

        mosConnector.sendToClient(mosCommands.roReq(r.roID));
        return { ok: true };
    }

    async roListHandler(msg) {
        try {
            const roList = msg?.mos?.roList;
            if (!roList) return null;

            // Safety: ignore unrelated rundowns
            if (roList.roSlug && this.ctx.roID && roList.roSlug !== this.ctx.roID) return null;

            const targetStory = this.findTargetStory(roList);

            if (!targetStory) {
                logger(`[STORY-SYNC] Story not found. roID=${this.ctx.roID} storyID=${this.ctx.storyID}`, "yellow");
                return null;
            }

            await this.resetStory(targetStory, roList.roSlug);

            // Done
            this.syncState = false;
            this.ctx = {};
            logger(`[STORY-SYNC] Done`, "green");
            return true;

        } catch (err) {
            logger(`[STORY-SYNC] Failed: ${err?.message || err}`, "red");
            this.syncState = false;
            this.ctx = {};
            return null;
        }
    }

    findTargetStory(roList) {
        const stories = roList?.story? (Array.isArray(roList.story) ? roList.story : [roList.story]) : [];
        return stories.find(s => String(s.storyID) === String(this.ctx.storyID));
    }

    // ========================= RESET CORE ========================= //

    async resetStory(targetStory, roID) {
        // 1) Normalize targetStory.item to array
        const items = targetStory?.item? (Array.isArray(targetStory.item) ? targetStory.item : [targetStory.item]): [];

        logger(`[STORY-SYNC] Reset story. roID=${roID} storyID=${targetStory.storyID} items=${items.length}`, "blue");

        // 2) Delete ALL existing items in SQL for this story UID (keep story row)
        await sqlService.deleteDbItemsByStoryUid(Number(this.ctx.storyUid));

        // 3) Clear items in cache for this story (keep story node)
        //    We reuse cache.getStory/saveStory like your item delete/insert does.
        const cachedStory = await cache.getStory(roID, String(this.ctx.storyID));
        cachedStory.item = [];

        cachedStory.roID = roID;
        cachedStory.storySlug = cachedStory.name;
        cachedStory.storyNum = cachedStory.number;

        await cache.saveStory(normalize.removeItemsMeta(cachedStory));

        // 4) Rebuild items sequentially
        const rebuilt = [];
        for (let i = 0; i < items.length; i++) {
            const el = items[i];

            // Ensure consistent item format
            normalize.normalizeItem(el);
            el.ord = i;

            const assertedUid = await this.assertItemUidAndPersist(roID, el, i);

            // Update MOS item with asserted uid for cache + possible replace
            el.mosExternalMetadata.gfxItem = Number(assertedUid);

            rebuilt.push(el);
        }

        // 5) Save rebuilt items to cache story
        cachedStory.item = rebuilt;

        cachedStory.roID = roID;
        cachedStory.storySlug = cachedStory.name;
        cachedStory.storyNum = cachedStory.number;

        await cache.saveStory(normalize.removeItemsMeta(cachedStory));
    }

    // Decide UID + persist DB + (optionally) send mosItemReplace to push new uid
    async assertItemUidAndPersist(roID, mosItemEl, ord) {
        const gfxIncoming = Number(mosItemEl?.mosExternalMetadata?.gfxItem || 0);

        // Build DB item object (duplicated from items-service)
        const dbItem = {
            uid: gfxIncoming,
            name: String(mosItemEl.itemSlug),
            production: Number(mosItemEl.mosExternalMetadata.gfxProduction),
            rundown: Number(this.ctx.rundownUid),
            story: Number(this.ctx.storyUid),
            ord: Number(ord),
            template: Number(mosItemEl.mosExternalMetadata.gfxTemplate),
            data: String(mosItemEl.mosExternalMetadata.data),
            scripts: String(mosItemEl.mosExternalMetadata.scripts)
        };

        // Case A: NEW (no uid yet) => create and push replace
        if (!gfxIncoming) {
            const result = await sqlService.upsertItem(roID, dbItem); // expect {success,event,uid}
            const asserted = result?.uid;

            if (asserted) {
                itemsHash.registerItem(asserted);
                await this.sendMosItemReplaceByCtx(mosItemEl, asserted, "NEW ITEM");
                return asserted;
            }

            throw new Error(`[STORY-SYNC] Failed to create NEW item (no uid).`);
        }

        // Case B: incoming uid already used => create duplicate uid and push replace
        if (itemsHash.isUsed(gfxIncoming)) {
            const duplicate = {
                name: dbItem.name,
                production: dbItem.production,
                rundown: Number(this.ctx.rundownUid),
                story: Number(this.ctx.storyUid),
                ord: Number(ord),
                template: dbItem.template,
                data: dbItem.data,
                scripts: dbItem.scripts
            };

            const asserted = await sqlService.storeNewDuplicate(duplicate);
            itemsHash.registerItem(asserted);

            await this.sendMosItemReplaceByCtx(mosItemEl, asserted, "DUPLICATE");
            return asserted;
        }

        // Case C: unique existing uid => just upsert, register
        await sqlService.upsertItem(roID, dbItem);
        itemsHash.registerItem(gfxIncoming);
        return gfxIncoming;
    }

    async sendMosItemReplaceByCtx(mosItemEl, assertedUid, action) {
        // Build a minimal story object mosCommands expects.
        // mosCommands.mosItemReplace(story, el, assertedUid) in your items-service.
        const storyForReplace = {
            roID: this.ctx.roID,
            storyID: this.ctx.storyID,
            uid: this.ctx.storyUid,
            rundown: this.ctx.rundownUid,
            production: mosItemEl?.mosExternalMetadata?.gfxProduction
        };

        const m = mosCommands.mosItemReplace(storyForReplace, mosItemEl, assertedUid);

        logger(`[STORY-SYNC] ${action}: Sending mosItemReplace for item {${assertedUid}}`, "blue");
        mosConnector.sendToClient(m.replaceMosMessage);

        // wait ack (same logic as items-service, duplicated)
        await this.waitForRoAck();
    }

    waitForRoAck(timeout = 5000, resolveDelayMs = 40) {
        return new Promise((resolve, reject) => {
            const listener = (msg) => {
                if (msg?.mos?.roAck) {
                    clearTimeout(timer);
                    mosRouter.off("roAckMessage", listener);
                    logger(`[STORY-SYNC] mosItemReplace ack'd`, "green");
                    setTimeout(() => resolve(), resolveDelayMs);
                }
            };

            const timer = setTimeout(() => {
                mosRouter.off("roAckMessage", listener);
                reject(new Error(`[STORY-SYNC] Timeout waiting for roAck`));
            }, timeout);

            mosRouter.on("roAckMessage", listener);
        });
    }
}

const storySyncService = new StorySyncSevice();
export default storySyncService;
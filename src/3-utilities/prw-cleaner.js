import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./logger.js";

// Resolve plugin/prw relative to THIS file (src/3-utilities/*)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This assumes: src/3-utilities/prw-cleaner.js  -> ../../plugin/prw
const PRW_DIR = path.join(__dirname, "../../plugin/prw");

// Hardcoded policy
const INTERVAL_MS = 60* 60_000;          // sweep every 1 hour
const MAX_AGE_MS  = 60_000;      // delete files older than 1 minutes
const MATCH_RE    = /\.(jpg|png)$/i; // delete preview images only

let timer = null;
let running = false;

async function sweepOnce() {
  if (running) return;
  running = true;

  try {
    logger(`[PRW cleaner] Starting schedulered preview-images cleanup`, "yellow");
    const now = Date.now();
    const entries = await fs.readdir(PRW_DIR, { withFileTypes: true });

    for (const ent of entries) {
      if (!ent.isFile()) continue;
      if (!MATCH_RE.test(ent.name)) continue;

      const fullPath = path.join(PRW_DIR, ent.name);

      try {
        const st = await fs.stat(fullPath);
        const age = now - st.mtimeMs;
        if (age < MAX_AGE_MS) continue;

        await fs.unlink(fullPath);
      } catch (err) {
        const code = err?.code;
        // locked / busy / race conditions
        if (code === "EPERM" || code === "EBUSY" || code === "ENOENT") continue;

        logger(`[PRW cleaner] Failed to delete ${fullPath}: ${err?.message || err}`, "yellow");
      }
    }
  } catch (err) {
    logger(`[PRW cleaner] Sweep failed in ${PRW_DIR}: ${err?.message || err}`, "yellow");
  } finally {
    running = false;
  }
}

function startPrwCleaner() {
  if (timer) return; 

  timer = setInterval(sweepOnce, INTERVAL_MS);
  timer.unref?.();

  logger(`[PRW cleaner] Started. dir=${PRW_DIR}, interval=${INTERVAL_MS}ms, maxAge=${MAX_AGE_MS}ms`, "green");
}

export default startPrwCleaner;
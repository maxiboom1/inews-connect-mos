import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Resolve absolute path to plugin/prw (served by your static)
const PRW_DIR = path.join(__dirname, "../../plugin/prw");

// Common no-cache headers for previews
function setNoCacheHeaders(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

// HEAD /prw/<uuid>.jpg  → existence check, no body
router.head("/:name([a-f0-9-]+).jpg", async (req, res) => {
  try {
    const filePath = path.join(PRW_DIR, `${req.params.name}.jpg`);
    await fs.access(filePath);             // throws if not found
    setNoCacheHeaders(res);
    res.status(200).end();
  } catch {
    setNoCacheHeaders(res);
    res.status(404).end();
  }
});

// GET static for /prw with no-cache headers (actual image fetch)
router.use("/",(req, res, next) => { setNoCacheHeaders(res); next(); },
  express.static(PRW_DIR, {
    etag: false,
    lastModified: false,
    maxAge: 0,
    setHeaders: (res) => setNoCacheHeaders(res),
  })
);

export default router;

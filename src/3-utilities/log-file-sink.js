import fs from "fs";
import fsp from "fs/promises";
import path from "path";

const LOG_DIR_NAME = "logs";
const IDLE_FLUSH_MS = 2000;

// Safety so long “rundown load” bursts don’t sit forever in RAM
const MAX_BUFFER_CHARS = 2_000_000; // ~2MB
const MAX_BUFFER_LINES = 20_000;

let initialized = false;

let logsDirAbs = "";
let currentDateStamp = "";
let currentFilePath = "";
let stream = null;

let cache = [];
let cacheChars = 0;
let timer = null;

// serialize flushes
let flushChain = Promise.resolve();

function pad2(n) {
  return String(n).padStart(2, "0");
}

function getDateStamp(d = new Date()) {
  // file name by day
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function getDateTimeStamp(d = new Date()) {
  // keep same style as your console timestamp
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function resolveBaseDirNoConfig() {
  // Prefer cwd, but handle common cases where service starts inside /src or /dist
  let base = process.cwd();
  const bn = path.basename(base).toLowerCase();
  if (bn === "src" || bn === "dist" || bn === "build") base = path.dirname(base);
  return base;
}

async function ensureLogsDir() {
  const baseDir = resolveBaseDirNoConfig();
  logsDirAbs = path.join(baseDir, LOG_DIR_NAME);
  await fsp.mkdir(logsDirAbs, { recursive: true });
}

async function createUniqueLogFileForDate(dateStamp) {
  // Requirement #4: each restart gets a new file even same day: date.log, date-1.log, date-2.log...
  for (let i = 0; i < 100000; i++) {
    const name = i === 0 ? `${dateStamp}.log` : `${dateStamp}-${i}.log`;
    const full = path.join(logsDirAbs, name);

    try {
      const fh = await fsp.open(full, "wx"); // create exclusively
      await fh.close();
      return full;
    } catch (e) {
      if (e?.code === "EEXIST") continue;
      throw e;
    }
  }
  throw new Error("Too many log files for this day.");
}

async function openStreamForTodayIfNeeded() {
  const today = getDateStamp();
  if (stream && today === currentDateStamp) return;

  // Day changed => new file
  await closeStream();

  currentDateStamp = today;
  currentFilePath = await createUniqueLogFileForDate(today);

  stream = fs.createWriteStream(currentFilePath, { flags: "a", encoding: "utf8" });
  stream.on("error", (e) => {
    // last resort: still allow app to continue printing to console
    try {
      process.stderr.write(`${getDateTimeStamp()} [LOG-FILE] stream error: ${e?.stack || e}\n`);
    } catch {}
  });
}

function writeToStreamAsync(text) {
  return new Promise((resolve, reject) => {
    if (!stream) return resolve(); // should not happen if we call openStreamForTodayIfNeeded()

    const ok = stream.write(text, "utf8", (err) => (err ? reject(err) : resolve()));
    if (!ok) stream.once("drain", resolve);
  });
}

async function flushAsync() {
  if (cache.length === 0) return;

  const chunk = cache.join("");
  cache = [];
  cacheChars = 0;

  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

  flushChain = flushChain
    .then(async () => {
      await openStreamForTodayIfNeeded();
      await writeToStreamAsync(chunk);
    })
    .catch((e) => {
      try {
        process.stderr.write(`${getDateTimeStamp()} [LOG-FILE] flush error: ${e?.stack || e}\n`);
      } catch {}
    });

  return flushChain;
}

function flushSyncBestEffort() {
  try {
    if (cache.length === 0) return;
    const chunk = cache.join("");
    cache = [];
    cacheChars = 0;

    // If stream exists, write (best effort). If not, fallback to sync append.
    if (stream && currentFilePath) {
      stream.write(chunk);
      return;
    }

    const baseDir = resolveBaseDirNoConfig();
    const dir = path.join(baseDir, LOG_DIR_NAME);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const stamp = getDateStamp();
    const fallback = path.join(dir, `${stamp}-${process.pid}.log`);
    fs.appendFileSync(fallback, chunk, { encoding: "utf8" });
  } catch {}
}

async function closeStream() {
  if (!stream) return;
  await new Promise((res) => stream.end(res));
  stream = null;
}

function scheduleFlush() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    flushAsync().catch(() => {});
  }, IDLE_FLUSH_MS);
}

export function enqueueLogLine(line) {
  // line should already include timestamp and message; we just store it.
  const withNl = line.endsWith("\n") ? line : `${line}\n`;

  cache.push(withNl);
  cacheChars += withNl.length;

  // If burst never stops, you still don’t want infinite RAM growth.
  if (cacheChars >= MAX_BUFFER_CHARS || cache.length >= MAX_BUFFER_LINES) {
    flushAsync().catch(() => {});
    return;
  }

  scheduleFlush();
}

export function getCurrentLogFilePath() {
  return currentFilePath;
}

function installCrashHandlers() {
  // Requirement #7: catch crashes & promise rejections and force a sync flush.
  process.on("uncaughtException", (err) => {
    try {
      enqueueLogLine(`${getDateTimeStamp()} [FATAL] uncaughtException: ${err?.stack || err}`);
      flushSyncBestEffort();
    } finally {
      process.exit(1);
    }
  });

  process.on("unhandledRejection", (reason) => {
    enqueueLogLine(`${getDateTimeStamp()} [FATAL] unhandledRejection: ${reason?.stack || reason}`);
    flushSyncBestEffort();
    // you can decide if you want to exit here; many production apps do:
    // process.exit(1);
  });

  process.on("SIGINT", () => {
    enqueueLogLine(`${getDateTimeStamp()} [INFO] SIGINT received, exiting`);
    flushSyncBestEffort();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    enqueueLogLine(`${getDateTimeStamp()} [INFO] SIGTERM received, exiting`);
    flushSyncBestEffort();
    process.exit(0);
  });

  process.on("beforeExit", () => flushSyncBestEffort());
  process.on("exit", () => flushSyncBestEffort());
}

export async function initFileLogging() {
  if (initialized) return;
  initialized = true;

  await ensureLogsDir();
  await openStreamForTodayIfNeeded();
  installCrashHandlers();
}
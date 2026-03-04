// src/utils/logger.js
const isProd = import.meta.env.MODE === "production";

const LEVEL_WEIGHT = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const envLevelRaw = String(
  import.meta.env.VITE_LOG_LEVEL || (isProd ? "warn" : "debug")
).toLowerCase();

const currentLevel =
  envLevelRaw in LEVEL_WEIGHT ? envLevelRaw : isProd ? "warn" : "debug";

function timestamp() {
  return new Date().toISOString();
}

function shouldLog(level) {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[currentLevel];
}

function formatArgs(level, args) {
  return [`[${timestamp()}] [${level}]`, ...args];
}

const loggerCore = {
  log: (...args) => {
    if (shouldLog("info")) console.log(...formatArgs("LOG", args));
  },
  info: (...args) => {
    if (shouldLog("info")) console.info(...formatArgs("INFO", args));
  },
  warn: (...args) => {
    if (shouldLog("warn")) console.warn(...formatArgs("WARN", args));
  },
  error: (...args) => {
    if (shouldLog("error")) console.error(...formatArgs("ERROR", args));
  },
  debug: (...args) => {
    if (shouldLog("debug")) console.debug(...formatArgs("DEBUG", args));
  },
};

export const logger = loggerCore;
export default loggerCore;

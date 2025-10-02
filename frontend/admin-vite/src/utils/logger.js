// src/utils/logger.js
const isDev = import.meta.env.MODE !== "production";

function timestamp() {
  return new Date().toISOString();
}

function formatArgs(level, args) {
  return [`[${timestamp()}] [${level}]`, ...args];
}

const loggerCore = {
  log: (...args) => {
    if (isDev) console.log(...formatArgs("LOG", args));
  },
  info: (...args) => {
    if (isDev) console.info(...formatArgs("INFO", args));
  },
  warn: (...args) => {
    if (isDev) console.warn(...formatArgs("WARN", args));
  },
  error: (...args) => {
    // sempre mostra erro (mesmo em prod)
    console.error(...formatArgs("ERROR", args));
  },
  debug: (...args) => {
    if (isDev) console.debug(...formatArgs("DEBUG", args));
  },
};

// Export duplo: compatível com default e nomeado
export const logger = loggerCore;
export default loggerCore;

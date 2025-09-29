// frontend/admin-vite/src/utils/logger.js
const isDev = import.meta.env.MODE !== "production";

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  info: (...args) => {
    if (isDev) console.info(...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  error: (...args) => {
    console.error(...args); // sempre mostra erros
  },
  debug: (...args) => {
    if (isDev) console.debug(...args);
  },
};

export default logger;

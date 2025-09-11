// frontend/admin-vite/src/utils/logger.js
const isDev = import.meta.env.MODE !== "production";

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args); // aparece só em dev
  },
  warn: (...args) => {
    if (isDev) console.warn(...args); // aparece só em dev
  },
  error: (...args) => {
    console.error(...args); // sempre mostra erros
  },
};
export default logger;

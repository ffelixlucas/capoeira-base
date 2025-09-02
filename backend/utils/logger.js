// backend/utils/logger.js
module.exports = {
    log: (...args) => {
      if (process.env.NODE_ENV !== "production") {
        console.log(...args);
      }
    },
    error: (msg, error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error(msg, error);
      } else {
        console.error(msg, error?.message || error);
      }
    },
    warn: (...args) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn(...args);
      }
    }
  };
  
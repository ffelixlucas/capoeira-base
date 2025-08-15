const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: parseInt(process.env.MYSQLPORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const transientErrors = ['EAI_AGAIN', 'ETIMEDOUT', 'ECONNRESET'];

// Função helper para criar erro HTTP
function httpError(message, status) {
  const e = new Error(message);
  e.status = status;
  return e;
}

async function getConnectionWithRetry(retries = 3, delayMs = 1000) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await pool.getConnection();
    } catch (err) {
      lastErr = err;
      if (transientErrors.includes(err.code)) {
        console.warn(
          `⚠️ Erro transitório MySQL (${err.code}) — tentativa ${attempt}/${retries}`
        );
        await new Promise(res => setTimeout(res, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// Wrapper para capturar erro e lançar 503 se for conexão perdida
async function safeExecute(fn, ...args) {
  try {
    return await pool[fn](...args);
  } catch (err) {
    if (transientErrors.includes(err.code)) {
      throw httpError('Banco de dados temporariamente indisponível', 503);
    }
    throw err;
  }
}

module.exports = {
  pool,
  getConnectionWithRetry,
  execute: (...args) => safeExecute('execute', ...args),
  query: (...args) => safeExecute('query', ...args)
};

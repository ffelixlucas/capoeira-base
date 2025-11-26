import mysql, { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import  logger  from "../utils/logger";

const pool: Pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: parseInt(process.env.MYSQLPORT || "3306", 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: "-03:00",
});

const transientErrors = ["EAI_AGAIN", "ETIMEDOUT", "ECONNRESET"] as const;
type TransientErrorCode = (typeof transientErrors)[number];

function httpError(message: string, status: number): Error {
  const e: any = new Error(message);
  e.status = status;
  return e;
}

export async function getConnectionWithRetry(
  retries = 3,
  delayMs = 1000
): Promise<PoolConnection> {
  let lastErr: any;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await pool.getConnection();
    } catch (err: any) {
      lastErr = err;

      if (transientErrors.includes(err.code as TransientErrorCode)) {
        logger.warn(
          `⚠️ Erro transitório MySQL (${err.code}) — tentativa ${attempt}/${retries}`
        );
        await new Promise((res) => setTimeout(res, delayMs * attempt));
        continue;
      }

      throw err;
    }
  }

  throw lastErr;
}

/** 
 * 🧩 Agora o execute aceita generics corretamente:
 * db.execute<T>(...)
 */
async function safeExecute<T = any>(
  fn: "execute" | "query",
  ...args: any[]
): Promise<[T, any]> {
  try {
    // @ts-ignore
    return await pool[fn](...args);
  } catch (err: any) {
    if (transientErrors.includes(err.code as TransientErrorCode)) {
      throw httpError("Banco de dados temporariamente indisponível", 503);
    }
    throw err;
  }
}

export const db = {
  pool,
  getConnectionWithRetry,

  /** AGORA ACEITA GENERICS */
  execute: <T = any>(...args: any[]) => safeExecute<T>("execute", ...args),
  query: <T = any>(...args: any[]) => safeExecute<T>("query", ...args),
};

export default db;

import type { Pool, PoolConnection } from "mysql2/promise";

/**
 * ExecutorQuery é um tipo que representa
 * tanto PoolConnection quanto o Pool original
 * ou outro wrapper que tenha .query().
 */
export type ExecutorQuery = {
  query: Pool["query"] | PoolConnection["query"];
};

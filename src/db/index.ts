import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Dua mode koneksi:
 * - Default (lokal / Vercel): node-postgres via Pool biasa.
 * - CLOUDFLARE_WORKERS=1 (Cloudflare Workers): Neon serverless driver lewat
 *   HTTPS — karena Workers tidak membolehkan koneksi TCP Postgres mentah.
 */
const useNeonHttp = process.env.CLOUDFLARE_WORKERS === "1";

let db: ReturnType<typeof drizzlePg> | NeonHttpDatabase;

if (useNeonHttp) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { neon } = require("@neondatabase/serverless") as typeof import("@neondatabase/serverless");
  const sql = neon(databaseUrl);
  db = drizzleNeon(sql);
} else {
  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: Pool;
  };

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  db = drizzlePg(pool);
}

export { db };

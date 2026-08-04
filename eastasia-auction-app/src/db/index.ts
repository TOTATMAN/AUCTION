import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Detect if we're connecting to Neon (production) or local PostgreSQL (dev)
const isNeon = databaseUrl.includes("neon.tech");

function createDb() {
  if (isNeon) {
    // Use Neon serverless driver (works on Vercel Edge/Serverless)
    const sql = neon(databaseUrl!);
    return drizzleNeon(sql);
  } else {
    // Use standard pg driver for local development
    const globalForDb = globalThis as typeof globalThis & {
      __arenaNextJsPostgresqlPool?: Pool;
    };

    const pool =
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({ connectionString: databaseUrl });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = pool;
    }

    return drizzlePg(pool);
  }
}

export const db = createDb();

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy singleton — the Postgres client is created on first use so it picks up
// process.env.DATABASE_URL AFTER dotenv has loaded the .env file, not at import time.
let _db: PostgresJsDatabase<typeof schema> | null = null;

function getDb(): PostgresJsDatabase<typeof schema> {
  if (_db) return _db;
  const url =
    process.env.DATABASE_URL ?? "postgres://cefanet:cefanet@localhost:5432/cefanet_dnb";
  const client = postgres(url, { max: 10 });
  _db = drizzle(client, { schema });
  return _db;
}

export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
}) as PostgresJsDatabase<typeof schema>;

export * from "./schema";
export { schema };

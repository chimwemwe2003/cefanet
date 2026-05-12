import type { Config } from "drizzle-kit";
import { config as loadDotenv } from "dotenv";
import path from "node:path";

loadDotenv({ path: path.resolve(__dirname, "../../.env") });
loadDotenv({ path: path.resolve(__dirname, "./.env"), override: false });

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://cefanet:cefanet@localhost:5432/cefanet_dnb",
  },
} satisfies Config;

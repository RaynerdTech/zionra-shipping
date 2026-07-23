/**
 * Responsibility:
 * Configures Prisma CLI behavior for the Zionra API.
 * It uses the direct database connection for migrations when available,
 * while preserving DATABASE_URL as a local-development fallback.
 */

import "dotenv/config";
import { defineConfig } from "prisma/config";

const migrationDatabaseUrl =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!migrationDatabaseUrl) {
  throw new Error(
    "DIRECT_URL or DATABASE_URL must be set before running Prisma commands.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationDatabaseUrl,
  },
});

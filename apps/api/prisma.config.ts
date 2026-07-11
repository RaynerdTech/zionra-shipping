/**
 * Responsibility:
 * Configures Prisma CLI behavior for the Zionra API.
 * It tells Prisma where the schema and migrations live, and which database URL to use.
 */

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
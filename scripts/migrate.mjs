#!/usr/bin/env node
/**
 * Run all Drizzle SQL migrations against the MySQL database.
 * Uses the drizzle-orm/mysql2 migrator.
 */
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("[Migrate] DATABASE_URL is required");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = join(__dirname, "../drizzle");

console.log("[Migrate] Connecting to database...");
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log("[Migrate] Running migrations from:", migrationsFolder);
try {
  await migrate(db, { migrationsFolder });
  console.log("[Migrate] All migrations completed successfully!");
} catch (error) {
  console.error("[Migrate] Migration failed:", error);
  process.exit(1);
} finally {
  await connection.end();
}

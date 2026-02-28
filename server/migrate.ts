/**
 * Run Drizzle MySQL migrations at server startup.
 * This ensures the database schema is always up to date.
 */
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runMigrations(): Promise<void> {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.warn("[Migrate] DATABASE_URL not set, skipping migrations");
    return;
  }

  // Determine migrations folder — works both in dev (server/) and prod (dist/)
  // In production, drizzle folder is copied to dist/drizzle
  const migrationsFolder = join(__dirname, "../drizzle");

  console.log("[Migrate] Connecting to database...");
  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);
    console.log("[Migrate] Running migrations from:", migrationsFolder);
    await migrate(db, { migrationsFolder });
    console.log("[Migrate] All migrations completed successfully!");
  } catch (error) {
    console.error("[Migrate] Migration failed:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

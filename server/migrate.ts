/**
 * Run Drizzle MySQL migrations at server startup.
 * Custom implementation that handles empty SQL files gracefully.
 */
import mysql from "mysql2/promise";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import crypto from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface JournalEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
}

interface Journal {
  version: string;
  dialect: string;
  entries: JournalEntry[];
}

export async function runMigrations(): Promise<void> {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.warn("[Migrate] DATABASE_URL not set, skipping migrations");
    return;
  }

  // Determine migrations folder — works both in dev (server/) and prod (dist/)
  const migrationsFolder = join(__dirname, "../drizzle");
  const journalPath = join(migrationsFolder, "meta/_journal.json");

  if (!existsSync(journalPath)) {
    console.warn("[Migrate] No migration journal found at", journalPath);
    return;
  }

  console.log("[Migrate] Connecting to database...");
  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection(DATABASE_URL);

    // Create migrations tracking table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      )
    `);

    // Get the last applied migration
    const [rows] = await connection.execute(
      "SELECT id, hash, created_at FROM `__drizzle_migrations` ORDER BY created_at DESC LIMIT 1"
    );
    const dbMigrations = rows as Array<{ id: number; hash: string; created_at: bigint }>;
    const lastDbMigration = dbMigrations[0];

    // Read journal
    const journal: Journal = JSON.parse(readFileSync(journalPath, "utf-8"));

    console.log("[Migrate] Running migrations from:", migrationsFolder);
    let appliedCount = 0;

    for (const entry of journal.entries) {
      const sqlPath = join(migrationsFolder, `${entry.tag}.sql`);

      if (!existsSync(sqlPath)) {
        throw new Error(`No file ${sqlPath} found in ${migrationsFolder} folder`);
      }

      const sqlContent = readFileSync(sqlPath, "utf-8");
      const hash = crypto.createHash("sha256").update(sqlContent).digest("hex");

      // Skip if already applied (check by timestamp)
      if (lastDbMigration && Number(lastDbMigration.created_at) >= entry.when) {
        continue;
      }

      // Split on statement-breakpoints and filter empty statements
      const statements = sqlContent
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (statements.length === 0) {
        console.log(`[Migrate] Skipping empty migration: ${entry.tag}`);
      } else {
        for (const stmt of statements) {
          await connection.execute(stmt);
        }
        console.log(`[Migrate] Applied migration: ${entry.tag}`);
      }

      // Record migration as applied
      await connection.execute(
        "INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) VALUES (?, ?)",
        [hash, entry.when]
      );
      appliedCount++;
    }

    if (appliedCount === 0) {
      console.log("[Migrate] Database is already up to date.");
    } else {
      console.log(`[Migrate] All migrations completed successfully! Applied ${appliedCount} migration(s).`);
    }
  } catch (error) {
    console.error("[Migrate] Migration failed:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

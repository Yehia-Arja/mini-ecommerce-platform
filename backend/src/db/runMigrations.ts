import "dotenv/config";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getServerConfig } from "../config.js";
import { Database } from "./database.js";

type MigrationRecord = {
  filename: string;
};

async function ensureMigrationsTable(database: Database) {
  await database.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrationNames(database: Database): Promise<Set<string>> {
  const result = await database.query<MigrationRecord>(
    "SELECT filename FROM schema_migrations",
  );

  return new Set(result.rows.map((row) => row.filename));
}

async function run() {
  const config = getServerConfig();
  const database = new Database(config.databaseUrl);

  const currentFilePath = fileURLToPath(import.meta.url);
  const migrationsDirectory = path.resolve(
    path.dirname(currentFilePath),
    "../../migrations",
  );

  try {
    await ensureMigrationsTable(database);

    const appliedMigrationNames = await getAppliedMigrationNames(database);
    const migrationFilenames = (await readdir(migrationsDirectory))
      .filter((filename) => filename.endsWith(".sql"))
      .sort((left, right) => left.localeCompare(right));

    for (const filename of migrationFilenames) {
      if (appliedMigrationNames.has(filename)) {
        continue;
      }

      const migrationPath = path.join(migrationsDirectory, filename);
      const migrationSql = await readFile(migrationPath, "utf8");

      await database.withTransaction(async (client) => {
        await client.query(migrationSql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [filename],
        );
      });

      console.log(`Applied migration ${filename}`);
    }
  } finally {
    await database.close();
  }
}

void run().catch((error: unknown) => {
  console.error("Failed to run migrations.");
  console.error(error);
  process.exitCode = 1;
});

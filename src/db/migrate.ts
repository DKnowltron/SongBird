import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb, query, closePool } from './connection.js';
import { loadEnv } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  loadEnv();
  initDb();

  // Create migrations tracking table
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Get already-applied migrations
  const { rows: applied } = await query<{ name: string }>(
    'SELECT name FROM _migrations ORDER BY name',
  );
  const appliedSet = new Set(applied.map((r) => r.name));

  // Read migration files
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  let count = 0;
  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  Skipping ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`  Applying ${file}...`);

    try {
      // Run migration SQL — each statement separately for Management API compatibility
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        await query(stmt);
      }

      await query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      count++;
    } catch (err) {
      console.error(`  Failed to apply ${file}:`, err);
      throw err;
    }
  }

  console.log(`\nMigrations complete. ${count} new migration(s) applied.`);
  await closePool();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

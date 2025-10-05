import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { pool } from './db.js';

dotenv.config({ path: '.env.local' });

const runMigration = async (migrationFile) => {
  console.log(`Running migration: ${migrationFile}...`);
  
  try {
    const sql = readFileSync(migrationFile, 'utf-8');
    await pool.query(sql);
    console.log(`✅ Migration ${migrationFile} completed successfully.`);
  } catch (error) {
    console.error(`❌ Migration ${migrationFile} failed:`, error.message);
    throw error;
  }
};

const run = async () => {
  try {
    await runMigration('server/migrations/001_add_auth.sql');
    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();

// backend/database/migrate.js
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');

async function runMigration() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running database migration...');
    await pool.query(sql);
    console.log('Migration completed successfully.');
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();

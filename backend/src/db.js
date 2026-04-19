// backend/src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon/Render connections
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

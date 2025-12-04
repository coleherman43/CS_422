const { Pool } = require('pg');
require('dotenv').config();

// Choose database URL based on environment
const isTest = process.env.NODE_ENV === 'test';
const effectiveDatabaseUrl = isTest
  ? (process.env.TEST_DATABASE_URL || process.env.DATABASE_URL)
  : process.env.DATABASE_URL;

// Log the database URL being used (for debugging local vs remote issues)
console.log('Using database URL:', effectiveDatabaseUrl || '(not set)');

// Validate URL is set
if (!effectiveDatabaseUrl) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.error('   Please create a .env file in the server directory with DATABASE_URL');
  console.error('   Example: DATABASE_URL=postgresql://user:password@localhost:5432/dbname');
  // Don't exit in development - allow server to start but queries will fail gracefully
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: effectiveDatabaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  if (!effectiveDatabaseUrl) {
    throw new Error('DATABASE_URL is not configured. Please set it in your .env file (or TEST_DATABASE_URL for tests).');
  }
  
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    // Add more context to the error
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Database connection refused. Is PostgreSQL running?';
    } else if (error.code === 'ENOTFOUND') {
      error.message = 'Database host not found. Check your DATABASE_URL.';
    } else if (error.code === '3D000') {
      error.message = 'Database does not exist. Check your DATABASE_URL.';
    } else if (error.code === '28P01') {
      error.message = 'Database authentication failed. Check your DATABASE_URL credentials.';
    }
    throw error;
  }
};

module.exports = {
  pool,
  query,
};


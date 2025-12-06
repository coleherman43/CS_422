#!/usr/bin/env node
/**
 * Simple Migration Runner - Direct SQL execution
 * 
 * This script directly executes the migration SQL without needing a separate file.
 * 
 * Usage:
 *   node scripts/runMigrationSimple.js
 * 
 * Requires DATABASE_URL in .env file
 */

require('dotenv').config();

const { Pool } = require('pg');

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL not found in .env file');
    console.error('\nPlease add DATABASE_URL to server/.env file');
    console.error('Get it from Railway: Dashboard > PostgreSQL > Variables > DATABASE_URL');
    process.exit(1);
  }

  // Validate DATABASE_URL format
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('❌ ERROR: DATABASE_URL must be a valid PostgreSQL connection string');
    console.error('\nCurrent value (first 50 chars):', dbUrl.substring(0, 50));
    console.error('\nExpected format: postgresql://user:password@host:port/database');
    console.error('\nTo get your DATABASE_URL from Railway:');
    console.error('  1. Go to Railway Dashboard');
    console.error('  2. Click on your PostgreSQL service');
    console.error('  3. Go to "Variables" tab');
    console.error('  4. Copy the DATABASE_URL value');
    console.error('  5. Paste it into server/.env file');
    process.exit(1);
  }

  // Extract and show connection info (without password)
  try {
    const urlParts = new URL(dbUrl);
    console.log('🔗 Connecting to database...');
    console.log(`   Host: ${urlParts.hostname}`);
    console.log(`   Port: ${urlParts.port || '5432'}`);
    console.log(`   Database: ${urlParts.pathname.replace('/', '')}`);
  } catch (e) {
    console.log('🔗 Connecting to database...');
  }
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database\n');

    // Run the migration
    console.log('📝 Running migration: Update qr_code_token to VARCHAR(500)');
    console.log('   Executing: ALTER TABLE attendance ALTER COLUMN qr_code_token TYPE VARCHAR(500);\n');
    
    await pool.query(`
      ALTER TABLE attendance 
      ALTER COLUMN qr_code_token TYPE VARCHAR(500);
    `);

    console.log('✅ Migration completed successfully!\n');

    // Verify
    console.log('📊 Verifying change...');
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'attendance' 
      AND column_name = 'qr_code_token'
    `);

    if (result.rows.length > 0) {
      const column = result.rows[0];
      console.log(`   Column: ${column.column_name}`);
      console.log(`   Type: ${column.data_type}(${column.character_maximum_length})`);
      
      if (column.character_maximum_length === 500) {
        console.log('   ✅ SUCCESS: Column is now VARCHAR(500)!');
      } else {
        console.log(`   ⚠️  Column is still VARCHAR(${column.character_maximum_length})`);
      }
    } else {
      console.log('   ⚠️  Could not verify - column not found');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    if (error.detail) {
      console.error(`   Detail: ${error.detail}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();


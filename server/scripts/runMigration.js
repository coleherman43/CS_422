#!/usr/bin/env node
/**
 * Migration Runner Script
 * 
 * This script runs database migrations.
 * 
 * Usage:
 *   node scripts/runMigration.js [migration-file]
 * 
 * Example:
 *   node scripts/runMigration.js db/migrations/001_update_qr_token_length.sql
 * 
 * Environment:
 *   Requires DATABASE_URL to be set in .env file or environment variables
 */

// Load environment variables first
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Check DATABASE_URL before requiring db config
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.error('\nPlease set DATABASE_URL in one of these ways:');
  console.error('  1. Create a .env file in the server directory with:');
  console.error('     DATABASE_URL=postgresql://user:password@host:port/database');
  console.error('  2. Or set it as an environment variable:');
  console.error('     export DATABASE_URL=postgresql://user:password@host:port/database');
  console.error('\nFor Railway, get your DATABASE_URL from:');
  console.error('  - Railway dashboard > Your PostgreSQL service > Variables tab');
  process.exit(1);
}

const { query, pool } = require('../config/db');

async function runMigration(migrationFile) {
  try {
    // Validate DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || typeof dbUrl !== 'string' || !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      console.error('❌ ERROR: DATABASE_URL must be a valid PostgreSQL connection string');
      console.error('   Expected format: postgresql://user:password@host:port/database');
      console.error(`   Got: ${dbUrl ? dbUrl.substring(0, 50) + '...' : '(empty)'}`);
      process.exit(1);
    }

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`📝 Running migration: ${migrationFile}`);
    console.log(`📊 Database: ${dbUrl.split('@')[1]?.split('/')[0] || 'unknown'}`);
    console.log('\nSQL:');
    console.log('---');
    console.log(sql);
    console.log('---\n');

    // Execute the migration
    await query(sql);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the change
    if (migrationFile.includes('qr_token')) {
      const verifyQuery = `
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = 'attendance' 
        AND column_name = 'qr_code_token'
      `;
      const result = await query(verifyQuery);
      if (result.rows.length > 0) {
        const column = result.rows[0];
        console.log('\n📊 Verification:');
        console.log(`   Column: ${column.column_name}`);
        console.log(`   Type: ${column.data_type}(${column.character_maximum_length})`);
        if (column.character_maximum_length === 500) {
          console.log('   ✅ Column successfully updated to VARCHAR(500)!');
        } else {
          console.log(`   ⚠️  Column is still VARCHAR(${column.character_maximum_length})`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
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

// Get migration file from command line
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Please provide a migration file path');
  console.error('\nUsage:');
  console.error('  node scripts/runMigration.js db/migrations/001_update_qr_token_length.sql');
  process.exit(1);
}

// Run the migration
runMigration(migrationFile);


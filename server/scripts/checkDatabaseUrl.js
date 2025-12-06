#!/usr/bin/env node
/**
 * Check DATABASE_URL format
 * 
 * This script validates your DATABASE_URL without connecting to the database
 */

require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

console.log('🔍 Checking DATABASE_URL...\n');

if (!dbUrl) {
  console.error('❌ DATABASE_URL is not set in .env file');
  console.error('\nTo fix this:');
  console.error('  1. Go to Railway Dashboard');
  console.error('  2. Click on your PostgreSQL service');
  console.error('  3. Go to "Variables" tab');
  console.error('  4. Find DATABASE_URL and copy its value');
  console.error('  5. Add it to server/.env file:');
  console.error('     DATABASE_URL=postgresql://user:password@host:port/database');
  process.exit(1);
}

console.log('Current DATABASE_URL value:');
console.log('  ' + (dbUrl.length > 80 ? dbUrl.substring(0, 80) + '...' : dbUrl));
console.log('  Length: ' + dbUrl.length + ' characters\n');

// Check if it looks like a placeholder
if (dbUrl.includes('user:pass@host:port') || 
    dbUrl.includes('localhost') && !dbUrl.includes('railway') ||
    dbUrl === 'postgresql://user:pass@host:port/railway') {
  console.error('⚠️  WARNING: DATABASE_URL looks like a placeholder!');
  console.error('   You need to replace it with your actual Railway database URL\n');
}

// Validate format
if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
  console.error('❌ ERROR: DATABASE_URL must start with "postgresql://" or "postgres://"');
  console.error('   Current format is invalid\n');
  process.exit(1);
}

// Try to parse it
try {
  const url = new URL(dbUrl);
  console.log('✅ DATABASE_URL format is valid!');
  console.log('\nConnection details:');
  console.log('  Protocol: ' + url.protocol);
  console.log('  Username: ' + (url.username || '(not set)'));
  console.log('  Password: ' + (url.password ? '***' + url.password.slice(-2) : '(not set)'));
  console.log('  Host: ' + url.hostname);
  console.log('  Port: ' + (url.port || '5432 (default)'));
  console.log('  Database: ' + url.pathname.replace('/', ''));
  console.log('  SSL: ' + (url.searchParams.get('sslmode') || 'not specified'));
  
  if (!url.hostname || url.hostname === 'host' || url.hostname === 'localhost') {
    console.error('\n⚠️  WARNING: Host looks like a placeholder!');
    console.error('   Railway databases should have a hostname like *.railway.app\n');
  }
  
  if (!url.password) {
    console.error('\n⚠️  WARNING: No password in connection string');
    console.error('   Railway databases require a password\n');
  }
  
} catch (error) {
  console.error('❌ ERROR: DATABASE_URL is not a valid URL');
  console.error('   Error: ' + error.message);
  console.error('\nExpected format:');
  console.error('   postgresql://username:password@hostname:port/database');
  console.error('\nExample:');
  console.error('   postgresql://postgres:abc123@containers-us-west-123.railway.app:5432/railway');
  process.exit(1);
}

console.log('\n✅ DATABASE_URL appears to be correctly formatted!');
console.log('   You can now run: node scripts/runMigrationSimple.js');


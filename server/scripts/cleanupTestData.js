/**
 * Script to clean up all test members from the database
 * 
 * Usage: node server/scripts/cleanupTestData.js
 * 
 * Removes all members with @test.uoregon.edu email domain.
 * 
 * SAFETY: Only works in development/test environments
 */

require('dotenv').config();
const { cleanupTestMembers } = require('../utils/generateDummyData');

async function cleanup() {
  // Check environment
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    console.error('❌ ERROR: Cannot clean up test data in production environment!');
    process.exit(1);
  }

  console.log(`\n🧹 Cleaning up test members...`);
  console.log(`   Environment: ${env}\n`);

  try {
    const deleted = await cleanupTestMembers();
    
    if (deleted > 0) {
      console.log(`   ✅ Deleted ${deleted} test member(s)\n`);
    } else {
      console.log(`   ℹ️  No test members found to delete\n`);
    }

  } catch (error) {
    console.error('❌ Error cleaning up test data:', error.message);
    process.exit(1);
  }
}

// Run the script
cleanup()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


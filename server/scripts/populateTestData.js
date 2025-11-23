/**
 * Script to populate test database with dummy member data
 * 
 * Usage: node server/scripts/populateTestData.js [count] [--keep-existing]
 * 
 * Examples:
 *   node server/scripts/populateTestData.js 20          # Create 20 members, clean existing first
 *   node server/scripts/populateTestData.js 20 --keep-existing  # Create 20 members, keep existing
 * 
 * This script safely creates test members in the database.
 * All test members use @test.uoregon.edu email domain for easy identification.
 * 
 * SAFETY: Only works in development/test environments
 */

require('dotenv').config();
const { createTestMember, cleanupTestMembers } = require('../utils/generateDummyData');
const { Role, Workplace } = require('../models');

async function populateTestData(count = 10, keepExisting = false) {
  // Check environment
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    console.error('❌ ERROR: Cannot populate test data in production environment!');
    process.exit(1);
  }

  console.log(`\n🧪 Populating test database with ${count} members...`);
  console.log(`   Environment: ${env}`);
  console.log(`   All test members will use @test.uoregon.edu email domain`);
  if (keepExisting) {
    console.log(`   Keeping existing test members\n`);
  } else {
    console.log(`   Cleaning existing test members first\n`);
  }

  try {
    // Clean up any existing test data first (unless --keep-existing flag is set)
    if (!keepExisting) {
      const deleted = await cleanupTestMembers();
      if (deleted > 0) {
        console.log(`   Cleaned up ${deleted} existing test members\n`);
      }
    }

    // Get available roles and workplaces for realistic data
    const roles = await Role.findAll();
    const workplaces = await Workplace.findAll();

    const createdMembers = [];

    for (let i = 0; i < count; i++) {
      const overrides = {};
      
      // Randomly assign role and workplace if available
      if (roles.length > 0) {
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        overrides.role_id = randomRole.id;
      }
      
      if (workplaces.length > 0) {
        const randomWorkplace = workplaces[Math.floor(Math.random() * workplaces.length)];
        overrides.workplace_id = randomWorkplace.id;
      }

      const member = await createTestMember(overrides);
      createdMembers.push(member);
      console.log(`   ✓ Created: ${member.name} (${member.email})`);
    }

    console.log(`\n✅ Successfully created ${createdMembers.length} test members!`);
    console.log(`\n   To clean up, run: node server/scripts/cleanupTestData.js\n`);

  } catch (error) {
    console.error('❌ Error populating test data:', error.message);
    process.exit(1);
  }
}

// Get count and flags from command line arguments
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 10;
const keepExisting = args.includes('--keep-existing') || args.includes('-k');

// Run the script
populateTestData(count, keepExisting)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


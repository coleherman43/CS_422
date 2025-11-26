/**
 * Script to add a single member to the database
 * 
 * Usage: node server/scripts/addMember.js <email> <name> <uo_id> [workplace_id] [role_id]
 * 
 * Example:
 *   node server/scripts/addMember.js user@example.com "John Doe" "951234567"
 */

require('dotenv').config();
const { Member, Role, Workplace } = require('../models');

async function addMember() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('❌ Usage: node server/scripts/addMember.js <email> <name> <uo_id> [workplace_id] [role_id]');
    console.error('   Example: node server/scripts/addMember.js user@example.com "John Doe" "951234567"');
    process.exit(1);
  }

  const [email, name, uo_id, workplace_id, role_id] = args;

  // Check environment
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    console.error('❌ ERROR: Cannot add members in production environment!');
    process.exit(1);
  }

  try {
    // Check if member already exists
    const existing = await Member.findByEmail(email);
    if (existing) {
      console.error(`❌ Member with email ${email} already exists!`);
      process.exit(1);
    }

    // Get available roles and workplaces if IDs not provided
    let finalWorkplaceId = workplace_id ? parseInt(workplace_id) : null;
    let finalRoleId = role_id ? parseInt(role_id) : null;

    if (!finalWorkplaceId) {
      const workplaces = await Workplace.findAll();
      if (workplaces.length > 0) {
        finalWorkplaceId = workplaces[0].id;
        console.log(`   Using workplace: ${workplaces[0].name} (ID: ${finalWorkplaceId})`);
      }
    }

    if (!finalRoleId) {
      const roles = await Role.findAll();
      if (roles.length > 0) {
        finalRoleId = roles[0].id;
        console.log(`   Using role: ${roles[0].name} (ID: ${finalRoleId})`);
      }
    }

    const memberData = {
      name,
      email,
      uo_id,
      workplace_id: finalWorkplaceId,
      role_id: finalRoleId,
      dues_status: 'unpaid',
      membership_status: 'active'
    };

    console.log(`\n➕ Adding member...`);
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   UO ID: ${uo_id}\n`);

    const member = await Member.create(memberData);
    
    console.log(`✅ Successfully added member!`);
    console.log(`   Member ID: ${member.id}`);
    console.log(`   Email: ${member.email}`);
    console.log(`   You can now log in with this email.\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding member:', error.message);
    if (error.code === '23505') {
      console.error('   This email or UO ID already exists in the database.');
    }
    process.exit(1);
  }
}

addMember();


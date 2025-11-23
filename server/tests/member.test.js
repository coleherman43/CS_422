const { Member, Role, Workplace } = require('../models');
const { generateMemberData } = require('../utils/generateDummyData');

describe('Member Database Operations', () => {
  let testMemberId;
  let testRoleId;
  let testWorkplaceId;

  beforeAll(async () => {
    // Clean up any existing test data first
    const existingRole = await Role.findByName('Test Role');
    if (existingRole) {
      await Role.delete(existingRole.id);
    }
    
    const existingWorkplace = await Workplace.findByName('Test Workplace');
    if (existingWorkplace) {
      await Workplace.delete(existingWorkplace.id);
    }
    
    // Create test role
    const testRole = await Role.create({
      name: 'Test Role',
      description: 'Test role for testing'
    });
    testRoleId = testRole.id;

    // Create test workplace
    const testWorkplace = await Workplace.create({
      name: 'Test Workplace',
      location: 'Test Location'
    });
    testWorkplaceId = testWorkplace.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testMemberId) {
      await Member.delete(testMemberId);
    }
    if (testRoleId) {
      await Role.delete(testRoleId);
    }
    if (testWorkplaceId) {
      await Workplace.delete(testWorkplaceId);
    }
  });

  describe('Member Creation', () => {
    test('should create a new member successfully', async () => {
      const memberData = generateMemberData({
        workplace_id: testWorkplaceId,
        role_id: testRoleId,
        dues_status: 'paid',
        membership_status: 'active'
      }, true);

      const member = await Member.create(memberData);
      testMemberId = member.id;

      expect(member).toBeDefined();
      expect(member.name).toBe(memberData.name);
      expect(member.email).toBe(memberData.email);
      expect(member.uo_id).toBe(memberData.uo_id);
      expect(member.workplace_id).toBe(testWorkplaceId);
      expect(member.role_id).toBe(testRoleId);
      expect(member.dues_status).toBe('paid');
      expect(member.membership_status).toBe('active');
    });

    test('should fail to create member with duplicate email', async () => {
      // Get the email from the first member
      const firstMember = await Member.findById(testMemberId);
      const memberData = generateMemberData({
        email: firstMember.email, // Same email as above
        workplace_id: testWorkplaceId,
        role_id: testRoleId
      }, true);

      await expect(Member.create(memberData)).rejects.toThrow();
    });

    test('should fail to create member with duplicate UO ID', async () => {
      // Get the UO ID from the first member
      const firstMember = await Member.findById(testMemberId);
      const memberData = generateMemberData({
        uo_id: firstMember.uo_id, // Same UO ID as above
        workplace_id: testWorkplaceId,
        role_id: testRoleId
      }, true);

      await expect(Member.create(memberData)).rejects.toThrow();
    });
  });

  describe('Member Retrieval', () => {
    test('should find member by ID', async () => {
      const member = await Member.findById(testMemberId);

      expect(member).toBeDefined();
      expect(member.id).toBe(testMemberId);
      expect(member.role_name).toBe('Test Role');
      expect(member.workplace_name).toBe('Test Workplace');
    });

    test('should find member by email', async () => {
      const firstMember = await Member.findById(testMemberId);
      const member = await Member.findByEmail(firstMember.email);

      expect(member).toBeDefined();
      expect(member.email).toBe(firstMember.email);
      expect(member.id).toBe(testMemberId);
    });

    test('should find member by UO ID', async () => {
      const firstMember = await Member.findById(testMemberId);
      const member = await Member.findByUOId(firstMember.uo_id);

      expect(member).toBeDefined();
      expect(member.uo_id).toBe(firstMember.uo_id);
      expect(member.id).toBe(testMemberId);
    });

    test('should return null for non-existent member', async () => {
      const member = await Member.findById(99999);
      expect(member).toBeUndefined();
    });
  });

  describe('Member Filtering', () => {
    test('should find members by workplace', async () => {
      const members = await Member.findAll({ workplace_id: testWorkplaceId });

      expect(members).toBeDefined();
      expect(members.length).toBeGreaterThan(0);
      expect(members[0].workplace_id).toBe(testWorkplaceId);
    });

    test('should find members by dues status', async () => {
      const members = await Member.findAll({ dues_status: 'paid' });

      expect(members).toBeDefined();
      expect(members.length).toBeGreaterThan(0);
      expect(members[0].dues_status).toBe('paid');
    });

    test('should find members by membership status', async () => {
      const members = await Member.findAll({ membership_status: 'active' });

      expect(members).toBeDefined();
      expect(members.length).toBeGreaterThan(0);
      expect(members[0].membership_status).toBe('active');
    });

    test('should search members by name', async () => {
      const firstMember = await Member.findById(testMemberId);
      const nameParts = firstMember.name.split(' ');
      const searchTerm = nameParts[0]; // Search by first name
      const members = await Member.findAll({ search: searchTerm });

      expect(members).toBeDefined();
      expect(members.length).toBeGreaterThan(0);
      expect(members.some(m => m.id === testMemberId)).toBe(true);
    });
  });

  describe('Member Updates', () => {
    test('should update member information', async () => {
      const updateData = generateMemberData({
        name: 'Updated Test Member',
        major: 'Updated Major'
      }, true);

      const updatedMember = await Member.update(testMemberId, {
        name: updateData.name,
        major: updateData.major,
        phone: updateData.phone
      });

      expect(updatedMember).toBeDefined();
      expect(updatedMember.name).toBe('Updated Test Member');
      expect(updatedMember.major).toBe('Updated Major');
      expect(updatedMember.phone).toBe(updateData.phone);
    });

    test('should fail to update with invalid workplace ID', async () => {
      const updateData = { workplace_id: 99999 };

      await expect(Member.update(testMemberId, updateData)).rejects.toThrow();
    });

    test('should fail to update with invalid role ID', async () => {
      const updateData = { role_id: 99999 };

      await expect(Member.update(testMemberId, updateData)).rejects.toThrow();
    });
  });

  describe('Member Statistics', () => {
    test('should get member statistics', async () => {
      const stats = await Member.getStatistics();

      expect(stats).toBeDefined();
      expect(parseInt(stats.total_members)).toBeGreaterThan(0);
      expect(parseInt(stats.active_members)).toBeGreaterThan(0);
      expect(typeof parseInt(stats.paid_dues)).toBe('number');
      expect(typeof parseInt(stats.unpaid_dues)).toBe('number');
    });
  });

  describe('Member Deletion', () => {
    test('should delete member successfully', async () => {
      const deletedMember = await Member.delete(testMemberId);

      expect(deletedMember).toBeDefined();
      expect(deletedMember.id).toBe(testMemberId);

      // Verify member is deleted
      const member = await Member.findById(testMemberId);
      expect(member).toBeUndefined();

      testMemberId = null; // Prevent cleanup in afterAll
    });
  });
});


const { Attendance, Event, Member, Workplace } = require('../models');
const { generateMemberData } = require('../utils/generateDummyData');
const { pool } = require('../config/db');

describe('Attendance Database Operations', () => {
  let testAttendanceId;
  let testEventId;
  let testMemberId;
  let dbAvailable = false;

  beforeAll(async () => {
    // Check if database is available
    try {
      await pool.query('SELECT 1');
      dbAvailable = true;
    } catch (error) {
      console.warn('⚠️  Database not available. Skipping database tests.');
      console.warn('   Make sure PostgreSQL is running and DATABASE_URL is set in .env');
      dbAvailable = false;
      return;
    }

    // Create test workplace
    const testWorkplace = await Workplace.create({
      name: 'Attendance Test Workplace',
      location: 'Test Location'
    });
    
    // Create test member using dummy data generator
    const memberData = generateMemberData({
      workplace_id: testWorkplace.id,
      dues_status: 'paid',
      membership_status: 'active'
    }, true);
    
    // Clean up any existing test data first
    const existingMember = await Member.findByEmail(memberData.email);
    if (existingMember) {
      await Member.delete(existingMember.id);
    }
    
    const testMember = await Member.create(memberData);
    testMemberId = testMember.id;

    // Create test event
    const testEvent = await Event.create({
      title: 'Test Attendance Event',
      description: 'Event for testing attendance',
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: 'Test Location',
      created_by: testMemberId
    });
    testEventId = testEvent.id;
  });

  afterAll(async () => {
    if (!dbAvailable) return;
    
    // Clean up test data
    if (testAttendanceId) {
      try {
        await Attendance.delete(testAttendanceId);
      } catch (error) {
        console.warn('Error cleaning up attendance:', error.message);
      }
    }
    if (testEventId) {
      try {
        await Event.delete(testEventId);
      } catch (error) {
        console.warn('Error cleaning up event:', error.message);
      }
    }
    if (testMemberId) {
      try {
        await Member.delete(testMemberId);
      } catch (error) {
        console.warn('Error cleaning up member:', error.message);
      }
    }
    // Clean up test workplace
    try {
      const testWorkplace = await Workplace.findByName('Attendance Test Workplace');
      if (testWorkplace) {
        await Workplace.delete(testWorkplace.id);
      }
    } catch (error) {
      console.warn('Error cleaning up workplace:', error.message);
    }
  });

  describe('Attendance Recording', () => {
    test('should record check-in successfully', async () => {
      if (!dbAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      const checkIn = await Attendance.recordCheckIn(
        testMemberId,
        testEventId,
        'test_qr_token_123'
      );
      testAttendanceId = checkIn.id;

      expect(checkIn).toBeDefined();
      expect(checkIn.member_id).toBe(testMemberId);
      expect(checkIn.event_id).toBe(testEventId);
      expect(checkIn.qr_code_token).toBe('test_qr_token_123');
      expect(checkIn.checked_in_at).toBeDefined();
    });

    test('should fail to record duplicate check-in', async () => {
      if (!dbAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      await expect(
        Attendance.recordCheckIn(testMemberId, testEventId, 'duplicate_token')
      ).rejects.toThrow();
    });
  });

  describe('Attendance Retrieval', () => {
    test('should find attendance by member', async () => {
      if (!dbAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      const attendance = await Attendance.findByMember(testMemberId);

      expect(attendance).toBeDefined();
      expect(attendance.length).toBeGreaterThan(0);
      expect(attendance[0].member_id).toBe(testMemberId);
      expect(attendance[0].event_title).toBe('Test Attendance Event');
    });

    test('should find attendance by event', async () => {
      if (!dbAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      const attendance = await Attendance.findByEvent(testEventId);

      expect(attendance).toBeDefined();
      expect(attendance.length).toBeGreaterThan(0);
      expect(attendance[0].event_id).toBe(testEventId);
      expect(attendance[0].member_name).toBeDefined();
    });

    test('should check if member is checked in', async () => {
      if (!dbAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      const isCheckedIn = await Attendance.isCheckedIn(testMemberId, testEventId);

      expect(isCheckedIn).toBe(true);
    });

    test('should return false for non-checked-in member', async () => {
      if (!dbAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      // Create another member who hasn't checked in
      const otherMemberData = generateMemberData({
        dues_status: 'paid',
        membership_status: 'active'
      }, true);
      const otherMember = await Member.create(otherMemberData);

      const isCheckedIn = await Attendance.isCheckedIn(otherMember.id, testEventId);
      expect(isCheckedIn).toBe(false);

      // Clean up
      await Member.delete(otherMember.id);
    });
  });

  describe('Attendance Statistics', () => {
    test('should get member attendance statistics', async () => {
      if (!dbAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      const stats = await Attendance.getStatistics(testMemberId);

      expect(stats).toBeDefined();
      expect(parseInt(stats.total_check_ins)).toBeGreaterThan(0);
      expect(typeof parseInt(stats.upcoming_events_attended)).toBe('number');
      expect(typeof parseInt(stats.past_events_attended)).toBe('number');
    });

    test('should get meeting summary', async () => {
      if (!dbAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      const summary = await Attendance.getMeetingSummary(testEventId);

      expect(summary).toBeDefined();
      expect(summary.event_title).toBe('Test Attendance Event');
      expect(parseInt(summary.total_attendance)).toBeGreaterThan(0);
      expect(parseInt(summary.workplaces_represented)).toBeGreaterThan(0);
    });

    test('should get attendance rate', async () => {
      if (!dbAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      const rate = await Attendance.getAttendanceRate(testMemberId);

      expect(rate).toBeDefined();
      expect(typeof parseInt(rate.attended_events)).toBe('number');
      expect(typeof parseInt(rate.total_events)).toBe('number');
      expect(typeof parseFloat(rate.attendance_rate)).toBe('number');
    });
  });

  describe('Recent Check-ins', () => {
    test('should get recent check-ins', async () => {
      if (!dbAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      const recentCheckIns = await Attendance.getRecentCheckIns(10);

      expect(recentCheckIns).toBeDefined();
      expect(recentCheckIns.length).toBeGreaterThan(0);
      expect(recentCheckIns[0].member_name).toBeDefined();
      expect(recentCheckIns[0].event_title).toBeDefined();
    });
  });

  describe('Attendance Deletion', () => {
    test('should delete attendance record successfully', async () => {
      if (!dbAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      const deletedAttendance = await Attendance.delete(testAttendanceId);

      expect(deletedAttendance).toBeDefined();
      expect(deletedAttendance.id).toBe(testAttendanceId);

      // Verify attendance is deleted
      const isCheckedIn = await Attendance.isCheckedIn(testMemberId, testEventId);
      expect(isCheckedIn).toBe(false);

      testAttendanceId = null; // Prevent cleanup in afterAll
    });
  });
});


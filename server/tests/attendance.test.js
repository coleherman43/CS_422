const { Attendance, Event, Member, Workplace } = require('../models');
const { generateMemberData } = require('../utils/generateDummyData');

describe('Attendance Database Operations', () => {
  let testAttendanceId;
  let testEventId;
  let testMemberId;

  beforeAll(async () => {
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
    // Clean up test data
    if (testAttendanceId) {
      await Attendance.delete(testAttendanceId);
    }
    if (testEventId) {
      await Event.delete(testEventId);
    }
    if (testMemberId) {
      await Member.delete(testMemberId);
    }
    // Clean up test workplace
    const testWorkplace = await Workplace.findByName('Attendance Test Workplace');
    if (testWorkplace) {
      await Workplace.delete(testWorkplace.id);
    }
  });

  describe('Attendance Recording', () => {
    test('should record check-in successfully', async () => {
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
      await expect(
        Attendance.recordCheckIn(testMemberId, testEventId, 'duplicate_token')
      ).rejects.toThrow();
    });
  });

  describe('Attendance Retrieval', () => {
    test('should find attendance by member', async () => {
      const attendance = await Attendance.findByMember(testMemberId);

      expect(attendance).toBeDefined();
      expect(attendance.length).toBeGreaterThan(0);
      expect(attendance[0].member_id).toBe(testMemberId);
      expect(attendance[0].event_title).toBe('Test Attendance Event');
    });

    test('should find attendance by event', async () => {
      const attendance = await Attendance.findByEvent(testEventId);

      expect(attendance).toBeDefined();
      expect(attendance.length).toBeGreaterThan(0);
      expect(attendance[0].event_id).toBe(testEventId);
      expect(attendance[0].member_name).toBeDefined();
    });

    test('should check if member is checked in', async () => {
      const isCheckedIn = await Attendance.isCheckedIn(testMemberId, testEventId);

      expect(isCheckedIn).toBe(true);
    });

    test('should return false for non-checked-in member', async () => {
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
      const stats = await Attendance.getStatistics(testMemberId);

      expect(stats).toBeDefined();
      expect(parseInt(stats.total_check_ins)).toBeGreaterThan(0);
      expect(typeof parseInt(stats.upcoming_events_attended)).toBe('number');
      expect(typeof parseInt(stats.past_events_attended)).toBe('number');
    });

    test('should get meeting summary', async () => {
      const summary = await Attendance.getMeetingSummary(testEventId);

      expect(summary).toBeDefined();
      expect(summary.event_title).toBe('Test Attendance Event');
      expect(parseInt(summary.total_attendance)).toBeGreaterThan(0);
      expect(parseInt(summary.workplaces_represented)).toBeGreaterThan(0);
    });

    test('should get attendance rate', async () => {
      const rate = await Attendance.getAttendanceRate(testMemberId);

      expect(rate).toBeDefined();
      expect(typeof parseInt(rate.attended_events)).toBe('number');
      expect(typeof parseInt(rate.total_events)).toBe('number');
      expect(typeof parseFloat(rate.attendance_rate)).toBe('number');
    });
  });

  describe('Recent Check-ins', () => {
    test('should get recent check-ins', async () => {
      const recentCheckIns = await Attendance.getRecentCheckIns(10);

      expect(recentCheckIns).toBeDefined();
      expect(recentCheckIns.length).toBeGreaterThan(0);
      expect(recentCheckIns[0].member_name).toBeDefined();
      expect(recentCheckIns[0].event_title).toBeDefined();
    });
  });

  describe('Attendance Deletion', () => {
    test('should delete attendance record successfully', async () => {
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


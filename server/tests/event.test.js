const { Event, Member, Attendance } = require('../models');
const { generateMemberData } = require('../utils/generateDummyData');

describe('Event Database Operations', () => {
  let testEventId;
  let testMemberId;

  beforeAll(async () => {
    // Create test member for event creator using dummy data generator
    const memberData = generateMemberData({
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
  });

  afterAll(async () => {
    // Clean up test data
    if (testEventId) {
      await Event.delete(testEventId);
    }
    if (testMemberId) {
      await Member.delete(testMemberId);
    }
  });

  describe('Event Creation', () => {
    test('should create a new event successfully', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'This is a test event',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        location: 'Test Location',
        created_by: testMemberId
      };

      const event = await Event.create(eventData);
      testEventId = event.id;

      expect(event).toBeDefined();
      expect(event.title).toBe(eventData.title);
      expect(event.description).toBe(eventData.description);
      expect(event.location).toBe(eventData.location);
      expect(event.created_by).toBe(testMemberId);
    });

    test('should fail to create event with invalid creator', async () => {
      const eventData = {
        title: 'Invalid Creator Event',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_by: 99999 // Non-existent member
      };

      await expect(Event.create(eventData)).rejects.toThrow();
    });
  });

  describe('Event Retrieval', () => {
    test('should find event by ID', async () => {
      const event = await Event.findById(testEventId);

      expect(event).toBeDefined();
      expect(event.id).toBe(testEventId);
      expect(event.title).toBe('Test Event');
      expect(event.created_by_name).toBeDefined();
    });

    test('should return null for non-existent event', async () => {
      const event = await Event.findById(99999);
      expect(event).toBeUndefined();
    });
  });

  describe('Event Filtering', () => {
    test('should find upcoming events', async () => {
      const events = await Event.findAll({ upcoming: true });

      expect(events).toBeDefined();
      expect(events.length).toBeGreaterThan(0);
      expect(new Date(events[0].event_date)).toBeInstanceOf(Date);
    });

    test('should find events by creator', async () => {
      const events = await Event.findAll({ created_by: testMemberId });

      expect(events).toBeDefined();
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].created_by).toBe(testMemberId);
    });

    test('should search events by title', async () => {
      const events = await Event.findAll({ search: 'Test' });

      expect(events).toBeDefined();
      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.id === testEventId)).toBe(true);
    });
  });

  describe('Event Updates', () => {
    test('should update event information', async () => {
      const updateData = {
        title: 'Updated Test Event',
        description: 'Updated description',
        location: 'Updated Location'
      };

      const updatedEvent = await Event.update(testEventId, updateData);

      expect(updatedEvent).toBeDefined();
      expect(updatedEvent.title).toBe('Updated Test Event');
      expect(updatedEvent.description).toBe('Updated description');
      expect(updatedEvent.location).toBe('Updated Location');
    });
  });

  describe('Event Statistics', () => {
    test('should get event statistics', async () => {
      const stats = await Event.getStatistics();

      expect(stats).toBeDefined();
      expect(parseInt(stats.total_events)).toBeGreaterThan(0);
      expect(typeof parseInt(stats.upcoming_events)).toBe('number');
      expect(typeof parseInt(stats.past_events)).toBe('number');
    });
  });

  describe('Event Deletion', () => {
    test('should delete event successfully', async () => {
      const deletedEvent = await Event.delete(testEventId);

      expect(deletedEvent).toBeDefined();
      expect(deletedEvent.id).toBe(testEventId);

      // Verify event is deleted
      const event = await Event.findById(testEventId);
      expect(event).toBeUndefined();

      testEventId = null; // Prevent cleanup in afterAll
    });
  });
});


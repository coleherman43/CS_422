const { pool, query } = require('../config/db');
const { Member, Event, Attendance, Role, Workplace } = require('../models');

describe('Database Connection and Basic Operations', () => {
  // Global cleanup before all tests
  beforeAll(async () => {
    // Clean up any test data that this suite is responsible for.
    // Keep this narrow so we don't interfere with other test files.
    await query(`DELETE FROM members WHERE email IN (
      'constraint-test1@example.com',
      'constraint-test2@example.com',
      'transaction-test@example.com',
      'rollback-test@example.com'
    )`);
    await query(`DELETE FROM events WHERE title IN ('Transaction Event')`);
  });

  // Global cleanup after all tests
  afterAll(async () => {
    // Clean up any remaining test data created by this suite only.
    await query(`DELETE FROM members WHERE email IN (
      'constraint-test1@example.com',
      'constraint-test2@example.com',
      'transaction-test@example.com',
      'rollback-test@example.com'
    )`);
    await query(`DELETE FROM events WHERE title IN ('Transaction Event')`);
  });

  describe('Database Connection', () => {
    test('should connect to database successfully', async () => {
      const result = await query('SELECT NOW() as current_time');
      expect(result.rows).toBeDefined();
      expect(result.rows[0].current_time).toBeDefined();
    });

    test('should handle database errors gracefully', async () => {
      await expect(query('SELECT * FROM non_existent_table')).rejects.toThrow();
    });
  });

  describe('Database Schema Validation', () => {
    test('should have all required tables', async () => {
      const result = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('roles', 'workplaces', 'members', 'events', 'attendance', 'admins')
        ORDER BY table_name
      `);

      const tableNames = result.rows.map(row => row.table_name);
      expect(tableNames).toContain('roles');
      expect(tableNames).toContain('workplaces');
      expect(tableNames).toContain('members');
      expect(tableNames).toContain('events');
      expect(tableNames).toContain('attendance');
      expect(tableNames).toContain('admins');
    });

    test('should have proper foreign key constraints', async () => {
      const result = await query(`
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_name
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      
      // Check for specific foreign key relationships
      const fkRelationships = result.rows.map(row => ({
        table: row.table_name,
        column: row.column_name,
        references: `${row.foreign_table_name}.${row.foreign_column_name}`
      }));

      expect(fkRelationships).toContainEqual({
        table: 'members',
        column: 'workplace_id',
        references: 'workplaces.id'
      });

      expect(fkRelationships).toContainEqual({
        table: 'members',
        column: 'role_id',
        references: 'roles.id'
      });

      expect(fkRelationships).toContainEqual({
        table: 'events',
        column: 'created_by',
        references: 'members.id'
      });

      expect(fkRelationships).toContainEqual({
        table: 'attendance',
        column: 'member_id',
        references: 'members.id'
      });

      expect(fkRelationships).toContainEqual({
        table: 'attendance',
        column: 'event_id',
        references: 'events.id'
      });
    });

    test('should have proper indexes for performance', async () => {
      const result = await query(`
        SELECT indexname, tablename, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      
      const indexNames = result.rows.map(row => row.indexname);
      expect(indexNames).toContain('idx_members_email');
      expect(indexNames).toContain('idx_members_uo_id');
      expect(indexNames).toContain('idx_members_workplace');
      expect(indexNames).toContain('idx_members_role');
      expect(indexNames).toContain('idx_members_status');
      expect(indexNames).toContain('idx_events_date');
      expect(indexNames).toContain('idx_attendance_member');
      expect(indexNames).toContain('idx_attendance_event');
    });
  });

  describe('Database Constraints', () => {
    test('should enforce unique constraints', async () => {
      // Clean up any existing test data first
      await query(`DELETE FROM members WHERE email IN ('constraint-test1@example.com', 'constraint-test2@example.com')`);
      
      // Test unique email constraint
      await expect(
        query(`
          INSERT INTO members (name, email, uo_id, dues_status, membership_status)
          VALUES ('Test1', 'constraint-test1@example.com', '951234001', 'paid', 'active')
        `)
      ).resolves.toBeDefined();

      await expect(
        query(`
          INSERT INTO members (name, email, uo_id, dues_status, membership_status)
          VALUES ('Test2', 'constraint-test1@example.com', '951234002', 'paid', 'active')
        `)
      ).rejects.toThrow();

      // Clean up
      await query(`DELETE FROM members WHERE email = 'constraint-test1@example.com'`);
    });

    test('should enforce check constraints', async () => {
      // Clean up any existing test data first
      await query(`DELETE FROM members WHERE email IN ('check-test1@example.com', 'check-test2@example.com')`);
      
      // Test dues_status constraint
      await expect(
        query(`
          INSERT INTO members (name, email, uo_id, dues_status, membership_status)
          VALUES ('Test', 'check-test1@example.com', '951234003', 'invalid_status', 'active')
        `)
      ).rejects.toThrow();

      // Test membership_status constraint
      await expect(
        query(`
          INSERT INTO members (name, email, uo_id, dues_status, membership_status)
          VALUES ('Test', 'check-test2@example.com', '951234004', 'paid', 'invalid_status')
        `)
      ).rejects.toThrow();
    });
  });

  describe('Database Transactions', () => {
    test('should handle transactions properly', async () => {
      const client = await pool.connect();
      
      try {
        // Clean up any existing test data first
        await query(`DELETE FROM members WHERE email = 'transaction-test@example.com'`);
        
        await client.query('BEGIN');
        
        // Insert test data
        const memberResult = await client.query(`
          INSERT INTO members (name, email, uo_id, dues_status, membership_status)
          VALUES ('Transaction Test', 'transaction-test@example.com', '951234005', 'paid', 'active')
          RETURNING id
        `);
        const memberId = memberResult.rows[0].id;

        const eventResult = await client.query(`
          INSERT INTO events (title, event_date, created_by)
          VALUES ('Transaction Event', NOW() + INTERVAL '1 day', $1)
          RETURNING id
        `, [memberId]);
        const eventId = eventResult.rows[0].id;

        // Commit transaction
        await client.query('COMMIT');

        // Verify data exists
        const member = await Member.findById(memberId);
        const event = await Event.findById(eventId);
        
        expect(member).toBeDefined();
        expect(event).toBeDefined();

        // Clean up
        await Event.delete(eventId);
        await Member.delete(memberId);

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    });

    test('should rollback on error', async () => {
      const client = await pool.connect();
      
      try {
        // Clean up any existing test data first
        await query(`DELETE FROM members WHERE email = 'rollback-test@example.com'`);
        
        await client.query('BEGIN');
        
        // Insert valid data
        await client.query(`
          INSERT INTO members (name, email, uo_id, dues_status, membership_status)
          VALUES ('Rollback Test', 'rollback-test@example.com', '951234006', 'paid', 'active')
        `);

        // Try to insert invalid data (should fail)
        await client.query(`
          INSERT INTO members (name, email, uo_id, dues_status, membership_status)
          VALUES ('Rollback Test 2', 'rollback-test@example.com', '951234007', 'invalid', 'active')
        `);

        // This should not be reached
        await client.query('COMMIT');
        fail('Should have thrown an error');

      } catch (error) {
        await client.query('ROLLBACK');
        
        // Verify rollback worked - member should not exist
        const result = await query(`SELECT * FROM members WHERE email = 'rollback-test@example.com'`);
        expect(result.rows.length).toBe(0);
      } finally {
        client.release();
      }
    });
  });

  describe('Database Performance', () => {
    test('should execute queries within reasonable time', async () => {
      const startTime = Date.now();
      
      // Execute a complex query
      const result = await query(`
        SELECT 
          m.name,
          m.email,
          r.name as role_name,
          w.name as workplace_name,
          COUNT(a.id) as attendance_count
        FROM members m
        LEFT JOIN roles r ON m.role_id = r.id
        LEFT JOIN workplaces w ON m.workplace_id = w.id
        LEFT JOIN attendance a ON m.id = a.member_id
        GROUP BY m.id, m.name, m.email, r.name, w.name
        ORDER BY attendance_count DESC
        LIMIT 10
      `);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(result.rows).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
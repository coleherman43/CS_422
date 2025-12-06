const { query } = require('../config/db');

class Attendance {
  // Record check-in
  static async recordCheckIn(memberId, eventId, qrToken = null) {
    // Safety check: ensure QR token doesn't exceed database limit (VARCHAR(500))
    let safeQrToken = qrToken;
    if (safeQrToken && typeof safeQrToken === 'string' && safeQrToken.length > 500) {
      console.warn(`QR token truncated from ${safeQrToken.length} to 500 characters (database limit)`);
      safeQrToken = safeQrToken.substring(0, 500);
    }
    
    const sql = `
      INSERT INTO attendance (member_id, event_id, qr_code_token)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [memberId, eventId, safeQrToken];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find attendance by member ID
  static async findByMember(memberId) {
    const sql = `
      SELECT a.*, e.title as event_title, e.event_date, e.location
      FROM attendance a
      JOIN events e ON a.event_id = e.id
      WHERE a.member_id = $1
      ORDER BY a.checked_in_at DESC
    `;
    const result = await query(sql, [memberId]);
    return result.rows;
  }

  // Find attendance by event ID
  static async findByEvent(eventId) {
    const sql = `
      SELECT a.*, m.name as member_name, m.email, m.uo_id, w.name as workplace_name
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      LEFT JOIN workplaces w ON m.workplace_id = w.id
      WHERE a.event_id = $1
      ORDER BY a.checked_in_at ASC
    `;
    const result = await query(sql, [eventId]);
    return result.rows;
  }

  // Get member attendance statistics
  static async getStatistics(memberId) {
    const sql = `
      SELECT 
        COUNT(*) as total_check_ins,
        COUNT(CASE WHEN e.event_date > NOW() THEN 1 END) as upcoming_events_attended,
        COUNT(CASE WHEN e.event_date < NOW() THEN 1 END) as past_events_attended
      FROM attendance a
      JOIN events e ON a.event_id = e.id
      WHERE a.member_id = $1
    `;
    const result = await query(sql, [memberId]);
    return result.rows[0];
  }

  // Get meeting summary for an event
  static async getMeetingSummary(eventId) {
    const sql = `
      SELECT 
        e.title as event_title,
        e.event_date,
        e.location,
        COUNT(a.id) as total_attendance,
        COUNT(DISTINCT m.workplace_id) as workplaces_represented
      FROM events e
      LEFT JOIN attendance a ON e.id = a.event_id
      LEFT JOIN members m ON a.member_id = m.id
      WHERE e.id = $1
      GROUP BY e.id, e.title, e.event_date, e.location
    `;
    const result = await query(sql, [eventId]);
    return result.rows[0];
  }

  // Check if member is already checked in to event
  static async isCheckedIn(memberId, eventId) {
    const sql = `
      SELECT id FROM attendance 
      WHERE member_id = $1 AND event_id = $2
    `;
    const result = await query(sql, [memberId, eventId]);
    return result.rows.length > 0;
  }

  // Get attendance rate for a member
  static async getAttendanceRate(memberId) {
    const sql = `
      SELECT 
        COUNT(a.id) as attended_events,
        COUNT(e.id) as total_events,
        CASE 
          WHEN COUNT(e.id) > 0 THEN 
            ROUND((COUNT(a.id)::DECIMAL / COUNT(e.id)) * 100, 2)
          ELSE 0 
        END as attendance_rate
      FROM events e
      LEFT JOIN attendance a ON e.id = a.event_id AND a.member_id = $1
      WHERE e.event_date < NOW()
    `;
    const result = await query(sql, [memberId]);
    return result.rows[0];
  }

  // Get recent check-ins
  static async getRecentCheckIns(limit = 10) {
    const sql = `
      SELECT a.*, m.name as member_name, e.title as event_title, e.event_date
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      JOIN events e ON a.event_id = e.id
      ORDER BY a.checked_in_at DESC
      LIMIT $1
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  }

  // Delete attendance record
  static async delete(attendanceId) {
    const sql = 'DELETE FROM attendance WHERE id = $1 RETURNING *';
    const result = await query(sql, [attendanceId]);
    return result.rows[0];
  }
}

module.exports = Attendance;


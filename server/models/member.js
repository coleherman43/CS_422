const { query } = require('../config/db');

class Member {
  // Create new member
  static async create(memberData) {
    const {
      name,
      email,
      uo_id,
      workplace_id,
      role_id,
      dues_status = 'unpaid',
      membership_status = 'active',
      major,
      phone,
      pronouns,
      graduation_year
    } = memberData;

    // Convert empty strings to null for integer fields
    const normalizedWorkplaceId = (workplace_id === '' || workplace_id === null || workplace_id === undefined) 
      ? null 
      : parseInt(workplace_id);
    const normalizedRoleId = (role_id === '' || role_id === null || role_id === undefined) 
      ? null 
      : parseInt(role_id);
    const normalizedGraduationYear = (graduation_year === '' || graduation_year === null || graduation_year === undefined) 
      ? null 
      : graduation_year ? parseInt(graduation_year) : null;

    // Convert empty strings to null for text fields
    const normalizedMajor = (major === '') ? null : major;
    const normalizedPhone = (phone === '') ? null : phone;
    const normalizedPronouns = (pronouns === '') ? null : pronouns;

    const sql = `
      INSERT INTO members (
        name, email, uo_id, workplace_id, role_id, dues_status, 
        membership_status, major, phone, pronouns, graduation_year
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      name, 
      email, 
      uo_id, 
      normalizedWorkplaceId, 
      normalizedRoleId, 
      dues_status,
      membership_status, 
      normalizedMajor, 
      normalizedPhone, 
      normalizedPronouns, 
      normalizedGraduationYear
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find member by ID
  static async findById(id) {
    const sql = `
      SELECT m.*, r.name as role_name, w.name as workplace_name
      FROM members m
      LEFT JOIN roles r ON m.role_id = r.id
      LEFT JOIN workplaces w ON m.workplace_id = w.id
      WHERE m.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Find member by email
  static async findByEmail(email) {
    const sql = `
      SELECT m.*, r.name as role_name, w.name as workplace_name
      FROM members m
      LEFT JOIN roles r ON m.role_id = r.id
      LEFT JOIN workplaces w ON m.workplace_id = w.id
      WHERE m.email = $1
    `;
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  // Find member by UO ID (95#)
  static async findByUOId(uo_id) {
    const sql = `
      SELECT m.*, r.name as role_name, w.name as workplace_name
      FROM members m
      LEFT JOIN roles r ON m.role_id = r.id
      LEFT JOIN workplaces w ON m.workplace_id = w.id
      WHERE m.uo_id = $1
    `;
    const result = await query(sql, [uo_id]);
    return result.rows[0];
  }

  // Find all members with optional filters
  static async findAll(filters = {}) {
    let sql = `
      SELECT m.*, r.name as role_name, w.name as workplace_name
      FROM members m
      LEFT JOIN roles r ON m.role_id = r.id
      LEFT JOIN workplaces w ON m.workplace_id = w.id
    `;
    
    const conditions = [];
    const values = [];
    let paramCount = 0;

    if (filters.workplace_id) {
      conditions.push(`m.workplace_id = $${++paramCount}`);
      values.push(filters.workplace_id);
    }

    if (filters.dues_status) {
      conditions.push(`m.dues_status = $${++paramCount}`);
      values.push(filters.dues_status);
    }

    if (filters.membership_status) {
      conditions.push(`m.membership_status = $${++paramCount}`);
      values.push(filters.membership_status);
    }

    if (filters.search) {
      conditions.push(`(m.name ILIKE $${++paramCount} OR m.email ILIKE $${++paramCount})`);
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY m.name ASC`;

    if (filters.limit) {
      sql += ` LIMIT $${++paramCount}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      sql += ` OFFSET $${++paramCount}`;
      values.push(filters.offset);
    }

    const result = await query(sql, values);
    return result.rows;
  }

  // Update member
  static async update(id, data) {
    const allowedFields = [
      'name', 'email', 'uo_id', 'workplace_id', 'role_id', 'dues_status',
      'membership_status', 'major', 'phone', 'pronouns', 'graduation_year'
    ];

    const updates = [];
    const values = [];
    let paramCount = 0;

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        let normalizedValue = data[key];
        
        // Normalize integer fields: convert empty strings to null
        if (key === 'workplace_id' || key === 'role_id') {
          normalizedValue = (normalizedValue === '' || normalizedValue === null) 
            ? null 
            : parseInt(normalizedValue);
        }
        
        // Normalize graduation_year
        if (key === 'graduation_year') {
          normalizedValue = (normalizedValue === '' || normalizedValue === null) 
            ? null 
            : normalizedValue ? parseInt(normalizedValue) : null;
        }
        
        // Normalize text fields: convert empty strings to null
        if (key === 'major' || key === 'phone' || key === 'pronouns') {
          normalizedValue = (normalizedValue === '') ? null : normalizedValue;
        }
        
        updates.push(`${key} = $${++paramCount}`);
        values.push(normalizedValue);
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE members 
      SET ${updates.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Delete member
  static async delete(id) {
    const sql = 'DELETE FROM members WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get member statistics
  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_members,
        COUNT(CASE WHEN membership_status = 'active' THEN 1 END) as active_members,
        COUNT(CASE WHEN membership_status = 'inactive' THEN 1 END) as inactive_members,
        COUNT(CASE WHEN membership_status = 'graduated' THEN 1 END) as graduated_members,
        COUNT(CASE WHEN dues_status = 'paid' THEN 1 END) as paid_dues,
        COUNT(CASE WHEN dues_status = 'unpaid' THEN 1 END) as unpaid_dues,
        COUNT(CASE WHEN dues_status = 'exempt' THEN 1 END) as exempt_dues
      FROM members
    `;
    const result = await query(sql);
    return result.rows[0];
  }

  // Get members by workplace
  static async getByWorkplace(workplaceId) {
    const sql = `
      SELECT m.*, r.name as role_name, w.name as workplace_name
      FROM members m
      LEFT JOIN roles r ON m.role_id = r.id
      LEFT JOIN workplaces w ON m.workplace_id = w.id
      WHERE m.workplace_id = $1
      ORDER BY m.name ASC
    `;
    const result = await query(sql, [workplaceId]);
    return result.rows;
  }
}

module.exports = Member;


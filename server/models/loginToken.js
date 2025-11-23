const { query } = require('../config/db');
const crypto = require('crypto');

class LoginToken {
  // Create a new login token
  static async create(email, expiresInMinutes = 15) {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const sql = `
      INSERT INTO login_tokens (email, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [email, token, expiresAt];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find and mark token as used in a single atomic operation
  static async findAndMarkAsUsed(token) {
    const sql = `
      UPDATE login_tokens
      SET used = TRUE
      WHERE token = $1
      AND expires_at > NOW()
      AND used = FALSE
      RETURNING *
    `;
    const result = await query(sql, [token]);
    return result.rows[0];
  }

  // Delete all tokens for an email (optional - for rate limiting)
  static async deleteByEmail(email) {
    const sql = `
      DELETE FROM login_tokens
      WHERE email = $1
    `;
    await query(sql, [email]);
  }
}

module.exports = LoginToken;


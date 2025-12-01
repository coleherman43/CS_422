const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

class QRCodeService {
  // Secret key for signing JWT tokens (should be in environment variables)
  static getSecret() {
    return process.env.JWT_SECRET || process.env.QR_CODE_SECRET || 'default-secret-key-change-in-production';
  }

  // Default expiration time: 2 hours from generation
  static getDefaultExpiration() {
    return 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  }

  /**
   * Generate a time-limited QR code token for an event
   * @param {number} eventId - The event ID
   * @param {number} expirationMs - Optional expiration time in milliseconds (default: 2 hours)
   * @returns {string} JWT token string
   */
  static generateToken(eventId, expirationMs = null) {
    const secret = this.getSecret();
    const expiration = expirationMs || this.getDefaultExpiration();
    const expiresAt = Date.now() + expiration;

    const payload = {
      eventId: eventId,
      iat: Math.floor(Date.now() / 1000), // Issued at (in seconds)
      exp: Math.floor(expiresAt / 1000)   // Expiration (in seconds)
    };

    return jwt.sign(payload, secret, {
      algorithm: 'HS256'
    });
  }

  /**
   * Generate QR code image as data URL (for embedding in HTML)
   * @param {string} token - JWT token to encode
   * @returns {Promise<string>} Data URL of QR code image
   */
  static async generateQRCodeDataURL(token) {
    try {
      const dataURL = await QRCode.toDataURL(token, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return dataURL;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generate QR code as buffer (for sending as image file)
   * @param {string} token - JWT token to encode
   * @returns {Promise<Buffer>} Buffer containing QR code image
   */
  static async generateQRCodeBuffer(token) {
    try {
      const buffer = await QRCode.toBuffer(token, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return buffer;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Validate QR code token
   * @param {string} token - JWT token to validate
   * @param {number} expectedEventId - Expected event ID (optional, for additional validation)
   * @returns {Object} { valid: boolean, decoded: Object|null, error: string|null }
   */
  static validateToken(token, expectedEventId = null) {
    const secret = this.getSecret();

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256']
      });

      // Additional validation: check if event ID matches (if provided)
      if (expectedEventId !== null && decoded.eventId !== expectedEventId) {
        return {
          valid: false,
          decoded: null,
          error: 'QR code token does not match this event'
        };
      }

      // Check if token has expired (additional check, though JWT verification should catch this)
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        return {
          valid: false,
          decoded: null,
          error: 'QR code token has expired'
        };
      }

      return {
        valid: true,
        decoded: decoded,
        error: null
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          decoded: null,
          error: 'QR code token has expired'
        };
      } else if (error.name === 'JsonWebTokenError') {
        return {
          valid: false,
          decoded: null,
          error: 'Invalid QR code token'
        };
      } else {
        return {
          valid: false,
          decoded: null,
          error: `Token validation error: ${error.message}`
        };
      }
    }
  }

  /**
   * Get token expiration time (for display purposes)
   * @param {string} token - JWT token
   * @returns {Date|null} Expiration date or null if invalid
   */
  static getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

module.exports = QRCodeService;


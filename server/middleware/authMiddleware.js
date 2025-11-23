const { Member } = require('../models');
const admin = require('../config/firebase');

class AuthMiddleware {
  // Verify user is logged in using Firebase ID token
  static async authenticate(req, res, next) {
    try {
      // Get token from Authorization header
      const authHeader = req.header('Authorization');
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      // Extract token (format: "Bearer <token>")
      const idToken = authHeader.replace('Bearer ', '');
      if (!idToken) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Get member by email to attach full member info
      const member = await Member.findByEmail(decodedToken.email);
      if (!member) {
        return res.status(401).json({
          success: false,
          message: 'Member not found'
        });
      }

      // Attach user info to request
      req.user = {
        id: member.id,
        email: member.email,
        name: member.name
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
      res.status(401).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }

  // Check user role permissions
  static authorizeRole(allowedRoles) {
    return async (req, res, next) => {
      try {
        // TODO: Implement role checking when authentication is added
        // For now, just pass through
        
        // Example implementation:
        // const member = await Member.findById(req.user.id);
        // if (!member || !allowedRoles.includes(member.role_name)) {
        //   return res.status(403).json({
        //     success: false,
        //     message: 'Access denied. Insufficient permissions.'
        //   });
        // }
        
        next();
      } catch (error) {
        console.error('Authorization error:', error);
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    };
  }

  // Verify admin access
  static async authorizeAdmin(req, res, next) {
    try {
      // TODO: Implement admin checking when authentication is added
      // For now, just pass through
      
      // Example implementation:
      // const member = await Member.findById(req.user.id);
      // const adminRoles = ['President', 'Treasurer', 'Executive Member'];
      // if (!member || !adminRoles.includes(member.role_name)) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Admin access required'
      //   });
      // }
      
      next();
    } catch (error) {
      console.error('Admin authorization error:', error);
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
  }

  // Optional authentication (doesn't fail if no auth)
  static async optionalAuth(req, res, next) {
    try {
      // TODO: Implement optional authentication
      // This would be useful for endpoints that work differently for logged-in vs anonymous users
      
      req.user = null; // Placeholder
      next();
    } catch (error) {
      // Don't fail on optional auth errors
      req.user = null;
      next();
    }
  }
}

module.exports = AuthMiddleware;


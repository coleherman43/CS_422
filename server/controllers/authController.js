const { Member } = require('../models');
const admin = require('../config/firebase');
const EmailService = require('../utils/emailService');

class AuthController {
  // Request magic link login (send email with link using Firebase)
  static async requestLogin(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Check if member exists
      const member = await Member.findByEmail(email);
      if (!member) {
        // Don't reveal that email doesn't exist (security best practice)
        // Still return success to prevent email enumeration
        return res.json({
          success: true,
          message: 'If an account exists with this email, a login link has been sent.'
        });
      }

      // Generate Firebase email link
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const actionCodeSettings = {
        url: `${baseUrl}/verify`,
        handleCodeInApp: false, // Set to true if using mobile app
      };

      // Generate the sign-in link using Firebase
      const magicLink = await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);

      // Send magic link email (non-blocking - log error but don't fail request)
      try {
        await EmailService.sendMagicLinkEmail(email, member.name, magicLink);
      } catch (emailError) {
        console.error('Failed to send magic link email:', emailError);
        // Continue even if email fails - link is still generated and valid
        // User can request another link if needed
      }

      res.json({
        success: true,
        message: 'If an account exists with this email, a login link has been sent.'
      });
    } catch (error) {
      console.error('Request login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Verify Firebase ID token and log user in
  static async verifyToken(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: 'ID token is required'
        });
      }

      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const email = decodedToken.email;

      if (!email) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token: email not found'
        });
      }

      // Get member by email
      const member = await Member.findByEmail(email);
      if (!member) {
        return res.status(401).json({
          success: false,
          message: 'Member not found'
        });
      }

      // Return the Firebase ID token as the session token
      // Frontend can use this token for subsequent requests
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token: idToken,
          member: {
            id: member.id,
            name: member.name,
            email: member.email,
            role_name: member.role_name,
            workplace_name: member.workplace_name
          }
        }
      });
    } catch (error) {
      console.error('Verify token error:', error);
      if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Legacy login endpoint (kept for backward compatibility, but now redirects to requestLogin)
  static async login(req, res) {
    // Redirect to requestLogin for email-based auth
    return this.requestLogin(req, res);
  }

  // Logout
  static async logout(req, res) {
    try {
      // Session tokens are stateless (no server-side storage)
      // Client should remove the token from storage
      // For additional security, you could implement a token blacklist here if needed
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get current user info
  static async getCurrentUser(req, res) {
    try {
      // User should be attached by authMiddleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const member = await Member.findById(req.user.id);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      res.json({
        success: true,
        data: {
          member: {
            id: member.id,
            name: member.name,
            email: member.email,
            role_name: member.role_name,
            workplace_name: member.workplace_name
          }
        }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Register new member (if needed for self-registration)
  static async register(req, res) {
    try {
      const memberData = req.body;

      // Check if member already exists
      const existingMember = await Member.findByEmail(memberData.email);
      if (existingMember) {
        return res.status(409).json({
          success: false,
          message: 'Member with this email already exists'
        });
      }

      // Check if UO ID already exists
      const existingUOId = await Member.findByUOId(memberData.uo_id);
      if (existingUOId) {
        return res.status(409).json({
          success: false,
          message: 'Member with this UO ID already exists'
        });
      }

      // Create new member
      const newMember = await Member.create(memberData);

      res.status(201).json({
        success: true,
        message: 'Member registered successfully',
        data: { member: newMember }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AuthController;


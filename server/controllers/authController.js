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
      let member;
      try {
        member = await Member.findByEmail(email);
      } catch (dbError) {
        if (dbError.message?.includes('DATABASE_URL') || dbError.code === 'ECONNREFUSED') {
          console.error('❌ Database not configured or not running');
          return res.status(503).json({
            success: false,
            message: 'Database is not configured. Please set DATABASE_URL in your .env file.'
          });
        }
        throw dbError;
      }

      if (!member) {
      console.log(`🔐 Login request for email: ${email}`);
      const member = await Member.findByEmail(email);
      if (!member) {
        console.log(`⚠️  Member not found for email: ${email}`);
        // Don't reveal that email doesn't exist (security best practice)
        // Still return success to prevent email enumeration
        return res.json({
          success: true,
          message: 'If an account exists with this email, a login link has been sent.'
        });
      }

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const actionCodeSettings = {
        url: `${baseUrl}/verify`,
        handleCodeInApp: false,
      };

      let magicLink;
      try {
        const isFirebaseInitialized = admin.isInitialized && admin.isInitialized();

        if (!isFirebaseInitialized && process.env.NODE_ENV !== 'production') {
          const crypto = require('crypto');
          const devToken = crypto.randomBytes(32).toString('hex');
          const expiresAt = Date.now() + 15 * 60 * 1000;

          if (!global.devTokens) global.devTokens = new Map();
          global.devTokens.set(devToken, { email, memberId: member.id, expiresAt });

          magicLink = `${baseUrl}/verify?token=${devToken}&email=${encodeURIComponent(email)}`;
          console.log(`🔗 Development magic link generated: ${magicLink}`);
        } else if (isFirebaseInitialized) {
          magicLink = await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);
          console.log(`✅ Magic link generated: ${magicLink.substring(0, 50)}...`);
        } else {
          throw new Error('Firebase is required in production mode but is not initialized');
        }
      } catch (firebaseError) {
      console.log(`✅ Member found: ${member.name} (${member.email})`);

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      let magicLink;

      // Check if Firebase is properly configured
      try {
        // Try to get the project ID to see if Firebase is initialized
        const projectId = admin.app().options.projectId;
        
        if (!projectId && process.env.NODE_ENV !== 'production') {
          // Development mode: Firebase not configured, use simple token
          console.log(`⚠️  Firebase not configured - using development mode`);
          const crypto = require('crypto');
          const devToken = crypto.randomBytes(32).toString('hex');
          const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes
          
          // Store token temporarily (in production, use Redis or database)
          if (!global.devTokens) global.devTokens = new Map();
          global.devTokens.set(devToken, { email, memberId: member.id, expiresAt });
          
          magicLink = `${baseUrl}/verify?token=${devToken}&email=${encodeURIComponent(email)}`;
          console.log(`🔗 Development magic link generated`);
          console.log(`📋 LOGIN LINK (copy this): ${magicLink}`);
        } else {
          // Production mode: Use Firebase
          const actionCodeSettings = {
            url: `${baseUrl}/verify`,
            handleCodeInApp: false,
          };

          console.log(`🔗 Generating Firebase magic link for: ${email}`);
          magicLink = await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);
          console.log(`✅ Magic link generated: ${magicLink.substring(0, 50)}...`);
        }
      } catch (firebaseError) {
        // Firebase not configured - fall back to development mode
        if (process.env.NODE_ENV !== 'production') {
          console.log(`⚠️  Firebase error - using development mode:`, firebaseError.message);
          const crypto = require('crypto');
          const devToken = crypto.randomBytes(32).toString('hex');
          const expiresAt = Date.now() + 15 * 60 * 1000;

          if (!global.devTokens) global.devTokens = new Map();
          global.devTokens.set(devToken, { email, memberId: member.id, expiresAt });

          magicLink = `${baseUrl}/verify?token=${devToken}&email=${encodeURIComponent(email)}`;
          console.log(`🔗 Development magic link generated: ${magicLink}`);
          const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes
          
          if (!global.devTokens) global.devTokens = new Map();
          global.devTokens.set(devToken, { email, memberId: member.id, expiresAt });
          
          magicLink = `${baseUrl}/verify?token=${devToken}&email=${encodeURIComponent(email)}`;
          console.log(`🔗 Development magic link generated`);
          console.log(`📋 LOGIN LINK (copy this): ${magicLink}`);
        } else {
          throw firebaseError;
        }
      }

      try {
        console.log(`📧 Attempting to send email to: ${email}`);
        const emailResult = await EmailService.sendMagicLinkEmail(email, member.name, magicLink);
        console.log(`📧 Email send result:`, emailResult);
        if (emailResult.mode === 'console') {
          console.log(`⚠️  Email not configured - check console above for the login link!`);
        }
      } catch (emailError) {
        console.error('Failed to send magic link email:', emailError);
        console.error('❌ Failed to send magic link email:', emailError);
        // Continue even if email fails - link is still generated and valid
      }

      res.json({
        success: true,
        message: 'If an account exists with this email, a login link has been sent.'
      });
    } catch (error) {
      console.error('Request login error:', error);
      console.error('Error stack:', error.stack);

      if (error.code === 'ECONNREFUSED' || error.message?.includes('connect')) {
        return res.status(503).json({
          success: false,
          message: 'Database connection failed. Please check your database configuration.'
        });
      }

      res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Verify Firebase ID token and log user in
  static async verifyToken(req, res) {
    try {
      const { idToken, token, email: emailParam } = req.body;

      // Check for development token (from query params or body)
      const devToken = token || req.query.token;
      const devEmail = emailParam || req.query.email;

      if (devToken && devEmail && process.env.NODE_ENV !== 'production') {
        // Development mode: verify simple token
        console.log(`🔐 Verifying development token for: ${devEmail}`);
        
        if (!global.devTokens) {
          return res.status(401).json({
            success: false,
            message: 'Invalid token'
          });
        }

        const tokenData = global.devTokens.get(devToken);
        if (!tokenData) {
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
          });
        }

        if (tokenData.email !== devEmail) {
          return res.status(401).json({
            success: false,
            message: 'Token email mismatch'
          });
        }

        if (Date.now() > tokenData.expiresAt) {
          global.devTokens.delete(devToken);
          return res.status(401).json({
            success: false,
            message: 'Token expired'
          });
        }

        // Get member
        const member = await Member.findByEmail(devEmail);
        if (!member) {
          return res.status(401).json({
            success: false,
            message: 'Member not found'
          });
        }

        // Clean up token
        global.devTokens.delete(devToken);

        // Return success with a simple token
        const crypto = require('crypto');
        const sessionToken = crypto.randomBytes(32).toString('hex');
        
        console.log(`✅ Development login successful for: ${member.name}`);

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token: sessionToken,
            member: {
              id: member.id,
              name: member.name,
              email: member.email,
              role_name: member.role_name,
              workplace_name: member.workplace_name
            }
          }
        });
        return;
      }

      // Production mode: Use Firebase
      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: 'ID token is required'
        });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const email = decodedToken.email;

      if (!email) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token: email not found'
        });
      }

      const member = await Member.findByEmail(email);
      if (!member) {
        return res.status(401).json({
          success: false,
          message: 'Member not found'
        });
      }

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

  // Legacy login endpoint
  static async login(req, res) {
    return this.requestLogin(req, res);
  }

  // Logout
  static async logout(req, res) {
    try {
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

  // Register new member
  static async register(req, res) {
    try {
      const memberData = req.body;

      const existingMember = await Member.findByEmail(memberData.email);
      if (existingMember) {
        return res.status(409).json({
          success: false,
          message: 'Member with this email already exists'
        });
      }

      const existingUOId = await Member.findByUOId(memberData.uo_id);
      if (existingUOId) {
        return res.status(409).json({
          success: false,
          message: 'Member with this UO ID already exists'
        });
      }

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

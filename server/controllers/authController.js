const { Member } = require('../models');
const admin = require('../config/firebase');
const EmailService = require('../utils/emailService');

class AuthController {

  // =======================
  // REQUEST MAGIC LINK LOGIN
  // =======================
  static async requestLogin(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      // Normalize email to lowercase for consistent lookup
      const normalizedEmail = email.toLowerCase().trim();

      // ---- Find account ----
      let member;
      try {
        member = await Member.findByEmail(normalizedEmail);
      } catch (dbError) {
        if (dbError.message?.includes("DATABASE_URL") || dbError.code === "ECONNREFUSED") {
          return res.status(503).json({
            success: false,
            message: "Database not configured. Set DATABASE_URL in .env"
          });
        }
        throw dbError;
      }

      console.log(`🔐 Login attempt: ${email}`);

      // ❗ Don't reveal existence of email — security best practice
      if (!member) {
        return res.json({
          success: true,
          message: "If an account exists with this email, a login link has been sent."
        });
      }

      console.log(`✅ Member found: ${member.name} (${member.email})`);

      // Ensure we use port 3000 for React app (not server port)
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      // Override if FRONTEND_URL points to wrong port
      const baseUrlFinal = baseUrl.includes(':5001') ? "http://localhost:3000" : baseUrl;
      let magicLink;

      // Try Firebase first — if fails → dev mode
      try {
        const projectId = admin.app().options.projectId;
        if (!projectId && process.env.NODE_ENV !== "production") {
          throw new Error("Firebase not configured — switching to dev mode");
        }

        console.log("⚡ Firebase magic link generating...");
        magicLink = await admin.auth().generateSignInWithEmailLink(normalizedEmail, {
          url: `${baseUrlFinal}/verify`,
          handleCodeInApp: false
        });

      } catch (firebaseError) {
        console.log("⚠ Firebase unavailable → using development token");

        const crypto = require("crypto");
        const devToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = Date.now() + 15 * 60 * 1000;

        if (!global.devTokens) global.devTokens = new Map();
        global.devTokens.set(devToken, { email: normalizedEmail, memberId: member.id, expiresAt });

        magicLink = `${baseUrlFinal}/verify?token=${devToken}&email=${encodeURIComponent(normalizedEmail)}`;
        console.log(`🔗 Dev magic link: ${magicLink}`);
      }

      // Send email (if configured)
      try {
        await EmailService.sendMagicLinkEmail(normalizedEmail, member.name, magicLink);
      } catch {
        console.log("📩 Email not configured — link shown above.");
      }

      return res.json({
        success: true,
        message: "If an account exists with this email, a login link has been sent."
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // =======================
  // VERIFY TOKEN (firebase or dev mode)
  // =======================
  static async verifyToken(req, res) {
    try {
      const { idToken, token, email: emailParam } = req.body;

      // ------- Development / local mode token -------
      const devToken = token || req.query.token;
      const devEmail = emailParam || req.query.email;

      if (devToken && devEmail && process.env.NODE_ENV !== "production") {
        console.log(`🔐 Verifying development token for ${devEmail}`);

        if (!global.devTokens) {
          return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const tokenData = global.devTokens.get(devToken);
        if (!tokenData || tokenData.email !== devEmail) {
          return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        if (Date.now() > tokenData.expiresAt) {
          global.devTokens.delete(devToken);
          return res.status(401).json({ success: false, message: "Token expired" });
        }

        const member = await Member.findByEmail(devEmail);
        if (!member) return res.status(401).json({ success: false, message: "Member not found" });

        global.devTokens.delete(devToken);

        const crypto = require("crypto");
        const sessionToken = crypto.randomBytes(32).toString("hex");

        return res.json({
          success: true,
          message: "Login successful",
          data: {
            token: sessionToken,
            member: {
              id: member.id, name: member.name, email: member.email,
              role_name: member.role_name, workplace_name: member.workplace_name
            }
          }
        });
      }


      // ------- Production Firebase Login -------
      if (!idToken) {
        return res.status(400).json({ success: false, message: "ID token required" });
      }

      const decoded = await admin.auth().verifyIdToken(idToken);
      const email = decoded.email;

      const member = await Member.findByEmail(email);
      if (!member) return res.status(401).json({ success: false, message: "Member not found" });

      return res.json({
        success: true,
        message: "Login successful",
        data: {
          token: idToken,
          member: {
            id: member.id, name: member.name, email: member.email,
            role_name: member.role_name, workplace_name: member.workplace_name
          }
        }
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  // ========= Redirects old login endpoint ========
  static async login(req, res) {
    return this.requestLogin(req, res);
  }


  // =======================
  // LOGOUT
  // =======================
  static async logout(req, res) {
    return res.json({ success: true, message: "Logout successful" });
  }


  // =======================
  // GET CURRENT USER
  // =======================
  static async getCurrentUser(req, res) {
    try {
      if (!req.user) return res.status(401).json({ success:false, message:"Not authenticated" });

      const member = await Member.findById(req.user.id);
      if (!member) return res.status(404).json({ success:false, message:"Member not found" });

      res.json({
        success: true,
        data: { member }
      });

    } catch (error) {
      res.status(500).json({ success:false, message:"Internal server error" });
    }
  }


  // =======================
  // REGISTER NEW ACCOUNT
  // =======================
  static async register(req, res) {
    try {
      const memberData = req.body;

      if (await Member.findByEmail(memberData.email)) {
        return res.status(409).json({ success:false, message:"Email already exists" });
      }
      if (await Member.findByUOId(memberData.uo_id)) {
        return res.status(409).json({ success:false, message:"UO ID already exists" });
      }

      const newMember = await Member.create(memberData);
      res.status(201).json({ success:true, message:"Member registered", data:{ member:newMember } });

    } catch (error) {
      res.status(500).json({ success:false, message:"Internal server error" });
    }
  }
}

module.exports = AuthController;

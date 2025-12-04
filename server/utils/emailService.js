const nodemailer = require('nodemailer');
const https = require('https');

class EmailService {
  // Initialize email transporter
  static getTransporter() {
    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return null; // Will fall back to console logging
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
  }

  // Send email using Resend API (bypasses SMTP blocking)
  static async sendEmailViaResend(to, subject, text, html = null) {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      // Extract email from "Name <email>" format if needed
      const from = fromEmail.includes('<') ? fromEmail.match(/<(.+)>/)[1] : fromEmail;

      const { data, error } = await resend.emails.send({
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html || text.replace(/\n/g, '<br>')
      });

      if (error) {
        throw error;
      }

      console.log('📧 Email sent successfully via Resend:', data.id);
      return { success: true, messageId: data.id, mode: 'resend' };
    } catch (error) {
      console.error('Resend API error:', error);
      throw error;
    }
  }

  // Send email using SendGrid HTTP API (bypasses SMTP blocking, no domain verification needed)
  static async sendEmailViaSendGrid(to, subject, text, html = null) {
    return new Promise((resolve, reject) => {
      try {
        const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com';
        // Extract email from "Name <email>" format if needed
        const from = fromEmail.includes('<') ? fromEmail.match(/<(.+)>/)[1] : fromEmail;

        const payload = JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
            subject: subject
          }],
          from: { email: from },
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html || text.replace(/\n/g, '<br>') }
          ]
        });

        const options = {
          hostname: 'api.sendgrid.com',
          port: 443,
          path: '/v3/mail/send',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const messageId = res.headers['x-message-id'] || `sg_${Date.now()}`;
              console.log('📧 Email sent successfully via SendGrid:', messageId);
              resolve({ success: true, messageId: messageId, mode: 'sendgrid' });
            } else {
              reject(new Error(`SendGrid API error (${res.statusCode}): ${data}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.write(payload);
        req.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Send email helper method
  static async sendEmail(to, subject, text, html = null) {
    // Try SendGrid HTTP API first (if configured) - works without domain verification
    if (process.env.SENDGRID_API_KEY) {
      console.log('📧 Using SendGrid HTTP API (SENDGRID_API_KEY detected)');
      try {
        return await this.sendEmailViaSendGrid(to, subject, text, html);
      } catch (error) {
        console.error('❌ SendGrid API failed, falling back to other methods:', error.message);
        console.error('SendGrid error details:', error);
        // Fall through to Resend or SMTP
      }
    }

    // Try Resend API second (if configured)
    if (process.env.RESEND_API_KEY) {
      console.log('📧 Using Resend API (RESEND_API_KEY detected)');
      try {
        return await this.sendEmailViaResend(to, subject, text, html);
      } catch (error) {
        console.error('❌ Resend API failed, falling back to SMTP or console:', error.message);
        console.error('Resend error details:', error);
        // Fall through to SMTP or console logging
      }
    }

    const transporter = this.getTransporter();
    
    // If email is not configured, fall back to console logging
    if (!transporter) {
      console.log('📧 EMAIL SENT (Console Log - Email not configured):');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', text);
      console.log('=====================================');
      return { success: true, messageId: `console_${Date.now()}`, mode: 'console' };
    }

    try {
      const mailOptions = {
        from: `"UOSW Administration" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: html || text.replace(/\n/g, '<br>')
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId, mode: 'email' };
    } catch (error) {
      console.error('Email sending error:', error);
      // Fall back to console logging on error
      console.log('📧 EMAIL FALLBACK (Console Log):');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', text);
      console.log('=====================================');
      return { success: true, messageId: `console_${Date.now()}`, mode: 'console_fallback' };
    }
  }

  // Send member confirmation email
  static async sendMemberConfirmation(memberData) {
    try {
      const text = `
        MEMBER CONFIRMATION EMAIL
        ========================
        
        Dear ${memberData.name},
        
        Welcome to the UO Student Workers Union! Your membership has been successfully registered.
        
        Member Details:
        - Name: ${memberData.name}
        - Email: ${memberData.email}
        - UO ID: ${memberData.uo_id}
        - Workplace: ${memberData.workplace_name || 'Not specified'}
        - Role: ${memberData.role_name || 'Member'}
        
        You will receive updates about union activities and events at this email address.
        
        Best regards,
        UOSW Administration
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            MEMBER CONFIRMATION EMAIL
          </h2>
          <p>Dear ${memberData.name},</p>
          <p>Welcome to the UO Student Workers Union! Your membership has been successfully registered.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Member Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Name:</strong> ${memberData.name}</li>
              <li><strong>Email:</strong> ${memberData.email}</li>
              <li><strong>UO ID:</strong> ${memberData.uo_id}</li>
              <li><strong>Workplace:</strong> ${memberData.workplace_name || 'Not specified'}</li>
              <li><strong>Role:</strong> ${memberData.role_name || 'Member'}</li>
            </ul>
          </div>
          <p>You will receive updates about union activities and events at this email address.</p>
          <p>Best regards,<br><strong>UOSW Administration</strong></p>
        </div>
      `;

      return await this.sendEmail(
        memberData.email,
        'Welcome to UOSW - Membership Confirmation',
        text,
        html
      );
    } catch (error) {
      console.error('Email service error:', error);
      throw new Error('Failed to send confirmation email');
    }
  }

  // Send event reminder email
  static async sendEventReminder(eventData, recipients) {
    try {
      if (!recipients || recipients.length === 0) {
        return { success: true, messageId: null, recipientsCount: 0, mode: 'skipped' };
      }

      const eventDate = new Date(eventData.event_date).toLocaleString();
      const text = `
        EVENT REMINDER
        =============
        
        Event: ${eventData.title}
        Date: ${eventDate}
        Location: ${eventData.location || 'TBD'}
        
        Description:
        ${eventData.description || 'No description provided'}
        
        We look forward to seeing you there!
        
        UOSW Administration
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">
            EVENT REMINDER
          </h2>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2196F3;">${eventData.title}</h3>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Location:</strong> ${eventData.location || 'TBD'}</p>
          </div>
          ${eventData.description ? `<p>${eventData.description}</p>` : ''}
          <p>We look forward to seeing you there!</p>
          <p>Best regards,<br><strong>UOSW Administration</strong></p>
        </div>
      `;

      const recipientEmails = recipients.map(r => r.email).join(', ');
      const result = await this.sendEmail(
        recipientEmails,
        `Event Reminder - ${eventData.title}`,
        text,
        html
      );

      return { 
        ...result,
        recipientsCount: recipients.length
      };
    } catch (error) {
      console.error('Event reminder email error:', error);
      throw new Error('Failed to send event reminder');
    }
  }

  // Send check-in confirmation email
  static async sendCheckInConfirmation(memberData, eventData) {
    try {
      const eventDate = new Date(eventData.event_date).toLocaleString();
      const text = `
        CHECK-IN CONFIRMATION
        ====================
        
        Dear ${memberData.name},
        
        You have successfully checked in to:
        
        Event: ${eventData.title}
        Date: ${eventDate}
        Location: ${eventData.location || 'TBD'}
        
        Thank you for your participation!
        
        UOSW Administration
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            CHECK-IN CONFIRMATION
          </h2>
          <p>Dear ${memberData.name},</p>
          <p>You have successfully checked in to:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4CAF50;">${eventData.title}</h3>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Location:</strong> ${eventData.location || 'TBD'}</p>
          </div>
          <p>Thank you for your participation!</p>
          <p>Best regards,<br><strong>UOSW Administration</strong></p>
        </div>
      `;

      return await this.sendEmail(
        memberData.email,
        `Check-in Confirmation - ${eventData.title}`,
        text,
        html
      );
    } catch (error) {
      console.error('Check-in confirmation email error:', error);
      throw new Error('Failed to send check-in confirmation');
    }
  }

  // Send dues reminder email
  static async sendDuesReminder(memberData) {
    try {
      const text = `
        DUES REMINDER
        =============
        
        Dear ${memberData.name},
        
        This is a friendly reminder that your union dues are currently unpaid.
        
        Member Details:
        - Name: ${memberData.name}
        - UO ID: ${memberData.uo_id}
        - Workplace: ${memberData.workplace_name || 'Not specified'}
        
        Please contact the treasurer to arrange payment.
        
        Thank you for your continued membership!
        
        UOSW Administration
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #FF9800; padding-bottom: 10px;">
            DUES REMINDER
          </h2>
          <p>Dear ${memberData.name},</p>
          <p>This is a friendly reminder that your union dues are currently unpaid.</p>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FF9800;">
            <h3 style="margin-top: 0;">Member Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Name:</strong> ${memberData.name}</li>
              <li><strong>UO ID:</strong> ${memberData.uo_id}</li>
              <li><strong>Workplace:</strong> ${memberData.workplace_name || 'Not specified'}</li>
            </ul>
          </div>
          <p>Please contact the treasurer to arrange payment.</p>
          <p>Thank you for your continued membership!</p>
          <p>Best regards,<br><strong>UOSW Administration</strong></p>
        </div>
      `;

      return await this.sendEmail(
        memberData.email,
        'UOSW Dues Reminder',
        text,
        html
      );
    } catch (error) {
      console.error('Dues reminder email error:', error);
      throw new Error('Failed to send dues reminder');
    }
  }

  // Send general announcement
  static async sendAnnouncement(announcementData, recipients) {
    try {
      if (!recipients || recipients.length === 0) {
        return { success: true, messageId: null, recipientsCount: 0, mode: 'skipped' };
      }

      const text = `
        UNION ANNOUNCEMENT
        =================
        
        Subject: ${announcementData.subject}
        
        ${announcementData.message}
        
        UOSW Administration
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #9C27B0; padding-bottom: 10px;">
            UNION ANNOUNCEMENT
          </h2>
          <h3 style="color: #9C27B0;">${announcementData.subject}</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="white-space: pre-wrap;">${announcementData.message}</p>
          </div>
          <p>Best regards,<br><strong>UOSW Administration</strong></p>
        </div>
      `;

      const recipientEmails = recipients.map(r => r.email).join(', ');
      const result = await this.sendEmail(
        recipientEmails,
        announcementData.subject,
        text,
        html
      );

      return { 
        ...result,
        recipientsCount: recipients.length
      };
    } catch (error) {
      console.error('Announcement email error:', error);
      throw new Error('Failed to send announcement');
    }
  }

  // Send magic link login email
  static async sendMagicLinkEmail(email, name, magicLink) {
    try {
      const text = `
        LOGIN LINK
        ==========
        
        Dear ${name},
        
        You requested a login link for Flock Manager. Click the link below to access your account:
        
        ${magicLink}
        
        This link will expire in 15 minutes and can only be used once.
        
        If you did not request this login link, please ignore this email.
        
        Best regards,
        UOSW Administration
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">
            LOGIN LINK
          </h2>
          <p>Dear ${name},</p>
          <p>You requested a login link for Flock Manager. Click the button below to access your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background-color: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Login to Flock Manager
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${magicLink}</p>
          <p style="color: #999; font-size: 11px; margin-top: 30px;">
            This link will expire in 15 minutes and can only be used once.
          </p>
          <p style="color: #999; font-size: 11px;">
            If you did not request this login link, please ignore this email.
          </p>
          <p>Best regards,<br><strong>UOSW Administration</strong></p>
        </div>
      `;

      return await this.sendEmail(
        email,
        'Your Flock Manager Login Link',
        text,
        html
      );
    } catch (error) {
      console.error('Magic link email error:', error);
      throw new Error('Failed to send magic link email');
    }
  }

  // Test email service
  static async testEmailService() {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.log('📧 EMAIL SERVICE TEST');
        console.log('Service is running in console logging mode (email not configured)');
        console.log('To enable email sending, configure EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env');
        console.log('=====================================');
        return { success: true, mode: 'console_logging', configured: false };
      }

      // Try to verify connection
      await transporter.verify();
      console.log('📧 EMAIL SERVICE TEST');
      console.log('Email service is configured and ready');
      console.log('=====================================');
      return { success: true, mode: 'email', configured: true };
    } catch (error) {
      console.error('Email service test error:', error);
      return { success: false, mode: 'error', error: error.message, configured: true };
    }
  }
}

module.exports = EmailService;


const { Event, Attendance, Member } = require('../models');
const EmailService = require('../utils/emailService');
const QRCodeService = require('../utils/qrCodeService');

class EventController {
  // Create new event
  static async createEvent(req, res) {
    try {
      const eventData = req.body;

      // Validate that creator exists
      if (eventData.created_by) {
        const creator = await Member.findById(eventData.created_by);
        if (!creator) {
          return res.status(400).json({
            success: false,
            message: 'Invalid creator ID'
          });
        }
      }

      const newEvent = await Event.create(eventData);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: { event: newEvent }
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all events with optional filters
  static async getEvents(req, res) {
    try {
      const filters = {
        upcoming: req.query.upcoming === 'true',
        past: req.query.past === 'true',
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        created_by: req.query.created_by,
        search: req.query.search,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const events = await Event.findAll(filters);

      res.json({
        success: true,
        data: { events },
        count: events.length
      });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get event by ID
  static async getEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Get attendance for this event
      const attendance = await Attendance.findByEvent(id);

      res.json({
        success: true,
        data: { 
          event,
          attendance,
          attendance_count: attendance.length
        }
      });
    } catch (error) {
      console.error('Get event by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update event
  static async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if event exists
      const existingEvent = await Event.findById(id);
      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      const updatedEvent = await Event.update(id, updateData);

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: { event: updatedEvent }
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete event
  static async deleteEvent(req, res) {
    try {
      const { id } = req.params;

      // Check if event exists
      const existingEvent = await Event.findById(id);
      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      const deletedEvent = await Event.delete(id);

      res.json({
        success: true,
        message: 'Event deleted successfully',
        data: { event: deletedEvent }
      });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Check in member to event
  static async checkInMember(req, res) {
    try {
      const { id: eventId } = req.params;
      const { member_id, name, uo_id, qr_code_token } = req.body;

      // Validate event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      let member;
      
      // If member_id is provided, use it directly
      if (member_id) {
        member = await Member.findById(member_id);
        if (!member) {
          return res.status(404).json({
            success: false,
            message: 'Member not found'
          });
        }
        // For member_id check-ins, QR code token is optional
        if (qr_code_token) {
          const validation = QRCodeService.validateToken(qr_code_token, parseInt(eventId));
          if (!validation.valid) {
            return res.status(400).json({
              success: false,
              message: validation.error || 'Invalid QR code token'
            });
          }
        }
      } 
      // Otherwise, look up by name (for QR code check-ins)
      else if (name) {
        // First, truncate to database limits BEFORE any processing
        // Database: name VARCHAR(100), uo_id VARCHAR(20)
        let processedName = typeof name === 'string' ? name.substring(0, 100) : '';
        let processedUoId = (uo_id && typeof uo_id === 'string') ? uo_id.substring(0, 20) : null;
        
        // Now trim and normalize
        processedName = processedName.trim();
        processedUoId = processedUoId ? processedUoId.trim() : null;
        
        // Validate name is not empty after processing
        if (!processedName || processedName.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Name is required'
          });
        }
        
        // Final truncation check (shouldn't be needed, but safety check)
        if (processedName.length > 100) {
          processedName = processedName.substring(0, 100);
        }
        if (processedUoId && processedUoId.length > 20) {
          processedUoId = processedUoId.substring(0, 20);
        }
        
        // For QR code check-ins, token is required
        if (!qr_code_token) {
          return res.status(400).json({
            success: false,
            message: 'QR code token is required for check-in'
          });
        }
        
        // Validate QR code token
        const validation = QRCodeService.validateToken(qr_code_token, parseInt(eventId));
        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            message: validation.error || 'Invalid or expired QR code token'
          });
        }
        
        // Normalize name: collapse multiple spaces to single space
        // This helps match names that might have extra spaces in the database
        let normalizedName = processedName.replace(/\s+/g, ' ').trim();
        
        // Final safety check - ensure normalized name is still within limits
        if (normalizedName.length > 100) {
          normalizedName = normalizedName.substring(0, 100);
        }
        
        // Look up member by name only (name matching is case-insensitive)
        member = await Member.findByNameForCheckIn(normalizedName);
        if (!member) {
          return res.status(404).json({
            success: false,
            message: 'Member not found. Please verify your name matches exactly as it appears in the system.'
          });
        }
        
        // Optionally verify UO ID if provided (but don't fail if it doesn't match - name is sufficient)
        if (processedUoId && member.uo_id && member.uo_id !== processedUoId) {
          // UO ID provided but doesn't match - still allow check-in since name matches
          // This is just a warning, not an error
          console.log(`Warning: UO ID mismatch for member ${member.id}. Provided: ${processedUoId}, Expected: ${member.uo_id}`);
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either member_id or name is required'
        });
      }

      // Check if already checked in
      const alreadyCheckedIn = await Attendance.isCheckedIn(member.id, eventId);
      if (alreadyCheckedIn) {
        return res.status(409).json({
          success: false,
          message: 'You have already checked in to this event'
        });
      }

      // Ensure qr_code_token is within database limits (VARCHAR(500))
      let safeQrToken = qr_code_token;
      if (safeQrToken && safeQrToken.length > 500) {
        safeQrToken = safeQrToken.substring(0, 500);
        console.warn(`QR token truncated from ${qr_code_token.length} to 500 characters`);
      }
      
      // Record the check-in
      const checkIn = await Attendance.recordCheckIn(member.id, eventId, safeQrToken);

      // Send check-in confirmation email (non-blocking - don't fail check-in if email fails)
      try {
        await EmailService.sendCheckInConfirmation(member, event);
      } catch (emailError) {
        console.error('Failed to send check-in confirmation email:', emailError);
        // Continue even if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Check-in successful',
        data: { checkIn, member: { id: member.id, name: member.name } }
      });
    } catch (error) {
      console.error('Check-in error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint
      });
      
      // Check if it's a database value too long error
      if (error.message && error.message.includes('value too long')) {
        return res.status(400).json({
          success: false,
          message: 'Input value is too long. Please ensure your name is 100 characters or less and your 95# is 20 characters or less.'
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Get event attendance
  static async getEventAttendance(req, res) {
    try {
      const { id: eventId } = req.params;

      // Validate event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      const attendance = await Attendance.findByEvent(eventId);
      const summary = await Attendance.getMeetingSummary(eventId);

      res.json({
        success: true,
        data: { 
          event,
          attendance,
          summary,
          attendance_count: attendance.length
        }
      });
    } catch (error) {
      console.error('Get event attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get upcoming events
  static async getUpcomingEvents(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const events = await Event.getUpcoming(limit);

      res.json({
        success: true,
        data: { events },
        count: events.length
      });
    } catch (error) {
      console.error('Get upcoming events error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get events by creator
  static async getEventsByCreator(req, res) {
    try {
      const { creatorId } = req.params;
      const events = await Event.getByCreator(creatorId);

      res.json({
        success: true,
        data: { events },
        count: events.length
      });
    } catch (error) {
      console.error('Get events by creator error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Generate QR code for event
  static async generateQRCode(req, res) {
    try {
      const { id: eventId } = req.params;
      const { expiration_hours } = req.query; // Optional: custom expiration in hours

      // Validate event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Calculate expiration time if provided
      let expirationMs = null;
      if (expiration_hours) {
        const hours = parseFloat(expiration_hours);
        if (isNaN(hours) || hours <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid expiration_hours parameter'
          });
        }
        expirationMs = hours * 60 * 60 * 1000; // Convert to milliseconds
      }

      // Generate token
      const token = QRCodeService.generateToken(parseInt(eventId), expirationMs);

      // Get frontend URL for QR code redirect (use public check-in route, not dashboard)
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const checkInUrl = `${frontendUrl}/checkin/${eventId}?token=${encodeURIComponent(token)}&eventId=${eventId}`;

      // Generate QR code as data URL (encode the URL, not just the token)
      const qrCodeDataURL = await QRCodeService.generateQRCodeDataURL(checkInUrl);
      const expirationDate = QRCodeService.getTokenExpiration(token);

      res.json({
        success: true,
        data: {
          qr_code: qrCodeDataURL,
          token: token, // Include token for API usage
          check_in_url: checkInUrl, // Include the full URL
          event_id: parseInt(eventId),
          expires_at: expirationDate ? expirationDate.toISOString() : null,
          expires_in_seconds: expirationDate ? Math.floor((expirationDate.getTime() - Date.now()) / 1000) : null
        }
      });
    } catch (error) {
      console.error('Generate QR code error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get QR code as image file
  static async getQRCodeImage(req, res) {
    try {
      const { id: eventId } = req.params;
      const { expiration_hours } = req.query;

      // Validate event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Calculate expiration time if provided
      let expirationMs = null;
      if (expiration_hours) {
        const hours = parseFloat(expiration_hours);
        if (isNaN(hours) || hours <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid expiration_hours parameter'
          });
        }
        expirationMs = hours * 60 * 60 * 1000;
      }

      // Generate token
      const token = QRCodeService.generateToken(parseInt(eventId), expirationMs);
      
      // Get frontend URL for QR code redirect (use public check-in route, not dashboard)
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const checkInUrl = `${frontendUrl}/checkin/${eventId}?token=${encodeURIComponent(token)}&eventId=${eventId}`;
      
      // Generate QR code as buffer (encode the URL, not just the token)
      const qrCodeBuffer = await QRCodeService.generateQRCodeBuffer(checkInUrl);

      // Set response headers for image
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="qr-code-event-${eventId}.png"`);
      res.send(qrCodeBuffer);
    } catch (error) {
      console.error('Get QR code image error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = EventController;


const { Member, Role, Workplace } = require('../models');
const EmailService = require('../utils/emailService');

class MemberController {
  // Register new member
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

      // Validate workplace and role exist
      if (memberData.workplace_id) {
        const workplace = await Workplace.findById(memberData.workplace_id);
        if (!workplace) {
          return res.status(400).json({
            success: false,
            message: 'Invalid workplace ID'
          });
        }
      }

      if (memberData.role_id) {
        const role = await Role.findById(memberData.role_id);
        if (!role) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role ID'
          });
        }
      }

      // Create new member
      const newMember = await Member.create(memberData);

      // Send confirmation email (non-blocking - don't fail registration if email fails)
      try {
        await EmailService.sendMemberConfirmation(newMember);
      } catch (emailError) {
        console.error('Failed to send member confirmation email:', emailError);
        // Continue even if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Member registered successfully',
        data: { member: newMember }
      });
    } catch (error) {
      console.error('Member registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all members with optional filters
  static async getMembers(req, res) {
    try {
      const filters = {
        workplace_id: req.query.workplace_id,
        dues_status: req.query.dues_status,
        membership_status: req.query.membership_status,
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

      const members = await Member.findAll(filters);

      res.json({
        success: true,
        data: { members },
        count: members.length
      });
    } catch (error) {
      console.error('Get members error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get member by ID
  static async getMemberById(req, res) {
    try {
      const { id } = req.params;
      const member = await Member.findById(id);

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      res.json({
        success: true,
        data: { member }
      });
    } catch (error) {
      console.error('Get member by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update member
  static async updateMember(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if member exists
      const existingMember = await Member.findById(id);
      if (!existingMember) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      // Validate workplace and role if provided
      if (updateData.workplace_id) {
        const workplace = await Workplace.findById(updateData.workplace_id);
        if (!workplace) {
          return res.status(400).json({
            success: false,
            message: 'Invalid workplace ID'
          });
        }
      }

      if (updateData.role_id) {
        const role = await Role.findById(updateData.role_id);
        if (!role) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role ID'
          });
        }
      }

      // Check for email conflicts if email is being updated
      if (updateData.email && updateData.email !== existingMember.email) {
        const emailExists = await Member.findByEmail(updateData.email);
        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use by another member'
          });
        }
      }

      // Check for UO ID conflicts if UO ID is being updated
      if (updateData.uo_id && updateData.uo_id !== existingMember.uo_id) {
        const uoIdExists = await Member.findByUOId(updateData.uo_id);
        if (uoIdExists) {
          return res.status(409).json({
            success: false,
            message: 'UO ID already in use by another member'
          });
        }
      }

      const updatedMember = await Member.update(id, updateData);

      res.json({
        success: true,
        message: 'Member updated successfully',
        data: { member: updatedMember }
      });
    } catch (error) {
      console.error('Update member error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete member
  static async deleteMember(req, res) {
    try {
      const { id } = req.params;

      // Check if member exists
      const existingMember = await Member.findById(id);
      if (!existingMember) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }

      const deletedMember = await Member.delete(id);

      res.json({
        success: true,
        message: 'Member deleted successfully',
        data: { member: deletedMember }
      });
    } catch (error) {
      console.error('Delete member error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get member statistics
  static async getMemberStatistics(req, res) {
    try {
      const statistics = await Member.getStatistics();

      res.json({
        success: true,
        data: { statistics }
      });
    } catch (error) {
      console.error('Get member statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get members by workplace
  static async getMembersByWorkplace(req, res) {
    try {
      const { workplaceId } = req.params;
      const members = await Member.getByWorkplace(workplaceId);

      res.json({
        success: true,
        data: { members },
        count: members.length
      });
    } catch (error) {
      console.error('Get members by workplace error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = MemberController;


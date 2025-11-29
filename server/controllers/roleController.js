const { Role } = require('../models');

class RoleController {
  // Get all roles
  static async getRoles(req, res) {
    try {
      const roles = await Role.findAll();
      res.json({
        success: true,
        data: { roles }
      });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = RoleController;


const { Workplace } = require('../models');

class WorkplaceController {
  // Get all workplaces
  static async getWorkplaces(req, res) {
    try {
      const workplaces = await Workplace.findAll();
      res.json({
        success: true,
        data: { workplaces }
      });
    } catch (error) {
      console.error('Get workplaces error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = WorkplaceController;




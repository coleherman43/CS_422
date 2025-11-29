const express = require('express');
const router = express.Router();
const WorkplaceController = require('../controllers/workplaceController');

// GET /api/workplaces - list all workplaces
router.get('/', WorkplaceController.getWorkplaces);

module.exports = router;


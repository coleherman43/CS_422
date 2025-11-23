const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/roleController');

// GET /api/roles - list all roles
router.get('/', RoleController.getRoles);

module.exports = router;




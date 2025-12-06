const express = require('express');
const router = express.Router();
const MemberController = require('../controllers/memberController');
const AuthMiddleware = require('../middleware/authMiddleware');

// POST /api/members - register new member
router.post('/', MemberController.register);

// GET /api/members - list members (with query filters)
router.get('/', MemberController.getMembers);

// GET /api/members/stats - member statistics
router.get('/stats', MemberController.getMemberStatistics);

// GET /api/members/workplace/:workplaceId - get members by workplace
router.get('/workplace/:workplaceId', MemberController.getMembersByWorkplace);

// POST /api/members/send-email - send email to filtered members (requires authentication)
router.post('/send-email', AuthMiddleware.authenticate, MemberController.sendEmailToMembers);

// GET /api/members/:id - get member by ID
router.get('/:id', MemberController.getMemberById);

// PUT /api/members/:id - update member
router.put('/:id', MemberController.updateMember);

// DELETE /api/members/:id - delete member
router.delete('/:id', MemberController.deleteMember);

module.exports = router;


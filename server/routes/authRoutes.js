const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/request-login - Request magic link (send email)
router.post('/request-login', AuthController.requestLogin);

// POST /api/auth/verify - Verify Firebase ID token
router.post('/verify', AuthController.verifyToken);

// POST /api/auth/login (legacy - redirects to requestLogin)
router.post('/login', AuthController.login);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

// GET /api/auth/me - Get current user (requires authentication)
router.get('/me', AuthMiddleware.authenticate, AuthController.getCurrentUser);

// POST /api/auth/register (if needed for self-registration)
router.post('/register', AuthController.register);

module.exports = router;


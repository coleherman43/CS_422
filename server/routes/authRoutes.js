const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/authMiddleware');
const ErrorHandler = require('../middleware/errorHandler');

// Helper to wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// POST /api/auth/request-login - Request magic link (send email)
router.post('/request-login', asyncHandler(AuthController.requestLogin));

// POST /api/auth/verify - Verify Firebase ID token
router.post('/verify', asyncHandler(AuthController.verifyToken));

// POST /api/auth/login (legacy - redirects to requestLogin)
router.post('/login', asyncHandler(AuthController.login));

// POST /api/auth/logout
router.post('/logout', asyncHandler(AuthController.logout));

// GET /api/auth/me - Get current user (requires authentication)
router.get('/me', AuthMiddleware.authenticate, asyncHandler(AuthController.getCurrentUser));

// POST /api/auth/register (if needed for self-registration)
router.post('/register', asyncHandler(AuthController.register));

module.exports = router;


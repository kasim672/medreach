const express = require('express');
const { register, login, logout, me, registerValidators, loginValidators } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', registerLimiter, registerValidators, register);
router.post('/login', loginLimiter, loginValidators, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;

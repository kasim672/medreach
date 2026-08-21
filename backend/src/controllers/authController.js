const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const BCRYPT_ROUNDS = 12;
const COOKIE_OPTIONS = {
  httpOnly: true, // inaccessible to JS -> mitigates XSS-based token theft
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict', // mitigates CSRF
  maxAge: 60 * 60 * 1000, // 1 hour, matches JWT_EXPIRES_IN
};

const registerValidators = [
  body('name').trim().isLength({ min: 1, max: 120 }).escape(),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 10 }).withMessage('Password must be at least 10 characters.'),
  body('emergencyContact').optional().trim().isLength({ max: 30 }).escape(),
];

const loginValidators = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
];

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input.', details: errors.array() });
    }

    const { name, email, password, emergencyContact } = req.body;

    const existing = await User.findOne({ email }); // Mongoose parameterizes this - no injection surface
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({
      name,
      email,
      passwordHash,
      emergencyContact: emergencyContact || '',
      role: 'public_user',
    });

    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input.', details: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Constant-shape response whether the user exists or not, to avoid
    // leaking account enumeration via response timing/content differences.
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, managedHospital: user.managedHospital },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.cookie('medreach_token', token, COOKIE_OPTIONS);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

async function logout(_req, res) {
  res.clearCookie('medreach_token', COOKIE_OPTIONS);
  return res.status(204).send();
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, logout, me, registerValidators, loginValidators };

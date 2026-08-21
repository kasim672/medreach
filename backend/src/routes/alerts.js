const { body, param, validationResult } = require('express-validator');
const express = require('express');
const Alert = require('../models/Alert');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/hospital/:hospitalId', param('hospitalId').isMongoId(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input.' });
    const alerts = await Alert.find({ hospital: req.params.hospitalId }).sort({ createdAt: -1 }).limit(20);
    return res.json({ alerts });
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/',
  requireAuth,
  requireRole('hospital_admin'),
  [
    body('hospital').isMongoId(),
    body('message').trim().isLength({ min: 1, max: 500 }).escape(),
    body('severity').optional().isIn(['info', 'warning', 'critical']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input.', details: errors.array() });
      }
      const alert = await Alert.create({ ...req.body, createdBy: req.user.id });
      return res.status(201).json({ alert });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;

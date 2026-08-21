const { body, query, param, validationResult } = require('express-validator');
const Hospital = require('../models/Hospital');

async function list(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid query.', details: errors.array() });
    }

    const { specialty, q, lat, lng, maxDistanceKm } = req.query;
    const filter = {};

    if (specialty) filter.specialties = specialty; // exact match against array field, Mongoose-parameterized
    if (q) filter.$text = { $search: q };

    let queryBuilder = Hospital.find(filter).limit(100);

    if (lat && lng) {
      const maxDistanceMeters = (Number(maxDistanceKm) || 50) * 1000;
      queryBuilder = Hospital.find({
        ...filter,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            $maxDistance: maxDistanceMeters,
          },
        },
      }).limit(100);
    }

    const hospitals = await queryBuilder.exec();
    return res.json({ hospitals });
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found.' });
    return res.json({ hospital });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input.', details: errors.array() });
    }
    const hospital = await Hospital.create(req.body);
    return res.status(201).json({ hospital });
  } catch (err) {
    return next(err);
  }
}

/** Admins may only update the hospital they manage — enforced here, not just in the UI. */
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    if (req.user.managedHospital && req.user.managedHospital.toString() !== id) {
      return res.status(403).json({ error: 'You may only manage your own hospital.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input.', details: errors.array() });
    }

    const { emergencyStatus, bedsAvailable } = req.body;
    const update = { lastUpdatedBy: req.user.id };
    if (emergencyStatus !== undefined) update.emergencyStatus = emergencyStatus;
    if (bedsAvailable !== undefined) update.bedsAvailable = bedsAvailable;

    const hospital = await Hospital.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found.' });
    return res.json({ hospital });
  } catch (err) {
    return next(err);
  }
}

const listValidators = [
  query('specialty').optional().trim().isLength({ max: 100 }).escape(),
  query('q').optional().trim().isLength({ max: 200 }).escape(),
  query('lat').optional().isFloat({ min: -90, max: 90 }),
  query('lng').optional().isFloat({ min: -180, max: 180 }),
  query('maxDistanceKm').optional().isFloat({ min: 0, max: 500 }),
];

const idValidator = [param('id').isMongoId()];

const createValidators = [
  body('name').trim().isLength({ min: 1, max: 200 }).escape(),
  body('address').trim().isLength({ min: 1, max: 300 }).escape(),
  body('phone').trim().isLength({ min: 1, max: 30 }).escape(),
  body('location.coordinates').isArray({ min: 2, max: 2 }),
];

const updateStatusValidators = [
  param('id').isMongoId(),
  body('emergencyStatus').optional().isIn(['normal', 'busy', 'critical', 'unavailable']),
  body('bedsAvailable').optional().isInt({ min: 0 }),
];

module.exports = {
  list,
  getById,
  create,
  updateStatus,
  listValidators,
  idValidator,
  createValidators,
  updateStatusValidators,
};

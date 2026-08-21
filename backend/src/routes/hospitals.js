const express = require('express');
const hospitalController = require('../controllers/hospitalController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', hospitalController.listValidators, hospitalController.list);
router.get('/:id', hospitalController.idValidator, hospitalController.getById);

router.post(
  '/',
  requireAuth,
  requireRole('hospital_admin'),
  hospitalController.createValidators,
  hospitalController.create
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('hospital_admin'),
  hospitalController.updateStatusValidators,
  hospitalController.updateStatus
);

module.exports = router;

const mongoose = require('mongoose');

/** Admin-broadcast emergency alerts, scoped by region/hospital. */
const alertSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);

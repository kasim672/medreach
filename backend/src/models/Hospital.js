const mongoose = require('mongoose');

/**
 * Hospital schema.
 * Deliberately excludes any patient medical data (project scope: no PII/PHI storage).
 */
const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    isEmergencyCapable: { type: Boolean, default: false },
  },
  { _id: false }
);

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    // GeoJSON point for location-based sorting (client-side geolocation only; see privacy module)
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    specialties: { type: [String], default: [] },
    departments: { type: [departmentSchema], default: [] },
    emergencyStatus: {
      type: String,
      enum: ['normal', 'busy', 'critical', 'unavailable'],
      default: 'normal',
    },
    bedsAvailable: { type: Number, default: 0, min: 0 },
    bedsTotal: { type: Number, default: 0, min: 0 },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ specialties: 1 });
hospitalSchema.index({ name: 'text', address: 'text' });

module.exports = mongoose.model('Hospital', hospitalSchema);

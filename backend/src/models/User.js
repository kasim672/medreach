const mongoose = require('mongoose');

/**
 * User schema.
 * Deliberately minimal: name + emergency contact only, per project scope
 * ("no medical data stored"). Password is always stored as a bcrypt hash,
 * never plaintext, never returned in API responses (see toJSON below).
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['public_user', 'hospital_admin'],
      default: 'public_user',
    },
    emergencyContact: { type: String, trim: true, maxlength: 30, default: '' },
    savedHospitals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' }],
    managedHospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null },
  },
  { timestamps: true }
);

// Never leak the password hash even if a document is accidentally serialized.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);

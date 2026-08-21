/**
 * Seed script — populates the database with sample hospitals and one admin user
 * so the frontend variants have data to display. Idempotent: clears and reloads.
 *
 * Run:  node src/seed.js   (with MongoDB running and .env configured)
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Clearing existing hospitals/users…');
  await Hospital.deleteMany({});
  await User.deleteMany({});

  const hospitals = await Hospital.insertMany([
    {
      name: 'City General Hospital', address: '12 Central Ave, Downtown',
      location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
      phone: '+1-202-555-0111', specialties: ['Cardiology', 'Emergency', 'Neurology'],
      emergencyStatus: 'normal', bedsAvailable: 24, bedsTotal: 120,
    },
    {
      name: 'Riverside Medical Center', address: '88 Riverside Dr, Westbank',
      location: { type: 'Point', coordinates: [-73.9911, 40.7681] },
      phone: '+1-202-555-0122', specialties: ['Pediatrics', 'Emergency', 'Orthopedics'],
      emergencyStatus: 'busy', bedsAvailable: 6, bedsTotal: 80,
    },
    {
      name: 'St. Mary Emergency Clinic', address: '4 Chapel St, Oldtown',
      location: { type: 'Point', coordinates: [-74.0060, 40.7128] },
      phone: '+1-202-555-0133', specialties: ['Emergency', 'Trauma'],
      emergencyStatus: 'critical', bedsAvailable: 0, bedsTotal: 30,
    },
  ]);

  const admin = await User.create({
    name: 'Admin User', email: 'admin@medreach.test',
    passwordHash: await bcrypt.hash('admin-password-123', 12),
    role: 'hospital_admin', managedHospital: hospitals[0]._id,
  });

  console.log(`Seeded ${hospitals.length} hospitals and admin user: ${admin.email} / admin-password-123`);
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });

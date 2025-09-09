require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in backend/.env');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected. Removing sample vehicles...');

    const toRemove = ['ABC1234', 'XYZ5678'];
    const result = await Vehicle.deleteMany({ registration_number: { $in: toRemove } });
    console.log(`Deleted ${result.deletedCount} sample vehicles.`);
  } catch (err) {
    console.error('Cleanup error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();



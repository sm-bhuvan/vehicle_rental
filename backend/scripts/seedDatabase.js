// scripts/seedDatabase.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const users = require('./data/users.json');
const vehicles = require('./data/vehicles.json');

const MONGODB_URI = process.env.MONGODB_URI;

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected for seeding.');

        // Clear existing data
        await User.deleteMany();
        await Vehicle.deleteMany();
        console.log('Existing data cleared.');

        // Insert new data
        await User.insertMany(users);
        await Vehicle.insertMany(vehicles);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
// models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    type: { type: String, enum: ['car', 'truck', 'van', 'motorcycle', 'suv'], required: true },
    registration_number: { type: String, unique: true, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    pricePerHour: { type: Number, required: true },
    images: [{ type: String }],
    specifications: {
        engine: String,
        transmission: String,
        fuelType: String,
        seatingCapacity: Number,
        color: String
    },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true } // For administrative purposes
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
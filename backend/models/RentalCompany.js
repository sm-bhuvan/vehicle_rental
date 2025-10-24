// models/RentalCompany.js
const mongoose = require('mongoose');

const rentalCompanySchema = new mongoose.Schema({
    rental_id: { 
        type: String, 
        required: true, 
        unique: true 
    },
    rental_name: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    region: { 
        type: String, 
        required: true 
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        state: { type: String, required: true }
    },
    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    isActive: { type: Boolean, default: true },
    vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }]
}, { timestamps: true });

const RentalCompany = mongoose.model('RentalCompany', rentalCompanySchema);
module.exports = RentalCompany;


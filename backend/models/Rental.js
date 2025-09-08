// models/Rental.js
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    rentalStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    securityDeposit: { type: Number, default: 0 },
    insurance: { type: Boolean, default: false },
    specialRequests: { type: String },
    notes: { type: String },
}, { timestamps: true });

const Rental = mongoose.model('Rental', rentalSchema);
module.exports = Rental;
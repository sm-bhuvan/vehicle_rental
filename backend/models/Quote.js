// models/Quote.js
const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerInfo: {
        name: String,
        email: String,
        phone: String
    },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    rentalPeriod: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }
    },
    additionalServices: {
        insurance: { type: Boolean, default: false },
        gps: { type: Boolean, default: false },
        childSeat: { type: Boolean, default: false },
        additionalDriver: { type: Boolean, default: false }
    },
    specialRequests: { type: String },
    pricing: {
        baseAmount: Number,
        additionalServicesAmount: Number,
        insuranceAmount: Number,
        taxes: Number,
        securityDeposit: Number,
        totalAmount: Number
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'accepted', 'rejected', 'expired'],
        default: 'pending'
    },
    validUntil: { type: Date },
    adminNotes: { type: String }
}, { timestamps: true });

const Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote;
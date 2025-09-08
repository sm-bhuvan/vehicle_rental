// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental', required: true },
    paymentMethod: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDate: { type: Date, default: Date.now },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
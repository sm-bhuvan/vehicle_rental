// routes/bookings.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const router = express.Router();

// Process booking after successful payment
router.post('/process-booking', [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('bookingDetails').isObject().withMessage('Booking details are required'),
  body('bookingDetails.vehicleId').isMongoId().withMessage('Valid vehicle ID is required'),
  body('bookingDetails.firstName').notEmpty().withMessage('First name is required'),
  body('bookingDetails.lastName').notEmpty().withMessage('Last name is required'),
  body('bookingDetails.email').isEmail().withMessage('Valid email is required'),
  body('bookingDetails.phone').notEmpty().withMessage('Phone number is required'),
  body('bookingDetails.pickupDate').isISO8601().withMessage('Valid pickup date is required'),
  body('bookingDetails.returnDate').isISO8601().withMessage('Valid return date is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      transactionId,
      bookingDetails,
      fileName,
      paymentMethod,
      amount
    } = req.body;

    const {
      vehicleId,
      firstName,
      lastName,
      email,
      phone,
      pickupDate,
      returnDate,
      message
    } = bookingDetails;

    // Validate dates
    const startDate = new Date(pickupDate);
    const endDate = new Date(returnDate);

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be after pickup date'
      });
    }

    if (startDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Pickup date cannot be in the past'
      });
    }

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (!vehicle.isAvailable || !vehicle.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available for booking'
      });
    }

    // Check for conflicting rentals
    const conflictingRentals = await Rental.find({
      vehicle: vehicleId,
      rentalStatus: { $in: ['confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: startDate },
          endDate: { $gte: startDate }
        },
        {
          startDate: { $lte: endDate },
          endDate: { $gte: endDate }
        },
        {
          startDate: { $gte: startDate },
          endDate: { $lte: endDate }
        }
      ]
    });

    if (conflictingRentals.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available for the selected dates'
      });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        firstName,
        lastName,
        email,
        phone,
        role: 'customer'
      });
      await user.save();
    }

    // Calculate rental amount (basic calculation - you can enhance this)
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalAmount = daysDiff * vehicle.pricePerDay;

    // Create rental record
    const rental = new Rental({
      user: user._id,
      vehicle: vehicleId,
      startDate,
      endDate,
      totalAmount,
      rentalStatus: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: message || '',
      notes: `Document uploaded: ${fileName || 'N/A'}`
    });

    await rental.save();

    // Create payment record
    const payment = new Payment({
      user: user._id,
      rental: rental._id,
      paymentMethod,
      amount,
      transactionId,
      paymentStatus: 'completed'
    });

    await payment.save();

    // Note: Vehicle availability is managed through rental records
    // No need to update vehicle schema - availability is checked via existing rentals

    // Populate rental data for email
    await rental.populate([
      { path: 'vehicle', select: 'make model year type images pricePerDay location' },
      { path: 'user', select: 'firstName lastName email phone' }
    ]);

    // Send booking confirmation email
    try {
      await sendEmail({
        to: email,
        subject: 'Booking Confirmation - BARS Wheels',
        template: 'booking-confirmation',
        data: {
          customerName: `${firstName} ${lastName}`,
          rental,
          vehicle: rental.vehicle,
          user: rental.user,
          transactionId,
          totalAmount,
          pickupDate: startDate.toLocaleDateString(),
          returnDate: endDate.toLocaleDateString(),
          vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.year})`
        }
      });
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking processed successfully',
      data: {
        rental,
        payment,
        transactionId
      }
    });

  } catch (error) {
    console.error('Process booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing booking'
    });
  }
});

// Verify payment status
router.post('/verify-payment', [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('upiId').notEmpty().withMessage('UPI ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { transactionId, amount, upiId } = req.body;

    // In a real implementation, you would:
    // 1. Check with your payment gateway (Razorpay, PayU, etc.)
    // 2. Verify the transaction with the UPI ID
    // 3. Check the amount matches
    // 4. Verify the transaction status

    // For now, we'll simulate verification
    // In production, replace this with actual payment gateway API calls
    const isVerified = await simulatePaymentVerification(transactionId, amount, upiId);

    console.log(`Payment verification for ${transactionId}: ${isVerified ? 'VERIFIED' : 'NOT VERIFIED'}`);

    res.json({
      success: true,
      verified: isVerified,
      transactionId
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// Simulate payment verification (replace with real payment gateway integration)
const simulatePaymentVerification = async (transactionId, amount, upiId) => {
  // This is a simulation - in real implementation, you would:
  // 1. Call your payment gateway's verification API
  // 2. Check transaction status
  // 3. Verify amount and UPI ID
  
  // For demo purposes, we'll simulate that payment verification
  // only succeeds when the user manually confirms payment
  // In production, replace this with actual API calls
  
  // For now, always return false to prevent automatic verification
  // The user must click "I've Completed the Payment" button
  return false;
};

module.exports = router;

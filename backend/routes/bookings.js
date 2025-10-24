// backend/routes/bookings.js - Add this NEW route

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const mongoose = require('mongoose');

// Import models (adjust paths as needed)
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// Simple Booking Schema - Create this if you don't have it
const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  vehicleName: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  message: { type: String },
  transactionRef: { type: String, required: true },
  paymentAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'UPI' },
  paymentStatus: { type: String, default: 'completed' },
  upiId: { type: String },
  documentName: { type: String },
  status: { type: String, default: 'confirmed' },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// SIMPLE DIRECT BOOKING ROUTE
router.post('/create-direct', [
  body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('pickupDate').notEmpty().withMessage('Pickup date is required'),
  body('returnDate').notEmpty().withMessage('Return date is required'),
  body('transactionRef').notEmpty().withMessage('Transaction reference is required'),
  body('paymentAmount').isNumeric().withMessage('Payment amount is required')
], async (req, res) => {
  try {
    console.log('📦 New booking request received');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      vehicleId,
      firstName,
      lastName,
      email,
      phone,
      pickupDate,
      returnDate,
      message,
      transactionRef,
      paymentAmount,
      paymentMethod,
      upiId,
      documentName
    } = req.body;

    // Generate unique booking ID
    const bookingId = `BKG${Date.now()}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
    
    console.log('🎫 Generated booking ID:', bookingId);

    // Get vehicle name (optional - won't fail if vehicle not found)
    let vehicleName = 'Vehicle';
    try {
      const vehicle = await Vehicle.findOne({ 
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(vehicleId) ? vehicleId : null },
          { vehicleId: vehicleId }
        ]
      });
      if (vehicle) {
        vehicleName = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;
        console.log('✅ Vehicle found:', vehicleName);
      }
    } catch (err) {
      console.log('⚠️ Vehicle lookup failed, continuing anyway');
    }

    // Create booking
    const booking = new Booking({
      bookingId,
      vehicleId,
      vehicleName,
      firstName,
      lastName,
      email,
      phone,
      pickupDate: new Date(pickupDate),
      returnDate: new Date(returnDate),
      message: message || '',
      transactionRef,
      paymentAmount,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'completed',
      upiId: upiId || '',
      documentName: documentName || 'license.pdf',
      status: 'confirmed'
    });

    await booking.save();
    console.log('✅ Booking saved to database:', bookingId);

    // Create or update user (optional)
    try {
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
        console.log('✅ New user created');
      }
    } catch (userErr) {
      console.log('⚠️ User creation skipped:', userErr.message);
    }

    // Send email notification
    try {
      const nodemailer = require('nodemailer');
      
      // Create transporter (use your SMTP settings)
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const pickupDateStr = new Date(pickupDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const returnDateStr = new Date(returnDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const mailOptions = {
        from: process.env.SMTP_USER || 'noreply@barswheels.com',
        to: email,
        subject: `Booking Confirmed - ${bookingId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .detail-label { font-weight: bold; color: #667eea; }
              .detail-value { color: #333; }
              .highlight { background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Booking Confirmed!</h1>
                <p>Thank you for choosing BARS Wheels</p>
              </div>
              
              <div class="content">
                <h2>Hello ${firstName} ${lastName},</h2>
                <p>Your booking has been confirmed successfully. Here are your booking details:</p>
                
                <div class="highlight">
                  <h3 style="margin: 0;">Booking ID: ${bookingId}</h3>
                  <p style="margin: 5px 0;">Transaction Ref: ${transactionRef}</p>
                </div>
                
                <div class="booking-details">
                  <h3>Booking Details</h3>
                  
                  <div class="detail-row">
                    <span class="detail-label">Vehicle:</span>
                    <span class="detail-value">${vehicleName}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Pickup Date:</span>
                    <span class="detail-value">${pickupDateStr}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Return Date:</span>
                    <span class="detail-value">${returnDateStr}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Customer Name:</span>
                    <span class="detail-value">${firstName} ${lastName}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${email}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${phone}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Payment Amount:</span>
                    <span class="detail-value">₹${paymentAmount}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Payment Status:</span>
                    <span class="detail-value" style="color: green; font-weight: bold;">✓ PAID</span>
                  </div>
                </div>
                
                ${message ? `
                <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <strong>Your Message:</strong>
                  <p style="margin: 5px 0;">${message}</p>
                </div>
                ` : ''}
                
                <div style="margin: 30px 0; text-align: center;">
                  <p><strong>Important Notes:</strong></p>
                  <ul style="text-align: left; display: inline-block;">
                    <li>Please bring your driver's license for verification</li>
                    <li>Arrive 15 minutes before your pickup time</li>
                    <li>Keep this booking reference for your records</li>
                    <li>Contact us if you need to make any changes</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                  <p>Questions? We're here to help!</p>
                  <p>📞 Phone: +91 94433 18232</p>
                  <p>📧 Email: support@barswheels.com</p>
                </div>
              </div>
              
              <div class="footer">
                <p>This is an automated confirmation email from BARS Wheels.</p>
                <p>Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} BARS Wheels. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Confirmation email sent to:', email);
    } catch (emailErr) {
      console.error('⚠️ Email sending failed:', emailErr.message);
      // Don't fail the booking if email fails
    }

    // Return success
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: bookingId,
        transactionRef: transactionRef,
        status: 'confirmed'
      }
    });

  } catch (error) {
    console.error('❌ Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

module.exports = router;
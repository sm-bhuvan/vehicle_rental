// routes/rentals.js
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Rental = require('../models/Rental');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { auth, adminAuth } = require('../middlewares/auth');
const { calculateRentalAmount } = require('../utils/pricing');
const { sendEmail } = require('../utils/email');
const router = express.Router();

// Create new rental
router.post('/', auth, [
  body('vehicle').isMongoId().withMessage('Valid vehicle ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('pickupLocation.address').optional().isString(),
  body('dropoffLocation.address').optional().isString(),
  body('insurance').optional().isBoolean(),
  body('specialRequests').optional().isString().isLength({ max: 500 })
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
      vehicle: vehicleId,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      insurance = false,
      specialRequests
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.isActive || !vehicle.isAvailable) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not available'
      });
    }

    // Vehicle availability is checked via existing rental records below

    // Check for conflicting rentals
    const conflictingRentals = await Rental.find({
      vehicle: vehicleId,
      rentalStatus: { $in: ['confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: start },
          endDate: { $gte: start }
        },
        {
          startDate: { $lte: end },
          endDate: { $gte: end }
        },
        {
          startDate: { $gte: start },
          endDate: { $lte: end }
        }
      ]
    });

    if (conflictingRentals.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available for the selected dates'
      });
    }

    // Calculate rental amount
    const pricing = calculateRentalAmount(vehicle, start, end, insurance);

    // Create rental
    const rental = new Rental({
      user: req.user._id,
      vehicle: vehicleId,
      startDate: start,
      endDate: end,
      pickupLocation,
      dropoffLocation,
      totalAmount: pricing.totalAmount,
      securityDeposit: pricing.securityDeposit,
      insurance,
      insuranceAmount: insurance ? pricing.insuranceAmount : 0,
      specialRequests
    });

    await rental.save();

    // Populate rental data for response
    await rental.populate([
      { path: 'vehicle', select: 'make model year type images pricePerDay' },
      { path: 'user', select: 'firstName lastName email phone' }
    ]);

    // Send confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        subject: 'Rental Booking Confirmation',
        template: 'rental-confirmation',
        data: {
          rental,
          user: req.user,
          vehicle
        }
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Rental created successfully',
      data: {
        rental,
        pricing
      }
    });

  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating rental'
    });
  }
});

// Get user's rentals
router.get('/my-rentals', auth, [
  query('status').optional().isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (status) filter.rentalStatus = status;

    const rentals = await Rental.find(filter)
      .populate('vehicle', 'make model year type images location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Rental.countDocuments(filter);

    res.json({
      success: true,
      data: {
        rentals,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Get user rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rentals'
    });
  }
});

// Get single rental
router.get('/:id', auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('vehicle', 'make model year type images specifications location')
      .populate('user', 'firstName lastName email phone');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Check if user owns this rental or is admin
    if (rental.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        rental
      }
    });

  } catch (error) {
    console.error('Get rental error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid rental ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching rental'
    });
  }
});

// Cancel rental
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('vehicle');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Check if user owns this rental
    if (rental.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if rental can be cancelled
    if (!['pending', 'confirmed'].includes(rental.rentalStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Rental cannot be cancelled at this stage'
      });
    }

    // Check cancellation policy (24 hours before start date)
    const now = new Date();
    const hoursUntilStart = (rental.startDate - now) / (1000 * 60 * 60);

    if (hoursUntilStart < 24) {
      return res.status(400).json({
        success: false,
        message: 'Rental can only be cancelled 24 hours before start date'
      });
    }

    // Update rental status
    rental.rentalStatus = 'cancelled';
    await rental.save();

    // Send cancellation email
    try {
      await sendEmail({
        to: req.user.email,
        subject: 'Rental Cancellation Confirmation',
        template: 'rental-cancellation',
        data: {
          rental,
          user: req.user,
          vehicle: rental.vehicle
        }
      });
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Rental cancelled successfully',
      data: {
        rental
      }
    });

  } catch (error) {
    console.error('Cancel rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling rental'
    });
  }
});

// Add rental rating and review
router.patch('/:id/rate', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isString().isLength({ max: 1000 }).withMessage('Review too long')
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

    const { rating, review } = req.body;

    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Check if user owns this rental
    if (rental.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if rental is completed
    if (rental.rentalStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed rentals'
      });
    }

    // Check if already rated
    if (rental.rating && rental.rating.score) {
      return res.status(400).json({
        success: false,
        message: 'Rental already rated'
      });
    }

    // Add rating
    rental.rating = {
      score: rating,
      review: review || '',
      date: new Date()
    };

    await rental.save();

    // Update vehicle rating
    const vehicle = await Vehicle.findById(rental.vehicle);
    if (vehicle) {
      const allRatings = await Rental.find({
        vehicle: rental.vehicle,
        'rating.score': { $exists: true }
      }).select('rating.score');

      const totalRatings = allRatings.length;
      const averageRating = allRatings.reduce((sum, r) => sum + r.rating.score, 0) / totalRatings;

      vehicle.rating = {
        average: Math.round(averageRating * 10) / 10,
        count: totalRatings
      };

      await vehicle.save();
    }

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: {
        rental
      }
    });

  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding rating'
    });
  }
});

// ADMIN ROUTES

// Get all rentals (Admin only)
router.get('/', adminAuth, [
  query('status').optional().isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('user').optional().isMongoId(),
  query('vehicle').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const { status, page = 1, limit = 10, user, vehicle } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.rentalStatus = status;
    if (user) filter.user = user;
    if (vehicle) filter.vehicle = vehicle;

    const rentals = await Rental.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('vehicle', 'make model year type location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Rental.countDocuments(filter);

    res.json({
      success: true,
      data: {
        rentals,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Get all rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rentals'
    });
  }
});

// Update rental status (Admin only)
router.patch('/:id/status', adminAuth, [
  body('status').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled'])
    .withMessage('Invalid status')
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

    const { status } = req.body;

    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      { rentalStatus: status },
      { new: true }
    ).populate(['user', 'vehicle']);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Send status update email
    try {
      await sendEmail({
        to: rental.user.email,
        subject: `Rental Status Updated - ${status.toUpperCase()}`,
        template: 'rental-status-update',
        data: {
          rental,
          status,
          user: rental.user,
          vehicle: rental.vehicle
        }
      });
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    res.json({
      success: true,
      message: 'Rental status updated successfully',
      data: {
        rental
      }
    });

  } catch (error) {
    console.error('Update rental status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating rental status'
    });
  }
});

module.exports = router;
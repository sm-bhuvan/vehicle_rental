// routes/vehicles.js
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const Rental = require('../models/Rental');
const { auth, adminAuth } = require('../middlewares/auth');
const router = express.Router();

// Get all vehicles with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('type').optional().isIn(['car', 'bike']),
  query('category').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('city').optional().isString(),
  query('available').optional().isBoolean(),
  query('search').optional().isString(),
  query('minSeats').optional().isInt({ min: 1 }).toInt()
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

    const {
      page = 1,
      limit = 10,
      type,
      category,
      minPrice,
      maxPrice,
      city,
      available,
      search,
      minSeats,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object (include docs missing isActive for legacy data)
    const filter = { $or: [{ isActive: true }, { isActive: { $exists: false } }] };

    if (type) filter.type = type;
    if (category) filter.category = new RegExp(category, 'i');
    if (city) filter['location'] = new RegExp(city, 'i');
    if (available !== undefined) filter.isAvailable = available;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = parseFloat(maxPrice);
    }

    // Text search
    if (search) {
      filter.$or = [
        { make: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') }
      ];
    }

    // Filter by minimum seats
    if (minSeats) {
      filter['specifications.seatingCapacity'] = { $gte: parseInt(minSeats) };
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const vehicles = await Vehicle.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Vehicle.countDocuments(filter);

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicles'
    });
  }
});

// Simple booking endpoint by vehicle name to mark availability for same-day pickup
router.post('/book-by-name', async (req, res) => {
  try {
    const { name, startDate } = req.body || {};
    if (!name) {
      return res.status(400).json({ success: false, message: 'Vehicle name is required' });
    }

    const vehicle = await Vehicle.findOne({ $and: [
      { $or: [{ isActive: true }, { isActive: { $exists: false } }] },
      { name }
    ] });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (startDate) {
      const start = new Date(startDate);
      const today = new Date();
      const isSameDay = start.getFullYear() === today.getFullYear() &&
        start.getMonth() === today.getMonth() &&
        start.getDate() === today.getDate();

      if (isSameDay) {
        vehicle.isAvailable = false;
        await vehicle.save();
      }
    }

    return res.json({ success: true, data: { vehicle } });
  } catch (error) {
    console.error('Book by name error:', error);
    return res.status(500).json({ success: false, message: 'Server error while booking vehicle' });
  }
});

// Get single vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).lean();

    if (!vehicle || !vehicle.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: {
        vehicle
      }
    });

  } catch (error) {
    console.error('Get vehicle error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle'
    });
  }
});

// Check vehicle availability
router.get('/:id/availability', [
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required')
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

    const { startDate, endDate } = req.query;
    const vehicleId = req.params.id;

    // Check if dates are valid
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

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check for overlapping rentals
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

    const isAvailable = conflictingRentals.length === 0 && vehicle.availability;

    res.json({
      success: true,
      data: {
        available: isAvailable,
        conflictingRentals: conflictingRentals.length,
        vehicleStatus: vehicle.availability
      }
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking availability'
    });
  }
});

// Get vehicle categories
router.get('/categories/:type', async (req, res) => {
  try {
    const { type } = req.params;

    if (!['car', 'bike'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle type. Must be car or bike'
      });
    }

    const categories = await Vehicle.distinct('category', { 
      type, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// ADMIN ROUTES

// Create new vehicle (Admin only)
router.post('/', adminAuth, [
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900 }).withMessage('Valid year is required'),
  body('type').isIn(['car', 'bike']).withMessage('Type must be car or bike'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Valid price per day is required'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Valid price per hour is required')
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

    const vehicleData = req.body;
    const vehicle = new Vehicle(vehicleData);

    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: {
        vehicle
      }
    });

  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating vehicle'
    });
  }
});

// Update vehicle (Admin only)
router.put('/:id', adminAuth, [
  body('make').optional().trim().notEmpty().withMessage('Make cannot be empty'),
  body('model').optional().trim().notEmpty().withMessage('Model cannot be empty'),
  body('year').optional().isInt({ min: 1900 }).withMessage('Valid year is required'),
  body('type').optional().isIn(['car', 'bike']).withMessage('Type must be car or bike'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('pricePerDay').optional().isFloat({ min: 0 }).withMessage('Valid price per day is required'),
  body('pricePerHour').optional().isFloat({ min: 0 }).withMessage('Valid price per hour is required')
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

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: {
        vehicle
      }
    });

  } catch (error) {
    console.error('Update vehicle error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating vehicle'
    });
  }
});

// Delete vehicle (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle has active rentals
    const activeRentals = await Rental.find({
      vehicle: req.params.id,
      rentalStatus: { $in: ['confirmed', 'active'] }
    });

    if (activeRentals.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle with active rentals'
      });
    }

    // Soft delete - mark as inactive instead of removing
    vehicle.isActive = false;
    await vehicle.save();

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('Delete vehicle error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting vehicle'
    });
  }
});

// Toggle vehicle availability (Admin only)
router.patch('/:id/availability', adminAuth, [
  body('availability').isBoolean().withMessage('Availability must be boolean')
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

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { availability: req.body.availability },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle availability updated successfully',
      data: {
        vehicle
      }
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating availability'
    });
  }
});

// Get vehicle rental history (Admin only)
router.get('/:id/rentals', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rentals = await Rental.find({ vehicle: req.params.id })
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Rental.countDocuments({ vehicle: req.params.id });

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
    console.error('Get vehicle rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle rentals'
    });
  }
});

module.exports = router;
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Quote = require('../models/Quote');
const Vehicle = require('../models/Vehicle');
const { auth, adminAuth } = require('../middlewares/auth');
const { calculateRentalAmount } = require('../utils/pricing');
const { sendEmail } = require('../utils/email');
const router = express.Router();

// Helper function to calculate custom quote pricing
function calculateCustomQuotePricing(vehicle, startDate, endDate, additionalServices = {}) {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const baseAmount = days * vehicle.pricePerDay;
    
    let additionalServicesAmount = 0;
    
    // Additional service pricing
    if (additionalServices.insurance) additionalServicesAmount += days * 15;
    if (additionalServices.gps) additionalServicesAmount += days * 5;
    if (additionalServices.childSeat) additionalServicesAmount += days * 8;
    if (additionalServices.additionalDriver) additionalServicesAmount += days * 10;
    
    const insuranceAmount = additionalServices.insurance ? days * 15 : 0;
    const subtotal = baseAmount + additionalServicesAmount;
    const taxes = subtotal * 0.1; // 10% tax
    const securityDeposit = vehicle.type === 'car' ? 500 : 200;
    const totalAmount = subtotal + taxes;
    
    return {
        baseAmount,
        additionalServicesAmount,
        insuranceAmount,
        taxes: Math.round(taxes * 100) / 100,
        securityDeposit,
        totalAmount: Math.round(totalAmount * 100) / 100
    };
}

// Request custom quote
router.post('/', [
    body('vehicle').isMongoId().withMessage('Valid vehicle ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('customerInfo.name').optional().trim().notEmpty().withMessage('Customer name is required'),
    body('customerInfo.email').optional().isEmail().withMessage('Valid email is required'),
    body('customerInfo.phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('additionalServices.insurance').optional().isBoolean(),
    body('additionalServices.gps').optional().isBoolean(),
    body('additionalServices.childSeat').optional().isBoolean(),
    body('additionalServices.additionalDriver').optional().isBoolean(),
    body('specialRequests').optional().isString().isLength({ max: 1000 })
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
            customerInfo,
            additionalServices = {},
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

        // Check if vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle || !vehicle.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // For authenticated users, use their info
        let quoteData = {
            vehicle: vehicleId,
            rentalPeriod: {
                startDate: start,
                endDate: end
            },
            additionalServices,
            specialRequests,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        };

        if (req.user) {
            quoteData.user = req.user._id;
        } else {
            // For guest users, require customer info
            if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Customer information is required for guest quotes'
                });
            }
            quoteData.customerInfo = customerInfo;
        }

        // Calculate pricing
        const pricing = calculateCustomQuotePricing(vehicle, start, end, additionalServices);
        quoteData.pricing = pricing;

        // Create quote
        const quote = new Quote(quoteData);
        await quote.save();

        // Populate vehicle data for response
        await quote.populate('vehicle', 'make model year type images pricePerDay pricePerHour');

        // Send quote email
        const emailTo = req.user ? req.user.email : customerInfo.email;
        const customerName = req.user ? `${req.user.firstName} ${req.user.lastName}` : customerInfo.name;

        try {
            await sendEmail({
                to: emailTo,
                subject: 'Your Custom Vehicle Rental Quote',
                template: 'custom-quote',
                data: {
                    quote,
                    customerName,
                    vehicle
                }
            });
        } catch (emailError) {
            console.error('Failed to send quote email:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Quote request submitted successfully',
            data: {
                quote
            }
        });

    } catch (error) {
        console.error('Create quote error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating quote'
        });
    }
});

// Get user's quotes (authenticated users only)
router.get('/my-quotes', auth, [
    query('status').optional().isIn(['pending', 'sent', 'accepted', 'rejected', 'expired']),
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
        if (status) filter.status = status;

        const quotes = await Quote.find(filter)
            .populate('vehicle', 'make model year type images location')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Quote.countDocuments(filter);

        res.json({
            success: true,
            data: {
                quotes,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total
                }
            }
        });

    } catch (error) {
        console.error('Get user quotes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching quotes'
        });
    }
});

// Get single quote
router.get('/:id', async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id)
            .populate('vehicle', 'make model year type images specifications location')
            .populate('user', 'firstName lastName email phone');

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Check if user owns this quote or is admin (for authenticated users)
        if (req.user) {
            if (quote.user && quote.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        res.json({
            success: true,
            data: {
                quote
            }
        });

    } catch (error) {
        console.error('Get quote error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while fetching quote'
        });
    }
});

// Accept quote (convert to rental)
router.post('/:id/accept', auth, async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id).populate('vehicle');

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Check if user owns this quote
        if (quote.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if quote is still valid and not already accepted
        if (quote.status !== 'sent' || quote.validUntil < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Quote is no longer valid or has already been accepted'
            });
        }

        // Check vehicle availability
        const Rental = require('../models/Rental');
        const conflictingRentals = await Rental.find({
            vehicle: quote.vehicle._id,
            rentalStatus: { $in: ['confirmed', 'active'] },
            $or: [
                {
                    startDate: { $lte: quote.rentalPeriod.startDate },
                    endDate: { $gte: quote.rentalPeriod.startDate }
                },
                {
                    startDate: { $lte: quote.rentalPeriod.endDate },
                    endDate: { $gte: quote.rentalPeriod.endDate }
                },
                {
                    startDate: { $gte: quote.rentalPeriod.startDate },
                    endDate: { $lte: quote.rentalPeriod.endDate }
                }
            ]
        });

        if (conflictingRentals.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is no longer available for the selected dates'
            });
        }

        // Create rental from quote
        const rental = new Rental({
            user: req.user._id,
            vehicle: quote.vehicle._id,
            startDate: quote.rentalPeriod.startDate,
            endDate: quote.rentalPeriod.endDate,
            totalAmount: quote.pricing.totalAmount,
            securityDeposit: quote.pricing.securityDeposit,
            insurance: quote.additionalServices.insurance || false,
            insuranceAmount: quote.pricing.insuranceAmount || 0,
            specialRequests: quote.specialRequests
        });

        await rental.save();

        // Update quote status
        quote.status = 'accepted';
        await quote.save();

        // Populate rental for response
        await rental.populate([
            { path: 'vehicle', select: 'make model year type images pricePerDay' },
            { path: 'user', select: 'firstName lastName email phone' }
        ]);

        res.json({
            success: true,
            message: 'Quote accepted and rental created successfully',
            data: {
                rental,
                quote
            }
        });

    } catch (error) {
        console.error('Accept quote error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while accepting quote'
        });
    }
});


// ADMIN ROUTES

// Get all quotes (Admin only)
router.get('/', adminAuth, [
    query('status').optional().isIn(['pending', 'sent', 'accepted', 'rejected', 'expired']),
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

        const filter = {};
        if (status) filter.status = status;

        const quotes = await Quote.find(filter)
            .populate('user', 'firstName lastName email phone')
            .populate('vehicle', 'make model year type location')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Quote.countDocuments(filter);

        res.json({
            success: true,
            data: {
                quotes,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total
                }
            }
        });

    } catch (error) {
        console.error('Get all quotes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching quotes'
        });
    }
});

// Update quote status (Admin only)
router.patch('/:id/status', adminAuth, [
    body('status').isIn(['pending', 'sent', 'accepted', 'rejected', 'expired'])
        .withMessage('Invalid status'),
    body('customPricing').optional().isObject(),
    body('adminNotes').optional().isString().isLength({ max: 1000 })
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

        const { status, customPricing, adminNotes } = req.body;

        const updateData = { status };
        if (customPricing) updateData.pricing = { ...updateData.pricing, ...customPricing };
        if (adminNotes) updateData.adminNotes = adminNotes;

        const quote = await Quote.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate(['user', 'vehicle']);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Send status update email
        const emailTo = quote.user ? quote.user.email : quote.customerInfo.email;
        const customerName = quote.user ? 
            `${quote.user.firstName} ${quote.user.lastName}` : 
            quote.customerInfo.name;

        try {
            await sendEmail({
                to: emailTo,
                subject: `Quote Status Update - ${status.toUpperCase()}`,
                template: 'quote-status-update',
                data: {
                    quote,
                    status,
                    customerName,
                    vehicle: quote.vehicle,
                    adminNotes
                }
            });
        } catch (emailError) {
            console.error('Failed to send quote status email:', emailError);
        }

        res.json({
            success: true,
            message: 'Quote status updated successfully',
            data: {
                quote
            }
        });

    } catch (error) {
        console.error('Update quote status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating quote status'
        });
    }
});

module.exports = router;
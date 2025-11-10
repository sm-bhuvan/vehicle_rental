const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Rental = require('../models/Rental');
const Quote = require('../models/Quote');
const { adminAuth } = require('../middlewares/auth');
const router = express.Router();

// Helper function to convert data to CSV
const convertToCSV = (data, type) => {
    if (!data || data.length === 0) {
        return '';
    }

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) {
                return '';
            }
            // Handle nested objects and arrays
            if (typeof value === 'object' && !Array.isArray(value)) {
                return JSON.stringify(value);
            }
            if (Array.isArray(value)) {
                return value.join('; ');
            }
            // Escape quotes and wrap in quotes if contains comma
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
};

// Dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // Get basic counts
        const [
            totalUsers,
            totalVehicles,
            activeRentals,
            pendingQuotes,
            availableVehicles
        ] = await Promise.all([
            User.countDocuments({ role: 'user', ...dateFilter }),
            Vehicle.countDocuments({ isActive: true }),
            Rental.countDocuments({ rentalStatus: 'active' }),
            Quote.countDocuments({ status: 'pending' }),
            Vehicle.countDocuments({ isActive: true, isAvailable: true })
        ]);

        // Recent activities
        const recentRentals = await Rental.find()
            .populate('user', 'firstName lastName email')
            .populate('vehicle', 'make model year')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentUsers = await User.find({ role: 'user' })
            .select('firstName lastName email createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // Monthly statistics
        const monthlyStats = await Rental.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    rentals: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' } // Assuming revenue is tied to rental total amount
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]);

        // Vehicle type distribution
        const vehicleDistribution = await Vehicle.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalVehicles,
                    activeRentals,
                    pendingQuotes,
                    availableVehicles
                },
                recentActivities: {
                    rentals: recentRentals,
                    users: recentUsers
                },
                monthlyStats,
                vehicleDistribution
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard statistics'
        });
    }
});

// User management
router.get('/users', adminAuth, [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('search').optional().isString(),
    query('role').optional().isIn(['user', 'admin'])
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

        const { page = 1, limit = 10, search, role } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        
        if (role) filter.role = role;
        
        if (search) {
            filter.$or = [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(filter);

        // Get rental statistics for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const rentalCount = await Rental.countDocuments({ user: user._id });
                // const totalSpent = await Payment.aggregate([
                //     { $match: { user: user._id, status: 'succeeded' } },
                //     { $group: { _id: null, total: { $sum: '$amount' } } }
                // ]);
                
                return {
                    ...user.toObject(),
                    stats: {
                        totalRentals: rentalCount,
                        totalSpent: 0 // Remove payment-related stat
                    }
                };
            })
        );

        res.json({
            success: true,
            data: {
                users: usersWithStats,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total
                }
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
});

// Update user status
router.patch('/users/:id/status', adminAuth, [
    body('isVerified').optional().isBoolean(),
    body('role').optional().isIn(['user', 'admin'])
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

        const updates = {};
        if ('isVerified' in req.body) updates.isVerified = req.body.isVerified;
        if ('role' in req.body) updates.role = req.body.role;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User status updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user status'
        });
    }
});

// Vehicle maintenance management
router.patch('/vehicles/:id/maintenance', adminAuth, [
    body('lastService').optional().isISO8601(),
    body('nextService').optional().isISO8601(),
    body('issues').optional().isArray(),
    body('condition').optional().isIn(['excellent', 'good', 'fair'])
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

        const { lastService, nextService, issues, condition } = req.body;

        const updateData = {};
        if (lastService) updateData['maintenanceStatus.lastService'] = new Date(lastService);
        if (nextService) updateData['maintenanceStatus.nextService'] = new Date(nextService);
        if (issues) updateData['maintenanceStatus.issues'] = issues;
        if (condition) updateData.condition = condition;

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            updateData,
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
            message: 'Vehicle maintenance updated successfully',
            data: { vehicle }
        });

    } catch (error) {
        console.error('Update vehicle maintenance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating vehicle maintenance'
        });
    }
});

// Generate reports
router.get('/reports', adminAuth, [
    query('type').isIn(['rentals', 'vehicles', 'users']).withMessage('Invalid report type'),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('format').optional().isIn(['json', 'csv']).withMessage('Invalid format')
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

        const { type, startDate, endDate, format = 'json' } = req.query;
        
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        let reportData;

        switch (type) {
            case 'rentals':
                reportData = await Rental.find(dateFilter)
                    .populate('user', 'firstName lastName email')
                    .populate('vehicle', 'make model year type')
                    .select('startDate endDate totalAmount rentalStatus')
                    .sort({ createdAt: -1 });
                break;

            case 'vehicles':
                reportData = await Vehicle.aggregate([
                    {
                        $lookup: {
                            from: 'rentals',
                            localField: '_id',
                            foreignField: 'vehicle',
                            as: 'rentals'
                        }
                    },
                    {
                        $project: {
                            make: 1,
                            model: 1,
                            year: 1,
                            type: 1,
                            isAvailable: 1,
                            condition: 1,
                            totalRentals: { $size: '$rentals' },
                            totalRevenue: { $sum: '$rentals.totalAmount' }, // Still here, based on rental amount
                            averageRating: '$rating.average'
                        }
                    }
                ]);
                break;

            case 'users':
                reportData = await User.aggregate([
                    { $match: { role: 'user', ...dateFilter } },
                    {
                        $lookup: {
                            from: 'rentals',
                            localField: '_id',
                            foreignField: 'user',
                            as: 'rentals'
                        }
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            email: 1,
                            phone: 1,
                            createdAt: 1,
                            totalRentals: { $size: '$rentals' },
                            totalSpent: { $sum: '$rentals.totalAmount' } // Total spent now based on total rental amount
                        }
                    }
                ]);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type specified'
                });
        }

        if (format === 'csv') {
            const csv = convertToCSV(reportData, type);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
            return res.send(csv);
        }

        res.json({
            success: true,
            data: {
                type,
                dateRange: { startDate, endDate },
                reportData
            }
        });

    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating report'
        });
    }
});

module.exports = router;
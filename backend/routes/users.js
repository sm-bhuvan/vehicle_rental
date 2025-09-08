const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Rental = require('../models/Rental');
const { auth } = require('../middlewares/auth');
const { sendEmail } = require('../utils/email');
const router = express.Router();

// Update user profile
router.put('/profile', auth, [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('address.street').optional().isString(),
    body('address.city').optional().isString(),
    body('address.state').optional().isString(),
    body('address.zipCode').optional().isString(),
    body('address.country').optional().isString(),
    body('driverLicense.number').optional().isString(),
    body('driverLicense.expiryDate').optional().isISO8601(),
    body('driverLicense.issuedBy').optional().isString()
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

        const updates = req.body;
        
        // Remove sensitive fields that shouldn't be updated through this endpoint
        delete updates.password;
        delete updates.email;
        delete updates.role;
        delete updates.isVerified;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
});

// Change password
router.put('/change-password', auth, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match');
        }
        return true;
    })
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

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id);
        
        // Verify current password
        const isCurrentPasswordValid = await user.matchPassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Send password change notification
        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Changed Successfully',
                template: 'password-changed',
                data: {
                    user,
                    timestamp: new Date()
                }
            });
        } catch (emailError) {
            console.error('Failed to send password change email:', emailError);
        }

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password'
        });
    }
});

// Upload profile image
router.post('/profile-image', auth, async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Image URL is required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profileImage: imageUrl },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile image updated successfully',
            data: {
                user
            }
        });

    } catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading profile image'
        });
    }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const [
            totalRentals,
            activeRentals,
            completedRentals,
            totalSpent,
            upcomingRentals
        ] = await Promise.all([
            Rental.countDocuments({ user: req.user._id }),
            Rental.countDocuments({ user: req.user._id, rentalStatus: 'active' }),
            Rental.countDocuments({ user: req.user._id, rentalStatus: 'completed' }),
            Rental.aggregate([
                { $match: { user: req.user._id, rentalStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Rental.countDocuments({
                user: req.user._id,
                rentalStatus: 'confirmed',
                startDate: { $gt: new Date() }
            })
        ]);

        res.json({
            success: true,
            data: {
                totalRentals,
                activeRentals,
                completedRentals,
                totalSpent: totalSpent[0]?.total || 0,
                upcomingRentals
            }
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user statistics'
        });
    }
});

// Delete account
router.delete('/account', auth, [
    body('password').notEmpty().withMessage('Password is required for account deletion'),
    body('confirmation').equals('DELETE').withMessage('Please type DELETE to confirm')
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

        const { password } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id);
        
        // Verify password
        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        // Check for active rentals
        const activeRentals = await Rental.find({
            user: req.user._id,
            rentalStatus: { $in: ['confirmed', 'active'] }
        });

        if (activeRentals.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete account with active rentals'
            });
        }

        // Soft delete - deactivate account instead of permanent deletion
        user.isActive = false;
        user.email = `deleted_${Date.now()}_${user.email}`;
        await user.save();

        // Send account deletion confirmation
        try {
            await sendEmail({
                to: req.user.email, // Use original email from token
                subject: 'Account Deleted Successfully',
                template: 'account-deleted',
                data: {
                    user: req.user,
                    deletionDate: new Date()
                }
            });
        } catch (emailError) {
            console.error('Failed to send account deletion email:', emailError);
        }

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting account'
        });
    }
});

module.exports = router;
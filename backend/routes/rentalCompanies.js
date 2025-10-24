// routes/rentalCompanies.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const RentalCompany = require('../models/RentalCompany');
const router = express.Router();

// Get all rental companies
router.get('/', async (req, res) => {
    try {
        const companies = await RentalCompany.find({ isActive: true })
            .populate('vehicles', 'make model year type pricePerDay isAvailable');
        
        res.json({
            success: true,
            data: companies
        });
    } catch (error) {
        console.error('Get rental companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching rental companies'
        });
    }
});

// Get rental company by ID
router.get('/:id', async (req, res) => {
    try {
        const company = await RentalCompany.findById(req.params.id)
            .populate('vehicles', 'make model year type pricePerDay isAvailable');
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Rental company not found'
            });
        }

        res.json({
            success: true,
            data: company
        });
    } catch (error) {
        console.error('Get rental company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching rental company'
        });
    }
});

// Create new rental company
router.post('/', [
    body('rental_id').notEmpty().withMessage('Rental ID is required'),
    body('rental_name').notEmpty().withMessage('Rental name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('region').notEmpty().withMessage('Region is required'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.pincode').notEmpty().withMessage('Pincode is required'),
    body('address.state').notEmpty().withMessage('State is required'),
    body('contact.phone').notEmpty().withMessage('Phone number is required'),
    body('contact.email').isEmail().withMessage('Valid email is required')
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

        const company = new RentalCompany(req.body);
        await company.save();

        res.status(201).json({
            success: true,
            message: 'Rental company created successfully',
            data: company
        });
    } catch (error) {
        console.error('Create rental company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating rental company'
        });
    }
});

// Update rental company
router.put('/:id', [
    body('rental_name').optional().notEmpty().withMessage('Rental name cannot be empty'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('region').optional().notEmpty().withMessage('Region cannot be empty'),
    body('contact.email').optional().isEmail().withMessage('Valid email is required')
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

        const company = await RentalCompany.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Rental company not found'
            });
        }

        res.json({
            success: true,
            message: 'Rental company updated successfully',
            data: company
        });
    } catch (error) {
        console.error('Update rental company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating rental company'
        });
    }
});

// Delete rental company (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const company = await RentalCompany.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Rental company not found'
            });
        }

        res.json({
            success: true,
            message: 'Rental company deleted successfully'
        });
    } catch (error) {
        console.error('Delete rental company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting rental company'
        });
    }
});

module.exports = router;


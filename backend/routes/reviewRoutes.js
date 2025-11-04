const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

console.log('Review routes loaded');
console.log('Vehicle model collection name:', Vehicle.collection.name);

// GET endpoint to fetch all vehicles for review page
router.get('/vehicles', async (req, res) => {
  console.log('GET /api/reviews/vehicles called');
  
  try {
    // Fetch all vehicles using .lean() to get plain objects
    const vehicles = await Vehicle.find({}).lean();
    
    console.log('Found vehicles:', vehicles.length);
    
    if (vehicles.length > 0) {
      console.log('Sample vehicle fields:', Object.keys(vehicles[0]));
      console.log('Sample vehicle name:', vehicles[0].name);
      console.log('Sample vehicle rating:', vehicles[0].rating);
      console.log('Sample vehicle reviews:', vehicles[0].reviews);
    }
    
    // Filter only active ones
    const activeVehicles = vehicles.filter(v => v.isActive !== false);
    console.log('Active vehicles:', activeVehicles.length);
    
    // Format vehicles using the 'name' field from database
    const formattedVehicles = activeVehicles.map(v => {
      return {
        _id: v._id,
        name: v.name || 'Unknown Vehicle',
        rating: v.rating || 0,
        reviews: v.reviews || 0
      };
    });
    
    console.log('Sending response with', formattedVehicles.length, 'vehicles');
    if (formattedVehicles.length > 0) {
      console.log('First formatted vehicle:', formattedVehicles[0]);
    }
    
    res.status(200).json(formattedVehicles);
  } catch (error) {
    console.error('Error fetching vehicles for review:', error);
    res.status(500).json({ message: 'Failed to fetch vehicles', error: error.message });
  }
});

// POST endpoint to submit vehicle review
router.post('/submit', async (req, res) => {
  const { vehicleId, vehicleName, rating, name, email, review } = req.body;

  console.log('Received review submission:', { vehicleId, rating, name, email });

  // Validation
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid rating value (must be 1-5)' });
  }

  if (!name || !email || !review) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!vehicleId) {
    return res.status(400).json({ message: 'Vehicle ID is required' });
  }

  try {
    const vehicle = await Vehicle.findById(vehicleId).lean();

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    console.log('Current vehicle data:', {
      name: vehicle.name,
      rating: vehicle.rating,
      reviews: vehicle.reviews
    });

    const currentRating = vehicle.rating || 0;
    const currentReviews = vehicle.reviews || 0;
    
    // Calculate new average rating
    const totalRatingPoints = (currentRating * currentReviews) + rating;
    const newReviewCount = currentReviews + 1;
    const newAverageRating = totalRatingPoints / newReviewCount;

    console.log(`Updating rating: ${currentRating} (${currentReviews} reviews) -> ${newAverageRating.toFixed(2)} (${newReviewCount} reviews)`);

    const reviewData = {
      name,
      email,
      rating,
      review,
      submittedAt: new Date()
    };

    // Update vehicle with new rating and add review - bypass schema strict mode
    console.log('Attempting to update vehicle with:', {
      rating: parseFloat(newAverageRating.toFixed(2)),
      reviews: newReviewCount
    });

    // Use collection.updateOne to bypass Mongoose schema validation
    const updateResult = await Vehicle.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(vehicleId) },
      {
        $set: {
          rating: parseFloat(newAverageRating.toFixed(2)),
          reviews: newReviewCount,
          updatedAt: new Date()
        },
        $push: {
          reviewsData: reviewData
        }
      }
    );

    console.log('Update result:', updateResult);

    if (updateResult.matchedCount === 0) {
      return res.status(500).json({ message: 'Vehicle not found for update' });
    }

    if (updateResult.modifiedCount === 0) {
      console.warn('WARNING: Vehicle was found but not modified. Check schema configuration.');
    }

    // Verify the update - force a fresh query without cache
    const updatedVehicle = await Vehicle.collection.findOne({ 
      _id: new mongoose.Types.ObjectId(vehicleId) 
    });
    
    console.log('Vehicle after update (direct from MongoDB):', {
      name: updatedVehicle?.name,
      rating: updatedVehicle?.rating,
      reviews: updatedVehicle?.reviews,
      hasReviewsData: updatedVehicle?.reviewsData?.length || 0
    });

    // Get vehicle display name
    const vehicleDisplayName = vehicle.name || vehicleName || 'Vehicle';

    console.log('Review submitted successfully for:', vehicleDisplayName);

    return res.status(200).json({
      message: 'Review submitted successfully',
      vehicleName: vehicleDisplayName,
      newRating: parseFloat(newAverageRating.toFixed(2)),
      totalReviews: newReviewCount
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

module.exports = router;
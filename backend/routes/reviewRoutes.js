const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

console.log('Review routes loaded');

// GET endpoint to fetch all vehicles for review page
router.get('/vehicles', async (req, res) => {
  console.log('GET /vehicles called');
  
  try {
    // Remove the filter or make it match your data
    const vehicles = await Vehicle.find({})  // Get ALL vehicles first to debug
      .select('_id make model year rating reviews isActive')
      .sort({ make: 1, model: 1 });
    
    console.log('Found vehicles:', vehicles.length);
    console.log('Sample vehicle:', vehicles[0]); // Log first vehicle to see structure
    
    // Filter only active ones
    const activeVehicles = vehicles.filter(v => v.isActive !== false);
    console.log('Active vehicles:', activeVehicles.length);
    
    const formattedVehicles = activeVehicles.map(v => ({
      _id: v._id,
      name: `${v.make} ${v.model} ${v.year}`,
      rating: v.rating || 0,
      reviews: v.reviews || 0
    }));
    
    console.log('Sending response:', formattedVehicles.length);
    res.status(200).json(formattedVehicles);
  } catch (error) {
    console.error('Error fetching vehicles for review:', error);
    res.status(500).json({ message: 'Failed to fetch vehicles', error: error.message });
  }
});

// POST endpoint to submit vehicle review
router.post('/submit', async (req, res) => {
  const { vehicleId, vehicleName, rating, name, email, review } = req.body;

  console.log('Received review submission:', { vehicleId, rating, name });

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
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const currentRating = vehicle.rating || 0;
    const currentReviews = vehicle.reviews || 0;
    
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

    const updateResult = await Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        $set: {
          rating: parseFloat(newAverageRating.toFixed(2)),
          reviews: newReviewCount
        },
        $push: {
          reviewsData: reviewData
        }
      },
      { new: true, runValidators: false }
    );

    if (!updateResult) {
      return res.status(500).json({ message: 'Failed to update vehicle rating' });
    }

    const vehicleDisplayName = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;

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

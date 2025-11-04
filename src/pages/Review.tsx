import { Star, Send, ThumbsUp, ChevronDown, Car, Users, Fuel, Settings, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function Review() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    review: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch all vehicles from database
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reviews/vehicles');
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched vehicles data:', data);
          
          if (Array.isArray(data) && data.length > 0) {
            setVehicles(data);
          } else {
            setVehicles([]);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch vehicles, status:', response.status, 'Response:', errorText);
          setVehicles([]);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setVehicles([]);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVehicleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleId = e.target.value;
    const vehicle = vehicles.find(v => v._id === vehicleId);
    setSelectedVehicle(vehicle || null);
  };

  const handleReviewClick = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setShowReviewForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateForm = () => {
    const { name, email, review } = formData;

    if (!selectedVehicle) {
      alert('Please select a vehicle to review');
      return false;
    }

    if (!name.trim() || !email.trim() || !review.trim()) {
      alert('Please fill in all required fields');
      return false;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return false;
    }

    const emailFormatOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailFormatOk) {
      alert('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicle._id,
          vehicleName: selectedVehicle.name,
          rating,
          name: formData.name,
          email: formData.email,
          review: formData.review
        })
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', review: '' });
        setRating(0);
        setSelectedVehicle(null);
        setShowReviewForm(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = () => (
    <div className="flex items-center space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400'
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20 px-4 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-xl p-12 text-center max-w-md shadow-2xl">
          <div className="mb-6 flex justify-center">
            <ThumbsUp className="h-16 w-16 text-cyan-400 animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-cyan-400">
            Thank You!
          </h2>
          <p className="text-gray-400 text-lg mb-6">
            Your review has been submitted successfully. We appreciate your feedback!
          </p>
          <button
            onClick={() => {
              setSubmitSuccess(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-semibold"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  if (showReviewForm && selectedVehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => {
              setShowReviewForm(false);
              setSelectedVehicle(null);
              setRating(0);
              setFormData({ name: '', email: '', review: '' });
            }}
            className="mb-8 flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Vehicles</span>
          </button>

          {/* Selected Vehicle Info */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 mb-8 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">Writing Review For</h3>
            <div className="flex items-center space-x-4">
              <Car className="h-12 w-12 text-cyan-400" />
              <div>
                <p className="text-white font-semibold text-2xl">{selectedVehicle.name}</p>
                {selectedVehicle.rating > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-400">
                      {selectedVehicle.rating.toFixed(1)} ({selectedVehicle.reviews || 0} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review Form */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-6 text-cyan-400">Your Review</h3>

            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Your Rating <span className="text-red-500">*</span>
                </label>
                <StarRating />
                {rating > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    {rating === 5 && "Excellent! ⭐"}
                    {rating === 4 && "Very Good! 👍"}
                    {rating === 3 && "Good 👌"}
                    {rating === 2 && "Fair 😐"}
                    {rating === 1 && "Needs Improvement 😞"}
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="review"
                  value={formData.review}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Tell us about your experience with this vehicle. What did you like? What could be improved?"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-white placeholder-gray-500"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2 font-semibold shadow-lg"
              >
                <Send className="h-5 w-5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Share Your <span className="text-cyan-400">Experience</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Select a vehicle you've experienced and share your valuable feedback
          </p>
        </div>

        {/* Vehicles Grid */}
        {isLoadingVehicles ? (
          <div className="text-center text-gray-400">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center text-gray-400">No vehicles available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-cyan-500 transition-all duration-300"
              >
                {/* Vehicle Image */}
                <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <Car className="h-24 w-24 text-cyan-400 opacity-50" />
                </div>

                {/* Vehicle Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{vehicle.name}</h3>
                  
                  {/* Rating */}
                  {vehicle.rating > 0 ? (
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(vehicle.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {vehicle.rating.toFixed(1)} ({vehicle.reviews} reviews)
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm mb-4">No reviews yet - Be the first!</div>
                  )}

                  {/* Write Review Button */}
                  <button
                    onClick={() => handleReviewClick(vehicle)}
                    className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>Write Review</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
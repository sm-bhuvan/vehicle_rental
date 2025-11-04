import { Star, Send, ThumbsUp, ChevronDown } from "lucide-react";
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

  // Fetch all vehicles from database
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reviews/vehicles');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched vehicles:', data);
          if (Array.isArray(data)) {
            setVehicles(data);
          } else if (data.vehicles && Array.isArray(data.vehicles)) {
            setVehicles(data.vehicles);
          } else {
            console.error('Unexpected data format:', data);
            setVehicles([]);
          }
        } else {
          console.error('Failed to fetch vehicles, status:', response.status);
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
            Submit Another Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Share Your <span className="text-cyan-400">Experience</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We value your feedback! Select a vehicle and let us know about your experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-cyan-400">Why Review?</h3>
              <div className="space-y-4 text-gray-400">
                <p>
                  Your feedback helps us improve our services and helps other customers make informed decisions.
                </p>
                <div className="space-y-3 mt-6">
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <span>Rate your experience</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <span>Share your thoughts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <span>Help us serve better</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedVehicle && (
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-xl p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-4 text-cyan-400">Selected Vehicle</h3>
                <p className="text-white font-semibold text-lg mb-3">{selectedVehicle.name}</p>
                {selectedVehicle.rating > 0 && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-400">
                      {selectedVehicle.rating.toFixed(1)} ({selectedVehicle.reviews || 0} {selectedVehicle.reviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-cyan-400">Write Your Review</h3>

              <div className="space-y-6">
                {/* Vehicle Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Select Vehicle <span className="text-red-500">*</span>
                  </label>
                  {isLoadingVehicles ? (
                    <div className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-400">
                      Loading vehicles...
                    </div>
                  ) : vehicles.length === 0 ? (
                    <div className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-400">
                      No vehicles available
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedVehicle?._id || ''}
                        onChange={handleVehicleSelect}
                        className="w-full px-4 py-3 pr-10 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white appearance-none cursor-pointer"
                      >
                        <option value="">Choose a vehicle...</option>
                        {Array.isArray(vehicles) && vehicles.map((vehicle) => (
                          <option key={vehicle._id} value={vehicle._id}>
                            {vehicle.name} {vehicle.rating > 0 ? `★ ${vehicle.rating.toFixed(1)}` : '(No reviews yet)'}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>

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
      </div>
    </div>
  );
}
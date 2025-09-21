import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { transactionId, bookingDetails, success, message } = location.state || {};

  useEffect(() => {
    if (!bookingDetails) {
      navigate("/");
    }
  }, [bookingDetails, navigate]);

  if (!bookingDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-green-400 mb-4">Booking Confirmed!</h1>
          <p className="text-gray-300 text-lg">Your vehicle rental has been successfully booked</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Booking Details</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Transaction ID</label>
                <p className="text-white font-mono text-lg">{transactionId}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Vehicle</label>
                <p className="text-white text-lg">{bookingDetails.vehicleName}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Customer Name</label>
                <p className="text-white text-lg">{bookingDetails.firstName} {bookingDetails.lastName}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <p className="text-white text-lg">{bookingDetails.email}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Phone</label>
                <p className="text-white text-lg">{bookingDetails.phone}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Pickup Date</label>
                <p className="text-white text-lg">{new Date(bookingDetails.pickupDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm">Return Date</label>
                <p className="text-white text-lg">{new Date(bookingDetails.returnDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {bookingDetails.message && (
            <div className="mt-6">
              <label className="text-gray-400 text-sm">Special Message</label>
              <p className="text-white text-lg mt-1">{bookingDetails.message}</p>
            </div>
          )}
        </div>

        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-400 mb-4">📧 Confirmation Email Sent</h3>
          <p className="text-gray-300">
            A detailed confirmation email has been sent to <strong>{bookingDetails.email}</strong> 
            with all your booking information and important details.
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-cyan-400 mb-4">📞 Contact Information</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">Phone Support</h4>
              <p className="text-gray-400">+91 94433 18232</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">Email Support</h4>
              <p className="text-gray-400">bars@gmail.com</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">24/7 Support</h4>
              <p className="text-gray-400">Always available</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/vehicles")}
            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Browse More Vehicles
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

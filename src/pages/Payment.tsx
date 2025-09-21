import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface BookingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleName: string;
  vehicleId: number;
  pickupDate: string;
  returnDate: string;
  message: string;
}

const Payment = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");
  const [showUpiInput, setShowUpiInput] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const bookingDetails = location.state?.bookingDetails as BookingDetails;

  // UPI apps configuration
  const upiApps = [
    { name: "Google Pay", id: "googlepay", icon: "🟢" },
    { name: "PhonePe", id: "phonepe", icon: "🟣" },
    { name: "Paytm", id: "paytm", icon: "🔵" },
    { name: "BHIM UPI", id: "bhim", icon: "🟡" },
    { name: "Other UPI App", id: "other", icon: "💳" }
  ];

  const merchantUpiId = "smbhuvantsi@oksbi"; // Replace with your actual UPI ID (kept private)
  const amount = 500;

  // Redirect if no booking details
  useEffect(() => {
    if (!bookingDetails) {
      alert("No booking details found. Please go back to the contact form.");
      navigate("/contact");
    }
  }, [bookingDetails, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        alert("Please upload a PDF file only!");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size should be less than 5MB!");
        return;
      }
      setFile(selectedFile);
    }
  };

  const generateUpiLink = () => {
    const transactionId = `TXN${Date.now()}`;
    const note = `Payment for ${bookingDetails.vehicleName} booking`;
    
    const upiParams = new URLSearchParams({
      pa: merchantUpiId, // Payee Address (merchant UPI ID)
      pn: "BARS Wheels", // Payee Name
      am: amount.toString(), // Amount
      cu: "INR", // Currency
      tn: note, // Transaction Note
      tr: transactionId // Transaction Reference
    });

    return `upi://pay?${upiParams.toString()}`;
  };

  const generateUpiQRString = () => {
    const transactionId = `TXN${Date.now()}`;
    const note = `Payment for ${bookingDetails.vehicleName} booking`;
    
    // Standard UPI QR format that banks recognize
    const upiQRString = `upi://pay?pa=${merchantUpiId}&pn=BARS Wheels&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}&tr=${transactionId}`;
    return upiQRString;
  };

  const generateQRCode = (upiString: string) => {
    const size = 200;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiString)}`;
    return qrApiUrl;
  };

  const handleUpiPayment = async () => {
    if (!file) {
      alert("Please upload your PDF first!");
      return;
    }

    if (!selectedUpiApp) {
      alert("Please select a UPI app!");
      return;
    }

    if (selectedUpiApp === "other" && !upiId.trim()) {
      alert("Please enter your UPI ID!");
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      const upiLink = generateUpiLink();
      
      // For mobile devices, try to open UPI app
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.location.href = upiLink;
        
        // Show processing state and wait for user confirmation
        setTimeout(() => {
          const confirmed = confirm("Have you completed the payment? Click OK if payment is successful, Cancel if not.");
          if (confirmed) {
            setPaymentStatus('completed');
            handlePaymentSuccess();
          } else {
            setPaymentStatus('failed');
            setLoading(false);
          }
        }, 3000);
      } else {
        // For desktop, show QR code
        setTimeout(() => {
          const confirmed = confirm("Please scan the QR code and complete the payment. Click OK when payment is done, Cancel if not.");
          if (confirmed) {
            setPaymentStatus('completed');
            handlePaymentSuccess();
          } else {
            setPaymentStatus('failed');
            setLoading(false);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('UPI payment failed:', error);
      setPaymentStatus('failed');
      alert('Failed to initiate UPI payment. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const transactionId = `TXN${Date.now()}`;
      
      // Send booking details to backend
      const response = await fetch('/api/process-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          bookingDetails,
          fileName: file?.name,
          paymentMethod: 'UPI',
          amount: amount,
        }),
      });
      
      if (response.ok) {
        alert(`Payment Successful! 
               Transaction ID: ${transactionId}
               Booking confirmed for ${bookingDetails.vehicleName}`);
        navigate('/booking-confirmation', { 
          state: { 
            transactionId,
            bookingDetails 
          }
        });
      } else {
        throw new Error('Failed to process booking');
      }
    } catch (error) {
      console.error('Booking processing failed:', error);
      alert('Payment successful but booking processing failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpiAppSelect = (appId: string) => {
    setSelectedUpiApp(appId);
    setShowUpiInput(appId === "other");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Payment Information */}
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-8">Payment Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Document Verification</h3>
                  <p className="text-gray-400">Upload your driver's license for verification</p>
                  <p className="text-gray-400">Accepted format: PDF only</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V9M15,3.5L19.5,8H15V3.5Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Processing Fee</h3>
                  <p className="text-gray-400">One-time verification fee</p>
                  <p className="text-cyan-400 font-bold text-xl">₹500</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">UPI Payment</h3>
                  <p className="text-gray-400">Pay securely using UPI</p>
                  <p className="text-gray-400">Instant & Safe</p>
                </div>
              </div>
            </div>

            {/* UPI QR Code Display */}
            {paymentStatus === 'processing' && (
              <div className="mt-8 p-6 bg-gray-700 rounded-lg text-center">
                <h4 className="text-cyan-400 font-semibold mb-4">Scan QR Code to Pay</h4>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img 
                    src={generateQRCode(generateUpiQRString())} 
                    alt="UPI Payment QR Code"
                    className="w-48 h-48"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      const sibling = target.nextElementSibling as HTMLDivElement;
                      target.style.display = 'none';
                      if (sibling) {
                        sibling.style.display = 'block';
                      }
                    }}
                  />
                  <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center text-gray-600" style={{display: 'none'}}>
                    QR Code Loading...
                  </div>
                </div>
                <p className="text-cyan-400 font-semibold mt-4">Amount: ₹{amount}</p>
                <p className="text-gray-400 text-sm mt-2">Scan with any UPI app to pay</p>
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <p className="text-gray-400 text-sm">Or open your UPI app and pay to:</p>
                  <p className="text-white font-mono bg-gray-800 px-3 py-2 rounded mt-2 select-all">
                    BARS Wheels
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Upload & Payment Form */}
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-8">Upload & Pay</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-3">
                  Driver License Document
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="license-upload"
                  />
                  <label 
                    htmlFor="license-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors bg-gray-700"
                  >
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                      <p className="text-gray-400">
                        {file ? file.name : "Click to upload PDF"}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {file ? "File selected" : "PDF files only"}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {file && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* UPI App Selection */}
              {file && (
                <div className="space-y-4">
                  <label className="block text-gray-300 font-medium">
                    Choose UPI App
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {upiApps.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => handleUpiAppSelect(app.id)}
                        className={`p-3 rounded-lg border-2 transition-colors flex items-center space-x-3 ${
                          selectedUpiApp === app.id
                            ? 'border-cyan-400 bg-cyan-400/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <span className="text-2xl">{app.icon}</span>
                        <span className="text-white font-medium">{app.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  {showUpiInput && (
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Enter UPI ID
                      </label>
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-300">Verification Fee:</span>
                  <span className="text-white font-bold text-xl">₹500</span>
                </div>
                
                <button
                  onClick={handleUpiPayment}
                  disabled={!file || !selectedUpiApp || loading || (selectedUpiApp === "other" && !upiId.trim())}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                    file && selectedUpiApp && !loading && (selectedUpiApp !== "other" || upiId.trim())
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>
                        {paymentStatus === 'processing' ? 'Waiting for payment...' : 'Processing...'}
                      </span>
                    </div>
                  ) : file && selectedUpiApp ? (
                    'Pay with UPI'
                  ) : (
                    'Upload File & Select UPI App'
                  )}
                </button>
                
                {paymentStatus === 'processing' && (
                  <p className="text-center text-cyan-400 text-sm mt-3">
                    Complete the payment in your UPI app and wait for confirmation
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-800 rounded-lg p-8 mt-12">
          <h3 className="text-xl font-bold text-cyan-400 mb-6">Need Help?</h3>
          <div className="grid md:grid-cols-3 gap-6">
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
              <p className="text-gray-400">support@luxedrive.com</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A1.5,1.5 0 0,1 13.5,7.5A1.5,1.5 0 0,1 12,9A1.5,1.5 0 0,1 10.5,7.5A1.5,1.5 0 0,1 12,6M16.64,15.5A7.5,7.5 0 0,1 12,18A7.5,7.5 0 0,1 7.36,15.5C7.9,14.66 9.77,14 12,14C14.23,14 16.1,14.66 16.64,15.5Z"/>
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">24/7 Support</h4>
              <p className="text-gray-400">Always available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
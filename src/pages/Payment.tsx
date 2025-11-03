import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface BookingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleName: string;
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  message: string;
}

const Payment = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false); // Used for both verification and booking
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");
  const [showUpiInput, setShowUpiInput] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "waiting" | "success" | "failed"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [transactionRef, setTransactionRef] = useState<string>("");

  const location = useLocation();
  const navigate = useNavigate();

  const bookingDetails = location.state?.bookingDetails as BookingDetails;

  const upiApps = [
    { name: "Google Pay", id: "googlepay", icon: "🟢" },
    { name: "PhonePe", id: "phonepe", icon: "🟣" },
    { name: "Paytm", id: "paytm", icon: "🔵" },
    { name: "BHIM UPI", id: "bhim", icon: "🟡" },
    { name: "Other UPI App", id: "other", icon: "💳" },
  ];

  const merchantUpiId = "smbhuvantsi@oksbi";
  const amount = 5;

  useEffect(() => {
    if (!bookingDetails) {
      navigate("/contact");
    }
  }, [bookingDetails, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Allow PDF AND images for verification
      if (
        !selectedFile.type.startsWith("application/pdf") &&
        !selectedFile.type.startsWith("image/")
      ) {
        alert("Please upload a PDF or image file only!");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB!");
        return;
      }
      setFile(selectedFile);
    }
  };

  const generateTransactionRef = () => {
    return `BARS${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  };

  const generateUpiLink = (txnRef: string) => {
    const note = `Payment for ${bookingDetails.vehicleName} booking`;
    const upiParams = new URLSearchParams({
      pa: merchantUpiId,
      pn: "BARS Wheels",
      am: amount.toString(),
      cu: "INR",
      tn: note,
      tr: txnRef,
    });
    return `upi://pay?${upiParams.toString()}`;
  };

  const generateQRCode = (txnRef: string) => {
    const upiString = `upi://pay?pa=${merchantUpiId}&pn=BARS Wheels&am=${amount}&cu=INR&tn=Payment for booking&tr=${txnRef}`;
    const size = 250;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      upiString,
    )}`;
  };

  // ==========================================================
  // MODIFIED FUNCTION
  // ==========================================================
  const handleInitiatePayment = async () => {
    setErrorMessage("");

    if (!file) {
      setErrorMessage("Please upload your driver license (PDF or Image) first!");
      return;
    }

    if (!selectedUpiApp) {
      setErrorMessage("Please select a UPI app!");
      return;
    }

    if (selectedUpiApp === "other" && !upiId.trim()) {
      setErrorMessage("Please enter your UPI ID!");
      return;
    }

    setLoading(true); // Start loading spinner

    try {
      // Bypass verification: we still require the file, but do not call the API
      const txnRef = generateTransactionRef();
      setTransactionRef(txnRef);
      setShowQR(true);
      setPaymentStatus("waiting");

      // Try to open UPI app on mobile
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const upiLink = generateUpiLink(txnRef);
        window.location.href = upiLink;
      }
    } catch (error) {
      console.error("Payment Init error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred.",
      );
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };
  // ==========================================================
  // END OF MODIFIED FUNCTION
  // ==========================================================

  const handleConfirmPayment = async () => {
    if (!transactionRef) {
      setErrorMessage("Transaction reference not found. Please try again.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Step 1: Create booking directly
      const bookingResponse = await fetch("/api/bookings/create-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId: bookingDetails.vehicleId,
          firstName: bookingDetails.firstName,
          lastName: bookingDetails.lastName,
          email: bookingDetails.email,
          phone: bookingDetails.phone,
          pickupDate: bookingDetails.pickupDate,
          returnDate: bookingDetails.returnDate,
          message: bookingDetails.message || "",
          transactionRef: transactionRef,
          paymentAmount: amount,
          paymentMethod: "UPI",
          upiId: upiId || selectedUpiApp,
          documentName: file?.name || "license.pdf",
        }),
      });

      // Read body once and parse conditionally to avoid JSON parse errors
      const bookingContentType = bookingResponse.headers.get("content-type");
      const bookingText = await bookingResponse.text();
      let bookingData: any = null;
      if (bookingContentType && bookingContentType.includes("application/json")) {
        try {
          bookingData = bookingText ? JSON.parse(bookingText) : null;
        } catch (e) {
          throw new Error("Invalid response from server while creating booking.");
        }
      }

      if (bookingData && bookingData.success) {
        setPaymentStatus("success");

        // Wait a moment then redirect
        setTimeout(() => {
          navigate("/booking-confirmation", {
            state: {
              bookingId: bookingData.data.bookingId,
              transactionRef: transactionRef,
              bookingDetails: bookingDetails,
              success: true,
              message: "Booking confirmed successfully!",
            },
          });
        }, 1500);
      } else {
        const serverMsg = bookingData?.message || bookingText || "Booking creation failed";
        throw new Error(serverMsg);
      }
    } catch (error) {
      console.error("Booking error:", error);
      setPaymentStatus("failed");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to process booking. Please contact support with your transaction reference: " +
            transactionRef,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpiAppSelect = (appId: string) => {
    setSelectedUpiApp(appId);
    setShowUpiInput(appId === "other");
    if (appId !== "other") {
      setUpiId("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Payment Info */}
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-8">
              Payment Information
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-gray-900"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    Document Verification
                  </h3>
                  <p className="text-gray-400">Upload your driver's license</p>
                  <p className="text-gray-400 text-sm">
                    PDF or Image format
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-gray-900"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V9M15,3.5L19.5,8H15V3.5Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    Processing Fee
                  </h3>
                  <p className="text-gray-400">One-time verification</p>
                  <p className="text-cyan-400 font-bold text-xl">₹{amount}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-gray-900"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    Secure Payment
                  </h3>
                  <p className="text-gray-400">UPI Payment</p>
                  <p className="text-gray-400 text-sm">Safe & Instant</p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {paymentStatus === "success" && (
              <div className="mt-8 p-6 bg-green-900/20 border border-green-500 rounded-lg text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                  </svg>
                </div>
                <h4 className="text-green-400 font-semibold text-lg mb-2">
                  Booking Confirmed!
                </h4>
                <p className="text-gray-300 text-sm">Redirecting...</p>
              </div>
            )}

            {/* QR Code Section */}
            {showQR && paymentStatus === "waiting" && (
              <div className="mt-8 p-6 bg-gray-700 rounded-lg">
                <h4 className="text-cyan-400 font-semibold text-center mb-4">
                  Scan to Pay ₹{amount}
                </h4>

                <div className="bg-white p-4 rounded-lg inline-block w-full text-center">
                  <img
                    src={generateQRCode(transactionRef)}
                    alt="UPI QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>

                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <p className="text-gray-400 text-sm text-center mb-2">
                    Transaction Reference:
                  </p>
                  <p className="text-cyan-400 font-mono text-center text-sm break-all">
                    {transactionRef}
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 text-center">
                    <p className="text-blue-400 font-semibold">
                      Complete payment in your UPI app
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      Then click confirm below
                    </p>
                  </div>

                  <button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </span>
                    ) : (
                      "✓ I have completed the payment"
                    )}
                  </button>

                  <p className="text-gray-400 text-xs text-center">
                    Save your transaction reference for future queries
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Upload Form */}
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-8">
              Upload & Pay
            </h2>

            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-gray-300 font-medium mb-3">
                  Driver License (PDF or Image)
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/*" // Updated accept
                  onChange={handleFileChange}
                  className="hidden"
                  id="license-upload"
                  disabled={showQR || loading} // Disable while loading or after QR shown
                />
                <label
                  htmlFor="license-upload"
                  className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors ${
                    showQR || loading
                      ? "border-gray-700 bg-gray-800 cursor-not-allowed"
                      : "border-gray-600 hover:border-cyan-400 cursor-pointer bg-gray-700"
                  }`}
                >
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    <p className="text-gray-400">
                      {file ? file.name : "Click to upload PDF or Image"}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {file
                        ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                        : "Max 5MB"}
                    </p>
                  </div>
                </label>
              </div>

              {file && !showQR && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      disabled={loading} // Disable while loading
                      className="text-red-400 hover:text-red-300 disabled:text-gray-600"
                      aria-label="Remove file"
                      title="Remove file"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* UPI Selection */}
              {file && !showQR && (
                <div className="space-y-4">
                  <label className="block text-gray-300 font-medium">
                    Choose Payment App
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {upiApps.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => handleUpiAppSelect(app.id)}
                        disabled={loading} // Disable while loading
                        className={`p-3 rounded-lg border-2 transition-colors flex items-center space-x-3 ${
                          selectedUpiApp === app.id
                            ? "border-cyan-400 bg-cyan-400/10"
                            : "border-gray-600 hover:border-gray-500"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span className="text-2xl">{app.icon}</span>
                        <span className="text-white font-medium text-sm">
                          {app.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {showUpiInput && (
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Your UPI ID
                      </label>
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        disabled={loading} // Disable while loading
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 disabled:bg-gray-800"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              {!showQR && (
                <div className="border-t border-gray-700 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-300">Amount to Pay:</span>
                    <span className="text-white font-bold text-2xl">
                      ₹{amount}
                    </span>
                  </div>

                  <button
                    onClick={handleInitiatePayment}
                    disabled={
                      !file ||
                      !selectedUpiApp ||
                      (selectedUpiApp === "other" && !upiId.trim()) ||
                      loading // Disable while loading
                    }
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                      file &&
                      selectedUpiApp &&
                      (selectedUpiApp !== "other" || upiId.trim()) &&
                      !loading
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {loading
                      ? "Verifying License..."
                      : file && selectedUpiApp
                        ? "Verify & Pay Now"
                        : "Complete All Steps Above"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-800 rounded-lg p-8 mt-12">
          {/* ... (your help section code is unchanged) ... */}
        </div>
      </div>
    </div>
  );
};

export default Payment;
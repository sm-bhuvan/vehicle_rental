import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { transactionId, transactionRef, bookingId, bookingDetails, success, message } = location.state || {};
  const effectiveTxnId = transactionId || transactionRef;

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
                <p className="text-white font-mono text-lg">{effectiveTxnId}</p>
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
            A detailed confirmation email has been sent to <strong>{bookingDetails.email} </strong> 
            with all your booking information and important details.
          </p>
        </div>

        {/* Invoice + Download */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Invoice</h2>
          <div id="receipt-content" className="bg-gray-900 rounded-md p-6">
            <div className="flex justify-between items-start border-b border-gray-700 pb-6 mb-6">
              <div>
                <h3 className="text-white font-bold text-2xl tracking-wide">BARS Wheels</h3>
                <p className="text-gray-400 text-sm mt-1">Vehicle Rental Invoice</p>
                <p className="text-gray-500 text-xs mt-2">Phone: +91 94433 18232 | Email: support@barswheels.com</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm font-semibold">Invoice Date</p>
                <p className="text-white font-medium">{new Date().toLocaleString()}</p>
                <p className="text-gray-400 text-sm font-semibold mt-3">Invoice No.</p>
                <p className="text-white font-mono">{bookingId || 'N/A'}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 rounded p-4">
                <p className="text-gray-400 text-xs font-semibold uppercase">Billed To</p>
                <p className="text-white font-semibold mt-1">{bookingDetails.firstName} {bookingDetails.lastName}</p>
                <p className="text-gray-300 text-sm mt-1">{bookingDetails.email}</p>
                <p className="text-gray-300 text-sm">{bookingDetails.phone}</p>
              </div>
              <div className="bg-gray-800 rounded p-4">
                <p className="text-gray-400 text-xs font-semibold uppercase">Payment</p>
                <p className="text-white font-semibold mt-1">Transaction ID</p>
                <p className="text-gray-300 font-mono text-sm">{effectiveTxnId}</p>
                <p className="text-white font-semibold mt-3">Payment Method</p>
                <p className="text-gray-300 text-sm">UPI</p>
              </div>
            </div>

            <div className="overflow-hidden rounded border border-gray-700">
              <table className="w-full text-left">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-gray-300 text-sm font-semibold">Item</th>
                    <th className="px-4 py-3 text-gray-300 text-sm font-semibold">Details</th>
                    <th className="px-4 py-3 text-gray-300 text-sm font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-700">
                    <td className="px-4 py-3 text-white font-medium">Vehicle Rental Processing</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      <div><span className="font-semibold text-white">Vehicle:</span> {bookingDetails.vehicleName}</div>
                      <div><span className="font-semibold text-white">Pickup:</span> {new Date(bookingDetails.pickupDate).toLocaleString()}</div>
                      <div><span className="font-semibold text-white">Return:</span> {new Date(bookingDetails.returnDate).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold text-right">₹{(location.state?.paymentAmount ?? 5).toString()}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-700 bg-gray-800">
                    <td className="px-4 py-3" colSpan={2}>
                      <span className="text-gray-300 text-sm font-semibold">Subtotal</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white font-semibold">₹{(location.state?.paymentAmount ?? 5).toString()}</span>
                    </td>
                  </tr>
                  <tr className="border-t border-gray-700 bg-gray-800">
                    <td className="px-4 py-3" colSpan={2}>
                      <span className="text-gray-300 text-sm font-semibold">Tax</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white font-semibold">₹0</span>
                    </td>
                  </tr>
                  <tr className="border-t border-gray-700 bg-gray-900">
                    <td className="px-4 py-3" colSpan={2}>
                      <span className="text-gray-300 text-sm font-bold">Total Paid</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white text-lg font-bold">₹{(location.state?.paymentAmount ?? 5).toString()}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-6">
              <p className="text-gray-400 text-sm font-semibold">Notes</p>
              <p className="text-gray-400 text-xs mt-1">Thank you for your payment. Please present a valid driver license during vehicle pickup.</p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => {
                const printWindow = window.open('', '_blank', 'width=900,height=1200');
                if (!printWindow) return;
                const amount = (location.state?.paymentAmount ?? 5).toString();
                const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice - BARS Wheels</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Inter, Arial, sans-serif; color: #111827; margin: 0; padding: 32px; background: #ffffff; }
    .invoice { max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 700; letter-spacing: .4px; }
    .muted { color: #6b7280; }
    .section { margin-bottom: 20px; }
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .row { display: flex; gap: 8px; margin: 6px 0; }
    .label { font-weight: 700; min-width: 150px; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    table { width: 100%; border-collapse: collapse; }
    @media print {
      body { padding: 0; }
    }
  </style>
  </head>
  <body>
    <div class="invoice">
      <div class="header">
        <div>
          <div class="brand">BARS Wheels</div>
          <div class="muted" style="font-size:13px; margin-top:4px;">Vehicle Rental Invoice</div>
          <div class="muted" style="font-size:12px; margin-top:6px;">Phone: +91 94433 18232 | Email: support@barswheels.com</div>
        </div>
        <div>
          <div class="row"><div class="label">Invoice Date:</div><div>${new Date().toLocaleString()}</div></div>
          <div class="row"><div class="label">Invoice No.:</div><div class="mono">${bookingId || 'N/A'}</div></div>
        </div>
      </div>

      <div class="grid section">
        <div class="card">
          <div class="muted" style="font-size:11px; font-weight:700; text-transform:uppercase;">Billed To</div>
          <div class="row"><div class="label">Name:</div><div>${bookingDetails.firstName} ${bookingDetails.lastName}</div></div>
          <div class="row"><div class="label">Email:</div><div>${bookingDetails.email}</div></div>
          <div class="row"><div class="label">Phone:</div><div>${bookingDetails.phone}</div></div>
        </div>
        <div class="card">
          <div class="muted" style="font-size:11px; font-weight:700; text-transform:uppercase;">Payment</div>
          <div class="row"><div class="label">Transaction ID:</div><div class="mono">${effectiveTxnId}</div></div>
          <div class="row"><div class="label">Method:</div><div>UPI</div></div>
        </div>
      </div>

      <div class="card section">
        <div class="row"><div class="label">Vehicle:</div><div>${bookingDetails.vehicleName}</div></div>
        <div class="row"><div class="label">Pickup:</div><div>${new Date(bookingDetails.pickupDate).toLocaleString()}</div></div>
        <div class="row"><div class="label">Return:</div><div>${new Date(bookingDetails.returnDate).toLocaleString()}</div></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align:left; padding:10px; background:#f3f4f6;">Item</th>
            <th style="text-align:left; padding:10px; background:#f3f4f6;">Details</th>
            <th style="text-align:right; padding:10px; background:#f3f4f6;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:10px; border-top:1px solid #e5e7eb; font-weight:600;">Vehicle Rental Processing</td>
            <td style="padding:10px; border-top:1px solid #e5e7eb;">
              <div class="row"><div class="label">Vehicle:</div><div>${bookingDetails.vehicleName}</div></div>
              <div class="row"><div class="label">Pickup:</div><div>${new Date(bookingDetails.pickupDate).toLocaleString()}</div></div>
              <div class="row"><div class="label">Return:</div><div>${new Date(bookingDetails.returnDate).toLocaleString()}</div></div>
            </td>
            <td style="padding:10px; border-top:1px solid #e5e7eb; text-align:right; font-weight:700;">₹${amount}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding:10px; border-top:1px solid #e5e7eb;" colspan="2"><span class="label">Subtotal:</span></td>
            <td style="padding:10px; border-top:1px solid #e5e7eb; text-align:right; font-weight:700;">₹${amount}</td>
          </tr>
          <tr>
            <td style="padding:10px; border-top:1px solid #e5e7eb;" colspan="2"><span class="label">Tax:</span></td>
            <td style="padding:10px; border-top:1px solid #e5e7eb; text-align:right; font-weight:700;">₹0</td>
          </tr>
          <tr>
            <td style="padding:10px; border-top:1px solid #e5e7eb;" colspan="2"><span class="label">Total Paid:</span></td>
            <td style="padding:10px; border-top:1px solid #e5e7eb; text-align:right; font-weight:800;">₹${amount}</td>
          </tr>
        </tfoot>
      </table>

      <div class="section" style="margin-top:24px;">
        <div class="label">Notes:</div>
        <div class="muted" style="margin-top:6px; font-size:13px;">Thank you for your payment. Please present a valid driver license during vehicle pickup.</div>
      </div>

    </div>
  </body>
</html>`;
                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
              }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Download Invoice (PDF)
            </button>
          </div>
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

import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import MyDatePicker from "./date";
import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useVehicles } from "../contexts/VehicleContext";

const Contact = () => {
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { updateVehicle } = useVehicles();

  // Extract vehicle info from previous page
  const { vehicleName, vehicleId } = useMemo(() => ({
    vehicleName: (location.state as any)?.vehicleName as string | undefined,
    vehicleId: (location.state as any)?.vehicleId as number | undefined,
  }), [location.state]);

  // Pre-fill from query params (from chatbot)
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const fullName = params.get("name") || "";
    const [first, last] = fullName.split(" ");
    setFormData((prev) => ({
      ...prev,
      firstName: first || "",
      lastName: last || "",
      email: params.get("email") || prev.email,
      phone: params.get("phone") || prev.phone,
    }));

    // Set pickup and return dates
    const pickup = params.get("pickup");
    const drop = params.get("drop");
    if (pickup) setPickupDate(new Date(pickup));
    if (drop) setReturnDate(new Date(drop));
  }, [location.search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { firstName, lastName, email, message } = formData;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !message.trim()) {
      alert('Please fill in all required fields');
      return false;
    }

    if (!pickupDate || !returnDate) {
      alert('Please select both pickup and return dates');
      return false;
    }

    if (pickupDate >= returnDate) {
      alert('Return date must be after pickup date');
      return false;
    }

    return true;
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let sameDay = false;
      if (pickupDate) {
        const today = new Date();
        sameDay = pickupDate.getFullYear() === today.getFullYear() &&
          pickupDate.getMonth() === today.getMonth() &&
          pickupDate.getDate() === today.getDate();
      }

      if (vehicleName && sameDay) {
        await fetch('/api/vehicles/book-by-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: vehicleName, startDate: pickupDate?.toISOString() })
        });
      }

      if (sameDay && vehicleId) {
        updateVehicle(vehicleId, { available: false });
      }

      navigate('/payment', {
        state: {
          bookingDetails: {
            ...formData,
            vehicleName,
            vehicleId,
            pickupDate: pickupDate?.toISOString(),
            returnDate: returnDate?.toISOString(),
          }
        }
      });
    } catch (_err) {
      alert('Failed to process booking. Please try again.');
    }
  };

  return (
    <section id="contact" className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-4">
            Get In <span className="text-neon">Touch</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Ready to experience luxury? Contact us for bookings, inquiries, 
            or any assistance you need. We're here 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* ... same contact info section ... */}
          </div>

          {/* Contact Form */}
          <div className="glass-card rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-neon">Send us a Message</h3>

            <form onSubmit={handleProceedToPayment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="John"
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 94433 18232"
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Vehicle Interest */}
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle</label>
                <input
                  type="text"
                  readOnly
                  value={vehicleName || ''}
                  placeholder="Select from vehicles page"
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Pickup & Return Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Pickup Date</label>
                  <MyDatePicker selectedDate={pickupDate} setSelectedDate={setPickupDate} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Return Date</label>
                  <MyDatePicker selectedDate={returnDate} setSelectedDate={setReturnDate} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  placeholder="Tell us about your rental needs, budget, and any special requirements..."
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>Proceed to Payment</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

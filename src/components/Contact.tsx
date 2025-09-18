import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import MyDatePicker from "./date";
import { useMemo, useState } from "react";
import ScheduleCall from "./CallSchedule";
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

  const { vehicleName, vehicleId } = useMemo(() => ({
    vehicleName: (location.state as any)?.vehicleName as string | undefined,
    vehicleId: (location.state as any)?.vehicleId as number | undefined,
  }), [location.state]);

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
    
    if (!validateForm()) {
      return;
    }

    try {
      let sameDay = false;
      if (pickupDate) {
        const today = new Date();
        sameDay = pickupDate.getFullYear() === today.getFullYear() &&
          pickupDate.getMonth() === today.getMonth() &&
          pickupDate.getDate() === today.getDate();
      }

      if (vehicleName && sameDay) {
        // Call backend to mark vehicle unavailable for same-day booking
        await fetch('/api/vehicles/book-by-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: vehicleName, startDate: pickupDate?.toISOString() })
        });
      }

      // Update local state immediately for better UX
      if (sameDay && vehicleId) {
        updateVehicle(vehicleId, { available: false });
      }

      // Navigate to payment page with booking details
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
            <div className="glass-card rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-neon">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-neon mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <p className="text-gray-400">+91 94433 18232</p>
                    <p className="text-gray-400">+91 89037 35645</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-neon mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-gray-400">booking@luxedrive.com</p>
                    <p className="text-gray-400">support@luxedrive.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-neon mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Address</h4>
                    <p className="text-gray-400">
                      123 Luxury Avenue<br />
                      Beverly Hills, CA 90210<br />
                      United States
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-neon mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Hours</h4>
                    <p className="text-gray-400">
                      24/7 Customer Support<br />
                      Pickup: 6:00 AM - 11:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-neon">Quick Actions</h3>
              <div className="space-y-4">
                <button className="btn-primary w-full justify-center">
                  Book Now - Instant Quote
                </button>
                <div className="btn-outline w-full flex items-center justify-center">
                  <ScheduleCall />
                </div>
                <button className="btn-outline w-full justify-center">
                  Live Chat Support
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-neon">Send us a Message</h3>
            
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John"
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
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Vehicle Interest (prefilled) */}
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
                  <MyDatePicker
                    selectedDate={pickupDate}
                    setSelectedDate={setPickupDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Return Date</label>
                  <MyDatePicker
                    selectedDate={returnDate}
                    setSelectedDate={setReturnDate}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Tell us about your rental needs, budget, and any special requirements..."
                ></textarea>
              </div>

              {/* Submit */}
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
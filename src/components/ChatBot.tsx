import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

export interface ChatMessage {
  id: number;
  type: "bot" | "user";
  text: string;
  buttons?: string[];
}

interface UserInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  pickup?: string;
  drop?: string;
  vehicleName?: string;
  message?: string;
}

interface Vehicle {
  _id: string;
  name: string;
  seatingCapacity: number;
  type: string;
}

interface InputProps {
  type: string;
  name: string;
  autoComplete: string;
  placeholder: string;
}

const ChatBot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, type: "bot", text: "Welcome to BARS Wheels! How can we assist you today?" },
    { id: 2, type: "bot", text: "How would you like me to accompany you?", buttons: ["Show Vehicles", "Customer Support"] },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [bookingStarted, setBookingStarted] = useState(false);
  const [vehicleTypeAsked, setVehicleTypeAsked] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [paymentProceeded, setPaymentProceeded] = useState(false);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ask for vehicle name on /vehicles page
  useEffect(() => {
    if (location.pathname === "/vehicles" && bookingStarted && !vehicleTypeAsked && !userInfo.vehicleName) {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => {
            const lastBot = prev.filter((m) => m.type === "bot").pop();
            if (lastBot?.text.includes("vehicle name")) return prev;
            return [
              ...prev,
              {
                id: prev.length + 1,
                type: "bot",
                text: "What vehicle are you looking for? Please enter the vehicle name (e.g., Tesla Model 3, Toyota Camry, etc.)",
              },
            ];
          });
          setVehicleTypeAsked(true);
        }, 600);
      }, 1000);
    }
  }, [location.pathname, bookingStarted, vehicleTypeAsked, userInfo.vehicleName]);

  // Contact page → Ask to proceed payment (only once, and only if payment hasn't been proceeded)
  useEffect(() => {
    // Don't show prompt if payment has already been proceeded
    if (paymentProceeded) return;
    
    const allInfoCollected =
      userInfo.firstName &&
      userInfo.lastName &&
      userInfo.email &&
      userInfo.phone &&
      userInfo.pickup &&
      userInfo.drop &&
      (userInfo.message !== undefined);

    if (location.pathname === "/contact" && allInfoCollected) {
      // Check if we've already asked about payment
      const hasAskedAboutPayment = messages.some(
        (msg) => msg.type === "bot" && (msg.text.includes("proceed for payment") || msg.text.includes("Proceed to Payment") || msg.buttons?.includes("Proceed to Payment"))
      );
      
      // Check if user has already clicked proceed to payment
      const hasProceededToPayment = messages.some(
        (msg) => msg.type === "user" && msg.text === "Proceed to Payment"
      );

      if (!hasAskedAboutPayment && !hasProceededToPayment) {
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, type: "bot", text: "Would you like to proceed for payment?", buttons: ["Proceed to Payment"] },
        ]);
      }
    }
  }, [location.pathname, userInfo, paymentProceeded, messages]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => /^\d{10}$/.test(phone.replace(/\s/g, ""));

  const askNextQuestion = (info: UserInfo) => {
    let text = "";
    if (location.pathname === "/vehicles" && !info.vehicleName) text = "Please enter the vehicle name:";
    else if (!info.firstName) text = "Please enter your first name:";
    else if (!info.lastName) text = "Please enter your last name:";
    else if (!info.email) text = "Please enter your email:";
    else if (!info.phone) text = "Please enter your 10-digit phone number:";
    else if (!info.pickup) text = "Enter pickup date (YYYY-MM-DD):";
    else if (!info.drop) text = "Enter return date (YYYY-MM-DD):";
    else if (!info.message)
      text = "Any special requirements or message? (Optional — type 'skip' to continue):";
    else {
      // Generate default message if empty
      if (!info.message || info.message === "") {
        const defaultMessage = `I would like to book ${info.vehicleName || 'a vehicle'} from ${info.pickup} to ${info.drop}. Please confirm availability and provide booking details.`;
        info.message = defaultMessage;
      }
      
      const query = new URLSearchParams(info as Record<string, string>).toString();
      navigate(`/contact?${query}`);
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((p) => [...p, { id: p.length + 1, type: "bot", text }]);
    }, 600);
  };

  const handleGeneralQuery = async (text: string): Promise<boolean> => {
    const lower = text.toLowerCase();
    setIsTyping(true);

    if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((p) => [
          ...p,
          { id: p.length + 1, type: "bot", text: "Welcome to BARS Wheels! How would you like me to accompany you?", buttons: ["Show Vehicles", "Customer Support"] },
        ]);
      }, 600);
      return true;
    }

    // Handle vehicle seat queries: "vehicle for 4 seats", "car for 3", "vehicle for 4", etc.
    const seatQueryMatch = lower.match(/(?:vehicle|car|right vehicle)\s+for\s+(\d+)\s*(?:seats?|people|person|passengers?|passenger)?/i);
    if (seatQueryMatch) {
      const seatCount = parseInt(seatQueryMatch[1]);
      if (seatCount >= 1 && seatCount <= 50) {
        try {
          const response = await fetch(`/api/vehicles?minSeats=${seatCount}`);
          const data = await response.json();
          
          setTimeout(() => {
            setIsTyping(false);
            
            let botMessage: string;
            let buttons: string[] = [];
            
            if (data.success && data.data && data.data.vehicles && data.data.vehicles.length > 0) {
              const vehicles = data.data.vehicles;
              
              // Classify vehicles by type
              const classifiedVehicles: { [key: string]: any[] } = {};
              vehicles.forEach((v: any) => {
                const type = v.type || v.vehicle_type || 'other';
                const typeKey = type.toUpperCase();
                if (!classifiedVehicles[typeKey]) {
                  classifiedVehicles[typeKey] = [];
                }
                classifiedVehicles[typeKey].push(v);
              });
              
              // Build detailed message
              let message = `Great! I found ${vehicles.length} vehicle${vehicles.length > 1 ? 's' : ''} with ${seatCount} or more seats:\n\n`;
              
              // Show classified vehicles by type
              Object.keys(classifiedVehicles).forEach((type) => {
                const typeVehicles = classifiedVehicles[type];
                message += `${type} (${typeVehicles.length}):\n`;
                
                // Sort vehicles by seat count to show exact matches first
                const sortedVehicles = typeVehicles.sort((a: any, b: any) => {
                  const seatsA = a.specifications?.seatingCapacity || a.seating_capacity || 0;
                  const seatsB = b.specifications?.seatingCapacity || b.seating_capacity || 0;
                  // Show vehicles with exact seat count first, then others
                  if (seatsA === seatCount && seatsB !== seatCount) return -1;
                  if (seatsA !== seatCount && seatsB === seatCount) return 1;
                  return seatsA - seatsB;
                });
                
                sortedVehicles.slice(0, 3).forEach((v: any) => {
                  const name = v.name || `${v.make || ''} ${v.model || ''}`.trim() || 'Vehicle';
                  const seats = v.specifications?.seatingCapacity || v.seating_capacity || 'N/A';
                  const price = v.pricePerDay || v.price_per_day || 'N/A';
                  const fuel = v.specifications?.fuelType || v.fuel_type || 'N/A';
                  const transmission = v.specifications?.transmission || v.transmission || 'N/A';
                  
                  // Highlight exact seat matches
                  const seatDisplay = seats === seatCount ? `⭐ ${seats} seats (exact match)` : `${seats} seats`;
                  
                  message += `  • ${name}\n`;
                  message += `    ${seatDisplay} | Price: ₹${price}/day | Fuel: ${fuel} | ${transmission}\n`;
                });
                
                if (typeVehicles.length > 3) {
                  message += `  ...and ${typeVehicles.length - 3} more ${type.toLowerCase()}(s)\n`;
                }
                message += `\n`;
              });
              
              message += `Would you like to start a booking?`;
              botMessage = message;
              buttons = ["Show Vehicles", "Start Booking"];
            } else {
              botMessage = `I'm sorry, we don't have any vehicles with ${seatCount} or more seats available at the moment. Would you like to see all our vehicles?`;
              buttons = ["Show Vehicles"];
            }
            
            setMessages((p) => [...p, { id: p.length + 1, type: "bot", text: botMessage, buttons }]);
          }, 600);
        } catch (error) {
          setTimeout(() => {
            setIsTyping(false);
            setMessages((p) => [...p, { id: p.length + 1, type: "bot", text: "Sorry, I had trouble searching for vehicles. Please try again.", buttons: ["Show Vehicles"] }]);
          }, 600);
        }
        return true;
      }
    }

    if (lower.includes("open") || lower.includes("hour")) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((p) => [...p, { id: p.length + 1, type: "bot", text: "We're open 24/7 online!" }]);
      }, 600);
      return true;
    }

    if (lower.includes("location")) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((p) => [
          ...p,
          { id: p.length + 1, type: "bot", text: "We have pickup points across the city." },
        ]);
      }, 600);
      return true;
    }

    setIsTyping(false);
    return false;
  };

  const handleUserClick = (text: string) => {
    // If it's "Proceed to Payment", set the flag FIRST to prevent useEffect from running
    if (text === "Proceed to Payment") {
      setPaymentProceeded(true); // Mark that payment has been proceeded FIRST
    }
    
    setMessages((p) => [...p, { id: p.length + 1, type: "user", text }]);
    setIsTyping(true);

    if (text === "Show Vehicles" || text === "Start Booking") {
      setBookingStarted(true);
      setVehicleTypeAsked(false);
      navigate("/vehicles");
      setTimeout(() => {
        setIsTyping(false);
        setMessages((p) => [...p, { id: p.length + 1, type: "bot", text: "Taking you to our vehicles..." }]);
      }, 500);
      return;
    }

    // Handle Customer Support button
    if (text === "Customer Support") {
      setTimeout(() => {
        setIsTyping(false);
        const supportMessage = `Customer Support Details:\n\n` +
          `For any queries or assistance, please contact our customer care team:\n\n` +
          `Phone Numbers:\n` +
          `📞 +91 7695846991\n` +
          `📞 +91 94433 188232\n\n` +
          `We're here to help you 24/7!\n\n` +
          `Would you like to browse our vehicles or need any other assistance?`;
        setMessages((p) => [
          ...p,
          { 
            id: p.length + 1, 
            type: "bot", 
            text: supportMessage,
            buttons: ["Show Vehicles"]
          }
        ]);
      }, 500);
      return;
    }

    // ✅ Fixed Payment Redirection Flow
    if (text === "Proceed to Payment") {
      setTimeout(() => {
        setIsTyping(false);
        
        // Beautiful final message
        const finalMessage = `🎉 Perfect! All your details have been collected successfully.\n\n` +
          `✅ Booking Details Confirmed:\n` +
          `👤 ${userInfo.firstName} ${userInfo.lastName}\n` +
          `🚗 ${userInfo.vehicleName || 'Vehicle selected'}\n` +
          `📅 ${userInfo.pickup} to ${userInfo.drop}\n\n` +
          `💳 You're being redirected to the payment page now.\n` +
          `Thank you for choosing BARS Wheels! 🚗✨`;
        
        setMessages((p) => [
          ...p, 
          { 
            id: p.length + 1, 
            type: "bot", 
            text: finalMessage
          }
        ]);
        
        // Convert userInfo to bookingDetails format expected by Payment page
        const bookingDetails = {
          firstName: userInfo.firstName || "",
          lastName: userInfo.lastName || "",
          email: userInfo.email || "",
          phone: userInfo.phone || "",
          vehicleName: userInfo.vehicleName || "",
          message: userInfo.message || "",
          pickupDate: userInfo.pickup || "",
          returnDate: userInfo.drop || "",
        };
        
        // Navigate after a short delay to show the message
        setTimeout(() => {
          navigate("/payment", {
            state: { bookingDetails }
          });
          setTimeout(() => setIsOpen(false), 1000); // close after navigating
        }, 2000);
      }, 500);
      return;
    }
  };

  const handleReset = () => {
    setUserInfo({});
    setBookingStarted(false);
    setVehicleTypeAsked(false);
    setPaymentProceeded(false); // Reset payment proceeded flag
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((p) => [
        ...p,
        { id: p.length + 1, type: "user", text: "Start Over" },
        { id: p.length + 2, type: "bot", text: "Okay, let's start over!", buttons: ["Show Vehicles"] },
      ]);
    }, 500);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue("");
    setMessages((p) => [...p, { id: p.length + 1, type: "user", text }]);

    // Check for vehicle seat queries first (works even during booking)
    const lower = text.toLowerCase();
    const seatQueryMatch = lower.match(/(?:vehicle|car|right vehicle)\s+for\s+(\d+)\s*(?:seats?|people|person|passengers?|passenger)?/i);
    if (seatQueryMatch) {
      const seatCount = parseInt(seatQueryMatch[1]);
      if (seatCount >= 1 && seatCount <= 50) {
        setIsTyping(true);
        try {
          const response = await fetch(`/api/vehicles?minSeats=${seatCount}`);
          const data = await response.json();
          
          setTimeout(() => {
            setIsTyping(false);
            
            let botMessage: string;
            let buttons: string[] = [];
            
            if (data.success && data.data && data.data.vehicles && data.data.vehicles.length > 0) {
              const vehicles = data.data.vehicles;
              
              // Classify vehicles by type
              const classifiedVehicles: { [key: string]: any[] } = {};
              vehicles.forEach((v: any) => {
                const type = v.type || v.vehicle_type || 'other';
                const typeKey = type.toUpperCase();
                if (!classifiedVehicles[typeKey]) {
                  classifiedVehicles[typeKey] = [];
                }
                classifiedVehicles[typeKey].push(v);
              });
              
              // Build detailed message
              let message = `Great! I found ${vehicles.length} vehicle${vehicles.length > 1 ? 's' : ''} with ${seatCount} or more seats:\n\n`;
              
              // Show classified vehicles by type
              Object.keys(classifiedVehicles).forEach((type) => {
                const typeVehicles = classifiedVehicles[type];
                message += `${type} (${typeVehicles.length}):\n`;
                
                // Sort vehicles by seat count to show exact matches first
                const sortedVehicles = typeVehicles.sort((a: any, b: any) => {
                  const seatsA = a.specifications?.seatingCapacity || a.seating_capacity || 0;
                  const seatsB = b.specifications?.seatingCapacity || b.seating_capacity || 0;
                  // Show vehicles with exact seat count first, then others
                  if (seatsA === seatCount && seatsB !== seatCount) return -1;
                  if (seatsA !== seatCount && seatsB === seatCount) return 1;
                  return seatsA - seatsB;
                });
                
                sortedVehicles.slice(0, 3).forEach((v: any) => {
                  const name = v.name || `${v.make || ''} ${v.model || ''}`.trim() || 'Vehicle';
                  const seats = v.specifications?.seatingCapacity || v.seating_capacity || 'N/A';
                  const price = v.pricePerDay || v.price_per_day || 'N/A';
                  const fuel = v.specifications?.fuelType || v.fuel_type || 'N/A';
                  const transmission = v.specifications?.transmission || v.transmission || 'N/A';
                  
                  // Highlight exact seat matches
                  const seatDisplay = seats === seatCount ? `⭐ ${seats} seats (exact match)` : `${seats} seats`;
                  
                  message += `  • ${name}\n`;
                  message += `    ${seatDisplay} | Price: ₹${price}/day | Fuel: ${fuel} | ${transmission}\n`;
                });
                
                if (typeVehicles.length > 3) {
                  message += `  ...and ${typeVehicles.length - 3} more ${type.toLowerCase()}(s)\n`;
                }
                message += `\n`;
              });
              
              message += `Would you like to start a booking?`;
              botMessage = message;
              buttons = ["Show Vehicles", "Start Booking"];
            } else {
              botMessage = `I'm sorry, we don't have any vehicles with ${seatCount} or more seats available at the moment. Would you like to see all our vehicles?`;
              buttons = ["Show Vehicles"];
            }
            
            setMessages((p) => [...p, { id: p.length + 1, type: "bot", text: botMessage, buttons }]);
          }, 600);
        } catch (error) {
          setTimeout(() => {
            setIsTyping(false);
            setMessages((p) => [...p, { id: p.length + 1, type: "bot", text: "Sorry, I had trouble searching for vehicles. Please try again.", buttons: ["Show Vehicles"] }]);
          }, 600);
        }
        return;
      }
    }

    if (!bookingStarted) {
      const handled = await handleGeneralQuery(text);
      if (!handled) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((p) => [
            ...p,
            {
              id: p.length + 1,
              type: "bot",
              text: "I'm not sure about that. Want to view our vehicles?",
              buttons: ["Show Vehicles"],
            },
          ]);
        }, 600);
      }
      return;
    }

    // Booking flow input handling
    let updatedInfo = { ...userInfo };
    let error = null;

    if (location.pathname === "/vehicles" && !userInfo.vehicleName) {
      updatedInfo.vehicleName = text.trim();
      setUserInfo(updatedInfo);
      // Update URL with vehicle name for filtering
      navigate(`/vehicles?name=${encodeURIComponent(updatedInfo.vehicleName)}`, { replace: true });
      // Confirm and ask next question
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((p) => [
          ...p,
          { id: p.length + 1, type: "bot", text: `Great! I've filtered vehicles to show "${updatedInfo.vehicleName}". Now, let's get your booking details.` }
        ]);
        askNextQuestion(updatedInfo);
      }, 500);
      return;
    } else if (!userInfo.firstName) updatedInfo.firstName = text;
    else if (!userInfo.lastName) updatedInfo.lastName = text;
    else if (!userInfo.email) {
      if (!isValidEmail(text)) error = "Invalid email format.";
      else updatedInfo.email = text;
    } else if (!userInfo.phone) {
      if (!isValidPhone(text)) error = "Phone number must be 10 digits.";
      else updatedInfo.phone = text;
    } else if (!userInfo.pickup) updatedInfo.pickup = text;
    else if (!userInfo.drop) updatedInfo.drop = text;
    else if (userInfo.message === undefined || userInfo.message === "") {
      const trimmedText = text.trim();
      if (trimmedText.toLowerCase() === "skip") {
        // Generate default message and navigate to Contact page
        const defaultMessage = `I would like to book ${updatedInfo.vehicleName || 'a vehicle'} from ${updatedInfo.pickup} to ${updatedInfo.drop}. Please confirm availability and provide booking details.`;
        updatedInfo.message = defaultMessage;
        setUserInfo(updatedInfo);
        
        // Navigate to Contact page with all details
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((p) => [
            ...p,
            { 
              id: p.length + 1, 
              type: "bot", 
              text: "All details collected! Taking you to the contact page to review and proceed to payment."
            }
          ]);
          
          // Pass all details via query params to Contact page
          const query = new URLSearchParams({
            firstName: updatedInfo.firstName || "",
            lastName: updatedInfo.lastName || "",
            email: updatedInfo.email || "",
            phone: updatedInfo.phone || "",
            vehicleName: updatedInfo.vehicleName || "",
            pickup: updatedInfo.pickup || "",
            drop: updatedInfo.drop || "",
            message: defaultMessage
          } as Record<string, string>).toString();
          
          navigate(`/contact?${query}`);
        }, 500);
        return;
      } else {
        updatedInfo.message = trimmedText;
      }
    }

    if (error) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((p) => [...p, { id: p.length + 1, type: "bot", text: error! }]);
      }, 500);
      return;
    }

    setUserInfo(updatedInfo);
    askNextQuestion(updatedInfo);
  };

  const getCurrentInputProps = (): InputProps => {
    if (!bookingStarted) return { type: "text", name: "generic", autoComplete: "off", placeholder: "Ask me a question..." };
    if (location.pathname === "/vehicles" && !userInfo.vehicleName)
      return { type: "text", name: "vehicleName", autoComplete: "off", placeholder: "Enter vehicle name..." };
    if (!userInfo.firstName)
      return { type: "text", name: "firstName", autoComplete: "given-name", placeholder: "Your first name..." };
    if (!userInfo.lastName)
      return { type: "text", name: "lastName", autoComplete: "family-name", placeholder: "Your last name..." };
    if (!userInfo.email)
      return { type: "email", name: "email", autoComplete: "email", placeholder: "Your email..." };
    if (!userInfo.phone)
      return { type: "tel", name: "tel", autoComplete: "tel", placeholder: "Your phone number..." };
    if (!userInfo.pickup)
      return { type: "text", name: "pickup", autoComplete: "off", placeholder: "Pickup date (YYYY-MM-DD)" };
    if (!userInfo.drop)
      return { type: "text", name: "drop", autoComplete: "off", placeholder: "Return date (YYYY-MM-DD)" };
    if (!userInfo.message)
      return { type: "text", name: "message", autoComplete: "off", placeholder: "Message or 'skip'..." };
    return { type: "text", name: "generic", autoComplete: "off", placeholder: "Type your message..." };
  };

  const inputProps = getCurrentInputProps();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 btn-primary rounded-full p-4 shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] rounded-xl border bg-gray-900/90 backdrop-blur flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-cyan-400" />
              <span className="font-semibold text-cyan-400">Vehicle Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2 ${
                  msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className={`p-2 rounded-full ${msg.type === "bot" ? "bg-cyan-900" : "bg-gray-700"}`}>
                  {msg.type === "bot" ? <Bot className="h-4 w-4 text-cyan-400" /> : <User className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.type === "bot" ? "bg-gray-800 text-white" : "bg-cyan-600 text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  {msg.buttons &&
                    msg.buttons.map((b, i) => (
                      <button
                        key={i}
                        onClick={() => handleUserClick(b)}
                        className="mt-2 mr-2 px-3 py-1 bg-cyan-500 text-xs rounded hover:bg-cyan-400"
                      >
                        {b}
                      </button>
                    ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start space-x-2">
                <div className="p-2 rounded-full bg-cyan-900">
                  <Bot className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="max-w-[70%] p-3 rounded-lg bg-gray-800 text-white">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-700">
            {bookingStarted && (
              <button onClick={handleReset} className="w-full text-xs text-cyan-400 mb-2 hover:text-cyan-200">
                Start Over
              </button>
            )}
            <div className="flex space-x-2">
              <input
                type={inputProps.type}
                name={inputProps.name}
                autoComplete={inputProps.autoComplete}
                placeholder={inputProps.placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-cyan-400"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-400 transition"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

import React, { useState, useEffect, useRef } from "react"; // --- MODIFIED ---
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

// (Interface ChatMessage is unchanged)
export interface ChatMessage {
  id: number;
  type: "bot" | "user";
  text: string;
  buttons?: string[];
}

// (Interface UserInfo is unchanged)
interface UserInfo {
  name?: string;
  email?: string;
  phone?: string;
  pickup?: string;
  drop?: string;
}

// (Interface Vehicle is unchanged)
interface Vehicle {
  _id: string;
  name: string;
  seatingCapacity: number;
  type: string; // Assuming 'type' (e.g., "SUV", "Sedan") exists on your model
}

// (Interface InputProps is unchanged)
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
    { id: 2, type: "bot", text: "You can ask me questions like 'show me cars for 5 people', 'do you have SUVs', or start a booking.", buttons: ["Show Vehicles"] },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [bookingStarted, setBookingStarted] = useState(false);
  
  // --- NEW ---
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // --- NEW --- (For Auto-scrolling)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // (useEffect for /contact page is unchanged)
  useEffect(() => {
    const allInfoCollected = userInfo.name && userInfo.email && userInfo.phone && userInfo.pickup && userInfo.drop;
    
    if (location.pathname === '/contact' && allInfoCollected) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.type === 'bot' && (lastMessage.text.includes("Would you like to proceed for payment?") || lastMessage.text.includes("Redirecting to payment page..."))) {
        return; 
      }

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: "bot",
          text: "Would you like to proceed for payment?",
          buttons: ["Proceed to Payment"],
        },
      ]);
    }
  }, [location, userInfo, messages]);

  // --- NEW --- (Validation Helper Functions)
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const isValidPhone = (phone: string): boolean => {
    // Basic 10-digit number check
    return /^\d{10}$/.test(phone.replace(/\s/g, ''));
  };

  // --- MODIFIED --- (askNextQuestion is now just for asking)
  const askNextQuestion = (updatedInfo: UserInfo) => {
    let text = "";
    if (!updatedInfo.name) {
      text = "Please enter your full name:";
    } else if (!updatedInfo.email) {
      text = "Please enter your email (e.g., user@example.com):";
    } else if (!updatedInfo.phone) {
      text = "Please enter your 10-digit phone number:";
    } else if (!updatedInfo.pickup) {
      text = "Enter pickup date (YYYY-MM-DD):";
    } else if (!updatedInfo.drop) {
      text = "Enter return date (YYYY-MM-DD):";
    } else {
      // All info collected
      const query = new URLSearchParams(updatedInfo as Record<string, string>).toString();
      navigate(`/contact?${query}`);
      return; // Don't send a message, just navigate
    }

    // Simulate typing and send the next question
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: prev.length + 1, type: "bot", text }]);
    }, 500);
  };

  // --- MODIFIED & EXPANDED --- (NLU function)
  const handleGeneralQuery = async (text: string): Promise<boolean> => {
    const lowerText = text.toLowerCase();
    
    setIsTyping(true);

    // --- NEW --- (FAQ / Static Responses)
    if (lowerText.includes("hello") || lowerText.includes("hi")) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: prev.length + 1, type: "bot", text: "Hi there! How can I help you today?", buttons: ["Show Vehicles"] }]);
      }, 500);
      return true;
    }

    if (lowerText.includes("hour") || lowerText.includes("open")) {
      setTimeout(() => {
        setIsTypING(false);
        setMessages((prev) => [...prev, { id: prev.length + 1, type: "bot", text: "We are open 24/7 for online bookings and support!" }]);
      }, 500);
      return true;
    }

    if (lowerText.includes("location") || lowerText.includes("address")) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: prev.length + 1, type: "bot", text: "We have pickup locations all over the city. You can select your preferred location during the booking process." }]);
      }, 500);
      return true;
    }

    // --- NEW --- (Vehicle Type Query)
    // Example: "Do you have an SUV?", "Show me sedans"
    const vehicleTypeRegex = /(suv|sedan|hatchback|truck|van)/i;
    const typeMatch = lowerText.match(vehicleTypeRegex);

    if (typeMatch && typeMatch[1]) {
      const vehicleType = typeMatch[1];
      try {
        const response = await fetch(`/api/vehicles?type=${vehicleType}`);
        const data = await response.json();
        let botMessage: string;
        let buttons: string[] = [];

        if (data.success && data.data.length > 0) {
          const vehicleNames = data.data.map((v: Vehicle) => v.name).join(', ');
          botMessage = `Yes, we have ${vehicleType}s available, including: ${vehicleNames}. Would you like to start a booking?`;
          buttons = ["Start Booking"];
        } else {
          botMessage = `I'm sorry, we don't have any ${vehicleType}s available at the moment.`;
        }
        setMessages((prev) => [...prev, { id: prev.length + 1, type: "bot", text: botMessage, buttons }]);
      } catch (error) {
        setMessages((prev) => [...prev, { id: prev.length + 1, type: "bot", text: "Sorry, I had trouble searching for vehicles. Please try again." }]);
      } finally {
        setIsTyping(false);
      }
      return true;
    }

    // Seating Capacity Query (Unchanged logic, just added setIsTyping)
    const seatRegex = /(\d+)\s*(people|person|seats|passengers)/;
    const seatMatch = lowerText.match(seatRegex);

    if (seatMatch && seatMatch[1]) {
      const seatCount = parseInt(seatMatch[1], 10);
      try {
        const response = await fetch(`/api/vehicles?minSeats=${seatCount}`);
        const data = await response.json();
        let botMessage: string;
        let buttons: string[] = [];

        if (data.success && data.data.length > 0) {
          const vehicleNames = data.data.map((v: Vehicle) => v.name).join(', ');
          botMessage = `Vehicles with ${seatCount} or more seats include: ${vehicleNames}. Would you like to start a booking?`;
          buttons = ["Start Booking"];
        } else {
          botMessage = `I'm sorry, we don't have any vehicles with at least ${seatCount} seats available.`;
        }
        setMessages((prev) => [...prev, { id: prev.length + 1, type: "bot", text: botMessage, buttons }]);
      } catch (error) {
        setMessages((prev) => [...prev, { id: prev.length + 1, type: "bot", text: "Sorry, I had trouble searching for vehicles. Please try again." }]);
      } finally {
        setIsTyping(false);
      }
      return true;
    }

    // If no query was matched
    setIsTyping(false);
    return false;
  };

  // --- MODIFIED --- (Simplified to only handle buttons)
  const handleUserClick = (text: string) => {
    setMessages((prev) => [...prev, { id: prev.length + 1, type: "user", text }]);
    setIsTyping(true);

    if (text === "Show Vehicles" || text === "Start Booking") {
      setBookingStarted(true);
      navigate('/vehicles');
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, type: "bot", text: "Great! Taking you to our vehicles page... Now, let's get your booking details." },
        ]);
        // Ask the first question
        askNextQuestion({}); // Pass empty info to ask for name
      }, 500);
      return; 
    }

    if (text === "Proceed to Payment") {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: prev.length + 1, type: "bot", text: "Redirecting to payment page..." }]);
        const query = new URLSearchParams(userInfo as Record<string, string>).toString();
        navigate(`/payment?${query}`);
        setTimeout(() => setIsOpen(false), 1500); 
      }, 500);
      return;
    }
  };

  // --- NEW --- (Handles resetting the chat)
  const handleReset = () => {
    setUserInfo({});
    setBookingStarted(false);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, type: "user", text: "Start Over" },
        { id: prev.length + 2, type: "bot", text: "OK, let's start over. How can I help?", buttons: ["Show Vehicles"] }
      ]);
    }, 500);
  };

  // --- MODIFIED & EXPANDED --- (Handles all text input, validation, and NLU)
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue(""); // Clear input immediately

    // Add user message to chat
    setMessages((prev) => [...prev, { id: prev.length + 1, type: "user", text }]);

    // --- MODIFIED FLOW ---
    // 1. If we are NOT in the booking process, treat it as a general query
    if (!bookingStarted) {
      const queryHandled = await handleGeneralQuery(text);
      if (!queryHandled) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            { 
              id: prev.length + 1, 
              type: "bot", 
              text: "I'm not sure about that. Would you like to see our vehicles?", 
              buttons: ["Show Vehicles"] 
            }
          ]);
        }, 500);
      }
      return;
    }

    // 2. If we ARE in the booking process, validate and fill the form
    if (bookingStarted) {
      let updatedInfo = { ...userInfo };
      let error = null;

      if (!userInfo.name) {
        updatedInfo.name = text;
      } else if (!userInfo.email) {
        if (!isValidEmail(text)) {
          error = "Please enter a valid email address (e.g., user@example.com).";
        } else {
          updatedInfo.email = text;
        }
      } else if (!userInfo.phone) {
        if (!isValidPhone(text)) {
          error = "Please enter a 10-digit phone number.";
        } else {
          updatedInfo.phone = text.replace(/\s/g, '');
        }
      } else if (!userInfo.pickup) {
        const pickupDate = new Date(text);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today for comparison
        if (isNaN(pickupDate.getTime())) {
          error = "That doesn't look like a valid date. Please use YYYY-MM-DD format.";
        } else if (pickupDate < today) {
          error = "Pickup date cannot be in the past. Please enter a future date.";
        } else {
          updatedInfo.pickup = text;
        }
      } else if (!userInfo.drop) {
        const dropDate = new Date(text);
        const pickupDate = new Date(userInfo.pickup!);
        if (isNaN(dropDate.getTime())) {
          error = "That doesn't look like a valid date. Please use YYYY-MM-DD format.";
        } else if (dropDate <= pickupDate) {
          error = "Return date must be at least one day after the pickup date.";
        } else {
          updatedInfo.drop = text;
        }
      }

      // Handle validation error
      if (error) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, { id: prev.length + 1, type: "bot", text: error }]);
        }, 500);
        return; // Stop processing, wait for user to re-enter
      }

      // If no error, update state and ask next question
      setUserInfo(updatedInfo);
      askNextQuestion(updatedInfo);
    }
  };

  // (getCurrentInputProps is unchanged)
  const getCurrentInputProps = (): InputProps => {
    if (!bookingStarted) {
      return { type: "text", name: "generic", autoComplete: "off", placeholder: "Ask me a question..." };
    }
    if (!userInfo.name) {
      return { type: "text", name: "name", autoComplete: "name", placeholder: "Type your full name..." };
    }
    if (!userInfo.email) {
      return { type: "email", name: "email", autoComplete: "email", placeholder: "Type your email..." };
    }
    if (!userInfo.phone) {
      return { type: "tel", name: "tel", autoComplete: "tel", placeholder: "Type your phone number..." };
    }
    if (!userInfo.pickup) {
      return { type: "text", name: "pickup-date", autoComplete: "off", placeholder: "YYYY-MM-DD" };
    }
    if (!userInfo.drop) {
      return { type: "text", name: "return-date", autoComplete: "off", placeholder: "YYYY-MM-DD" };
    }
    return { type: "text", name: "generic", autoComplete: "off", placeholder: "Type your message..." };
  };

  const inputProps = getCurrentInputProps();

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 btn-primary rounded-full p-4 neon-glow shadow-lg">
        <MessageCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] glass-card rounded-xl border border-neon-cyan/30 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border/20">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-neon" />
              <span className="font-semibold text-neon">Vehicle Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* --- MODIFIED --- (Added scrolling ref) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start space-x-2 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                <div className={`p-2 rounded-full ${message.type === "bot" ? "bg-primary/20" : "bg-secondary"}`}>
                  {message.type === "bot" ? <Bot className="h-4 w-4 text-neon" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`max-w-[70%] p-3 rounded-lg ${message.type === "bot" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"}`}>
                  <p className="text-sm">{message.text}</p>
                  {message.buttons && message.buttons.map((btn, idx) => (
                    <button key={idx} onClick={() => handleUserClick(btn)} className="mt-2 mr-2 px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-xs">
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {/* --- NEW --- (Typing indicator) */}
            {isTyping && (
              <div className="flex items-start space-x-2">
                <div className="p-2 rounded-full bg-primary/20">
                  <Bot className="h-4 w-4 text-neon" />
                </div>
                <div className="max-w-[70%] p-3 rounded-lg bg-secondary text-foreground">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-short"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-short-delay"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-short-delay-2"></div>
                  </div>
                </div>
              </div>
            )}
            {/* --- NEW --- (Auto-scroll target) */}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border/20">
            {/* --- NEW --- (Start Over button) */}
            {bookingStarted && (
              <button
                onClick={handleReset}
                className="w-full mb-2 text-xs text-cyan-400 hover:text-cyan-200"
              >
                Start Over
              </button>
            )}
            <div className="flex space-x-2 items-center">
              <input
                type={inputProps.type}
                name={inputProps.name}
                id={inputProps.name}
                autoComplete={inputProps.autoComplete}
                placeholder={inputProps.placeholder}
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button onClick={handleSendMessage} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
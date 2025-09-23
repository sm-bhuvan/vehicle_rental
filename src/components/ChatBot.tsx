import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { ChatMessage } from "../types/vehicle";

const ChatBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "bot",
      text: "Hi! I'm your vehicle rental assistant. You can explore options below.",
      buttons: ["Show Vehicles", "Admin Login"],
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleUserClick = (text: string) => {
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      type: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);

    if (text === "Show Vehicles") {
      const botResponse: ChatMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "Here you are! Redirecting to the vehicles page...",
        buttons: ["Book Now"],
      };
      setMessages((prev) => [...prev, botResponse]);

      setTimeout(() => {
        navigate("/vehicles");
      }, 1000);
      return;
    }

    if (text === "Admin Login") {
      const botResponse: ChatMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "Redirecting to admin login...",
      };
      setMessages((prev) => [...prev, botResponse]);

      setTimeout(() => {
        navigate("/admin/login");
      }, 1000);
      return;
    }

    if (text === "Book Now") {
      const botResponse: ChatMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "Great! Redirecting you to the booking page...",
      };
      setMessages((prev) => [...prev, botResponse]);

      setTimeout(() => {
        navigate("/contact");
      }, 1000);
      return;
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    handleUserClick(inputValue);
    setInputValue("");
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 btn-primary rounded-full p-4 neon-glow shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] glass-card rounded-xl border border-neon-cyan/30 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/20">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-neon" />
              <span className="font-semibold text-neon">Vehicle Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    message.type === "bot" ? "bg-primary/20" : "bg-secondary"
                  }`}
                >
                  {message.type === "bot" ? (
                    <Bot className="h-4 w-4 text-neon" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.type === "bot"
                      ? "bg-secondary text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>

                  {/* Render buttons if bot message has them */}
                  {message.buttons &&
                    message.buttons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUserClick(btn)}
                        className="mt-2 mr-2 px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-xs"
                      >
                        {btn}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/20">
            <div className="flex space-x-2 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about budget, duration, or vehicle type..."
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
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
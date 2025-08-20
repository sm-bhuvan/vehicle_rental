import { useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { ChatMessage } from "../types/vehicle";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your vehicle rental assistant. Tell me your budget and rental duration, and I'll help you find the perfect vehicle!"
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      text: inputValue
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: messages.length + 2,
        type: 'bot' as const,
        text: getBotResponse(inputValue)
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setInputValue('');
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('budget') || input.includes('$') || input.includes('price')) {
      return "Great! Based on your budget, I can recommend some excellent options. For budgets under $100/day, I'd suggest our economy cars. For $100-200/day, our premium sedans are perfect. Above $200/day, you can enjoy our luxury sports cars and SUVs!";
    }
    
    if (input.includes('day') || input.includes('week') || input.includes('month')) {
      return "Perfect! For longer rentals, we offer special discounts. Weekly rentals get 15% off, and monthly rentals get 25% off. Would you like me to show you vehicles that fit your timeframe?";
    }
    
    if (input.includes('car') || input.includes('vehicle')) {
      return "We have an amazing selection! Are you looking for economy, luxury, or sports cars? Each category has different pricing and features.";
    }
    
    if (input.includes('bike') || input.includes('motorcycle')) {
      return "Our motorcycle collection includes sport bikes, cruisers, and touring bikes. Prices start from $50/day. What type of riding experience are you looking for?";
    }
    
    return "That's interesting! Could you tell me more about your budget range and how many days you need the vehicle? This will help me recommend the best options for you.";
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
              <span className="font-semibold text-neon">Budget Assistant</span>
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
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`p-2 rounded-full ${
                  message.type === 'bot' ? 'bg-primary/20' : 'bg-secondary'
                }`}>
                  {message.type === 'bot' ? (
                    <Bot className="h-4 w-4 text-neon" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className={`max-w-[70%] p-3 rounded-lg ${
                  message.type === 'bot' 
                    ? 'bg-secondary text-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/20">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
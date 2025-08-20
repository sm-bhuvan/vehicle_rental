import { ArrowRight, Play } from "lucide-react";
import heroBg from "../assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Luxury vehicles" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero opacity-90"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Animated Particles/Dots */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-gold-accent rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-glass border border-neon-cyan/30 rounded-full text-neon text-sm font-medium mb-4">
            Premium Vehicle Rentals
          </span>
        </div>
        
        <h1 className="hero-text mb-6 leading-tight">
          Drive Your
          <br />
          <span className="text-gold">Dreams</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Experience luxury and performance with our premium collection of cars, bikes, and commercial vehicles. 
          Your perfect ride awaits.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button className="btn-primary flex items-center space-x-2 group">
            <span>Explore Vehicles</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="btn-outline flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Watch Demo</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-neon mb-2">500+</div>
            <div className="text-gray-400">Premium Vehicles</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-neon mb-2">50K+</div>
            <div className="text-gray-400">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-neon mb-2">24/7</div>
            <div className="text-gray-400">Customer Support</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-neon-cyan rounded-full flex justify-center">
          <div className="w-1 h-3 bg-neon-cyan rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
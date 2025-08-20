import { useState } from "react";
import { Menu, X, Car, MessageCircle } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-neon" />
            <span className="font-orbitron font-bold text-2xl text-neon">
              LuxeDrive
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="hover:text-neon transition-colors">Home</a>
            <a href="#vehicles" className="hover:text-neon transition-colors">Vehicles</a>
            <a href="#services" className="hover:text-neon transition-colors">Services</a>
            <a href="#about" className="hover:text-neon transition-colors">About</a>
            <a href="#contact" className="hover:text-neon transition-colors">Contact</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-6 py-2 text-sm border border-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-lg">
              Login
            </button>
            <button className="btn-primary">
              Book Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/20 pt-4">
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="hover:text-neon transition-colors">Home</a>
              <a href="#vehicles" className="hover:text-neon transition-colors">Vehicles</a>
              <a href="#services" className="hover:text-neon transition-colors">Services</a>
              <a href="#about" className="hover:text-neon transition-colors">About</a>
              <a href="#contact" className="hover:text-neon transition-colors">Contact</a>
            </nav>
            <div className="flex flex-col space-y-2 mt-4">
              <button className="px-6 py-2 text-sm border border-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-lg">
                Login
              </button>
              <button className="btn-primary">
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
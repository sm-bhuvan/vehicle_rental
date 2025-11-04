import { useState } from "react";
import { Menu, X, Car, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-neon" />
            <span className="font-orbitron font-bold text-2xl text-neon">
              BARS Wheels
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`hover:text-neon transition-colors ${isActive('/') ? 'text-neon' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/vehicles" 
              className={`hover:text-neon transition-colors ${isActive('/vehicles') ? 'text-neon' : ''}`}
            >
              Vehicles
            </Link>
            <Link 
              to="/services" 
              className={`hover:text-neon transition-colors ${isActive('/services') ? 'text-neon' : ''}`}
            >
              Services
            </Link>
            <Link 
              to="/about" 
              className={`hover:text-neon transition-colors ${isActive('/about') ? 'text-neon' : ''}`}
            >
              About
            </Link>
            <Link 
              to="/review" 
              className={`hover:text-neon transition-colors ${isActive('/review') ? 'text-neon' : ''}`}
            >
              Review
            </Link>
            <Link 
              to="/contact" 
              className={`hover:text-neon transition-colors ${isActive('/contact') ? 'text-neon' : ''}`}
            >
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin/dashboard" 
                    className="px-6 py-2 text-sm border border-blue-500 hover:bg-blue-500 hover:text-white transition-all rounded-lg flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <button 
                  onClick={logout}
                  className="px-6 py-2 text-sm border border-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/admin/login" 
                className="px-6 py-2 text-sm border border-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-lg"
              >
                Login
              </Link>
            )}
            <Link to="/vehicles" className="btn-primary">
              Book Now
            </Link>
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
              <Link 
                to="/" 
                className={`hover:text-neon transition-colors ${isActive('/') ? 'text-neon' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/vehicles" 
                className={`hover:text-neon transition-colors ${isActive('/vehicles') ? 'text-neon' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Vehicles
              </Link>
              <Link 
                to="/services" 
                className={`hover:text-neon transition-colors ${isActive('/services') ? 'text-neon' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className={`hover:text-neon transition-colors ${isActive('/about') ? 'text-neon' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`hover:text-neon transition-colors ${isActive('/contact') ? 'text-neon' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
            <div className="flex flex-col space-y-2 mt-4">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link 
                      to="/admin/dashboard" 
                      className="px-6 py-2 text-sm border border-blue-500 hover:bg-blue-500 hover:text-white transition-all rounded-lg flex items-center justify-center space-x-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="px-6 py-2 text-sm border border-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/admin/login" 
                  className="px-6 py-2 text-sm border border-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
              <Link to="/vehicles" className="btn-primary text-center" onClick={() => setIsMenuOpen(false)}>
                Book Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
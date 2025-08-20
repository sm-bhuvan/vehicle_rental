import { Car, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/20 pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-neon" />
              <span className="font-orbitron font-bold text-2xl text-neon">
                LuxeDrive
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Premium vehicle rental service offering luxury cars, motorcycles, 
              and commercial vehicles for all your transportation needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-neon transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-neon transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-neon transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-neon transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-neon">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/vehicles" className="text-gray-400 hover:text-foreground transition-colors">Vehicles</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-foreground transition-colors">Services</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-neon">Services</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-foreground transition-colors">Luxury Car Rental</a></li>
              <li><a href="#" className="text-gray-400 hover:text-foreground transition-colors">Motorcycle Rental</a></li>
              <li><a href="#" className="text-gray-400 hover:text-foreground transition-colors">Commercial Vehicles</a></li>
              <li><a href="#" className="text-gray-400 hover:text-foreground transition-colors">Chauffeur Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-foreground transition-colors">Airport Transfer</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-neon">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-neon" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-neon" />
                <span className="text-gray-400">info@luxedrive.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-neon mt-1" />
                <span className="text-gray-400">
                  123 Luxury Avenue<br />
                  Beverly Hills, CA 90210
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 LuxeDrive. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
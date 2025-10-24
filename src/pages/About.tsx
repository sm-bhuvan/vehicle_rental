//import { Footer } from "react-day-picker";
import Footer from "../components/Footer";

import Testimonials from "../components/Testimonials";
import { Award, Shield, Users, Clock } from "lucide-react";

const About = () => {
  return (
    <main className="pt-20">
      {/* About Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-6">
              About <span className="text-neon">BARS Wheels</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Since 2024, we've been delivering premium vehicle rental experiences 
              that exceed expectations. Our commitment to luxury, reliability, and 
              exceptional service has made us the trusted choice for discerning customers.
            </p>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-card rounded-xl p-8 text-center group hover:scale-105 transition-all duration-300">
              <Award className="h-12 w-12 text-neon mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-gray-400">Every vehicle in our fleet meets the highest standards of luxury and performance.</p>
            </div>
            
            <div className="glass-card rounded-xl p-8 text-center group hover:scale-105 transition-all duration-300">
              <Shield className="h-12 w-12 text-neon mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Trust & Security</h3>
              <p className="text-gray-400">Comprehensive insurance and security measures protect you throughout your journey.</p>
            </div>
            
            <div className="glass-card rounded-xl p-8 text-center group hover:scale-105 transition-all duration-300">
              <Users className="h-12 w-12 text-neon mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Expert Service</h3>
              <p className="text-gray-400">Our experienced team provides personalized assistance for your perfect rental experience.</p>
            </div>
            
            <div className="glass-card rounded-xl p-8 text-center group hover:scale-105 transition-all duration-300">
              <Clock className="h-12 w-12 text-neon mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-400">Round-the-clock customer support ensures you're never alone on your journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-orbitron font-bold mb-6">
                Our <span className="text-neon">Story</span>
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Founded in 2024 by automotive enthusiasts, BARS Wheels began with a simple mission: 
                  to make luxury vehicles accessible to everyone who appreciates quality and performance.
                </p>
                <p>
                  What started as a small collection of premium cars has grown into one of the most 
                  trusted luxury vehicle rental services, featuring an extensive fleet of cars, 
                  motorcycles, and commercial vehicles.
                </p>
                <p>
                  Today, we serve thousands of customers annually, maintaining our commitment to 
                  excellence while embracing innovative technologies like our AI-powered budget 
                  assistant to enhance your rental experience.
                </p>
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-neon mb-2">1+</div>
                  <div className="text-gray-400">Years Experience</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-neon mb-2">100+</div>
                  <div className="text-gray-400">Premium Vehicles</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-neon mb-2">10K+</div>
                  <div className="text-gray-400">Happy Customers</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-neon mb-2">5+</div>
                  <div className="text-gray-400">Locations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
      <Footer/>
    </main>
  );
};

export default About;
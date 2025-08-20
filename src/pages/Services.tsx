import { Car, Bike, Truck, Crown, MapPin, Shield, Clock, Phone } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Car,
      title: "Luxury Car Rental",
      description: "Premium sedans, sports cars, and luxury vehicles for every occasion.",
      features: ["BMW, Mercedes, Audi", "Insurance included", "24/7 roadside assistance", "Flexible rental periods"]
    },
    {
      icon: Bike,
      title: "Motorcycle Rental",
      description: "High-performance motorcycles for thrill-seekers and touring enthusiasts.",
      features: ["Sport bikes & cruisers", "Safety gear included", "Route planning assistance", "Group discounts available"]
    },
    {
      icon: Truck,
      title: "Commercial Vehicles",
      description: "Vans, trucks, and commercial vehicles for business and moving needs.",
      features: ["Various sizes available", "Competitive business rates", "Long-term rental options", "Delivery service"]
    },
    {
      icon: Crown,
      title: "Chauffeur Service",
      description: "Professional drivers for a truly luxurious transportation experience.",
      features: ["Experienced chauffeurs", "Airport transfers", "Corporate services", "Event transportation"]
    }
  ];

  const additionalServices = [
    {
      icon: MapPin,
      title: "Delivery & Pickup",
      description: "We bring the vehicle to you and pick it up when you're done."
    },
    {
      icon: Shield,
      title: "Comprehensive Insurance",
      description: "Full coverage insurance options for complete peace of mind."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support for any assistance you need."
    },
    {
      icon: Phone,
      title: "Emergency Assistance",
      description: "Immediate help available wherever you are, whenever you need it."
    }
  ];

  return (
    <main className="pt-20">
      {/* Services Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-6">
              Our <span className="text-neon">Services</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From luxury cars to commercial vehicles, we provide comprehensive 
              rental solutions tailored to your specific needs and preferences.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {services.map((service, index) => (
              <div key={index} className="glass-card rounded-xl p-8 group hover:scale-105 transition-all duration-300">
                <service.icon className="h-16 w-16 text-neon mb-6" />
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-400 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-neon rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-orbitron font-bold mb-4">
              Additional <span className="text-neon">Services</span>
            </h2>
            <p className="text-xl text-gray-400">
              Enhanced services to make your rental experience seamless and worry-free.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service, index) => (
              <div key={index} className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-all duration-300">
                <service.icon className="h-12 w-12 text-neon mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-orbitron font-bold mb-4">
              Pricing <span className="text-neon">Plans</span>
            </h2>
            <p className="text-xl text-gray-400">
              Flexible pricing options to suit every budget and rental duration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Daily</h3>
              <div className="text-4xl font-bold text-neon mb-6">Standard Rates</div>
              <ul className="space-y-2 mb-8">
                <li>✓ All vehicles available</li>
                <li>✓ Basic insurance</li>
                <li>✓ Customer support</li>
              </ul>
              <button className="btn-outline w-full">Get Quote</button>
            </div>
            
            <div className="glass-card rounded-xl p-8 text-center border-2 border-neon">
              <div className="bg-neon text-primary-foreground px-4 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">Weekly</h3>
              <div className="text-4xl font-bold text-neon mb-2">15% OFF</div>
              <div className="text-gray-400 mb-6">7+ day rentals</div>
              <ul className="space-y-2 mb-8">
                <li>✓ All daily benefits</li>
                <li>✓ Premium insurance</li>
                <li>✓ Free delivery/pickup</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="btn-primary w-full">Get Quote</button>
            </div>
            
            <div className="glass-card rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Monthly</h3>
              <div className="text-4xl font-bold text-neon mb-2">25% OFF</div>
              <div className="text-gray-400 mb-6">30+ day rentals</div>
              <ul className="space-y-2 mb-8">
                <li>✓ All weekly benefits</li>
                <li>✓ Maintenance included</li>
                <li>✓ Vehicle replacement</li>
                <li>✓ Dedicated account manager</li>
              </ul>
              <button className="btn-outline w-full">Get Quote</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Services;
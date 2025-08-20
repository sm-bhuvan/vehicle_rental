import { Star, Quote } from "lucide-react";
import { Testimony } from "../types/vehicle";

const testimonials: Testimony[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Business Executive",
    rating: 5,
    text: "Absolutely incredible service! The BMW M3 was in pristine condition and the booking process was seamless. Will definitely use LuxeDrive again.",
    avatar: "SJ"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Travel Blogger",
    rating: 5,
    text: "Rented the Ducati for a weekend trip - what an experience! The bike was perfectly maintained and the staff was incredibly professional.",
    avatar: "MC"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Event Planner",
    rating: 5,
    text: "The Range Rover was perfect for our corporate event. Luxury, comfort, and reliability all in one package. Highly recommended!",
    avatar: "ER"
  }
];

const TestimonialCard = ({ testimonial }: { testimonial: Testimony }) => {
  return (
    <div className="glass-card rounded-xl p-8 relative group hover:scale-105 transition-all duration-300">
      {/* Quote Icon */}
      <Quote className="absolute top-6 right-6 h-8 w-8 text-neon-cyan/20" />
      
      {/* Rating */}
      <div className="flex items-center space-x-1 mb-6">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-gold fill-current" />
        ))}
      </div>

      {/* Testimonial Text */}
      <p className="text-gray-300 mb-6 leading-relaxed">
        "{testimonial.text}"
      </p>

      {/* Author */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-neon rounded-full flex items-center justify-center font-bold text-primary-foreground">
          {testimonial.avatar}
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
          <p className="text-sm text-gray-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-4">
            What Our <span className="text-neon">Clients</span> Say
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers 
            have to say about their LuxeDrive experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-neon mb-2">4.9/5</div>
            <div className="text-gray-400">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-neon mb-2">2,500+</div>
            <div className="text-gray-400">Reviews</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-neon mb-2">50K+</div>
            <div className="text-gray-400">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-neon mb-2">99%</div>
            <div className="text-gray-400">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
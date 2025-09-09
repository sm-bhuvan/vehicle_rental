import { Star, Users, Fuel, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Vehicle } from "../types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const navigate = useNavigate();
  const {
    id,
    name,
    type,
    image,
    pricePerDay,
    rating,
    reviews,
    features,
    available
  } = vehicle;

  return (
    <div className="vehicle-card group">
      {/* Image */}
      <div className="relative mb-6 rounded-lg overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {!available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-red-400 font-semibold">Not Available</span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-glass rounded-full text-sm text-neon border border-neon-cyan/30">
            {type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
          <div className="flex items-center space-x-2 mb-2">
            <Star className="h-4 w-4 text-gold fill-current" />
            <span className="text-gold font-medium">{rating}</span>
            <span className="text-gray-400">({reviews} reviews)</span>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              {feature.icon === 'users' && <Users className="h-4 w-4" />}
              {feature.icon === 'fuel' && <Fuel className="h-4 w-4" />}
              {feature.icon === 'settings' && <Settings className="h-4 w-4" />}
              <span>{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-4 border-t border-border/20">
          <div>
            <span className="text-2xl font-bold text-neon">₹{pricePerDay}</span>
            <span className="text-gray-400">/day</span>
          </div>
          
          <button 
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              available 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 neon-glow' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!available}
            onClick={() => {
              if (!available) return;
              navigate('/contact', { state: { vehicleId: id, vehicleName: name } });
            }}
          >
            {available ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
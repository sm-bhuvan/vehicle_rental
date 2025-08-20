import { useState } from "react";
import { Search, Filter } from "lucide-react";
import VehicleCard from "./VehicleCard";
import { Vehicle } from "../types/vehicle";
import car1 from "../assets/car1.jpg";
import bike1 from "../assets/bike1.jpg";
import suv1 from "../assets/suv1.jpg";
import sports1 from "../assets/sports1.jpg";

const vehicleData: Vehicle[] = [
  {
    id: 1,
    name: "BMW M3 Competition",
    type: "Luxury Sedan",
    image: car1,
    pricePerDay: 189,
    rating: 4.8,
    reviews: 124,
    available: true,
    features: [
      { icon: 'users', label: '4 Seats' },
      { icon: 'fuel', label: 'Premium' },
      { icon: 'settings', label: 'Auto' }
    ]
  },
  {
    id: 2,
    name: "Ducati Panigale V4",
    type: "Sports Bike",
    image: bike1,
    pricePerDay: 149,
    rating: 4.9,
    reviews: 89,
    available: true,
    features: [
      { icon: 'users', label: '2 Riders' },
      { icon: 'fuel', label: 'Premium' },
      { icon: 'settings', label: '6-Speed' }
    ]
  },
  {
    id: 3,
    name: "Range Rover Vogue",
    type: "Luxury SUV",
    image: suv1,
    pricePerDay: 249,
    rating: 4.7,
    reviews: 156,
    available: true,
    features: [
      { icon: 'users', label: '7 Seats' },
      { icon: 'fuel', label: 'Hybrid' },
      { icon: 'settings', label: 'AWD' }
    ]
  },
  {
    id: 4,
    name: "Ferrari 488 GTB",
    type: "Super Car",
    image: sports1,
    pricePerDay: 599,
    rating: 5.0,
    reviews: 67,
    available: false,
    features: [
      { icon: 'users', label: '2 Seats' },
      { icon: 'fuel', label: 'Premium' },
      { icon: 'settings', label: '7-Speed' }
    ]
  }
];

const VehicleGrid = () => {
  const [filteredVehicles, setFilteredVehicles] = useState(vehicleData);
  const [selectedType, setSelectedType] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchTerm, setSearchTerm] = useState("");

  const vehicleTypes = ["All", "Luxury Sedan", "Sports Bike", "Luxury SUV", "Super Car"];

  const handleFilter = () => {
    let filtered = vehicleData;

    // Filter by type
    if (selectedType !== "All") {
      filtered = filtered.filter(vehicle => vehicle.type === selectedType);
    }

    // Filter by price range
    filtered = filtered.filter(vehicle => 
      vehicle.pricePerDay >= priceRange[0] && vehicle.pricePerDay <= priceRange[1]
    );

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVehicles(filtered);
  };

  return (
    <section id="vehicles" className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-4">
            Our <span className="text-neon">Premium</span> Fleet
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose from our exclusive collection of luxury vehicles, 
            each maintained to the highest standards for your perfect journey.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card rounded-xl p-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {vehicleTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Price Range */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Price:</span>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-32"
              />
              <span className="text-sm text-neon">${priceRange[1]}/day</span>
            </div>

            <button
              onClick={handleFilter}
              className="btn-primary flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredVehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>

        {/* No Results */}
        {filteredVehicles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-2xl font-bold mb-2">No Vehicles Found</h3>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Load More Button */}
        {filteredVehicles.length > 0 && (
          <div className="text-center mt-12">
            <button className="btn-outline">
              Load More Vehicles
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default VehicleGrid;
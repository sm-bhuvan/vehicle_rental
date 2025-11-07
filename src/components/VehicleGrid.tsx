import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { useLocation } from "react-router-dom";
import VehicleCard from "./VehicleCard";
import { Vehicle } from "../types/vehicle";
import { useVehicles } from "../contexts/VehicleContext";

const VehicleGrid = () => {
  const location = useLocation();
  const { vehicles } = useVehicles();
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedType, setSelectedType] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [searchTerm, setSearchTerm] = useState("");

  // Get unique vehicle types from the current vehicles
  const vehicleTypes = ["All", ...Array.from(new Set(vehicles.map(v => v.type)))];

  // Read vehicle name from URL query params and auto-fill search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nameFromUrl = params.get("name");
    if (nameFromUrl) {
      // Set the search term to the vehicle name from URL
      setSearchTerm(nameFromUrl);
    }
  }, [location.search]);

  // Update filtered vehicles when vehicles or filters change
  useEffect(() => {
    let filtered = vehicles;

    // Filter by type
    if (selectedType !== "All") {
      filtered = filtered.filter(vehicle => 
        vehicle.type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      vehicle =>
        vehicle.pricePerDay >= priceRange[0] &&
        vehicle.pricePerDay <= priceRange[1]
    );

    // Filter by search term (vehicle name) - prioritize this if URL has name param
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVehicles(filtered);
  }, [vehicles, selectedType, priceRange, searchTerm]);

  const handleFilter = () => {
    let filtered = vehicles;

    // Filter by type
    if (selectedType !== "All") {
      filtered = filtered.filter(vehicle => 
        vehicle.type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      vehicle =>
        vehicle.pricePerDay >= priceRange[0] &&
        vehicle.pricePerDay <= priceRange[1]
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
            Choose from our exclusive collection of luxury vehicles, each
            maintained to the highest standards for your perfect journey.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card rounded-xl p-6 mb-12">
          <div className="flex flex-wrap gap-6 items-center">
            {/* Search */}
            <div className="flex-grow min-w-[250px] relative">
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
            <div className="flex flex-wrap gap-2 flex-shrink">
              {vehicleTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Price Range */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <span className="text-sm text-gray-400">Price:</span>
              <input
                type="range"
                min="0"
                max="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-32"
              />
              <span className="text-sm text-neon">₹{priceRange[1]}/day</span>
            </div>

            {/* Apply Filters */}
            <button
              onClick={handleFilter}
              className="btn-primary flex items-center space-x-2 flex-shrink-0"
            >
              <Filter className="h-4 w-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredVehicles.map((vehicle) => (
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
            <button className="btn-outline">Load More Vehicles</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default VehicleGrid;

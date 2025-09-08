// src/hooks/useVehicles.ts - Fixed to avoid conflicts
import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import type { VehicleFilters, BackendVehicle, convertBackendVehicleToFrontend } from '../types/backend';
import type { Vehicle } from '../types/vehicle'; // Your existing frontend type

interface UseVehiclesReturn {
  vehicles: Vehicle[]; // Return your existing frontend Vehicle type
  backendVehicles: BackendVehicle[]; // Also provide backend data if needed
  loading: boolean;
  error: string | null;
  filters: VehicleFilters;
  applyFilters: (newFilters: VehicleFilters) => void;
  refreshVehicles: () => void;
}

export const useVehicles = (initialFilters: VehicleFilters = {}): UseVehiclesReturn => {
  const [backendVehicles, setBackendVehicles] = useState<BackendVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VehicleFilters>(initialFilters);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.getVehicles(filters);
      setBackendVehicles(response.vehicles);
      
      // Convert backend vehicles to frontend format
      const convertedVehicles = response.vehicles.map((backendVehicle: BackendVehicle): Vehicle => ({
        id: parseInt(backendVehicle.id) || 0,
        name: `${backendVehicle.year} ${backendVehicle.make} ${backendVehicle.model}`,
        type: backendVehicle.vehicle_type,
        image: backendVehicle.images[0] ? `http://localhost:5000${backendVehicle.images[0]}` : '/placeholder-car.jpg',
        pricePerDay: backendVehicle.price_per_day,
        rating: backendVehicle.average_rating,
        reviews: backendVehicle.total_reviews,
        available: backendVehicle.is_available,
        features: [
          {
            icon: 'users' as const,
            label: `${backendVehicle.seating_capacity} seats`
          },
          {
            icon: 'fuel' as const,
            label: backendVehicle.fuel_type
          },
          {
            icon: 'settings' as const,
            label: backendVehicle.transmission
          }
        ]
      }));
      
      setVehicles(convertedVehicles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
      setVehicles([]);
      setBackendVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const applyFilters = (newFilters: VehicleFilters) => {
    setFilters(newFilters);
  };

  const refreshVehicles = () => {
    fetchVehicles();
  };

  return {
    vehicles, // Your existing frontend format
    backendVehicles, // Raw backend data if needed
    loading,
    error,
    filters,
    applyFilters,
    refreshVehicles
  };
};
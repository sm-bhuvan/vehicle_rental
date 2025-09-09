import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Vehicle } from '../types/vehicle';

interface VehicleContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: number, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: number) => void;
  getVehicleById: (id: number) => Vehicle | undefined;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

// Derive backend base origin from Vite env (expects VITE_API_URL like http://host:port/api)
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_BASE_URL.replace(/\/?api\/?$/, '');

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/vehicles`);
        const json = await response.json();

        if (json && json.success && json.data && Array.isArray(json.data.vehicles)) {
          const mapped: Vehicle[] = json.data.vehicles.map((v: any, index: number) => {
            // Prefer your DB schema fields when present
            const hasCustomSchema = typeof v.name === 'string' || typeof v.price_per_day === 'number';

            if (hasCustomSchema) {
              const rawImage = v.image_url || (Array.isArray(v.images) ? v.images[0] : undefined);
              const imageUrl = rawImage
                ? (String(rawImage).startsWith('http') ? rawImage : `${API_ORIGIN}${rawImage}`)
                : '/placeholder-car.jpg';

              return {
                id: index + 1,
                name: v.name || `${v.brand ?? ''}`.trim() || 'Vehicle',
                type: v.brand || v.type || 'car',
                image: imageUrl,
                pricePerDay: v.price_per_day ?? v.pricePerDay ?? 0,
                rating: typeof v.rating === 'number' ? v.rating : 4.5,
                reviews: typeof v.reviews === 'number' ? v.reviews : 0,
                available: typeof v.availability === 'boolean' ? v.availability : (typeof v.isAvailable === 'boolean' ? v.isAvailable : true),
                features: [
                  { icon: 'users', label: `${v.seats ?? v.specifications?.seatingCapacity ?? 4} seats` },
                  { icon: 'fuel', label: v.fuel_type ?? v.specifications?.fuelType ?? 'Petrol' },
                  { icon: 'settings', label: v.gear ?? v.specifications?.transmission ?? 'Automatic' }
                ]
              } as Vehicle;
            }

            // Fallback to original demo schema mapping
            const imagePath: string | undefined = Array.isArray(v.images) && v.images.length > 0 ? v.images[0] : undefined;
            const imageUrl = imagePath
              ? (imagePath.startsWith('http') ? imagePath : `${API_ORIGIN}${imagePath}`)
              : '/placeholder-car.jpg';

            return {
              id: typeof v.id === 'number' ? v.id : (typeof v._id === 'string' ? index + 1 : index + 1),
              name: `${v.year ?? ''} ${v.make ?? ''} ${v.model ?? ''}`.trim(),
              type: v.type ?? 'car',
              image: imageUrl,
              pricePerDay: v.pricePerDay ?? 0,
              rating: typeof v.averageRating === 'number' ? v.averageRating : 4.5,
              reviews: typeof v.totalReviews === 'number' ? v.totalReviews : 0,
              available: typeof v.isAvailable === 'boolean' ? v.isAvailable : true,
              features: [
                { icon: 'users', label: `${v.specifications?.seatingCapacity ?? 4} seats` },
                { icon: 'fuel', label: v.specifications?.fuelType ?? 'Petrol' },
                { icon: 'settings', label: v.specifications?.transmission ?? 'Automatic' }
              ]
            } as Vehicle;
          });
          setVehicles(mapped);
        } else if (Array.isArray(json?.vehicles)) {
          // Fallback for alternate response shape
          const mapped: Vehicle[] = json.vehicles.map((v: any, index: number) => ({
            id: index + 1,
            name: `${v.year ?? ''} ${v.make ?? ''} ${v.model ?? ''}`.trim(),
            type: v.type ?? 'car',
            image: v.images?.[0] ? (v.images[0].startsWith('http') ? v.images[0] : `${API_ORIGIN}${v.images[0]}`) : '/placeholder-car.jpg',
            pricePerDay: v.pricePerDay ?? 0,
            rating: v.averageRating ?? 4.5,
            reviews: v.totalReviews ?? 0,
            available: v.isAvailable ?? true,
            features: [
              { icon: 'users', label: `${v.specifications?.seatingCapacity ?? 4} seats` },
              { icon: 'fuel', label: v.specifications?.fuelType ?? 'Petrol' },
              { icon: 'settings', label: v.specifications?.transmission ?? 'Automatic' }
            ]
          }));
          setVehicles(mapped);
        } else {
          setVehicles([]);
        }
      } catch (_err) {
        setVehicles([]);
      }
    };

    fetchVehicles();
  }, []);

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Math.max(...vehicles.map(v => v.id), 0) + 1
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = (id: number, vehicle: Partial<Vehicle>) => {
    setVehicles(prev => 
      prev.map(v => v.id === id ? { ...v, ...vehicle } : v)
    );
  };

  const deleteVehicle = (id: number) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const getVehicleById = (id: number) => {
    return vehicles.find(v => v.id === id);
  };

  return (
    <VehicleContext.Provider value={{
      vehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      getVehicleById
    }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};


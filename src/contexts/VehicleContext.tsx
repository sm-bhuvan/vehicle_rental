import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Vehicle } from '../types/vehicle';
import car1 from '../assets/car1.jpg';
import bike1 from '../assets/bike1.jpg';
import suv1 from '../assets/suv1.jpg';
import sports1 from '../assets/sports1.jpg';

interface VehicleContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: number, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: number) => void;
  getVehicleById: (id: number) => Vehicle | undefined;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

const initialVehicles: Vehicle[] = [
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

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

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

// src/types/backend.ts - Backend-specific types to avoid conflicts

export interface BackendUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'admin' | 'customer';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: 'car' | 'suv' | 'truck' | 'motorcycle' | 'van' | 'luxury';
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  seating_capacity: number;
  price_per_day: number;
  price_per_hour?: number;
  license_plate: string;
  color?: string;
  mileage?: number;
  engine_capacity?: number;
  features: string[];
  images: string[];
  location?: {
    address?: string;
    city?: string;
    state?: string;
    coordinates?: number[];
  };
  is_available: boolean;
  is_active: boolean;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface BackendBooking {
  id: string;
  user: BackendUser;
  vehicle: BackendVehicle;
  start_date: string;
  end_date: string;
  pickup_location?: any;
  return_location?: any;
  total_days: number;
  daily_rate: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded' | 'failed';
  advance_payment: number;
  special_requests?: string;
  driver_license_verified: boolean;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
}

export interface BackendPayment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash';
  transaction_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  gateway_name?: string;
  created_at: string;
  processed_at?: string;
}

export interface VehicleFilters {
  type?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  seating_capacity?: number;
  available_only?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

// API Response types
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: BackendUser;
  message: string;
}

export interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  user: BackendUser;
  message: string;
}

export interface VehiclesResponse {
  vehicles: BackendVehicle[];
  count: number;
}

export interface BookingsResponse {
  bookings: BackendBooking[];
  count: number;
}

// Helper function to convert backend vehicle to frontend vehicle format
export const convertBackendVehicleToFrontend = (backendVehicle: BackendVehicle): import('./vehicle').Vehicle => {
  return {
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
  };
};

// Helper function to convert frontend vehicle filters to backend format
export const convertFiltersToBackend = (filters: any) => {
  return {
    type: filters.type,
    city: filters.city,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    seating_capacity: filters.seatingCapacity,
    available_only: filters.availableOnly !== false
  };
};
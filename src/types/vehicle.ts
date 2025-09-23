export interface Vehicle {
  id: number;
  name: string;
  type: string;
  image: string;
  pricePerDay: number;
  rating: number;
  reviews: number;
  available: boolean;
  features: VehicleFeature[];
}

export interface VehicleFeature {
  icon: 'users' | 'fuel' | 'settings';
  label: string;
}

export interface Testimony {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
  avatar: string;
}

export interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  text: string;
  buttons?: string[];
}
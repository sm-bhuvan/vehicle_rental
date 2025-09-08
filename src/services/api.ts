// src/services/api.ts - Vite compatible version
import type {
  BackendUser,
  BackendVehicle,
  BackendBooking,
  BackendPayment,
  LoginResponse,
  RegisterResponse,
  VehiclesResponse,
  BookingsResponse,
  VehicleFilters,
  RegisterData
} from '../types/backend';

// Use import.meta.env for Vite (NOT process.env)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseURL: string = API_BASE_URL;

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  removeToken(): void {
    localStorage.removeItem('access_token');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    try {
      console.log(`API Call: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { message: 'Server error' };
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`API Response:`, data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // AUTHENTICATION METHODS
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getProfile(): Promise<{ user: BackendUser }> {
    return this.request('/auth/profile');
  }

  // VEHICLE METHODS
  async getVehicles(filters: VehicleFilters = {}): Promise<VehiclesResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    return this.request<VehiclesResponse>(`/vehicles${queryString ? '?' + queryString : ''}`);
  }

  async getVehicle(id: string): Promise<{ vehicle: BackendVehicle }> {
    return this.request(`/vehicles/${id}`);
  }

  async searchVehicles(query: string): Promise<VehiclesResponse> {
    return this.request(`/vehicles/search?q=${encodeURIComponent(query)}`);
  }

  // BOOKING METHODS
  async getBookings(): Promise<BookingsResponse> {
    return this.request('/bookings');
  }

  async getBooking(id: string): Promise<{ booking: BackendBooking }> {
    return this.request(`/bookings/${id}`);
  }

  async createBooking(bookingData: any): Promise<{ booking: BackendBooking; message: string }> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(bookingId: string, reason = ''): Promise<{ booking: BackendBooking; message: string }> {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async checkAvailability(vehicleId: string, startDate: string, endDate: string) {
    return this.request('/bookings/availability', {
      method: 'POST',
      body: JSON.stringify({
        vehicle_id: vehicleId,
        start_date: startDate,
        end_date: endDate
      }),
    });
  }

  // PAYMENT METHODS
  async processPayment(paymentData: any) {
    return this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentHistory(): Promise<{ payments: BackendPayment[]; count: number }> {
    return this.request('/payments/history');
  }

  // USER METHODS
  async updateProfile(userData: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getBookingSummary() {
    return this.request('/users/bookings-summary');
  }

  // HEALTH CHECK
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }
}

export default new ApiService();
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import ApiService from '../services/api';
import type { BackendUser, RegisterData } from '../types/backend';

// Updated User interface to match Flask backend
interface User extends BackendUser {
  // Keep username for backward compatibility with existing components
  username?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  register: (userData: RegisterData) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Keep admin credentials as fallback for development
const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123',
  role: 'admin' as const
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for logout events from API service
    const handleLogout = () => {
      setUser(null);
    };
    
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const checkAuthStatus = async () => {
    const token = ApiService.getToken();
    
    if (token) {
      try {
        const response = await ApiService.getProfile();
        // Add username for backward compatibility
        const userData: User = {
          ...response.user,
          username: response.user.email // Use email as username for existing components
        };
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        ApiService.removeToken();
        setUser(null);
      }
    }
    
    setLoading(false);
  };

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
      // First try Flask backend
      const response = await ApiService.login(emailOrUsername, password);
      
      if (response.access_token) {
        // Add username for backward compatibility
        const userData: User = {
          ...response.user,
          username: response.user.email
        };
        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Backend login failed, trying fallback:', error);
      
      // Fallback to hardcoded admin (for development)
      if (emailOrUsername === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const currentTime = new Date().toISOString();
        const userData: User = {
          id: '1',
          email: ADMIN_CREDENTIALS.email,
          first_name: 'Admin',
          last_name: 'User',
          username: ADMIN_CREDENTIALS.email,
          role: ADMIN_CREDENTIALS.role,
          is_verified: true,
          is_active: true,
          created_at: currentTime,  // Add missing properties
          updated_at: currentTime   // Add missing properties
        };
        setUser(userData);
        // Store in localStorage for compatibility
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await ApiService.register(userData);
      
      if (response.access_token) {
        // Add username for backward compatibility
        const userDataWithUsername: User = {
          ...response.user,
          username: response.user.email
        };
        setUser(userDataWithUsername);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user'); // Clean up old storage
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      isAdmin,
      loading,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
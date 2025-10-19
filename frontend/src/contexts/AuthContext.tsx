import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'employer' | 'admin';
  phone?: string;
  bio?: string;
  location?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'student' | 'employer' | 'admin';
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
  error?: {
    message: string;
    code: string;
  };
}

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!tokens;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('authTokens');
        const storedUser = localStorage.getItem('authUser');

        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens);
          const parsedUser = JSON.parse(storedUser);

          // Check if access token is still valid
          const tokenExpiry = localStorage.getItem('tokenExpiry');
          if (tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
            setTokens(parsedTokens);
            setUser(parsedUser);
          } else {
            // Try to refresh the token
            const refreshed = await refreshTokenSilently(parsedTokens.refreshToken);
            if (!refreshed) {
              // Refresh failed, clear stored data
              localStorage.removeItem('authTokens');
              localStorage.removeItem('authUser');
              localStorage.removeItem('tokenExpiry');
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('authTokens');
        localStorage.removeItem('authUser');
        localStorage.removeItem('tokenExpiry');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Silent token refresh
  const refreshTokenSilently = async (refreshToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        setTokens(data.data.tokens);
        localStorage.setItem('authTokens', JSON.stringify(data.data.tokens));
        localStorage.setItem('tokenExpiry', (Date.now() + data.data.tokens.expiresIn * 1000).toString());
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        setUser(data.data.user);
        setTokens(data.data.tokens);
        
        // Store in localStorage
        localStorage.setItem('authUser', JSON.stringify(data.data.user));
        localStorage.setItem('authTokens', JSON.stringify(data.data.tokens));
        localStorage.setItem('tokenExpiry', (Date.now() + data.data.tokens.expiresIn * 1000).toString());
      } else {
        throw new Error(data.error?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        setUser(data.data.user);
        setTokens(data.data.tokens);
        
        // Store in localStorage
        localStorage.setItem('authUser', JSON.stringify(data.data.user));
        localStorage.setItem('authTokens', JSON.stringify(data.data.tokens));
        localStorage.setItem('tokenExpiry', (Date.now() + data.data.tokens.expiresIn * 1000).toString());
      } else {
        throw new Error(data.error?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    setTokens(null);
    
    // Clear localStorage
    localStorage.removeItem('authUser');
    localStorage.removeItem('authTokens');
    localStorage.removeItem('tokenExpiry');
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    if (!tokens?.refreshToken) {
      return false;
    }

    try {
      const success = await refreshTokenSilently(tokens.refreshToken);
      if (!success) {
        logout();
      }
      return success;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!tokens?.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const responseData: AuthResponse = await response.json();

      if (responseData.success && responseData.data?.user) {
        setUser(responseData.data.user);
        localStorage.setItem('authUser', JSON.stringify(responseData.data.user));
      } else {
        throw new Error(responseData.error?.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

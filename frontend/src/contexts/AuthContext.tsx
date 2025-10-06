'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin, logout as apiLogout } from '../services/authService';
import { toast } from 'sonner';

// Simplified User and Profile types for our new backend
export interface User {
  id: string;
  email: string;
}

export interface UserProfile {
  id: string;
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: { name: string; level: number };
  // Add other profile fields as needed
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    // In a real app, you would fetch the profile from your backend.
    // This is a placeholder and should be replaced with a real API call.
    console.log(`Fetching profile for user ID: ${userId}`);
    const mockProfile: UserProfile = {
      id: userId,
      employee_id: `EMP-${userId.substring(0, 4)}`,
      email: user?.email || 'test@example.com', // Use user's email if available
      first_name: 'Test',
      last_name: 'User',
      role: { name: 'admin', level: 90 },
    };
    setProfile(mockProfile);
  }, [user?.email]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decoded = jwtDecode<{ sub: string; email: string }>(token);
          const currentUser = { id: decoded.sub, email: decoded.email };
          setUser(currentUser);
          await fetchProfile(decoded.sub);
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [fetchProfile]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    const response = await apiLogin(credentials);
    if (response.success) {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode<{ sub: string; email: string }>(token);
                const loggedInUser = { id: decoded.sub, email: decoded.email };
                setUser(loggedInUser);
                await fetchProfile(decoded.sub);
                toast.success('Login successful!');
            } catch (error) {
                console.error('Failed to decode token after login:', error);
                toast.error('Login failed: Invalid token received.');
                await apiLogout(); // Clean up local storage
            }
        }
    } else {
      toast.error(response.error || 'Login failed');
    }
    setIsLoading(false);
    return response;
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setProfile(null);
    toast.success('Logged out successfully');
  }, []);

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
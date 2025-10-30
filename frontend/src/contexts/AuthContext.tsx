"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api, type LoginData, type RegisterData } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const login = async (data: LoginData) => {
    try {
      const response = await api.login(data);
      
      // Store token first
      setToken(response.access_token);
      localStorage.setItem('authToken', response.access_token);
      
      // Use the updated getProfile (no token parameter needed)
      const profile = await api.getProfile();
      
      // Merge user data safely without permissions field
      const fullUser = { 
        ...response.user, 
        ...profile,
        // Remove permissions if it doesn't exist in profile
        permissions: undefined 
      };
      setUser(fullUser);
      localStorage.setItem('auth_user', JSON.stringify(fullUser));
      
      console.log('✅ Login successful with full profile:', {
        id: fullUser.id,
        role: fullUser.role,
        roles: fullUser.roles,
        emailVerified: fullUser.emailVerified
      });
      
      // Validate government access
      if (fullUser.role === 'GOVERNMENT_OFFICIAL' || 
          (fullUser.roles && fullUser.roles.includes('GOVERNMENT_OFFICIAL'))) {
        console.log('✅ Government official access confirmed');
      } else {
        console.warn('⚠️ User is not a government official:', fullUser.role);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Update the init function
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('auth_user');
      
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          
          // Use the updated getProfile
          const profile = await api.getProfile();
          // Merge user data safely without permissions field
          const fullUser = { 
            ...JSON.parse(savedUser), 
            ...profile,
            permissions: undefined 
          };
          setUser(fullUser);
          localStorage.setItem('auth_user', JSON.stringify(fullUser));
          
          console.log('✅ Auth restored with refreshed profile:', fullUser);
        } catch (error) {
          console.error('Profile refresh failed, clearing auth:', error);
          logout();
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const register = async (data: RegisterData) => {
    try {
      const response = await api.register(data);
        
      setToken(response.access_token);
      setUser(response.user);
        
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      console.log('✅ Registration successful, token stored');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('auth_user');
    console.log('✅ Logged out');
  };

  const verifyEmail = async (verificationToken: string) => {
    try {
      await api.verifyEmail(verificationToken);
      if (user) {
        const updatedUser = { ...user, emailVerified: true };
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
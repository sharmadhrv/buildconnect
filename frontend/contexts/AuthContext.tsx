'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../services/api/axiosInstance';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'builder' | 'contractor';
  is_email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  registerUser: (email: string, password: string, role: 'builder' | 'contractor', profileName: string) => Promise<any>;
  loginUser: (email: string, password: string) => Promise<any>;
  logoutUser: () => Promise<void>;
  verifyOtpUser: (email: string, otp: string) => Promise<any>;
  forgotPasswordUser: (email: string) => Promise<any>;
  resetPasswordUser: (email: string, otp: string, passwordNew: string) => Promise<any>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check login state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          
          // Verify session validity with backend
          try {
            const response = (await axiosInstance.get('/auth/me')) as any;
            if (response.success && response.data.user) {
              const updatedUser = response.data.user;
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          } catch (meError) {
            console.error('[AuthContext] Session verification failed', meError);
            // axiosInstance interceptor handles redirections if refreshing fails
          }
        }
      } catch (err) {
        console.error('[AuthContext] Initialization error', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearError = () => setError(null);

  // Register User
  const registerUser = async (email: string, password: string, role: 'builder' | 'contractor', profileName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/register', { email, password, role, profileName });
      return response;
    } catch (err: any) {
      const errMsg = err?.message || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const loginUser = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await axiosInstance.post('/auth/login', { email, password })) as any;
      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;
        setUser(userData);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return response;
    } catch (err: any) {
      const errMsg = err?.message || 'Login failed.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logoutUser = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP Email
  const verifyOtpUser = async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await axiosInstance.post('/auth/verify-otp', { email, otp })) as any;
      if (response.success && user && user.email === email) {
        const updatedUser = { ...user, is_email_verified: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return response;
    } catch (err: any) {
      const errMsg = err?.message || 'Verification failed.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const forgotPasswordUser = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return response;
    } catch (err: any) {
      const errMsg = err?.message || 'Password reset request failed.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPasswordUser = async (email: string, otp: string, passwordNew: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/reset-password', { email, otp, password: passwordNew });
      return response;
    } catch (err: any) {
      const errMsg = err?.message || 'Password reset failed.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        error,
        registerUser,
        loginUser,
        logoutUser,
        verifyOtpUser,
        forgotPasswordUser,
        resetPasswordUser,
        clearError,
      }}
    >
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

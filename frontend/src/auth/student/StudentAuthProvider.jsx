import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { studentAuthService } from './studentAuthService';
import { useToast } from '@/hooks/useToast';

export const StudentAuthContext = createContext(null);

export function StudentAuthProvider({ children }) {
  const [studentUser, setStudentUser] = useState(null);
  const [studentToken, setStudentToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('xebia-student-token');
    const storedUser = localStorage.getItem('xebia-student-user');
    
    if (storedToken && storedUser) {
      setStudentToken(storedToken);
      try {
        setStudentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('xebia-student-user');
      }
    }
    setLoading(false);
  }, []);

  const sendOtp = useCallback(async (email, fullName) => {
    try {
      const data = await studentAuthService.sendOtp(email, fullName);
      showToast('OTP verification code sent to your email address.', 'info');
      return data;
    } catch (error) {
      showToast(error.message || 'Failed to send OTP.', 'error');
      throw error;
    }
  }, [showToast]);

  const verifyOtp = useCallback(async (email, code, fullName, isGoogleLogin) => {
    setLoading(true);
    try {
      const data = await studentAuthService.verifyOtp(email, code, fullName, isGoogleLogin);
      const { accessToken, refreshToken, user } = data;
      
      localStorage.setItem('xebia-student-token', accessToken);
      localStorage.setItem('xebia-student-refresh-token', refreshToken);
      localStorage.setItem('xebia-student-user', JSON.stringify(user));
      
      setStudentToken(accessToken);
      setStudentUser(user);
      
      showToast('OTP verified. Successfully logged in!', 'success');
      return user;
    } catch (error) {
      showToast(error.message || 'OTP verification failed.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const register = useCallback(async (fullName, email, password) => {
    setLoading(true);
    try {
      const result = await studentAuthService.register(fullName, email, password);
      showToast('Account created successfully. Please sign in.', 'success');
      return result;
    } catch (error) {
      showToast(error.message || 'Registration failed.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem('xebia-student-token');
    localStorage.removeItem('xebia-student-refresh-token');
    localStorage.removeItem('xebia-student-user');
    
    setStudentToken(null);
    setStudentUser(null);
    
    showToast('Logged out of Student Portal successfully', 'info');
  }, [showToast]);

  const value = useMemo(() => ({
    user: studentUser,
    token: studentToken,
    loading,
    sendOtp,
    verifyOtp,
    register,
    logout,
    isAuthenticated: !!studentToken,
  }), [studentUser, studentToken, loading, sendOtp, verifyOtp, register, logout]);

  return (
    <StudentAuthContext.Provider value={value}>
      {children}
    </StudentAuthContext.Provider>
  );
}

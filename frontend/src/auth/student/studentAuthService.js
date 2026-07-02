// Student Authentication API client service
import api from '@/services/api';
import { studentProfile } from '@/services/studentMockData';

export const studentAuthService = {
  // Initiates OTP sending by calling the backend
  sendOtp: async (email, fullName) => {
    try {
      const response = await api.post('/auth/send-otp', { email, fullName });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send verification code. Please try again.';
      throw new Error(msg);
    }
  },

  // Verifies OTP code against the backend
  verifyOtp: async (email, code, fullName = 'Student User', isGoogleLogin = false) => {
    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        code,
        fullName,
        isGoogleLogin
      });
      // Backend returns: data: { accessToken, refreshToken, user: { email, fullName, role, avatar } }
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please check the code.';
      throw new Error(msg);
    }
  },

  // Mock student registration logic
  register: async (fullName, email, password) => {
    // Simulated short delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    if (!fullName || !email || !password) {
      throw new Error('All fields are required.');
    }
    
    const emailLower = email.toLowerCase();
    
    if (emailLower === 'aarav.sharma@xebia.com') {
      throw new Error('Email address is already in use.');
    }
    
    const registeredRaw = localStorage.getItem('registered-students') || '[]';
    let registered = [];
    try {
      registered = JSON.parse(registeredRaw);
    } catch (e) {
      registered = [];
    }
    
    if (registered.some(u => u.email.toLowerCase() === emailLower)) {
      throw new Error('Email address is already in use.');
    }
    
    const newStudent = {
      id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName,
      email,
      password
    };
    
    registered.push(newStudent);
    localStorage.setItem('registered-students', JSON.stringify(registered));
    
    return { success: true };
  },

  forgotPassword: async (email) => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    return { message: 'Password recovery email sent successfully.' };
  },

  resetPassword: async (token, password) => {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    return { message: 'Password has been reset successfully.' };
  }
};

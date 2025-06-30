// src/services/authService.js
import api from './api';
import { toast } from 'react-toastify';

export const register = async (userData) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    // Show success notification
    toast.success('Registration successful');
    return data;
  } catch (err) {
    // Show error notification
    toast.error(err.response?.data?.message || 'Registration failed');
    throw err;
  }
};

export const login = async (credentials) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    // Show success notification
    toast.success('Login successful');
    return data;
  } catch (err) {
    // Show error notification
    toast.error(err.response?.data?.message || 'Login failed');
    throw err;
  }
};

export const logout = () => {
  // Remove token from localStorage
  localStorage.removeItem('token');
  // Show success notification
  toast.success('Logged out successfully');
};

export const getCurrentUser = async () => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (err) {
    // If token is invalid/expired, remove it
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
    throw err;
  }
};

export const updateProfile = async (userData) => {
  try {
    const { data } = await api.put('/auth/me', userData);
    toast.success('Profile updated successfully');
    return data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Profile update failed');
    throw err;
  }
};

export const changePassword = async (passwords) => {
  try {
    await api.put('/auth/change-password', passwords);
    toast.success('Password changed successfully');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Password change failed');
    throw err;
  }
};
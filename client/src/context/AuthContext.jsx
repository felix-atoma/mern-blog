// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (formData) => {
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      setUser(data);
      toast.success('Registration successful');
      return data; // Return user data for component to handle navigation
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err; // Re-throw for component to handle
    }
  };

  const login = async (formData) => {
    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('token', data.token);
      setUser(data);
      toast.success('Login successful');
      return data; // Return user data for component to handle navigation
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      throw err; // Re-throw for component to handle
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    // Navigation should be handled by the component calling logout
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
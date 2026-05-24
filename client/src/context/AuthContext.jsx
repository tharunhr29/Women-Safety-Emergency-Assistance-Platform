import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const refreshProfile = async () => {
    if (user && user.token) {
      try {
        const { data } = await api.getProfile();
        // Merge fresh data with the token
        const freshUser = { ...data, token: user.token };
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        return freshUser;
      } catch (error) {
        console.error("Failed to fetch fresh profile", error);
        if (error.response?.status === 401) {
          logout();
        }
      }
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.login(formData);
      if (data.role === 'admin') {
        throw new Error('Administrators must use the dedicated Admin Login portal.');
      }
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.register(formData);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.login(formData);
      if (data.role !== 'admin') {
        throw new Error('Access Denied: You do not have administrator privileges.');
      }
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      navigate('/admin-dashboard');
      return data;
    } catch (error) {
      console.error(error);
      throw error; // Throw so AdminLogin can catch and display
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, adminLogin, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

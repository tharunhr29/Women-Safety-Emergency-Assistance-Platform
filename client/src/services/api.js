import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include auth token
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const login = (formData) => API.post('/users/login', formData);
export const register = (formData) => API.post('/users', formData);
export const resetPassword = (formData) => API.post('/users/reset-password', formData);
export const getProfile = () => API.get('/users/me');
export const updateProfile = (data) => API.put('/users/profile', data);
export const addContact = (data) => API.post('/users/contacts', data);

export const createAlert = (alertData) => API.post('/alerts', alertData);
export const getAlertHistory = () => API.get('/alerts/history');
export const resolveAlert = (id) => API.put(`/alerts/${id}/resolve`);
export const rateResponders = (id, ratings) => API.put(`/alerts/${id}/rate`, { ratings });

export const getActiveAlerts = () => API.get('/alerts/active');
export const respondToAlert = (id) => API.put(`/alerts/${id}/respond`);
export const updateResponseStatus = (id, status) => API.put(`/alerts/${id}/status`, { status });

// Admin Endpoints
export const adminGetUsers = () => API.get('/admin/users');
export const adminVerifyVolunteer = (id) => API.put(`/admin/users/${id}/verify`);
export const adminUpdateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);
export const adminGetAllAlerts = () => API.get('/admin/alerts');
export const adminMarkFalseAlarm = (id) => API.put(`/admin/alerts/${id}/false-alarm`);
export const adminCreateSafeZone = (data) => API.post('/admin/safezones', data);
export const adminDeleteSafeZone = (id) => API.delete(`/admin/safezones/${id}`);

export const getSafeZones = () => API.get('/admin/safezones'); // Public/Protected

export default API;

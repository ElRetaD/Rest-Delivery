// src/services/api.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clientToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('clientToken', response.data.token);
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('clientToken', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('clientToken');
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ==================== MENU ====================
export const menuAPI = {
  getAll: async () => {
    const response = await api.get('/menu');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },

  getByCategory: async (category) => {
    const response = await api.get(`/menu?category=${category}`);
    return response.data;
  },
};

// ==================== ORDERS ====================
export const ordersAPI = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  trackOrder: async (id) => {
    const response = await api.get(`/orders/${id}/track`);
    return response.data;
  },
};

export default api;
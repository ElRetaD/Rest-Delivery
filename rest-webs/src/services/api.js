// src/services/api.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

console.log('🌐 API URL configurée:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Requête:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('📥 Réponse reçue:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Erreur réponse:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    console.log('🔐 authAPI.login appelé avec:', { email });
    
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login réponse:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        console.log('💾 Token sauvegardé');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },
};

export const ordersAPI = {
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  assignDeliverer: async (orderId, delivererId) => {
    const response = await api.patch(`/orders/${orderId}/assign`, { delivererId });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

export const deliverersAPI = {
  getAll: async () => {
    const response = await api.get('/deliverers');
    return response.data;
  },

  getAvailable: async () => {
    const response = await api.get('/deliverers/available');
    return response.data;
  },

  updatePosition: async (id, lat, lng) => {
    const response = await api.patch(`/deliverers/${id}/position`, { lat, lng });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/deliverers/${id}/status`, { status });
    return response.data;
  },
};

export const menuAPI = {
  getAll: async () => {
    const response = await api.get('/menu');
    return response.data;
  },

  create: async (dishData) => {
    const response = await api.post('/menu', dishData);
    return response.data;
  },

  update: async (id, dishData) => {
    const response = await api.patch(`/menu/${id}`, dishData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },

  updateAvailability: async (id, available) => {
    const response = await api.patch(`/menu/${id}/availability`, { available });
    return response.data;
  },
};

export const statsAPI = {
  getToday: async () => {
    const response = await api.get('/stats/today');
    return response.data;
  },

  getWeek: async () => {
    const response = await api.get('/stats/week');
    return response.data;
  },

  getMonth: async () => {
    const response = await api.get('/stats/month');
    return response.data;
  },

  getCustom: async (startDate, endDate) => {
    const response = await api.get('/stats/custom', {
      params: { startDate, endDate }
    });
    return response.data;
  },
};

export const settingsAPI = {
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  update: async (settings) => {
    const response = await api.patch('/settings', settings);
    return response.data;
  },
};

export default api;
// src/services/api.js

import axios from 'axios';
import toast from 'react-hot-toast';
import socketService from './socket';

// Utiliser l'URL de l'API depuis les variables d'environnement ou détecter automatiquement
const getAPIUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = window.location.hostname;
  // Détection intelligente: si le site est déployé sur Vercel ou via HTTPS
  if (hostname.includes('vercel.app') || window.location.protocol === 'https:') {
    return 'https://lacanyada-backend.onrender.com/api';
  }

  return `http://${hostname}:5000/api`;
};

const API_URL = getAPIUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.debug('📤 Requête:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Gestion centralisée 401 Unauthorized
    if (status === 401) {
      if (!requestUrl.includes('/auth/login')) {
        localStorage.removeItem('adminToken');
        try {
          socketService.disconnect();
        } catch (e) {
          // ignore
        }
        window.dispatchEvent(new Event('admin:unauthorized'));
        toast.error(error.response?.data?.message || 'Session administrateur expirée. Veuillez vous reconnecter.', {
          id: 'admin-401-session-expired',
        });
      }
    }

    // Gestion centralisée 429 Too Many Requests
    if (status === 429) {
      const message = error.response?.data?.message || 'Trop de requêtes. Veuillez patienter un instant avant de réessayer.';
      toast.error(message, {
        id: 'admin-429-rate-limit',
        duration: 5000,
      });
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

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.patch('/auth/change-password', passwordData);
    return response.data;
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

  getCaisse: async () => {
    const response = await api.get('/deliverers/caisse');
    return response.data;
  },

  settleCash: async (id) => {
    const response = await api.post(`/deliverers/${id}/settle-cash`);
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

  getYear: async (year) => {
    const response = await api.get(`/stats/year/${year}`);
    return response.data;
  },

  getTopDishes: async () => {
    const response = await api.get('/stats/top-dishes');
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

export const usersAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateStatus: async (id, isActive) => {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// ==================== EXPENSES ====================
export const expensesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  create: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

// ==================== SUPPORT ====================
export const supportAPI = {
  reportBug: async (bugData) => {
    const response = await api.post('/support/report', bugData);
    return response.data;
  },
};

// ==================== REVIEWS ====================
export const reviewsAPI = {
  getForMenuItem: async (menuId, page = 1) => {
    const response = await api.get(`/reviews/menu/${menuId}?page=${page}&limit=10`);
    return response.data;
  },
};

export default api;
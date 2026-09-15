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

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clientToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ne jamais logger les corps de requête en clair pour prévenir la fuite de mots de passe
    if (import.meta.env.DEV) {
      console.debug('📤 API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Gestion centralisée 401 Unauthorized
    if (status === 401) {
      if (!requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
        localStorage.removeItem('clientToken');
        try {
          socketService.disconnect();
        } catch (e) {
          // ignore
        }
        window.dispatchEvent(new Event('auth:unauthorized'));
        toast.error(error.response?.data?.message || 'Session expirée. Veuillez vous reconnecter.', {
          id: 'client-401-session-expired',
        });
      }
    }

    // Gestion centralisée 429 Too Many Requests
    if (status === 429) {
      const message = error.response?.data?.message || 'Trop de requêtes. Veuillez patienter un instant avant de réessayer.';
      toast.error(message, {
        id: 'client-429-rate-limit',
        duration: 5000,
      });
    }

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

  googleAuth: async (googleData) => {
    const response = await api.post('/auth/google', googleData);
    if (response.data.token) {
      localStorage.setItem('clientToken', response.data.token);
    }
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.patch('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await api.post('/auth/addresses', addressData);
    return response.data;
  },

  removeAddress: async (id) => {
    const response = await api.delete(`/auth/addresses/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id) => {
    const response = await api.put(`/auth/addresses/${id}/default`);
    return response.data;
  },

  updateAddress: async (id, addressData) => {
    const response = await api.put(`/auth/addresses/${id}`, addressData);
    return response.data;
  },
};

// ==================== MENU ====================
export const menuAPI = {
  getAll: async () => {
    const response = await api.get('/menu?available=true');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },

  getByCategory: async (category) => {
    const response = await api.get(`/menu?category=${category}&available=true`);
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

  cancel: async (id) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  },
};

// ==================== PAYMENT ====================
export const paymentAPI = {
  createPaymentIntent: async (orderId, amount) => {
    const response = await api.post('/payment/create-intent', { orderId, amount });
    return response.data;
  },

  confirmPayment: async (paymentIntentId, orderId) => {
    const response = await api.post('/payment/confirm', { paymentIntentId, orderId });
    return response.data;
  },
};

// ==================== SETTINGS ====================
export const settingsAPI = {
  getPublic: async () => {
    const response = await api.get('/settings/public');
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
  // Soumettre un avis pour un plat d'une commande livrée
  submit: async (orderId, menuItemId, rating, comment) => {
    const response = await api.post('/reviews', { orderId, menuItemId, rating, comment });
    return response.data;
  },

  // Récupérer les avis d'un plat
  getForMenuItem: async (menuId, page = 1) => {
    const response = await api.get(`/reviews/menu/${menuId}?page=${page}&limit=5`);
    return response.data;
  },

  // Vérifier quels plats ont déjà été notés pour une commande
  getOrderReviewStatus: async (orderId) => {
    const response = await api.get(`/reviews/order/${orderId}/status`);
    return response.data;
  },

  // Récupérer les avis les plus récents (pour la page d'accueil)
  getLatest: async (limit = 6) => {
    const response = await api.get(`/reviews/latest?limit=${limit}`);
    return response.data;
  },
};

export default api;
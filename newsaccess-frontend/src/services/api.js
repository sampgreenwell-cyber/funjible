import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Wallet APIs
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  addFunds: (amount) => api.post('/wallet/add-funds', { amount }),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
};

// Article APIs
export const articleAPI = {
  getArticles: (params) => api.get('/articles', { params }),
  getArticle: (id) => api.get(`/articles/${id}`),
  purchaseArticle: (id) => api.post(`/articles/${id}/purchase`),
  getPurchasedArticles: () => api.get('/articles/purchased'),
};

// Publisher APIs
export const publisherAPI = {
  getPublishers: () => api.get('/publishers'),
  getPublisher: (id) => api.get(`/publishers/${id}`),
  subscribe: (id) => api.post(`/publishers/${id}/subscribe`),
  unsubscribe: (id) => api.delete(`/publishers/${id}/subscribe`),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getReadingHistory: () => api.get('/users/reading-history'),
  getSpendingAnalytics: () => api.get('/users/spending-analytics'),
};

// Payment APIs
export const paymentAPI = {
  createPaymentIntent: (amount) => api.post('/payments/create-intent', { amount }),
  confirmPayment: (paymentIntentId) => api.post('/payments/confirm', { paymentIntentId }),
  getPaymentMethods: () => api.get('/payments/methods'),
  addPaymentMethod: (data) => api.post('/payments/methods', data),
  deletePaymentMethod: (id) => api.delete(`/payments/methods/${id}`),
};

export default api;
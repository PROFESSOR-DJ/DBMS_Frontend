import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};

export const paperApi = {
  getDashboardStats: async () => {
    const response = await api.get('/stats/overview');
    return response.data;
  },

  searchPapers: async (query = '', filters = {}) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await api.get(`/papers/search?${params.toString()}`);
    return response.data;
  },

  getAllPapers: async (page = 1, limit = 50, source = 'mongodb') => {
    const response = await api.get('/papers', {
      params: { page, limit, source }
    });
    return response.data;
  },

  getPaperById: async (id, source = 'mongodb') => {
    const response = await api.get(`/papers/${id}`, {
      params: { source }
    });
    return response.data;
  },

  getAuthorStats: async (source = 'mongodb', limit = 50) => {
    const response = await api.get('/stats/authors', {
      params: { source, limit }
    });
    return response.data;
  },

  getJournalStats: async (source = 'mongodb', limit = 50) => {
    const response = await api.get('/stats/journals', {
      params: { source, limit }
    });
    return response.data;
  },
  
  getPapersPerYear: async (source = 'mongodb') => {
    const response = await api.get('/stats/papers-per-year', {
      params: { source }
    });
    return response.data;
  },
};

export default api;
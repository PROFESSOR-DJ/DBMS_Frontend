import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
    const params = { query, ...filters };
    const response = await api.get('/papers', { params });
    return response.data;
  },

  getPaperById: async (id) => {
    const response = await api.get(`/papers/${id}`);
    return response.data;
  },

  getAuthorStats: async () => {
    const response = await api.get('/stats/authors');
    return response.data;
  },

  getJournalStats: async () => {
    const response = await api.get('/stats/journals');
    return response.data;
  },
};
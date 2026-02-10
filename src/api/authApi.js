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
  // Dashboard stats - HYBRID (SQL counts + MongoDB analytics)
  getDashboardStats: async () => {
    const response = await api.get('/stats/overview');
    return response.data;
  },

  // Search uses MongoDB (optimized for full-text search)
  searchPapers: async (query = '', filters = {}) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    
    // Add all filter parameters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/papers/search?${params.toString()}`);
    return response.data;
  },

  // Browse uses MongoDB (optimized for document retrieval)
  getAllPapers: async (page = 1, limit = 20, sortBy = 'recent') => {
    const response = await api.get('/papers', {
      params: { page, limit, sortBy }
    });
    return response.data;
  },

  // Get by ID uses MongoDB with SQL enrichment
  getPaperById: async (id) => {
    const response = await api.get(`/papers/${id}`);
    return response.data;
  },

  // Filter options use MongoDB aggregation
  getFilterOptions: async () => {
    const response = await api.get('/papers/filters');
    return response.data;
  },

  // Suggestions use MongoDB regex search
  getSuggestions: async (query, type = 'all') => {
    const response = await api.get('/papers/suggestions', {
      params: { q: query, type }
    });
    return response.data;
  },

  // Year/Journal queries use MongoDB indexes
  getPapersByYear: async (year) => {
    const response = await api.get(`/papers/year/${year}`);
    return response.data;
  },

  getPapersByJournal: async (journal) => {
    const response = await api.get(`/papers/journal/${encodeURIComponent(journal)}`);
    return response.data;
  },

  // Author uses HYBRID (SQL relationships + MongoDB documents)
  getPapersByAuthor: async (author) => {
    const response = await api.get(`/papers/author/${encodeURIComponent(author)}`);
    return response.data;
  },

  // Author stats use SQL (normalized relationships)
  getAuthorStats: async (limit = 50) => {
    const response = await api.get('/stats/authors', {
      params: { limit }
    });
    return response.data;
  },

  // Journal stats use MongoDB aggregation
  getJournalStats: async (limit = 50) => {
    const response = await api.get('/stats/journals', {
      params: { limit }
    });
    return response.data;
  },
  
  // Year analytics use MongoDB
  getPapersPerYear: async () => {
    const response = await api.get('/stats/papers-per-year');
    return response.data;
  },

  // Get database architecture info
  getDatabaseInfo: async () => {
    const response = await api.get('/stats/database-info');
    return response.data;
  },

  // Get performance comparison
  getQueryPerformance: async () => {
    const response = await api.get('/stats/query-performance');
    return response.data;
  },

  // Advanced search - MongoDB optimized
  advancedSearch: async (searchParams) => {
    const params = new URLSearchParams();
    
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== null && searchParams[key] !== undefined && searchParams[key] !== '') {
        params.append(key, searchParams[key]);
      }
    });
    
    const response = await api.get(`/papers/search?${params.toString()}`);
    return response.data;
  },

  // Create paper (writes to both databases)
  createPaper: async (paperData) => {
    const response = await api.post('/papers', paperData);
    return response.data;
  },

  // Update paper (updates both databases)
  updatePaper: async (id, paperData) => {
    const response = await api.put(`/papers/${id}`, paperData);
    return response.data;
  },

  // Delete paper (deletes from both databases)
  deletePaper: async (id) => {
    const response = await api.delete(`/papers/${id}`);
    return response.data;
  },

  // Bulk operations (MongoDB first, SQL sync)
  bulkCreatePapers: async (papers) => {
    const response = await api.post('/papers/bulk', papers);
    return response.data;
  },
};

export default api;
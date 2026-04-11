// authApi wraps frontend authentication and data requests to the backend.
import axios from 'axios';
import { clearAuthSession, getAuthToken } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearAuthSession();
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
  register: async userData => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  forgotPassword: async email => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateProfile: async userData => {
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
  getAllPapers: async (page = 1, limit = 20, sortBy = 'recent', filters = {}) => {
    const response = await api.get('/papers', { params: { page, limit, sortBy, ...filters } });
    return response.data;
  },
  getPaperById: async id => {
    const response = await api.get(`/papers/${id}`);
    return response.data;
  },
  createPaper: async paperData => {
    const response = await api.post('/papers', paperData);
    return response.data;
  },
  updatePaper: async (id, paperData) => {
    const response = await api.put(`/papers/${id}`, paperData);
    return response.data;
  },
  deletePaper: async id => {
    const response = await api.delete(`/papers/${id}`);
    return response.data;
  },
  getFilterOptions: async () => {
    const response = await api.get('/papers/filters');
    return response.data;
  },
  getSuggestions: async (query, type = 'all') => {
    const response = await api.get('/papers/suggestions', { params: { q: query, type } });
    return response.data;
  },
  getPapersByYear: async year => {
    const response = await api.get(`/papers/year/${year}`);
    return response.data;
  },
  getPapersByJournal: async journal => {
    const response = await api.get(`/papers/journal/${encodeURIComponent(journal)}`);
    return response.data;
  },
  getPapersByAuthor: async author => {
    const response = await api.get(`/papers/author/${encodeURIComponent(author)}`);
    return response.data;
  },
  getAuthorStats: async (limit = 50) => {
    const response = await api.get('/stats/authors', { params: { limit } });
    return response.data;
  },
  advancedSearch: async searchParams => {
    const params = new URLSearchParams();
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== null && searchParams[key] !== undefined && searchParams[key] !== '') {
        params.append(key, searchParams[key]);
      }
    });
    const response = await api.get(`/papers/search?${params.toString()}`);
    return response.data;
  },
  bulkCreatePapers: async papers => {
    const response = await api.post('/papers/bulk', papers);
    return response.data;
  },
};

export const authorApi = {
  getAllAuthors: async (params = {}) => {
    const response = await api.get('/authors', { params });
    return response.data;
  },
  searchAuthors: async query => {
    const response = await api.get('/authors/search', { params: { q: query } });
    return response.data;
  },
  createAuthor: async authorData => {
    const response = await api.post('/authors', authorData);
    return response.data;
  },
  updateAuthor: async (id, updates) => {
    const response = await api.put(`/authors/${id}`, updates);
    return response.data;
  },
  deleteAuthor: async id => {
    const response = await api.delete(`/authors/${id}`);
    return response.data;
  },
  getPapersByAuthor: async authorName => {
    const response = await api.get(`/papers/author/${authorName}`);
    return response.data;
  },
  getAuthorInsights: async id => {
    const response = await api.get(`/authors/${id}/insights`);
    return response.data;
  },
};

export const journalApi = {
  searchJournals: async (params = {}) => {
    const response = await api.get('/journals/search', { params });
    return response.data;
  },
  getJournalById: async id => {
    const response = await api.get(`/journals/${encodeURIComponent(id)}`);
    return response.data;
  },
};

export const statsApi = {
  getOverview: async () => {
    const response = await api.get('/stats/overview');
    return response.data;
  },
  getTopAuthors: async () => {
    const response = await api.get('/stats/overview');
    return response.data.analytics.top_authors;
  },
  getTopJournals: async () => {
    const response = await api.get('/stats/overview');
    return response.data.analytics.top_journals;
  },
  getPapersPerYear: async () => {
    const response = await api.get('/stats/year');
    return response.data.papers_per_year;
  },
  getAuthorImpact: async (limit = 50) => {
    const response = await api.get('/stats/authors', { params: { limit } });
    return response.data;
  },
  getTrendingPapers: async (year, limit = 10, options = {}) => {
    const params = {};
    if (year) params.year = year;
    if (limit) params.limit = limit;
    if (options.curated !== undefined) params.curated = options.curated;
    const response = await api.get('/stats/trending', { params });
    return response.data;
  },
  getIncompletePapers: async (limit = 6, offset = 0) => {
    const response = await api.get('/stats/incomplete-papers', { params: { limit, offset } });
    return response.data;
  },
  getActiveUsers: async (limit = 6, offset = 0) => {
    const response = await api.get('/stats/active-users', { params: { limit, offset } });
    return response.data;
  },
  getImportantPapers: async (limit = 20, offset = 0, options = {}) => {
    const params = { limit, offset };
    if (options.curated !== undefined) params.curated = options.curated;
    const response = await api.get('/stats/important-papers', { params });
    return response.data;
  },
  getJournalPopularity: async (limit = 10) => {
    const response = await api.get('/stats/journal-popularity', { params: { limit } });
    return response.data;
  },
};

export default api;

/**
 * src/api/graphApi.js
 * All frontend API calls for Neo4j graph endpoints.
 * Import and use anywhere in your React pages.
 */
import api from './authApi';   // reuses the same axios instance with auth token

export const graphApi = {

  /** Overall graph statistics (node + relationship counts) */
  getStats: async () => {
    const res = await api.get('/graph/stats');
    return res.data;
  },

  /** Top N authors by paper count */
  getTopAuthors: async (limit = 10) => {
    const res = await api.get('/graph/top-authors', { params: { limit } });
    return res.data;
  },

  /** Top N journals by paper count */
  getTopJournals: async (limit = 10) => {
    const res = await api.get('/graph/top-journals', { params: { limit } });
    return res.data;
  },

  /** Papers per year from graph */
  getPapersByYear: async () => {
    const res = await api.get('/graph/papers-by-year');
    return res.data;
  },

  /** Papers grouped by source dataset */
  getPapersBySource: async () => {
    const res = await api.get('/graph/papers-by-source');
    return res.data;
  },

  /**
   * Co-author network for a specific author
   * Returns: { author, papers, coAuthors, totalCoAuthors }
   */
  getAuthorNetwork: async (name, limit = 50) => {
    const res = await api.get(`/graph/author-network/${encodeURIComponent(name)}`, { params: { limit } });
    return res.data;
  },

  /** All papers by a specific author */
  getAuthorPapers: async (name, limit = 20) => {
    const res = await api.get(`/graph/author-papers/${encodeURIComponent(name)}`, { params: { limit } });
    return res.data;
  },

  /** Top contributing authors in a specific journal */
  getJournalAuthors: async (journal, limit = 15) => {
    const res = await api.get(`/graph/journal-authors/${encodeURIComponent(journal)}`, { params: { limit } });
    return res.data;
  },

  /** Search authors by name */
  searchAuthors: async (q) => {
    const res = await api.get('/graph/search-authors', { params: { q } });
    return res.data;
  },

  /** Neo4j health check */
  getHealth: async () => {
    const res = await api.get('/graph/health');
    return res.data;
  },
};
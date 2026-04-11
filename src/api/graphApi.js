// graphApi wraps frontend graph analytics requests to the backend.
import api from './authApi';
export const graphApi = {
  getStats: async () => {
    const res = await api.get('/graph/stats');
    return res.data;
  },
  getTopAuthors: async (limit = 10) => {
    const res = await api.get('/graph/top-authors', {
      params: {
        limit
      }
    });
    return res.data;
  },
  getTopJournals: async (limit = 10) => {
    const res = await api.get('/graph/top-journals', {
      params: {
        limit
      }
    });
    return res.data;
  },
  getPapersByYear: async () => {
    const res = await api.get('/graph/papers-by-year');
    return res.data;
  },
  getPapersBySource: async () => {
    const res = await api.get('/graph/papers-by-source');
    return res.data;
  },
  getAuthorNetwork: async (name, limit = 50) => {
    const res = await api.get(`/graph/author-network/${encodeURIComponent(name)}`, {
      params: {
        limit
      }
    });
    return res.data;
  },
  getAuthorPapers: async (name, limit = 20) => {
    const res = await api.get(`/graph/author-papers/${encodeURIComponent(name)}`, {
      params: {
        limit
      }
    });
    return res.data;
  },
  getJournalAuthors: async (journal, limit = 15) => {
    const res = await api.get(`/graph/journal-authors/${encodeURIComponent(journal)}`, {
      params: {
        limit
      }
    });
    return res.data;
  },
  searchAuthors: async q => {
    const res = await api.get('/graph/search-authors', {
      params: {
        q
      }
    });
    return res.data;
  },
  checkConflictOfInterest: async (reviewer, authors) => {
    const res = await api.post('/graph/conflict-check', {
      reviewer,
      authors
    });
    return res.data;
  },
  getAuthorTrackRecord: async name => {
    const res = await api.get('/stats/author-track', {
      params: {
        name
      }
    });
    return res.data;
  },
  findSimilarPapers: async ({ title, abstract, limit = 5 }) => {
    const res = await api.get('/papers/similar', {
      params: {
        title,
        abstract,
        limit
      }
    });
    return res.data;
  },
  getHealth: async () => {
    const res = await api.get('/graph/health');
    return res.data;
  }
};

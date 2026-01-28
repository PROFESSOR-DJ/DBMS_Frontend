import React, { useState, useEffect } from 'react';
import { paperApi } from '../api/authApi';
import PaperCard from '../components/PaperCard';
import SearchBar from '../components/SearchBar';
import { FaFilter, FaSort } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Papers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    year: '',
    journal: '',
    author: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if there's a search query in URL
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
      setSearchQuery(q);
      handleSearch(q);
    } else {
      fetchPapers();
    }
  }, [page, filters]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      // Fetch from MySQL database
      const data = await paperApi.getAllPapers(page, 50, 'mysql');
      
      setPapers(data.papers || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
      
    } catch (error) {
      console.error('Failed to fetch papers:', error);
      toast.error('Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setLoading(true);
    setSearchQuery(query);
    try {
      const data = await paperApi.searchPapers(query, {
        source: 'mysql',
        ...filters
      });
      setPapers(data.papers || []);
      setTotal(data.count || 0);
      setPage(1);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      year: '',
      journal: '',
      author: '',
    });
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Papers</h1>
          <p className="text-gray-600">
            Browse and search through {total.toLocaleString()} research papers (MySQL Database)
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          <SearchBar onSearch={handleSearch} />
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center">
              <FaFilter className="mr-2 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <input
              type="number"
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              placeholder="Year"
              className="input-field w-32"
            />

            <input
              type="text"
              value={filters.journal}
              onChange={(e) => handleFilterChange('journal', e.target.value)}
              placeholder="Journal name"
              className="input-field w-48"
            />

            <input
              type="text"
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
              placeholder="Author name"
              className="input-field w-48"
            />

            {(filters.year || filters.journal || filters.author || searchQuery) && (
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {searchQuery && <span>Search results for "<strong>{searchQuery}</strong>" - </span>}
            Showing <span className="font-medium">{papers.length}</span> of{' '}
            <span className="font-medium">{total.toLocaleString()}</span> papers
          </p>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Page {page} of {totalPages}</span>
          </div>
        </div>

        {/* Papers Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading papers...</p>
            </div>
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No papers found</p>
            <button onClick={clearFilters} className="mt-4 btn-primary">
              Clear filters and show all papers
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {papers.map(paper => (
                <PaperCard key={paper.paper_id} paper={paper} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {/* Show page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Papers;
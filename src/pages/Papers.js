import React, { useState, useEffect } from 'react';
import { paperApi } from '../api/authApi';
import PaperCard from '../components/PaperCard';
import { 
  FaFilter, 
  FaSort, 
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaNewspaper,
  FaUser,
  FaQuoteRight
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Papers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Advanced filters
  const [filters, setFilters] = useState({
    yearFrom: '',
    yearTo: '',
    journal: '',
    author: '',
    minCitations: '',
    source: 'mysql',
    sortBy: 'recent'
  });

  // Filter panel states
  const [expandedSections, setExpandedSections] = useState({
    year: true,
    journal: false,
    author: false,
    citations: false,
    source: false
  });

  const [showFilters, setShowFilters] = useState(true);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Available filter options (would normally come from API)
  const [filterOptions, setFilterOptions] = useState({
    journals: [],
    years: Array.from({ length: 20 }, (_, i) => 2024 - i),
    sources: ['MySQL', 'MongoDB']
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
      setSearchQuery(q);
      handleSearch(q);
    } else {
      fetchPapers();
    }
  }, [page, filters.sortBy]);

  useEffect(() => {
    // Count active filters
    const count = Object.entries(filters).filter(([key, value]) => 
      value && key !== 'source' && key !== 'sortBy'
    ).length;
    setActiveFiltersCount(count);
  }, [filters]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const data = await paperApi.getAllPapers(page, 20, filters.source.toLowerCase());
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

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      fetchPapers();
      return;
    }

    setLoading(true);
    try {
      const searchFilters = {
        source: filters.source.toLowerCase(),
        ...(filters.yearFrom && { yearFrom: filters.yearFrom }),
        ...(filters.yearTo && { yearTo: filters.yearTo }),
        ...(filters.journal && { journal: filters.journal }),
        ...(filters.author && { author: filters.author }),
      };

      const data = await paperApi.searchPapers(query, searchFilters);
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
  };

  const applyFilters = () => {
    setPage(1);
    if (searchQuery) {
      handleSearch();
    } else {
      fetchPapers();
    }
  };

  const clearAllFilters = () => {
    setFilters({
      yearFrom: '',
      yearTo: '',
      journal: '',
      author: '',
      minCitations: '',
      source: 'mysql',
      sortBy: 'recent'
    });
    setSearchQuery('');
    setPage(1);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const removeFilter = (filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: ''
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Search */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Research Papers</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by title, author, keyword, or abstract..."
              className="w-full px-4 py-3 pl-12 pr-24 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-4 top-4 text-gray-400 text-xl" />
            <button
              onClick={() => handleSearch()}
              className="absolute right-2 top-2 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors font-medium"
            >
              Search
            </button>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              {filters.yearFrom && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Year from: {filters.yearFrom}
                  <button
                    onClick={() => removeFilter('yearFrom')}
                    className="ml-2 hover:text-primary-900"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}
              {filters.yearTo && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Year to: {filters.yearTo}
                  <button
                    onClick={() => removeFilter('yearTo')}
                    className="ml-2 hover:text-primary-900"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}
              {filters.journal && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Journal: {filters.journal}
                  <button
                    onClick={() => removeFilter('journal')}
                    className="ml-2 hover:text-primary-900"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}
              {filters.author && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Author: {filters.author}
                  <button
                    onClick={() => removeFilter('author')}
                    className="ml-2 hover:text-primary-900"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count and Sort */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-gray-700">
              <span className="font-semibold">{total.toLocaleString()}</span> results found
              {searchQuery && <span> for "<strong>{searchQuery}</strong>"</span>}
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800"
            >
              <FaFilter />
              {showFilters ? 'Hide' : 'Show'} Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <FaSort className="text-gray-500" />
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="recent">Most Recent</option>
              <option value="citations">Most Cited</option>
              <option value="title">Title A-Z</option>
              <option value="relevance">Relevance</option>
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center justify-between">
                    <span>Refine Results</span>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-primary-600 hover:text-primary-800"
                      >
                        Clear all
                      </button>
                    )}
                  </h3>
                </div>

                <div className="divide-y divide-gray-200">
                  {/* Publication Year */}
                  <div className="p-4">
                    <button
                      onClick={() => toggleSection('year')}
                      className="w-full flex items-center justify-between mb-3"
                    >
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-500" size={14} />
                        Publication Year
                      </span>
                      {expandedSections.year ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                    </button>
                    
                    {expandedSections.year && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">From</label>
                          <select
                            value={filters.yearFrom}
                            onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="">Any year</option>
                            {filterOptions.years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">To</label>
                          <select
                            value={filters.yearTo}
                            onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="">Any year</option>
                            {filterOptions.years.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={applyFilters}
                          className="w-full bg-primary-600 text-white px-3 py-1.5 rounded text-sm hover:bg-primary-700"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Journal */}
                  <div className="p-4">
                    <button
                      onClick={() => toggleSection('journal')}
                      className="w-full flex items-center justify-between mb-3"
                    >
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <FaNewspaper className="text-gray-500" size={14} />
                        Journal
                      </span>
                      {expandedSections.journal ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                    </button>
                    
                    {expandedSections.journal && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={filters.journal}
                          onChange={(e) => handleFilterChange('journal', e.target.value)}
                          placeholder="Enter journal name"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={applyFilters}
                          className="w-full bg-primary-600 text-white px-3 py-1.5 rounded text-sm hover:bg-primary-700"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Author */}
                  <div className="p-4">
                    <button
                      onClick={() => toggleSection('author')}
                      className="w-full flex items-center justify-between mb-3"
                    >
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <FaUser className="text-gray-500" size={14} />
                        Author
                      </span>
                      {expandedSections.author ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                    </button>
                    
                    {expandedSections.author && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={filters.author}
                          onChange={(e) => handleFilterChange('author', e.target.value)}
                          placeholder="Enter author name"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={applyFilters}
                          className="w-full bg-primary-600 text-white px-3 py-1.5 rounded text-sm hover:bg-primary-700"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Citations */}
                  <div className="p-4">
                    <button
                      onClick={() => toggleSection('citations')}
                      className="w-full flex items-center justify-between mb-3"
                    >
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <FaQuoteRight className="text-gray-500" size={14} />
                        Citations
                      </span>
                      {expandedSections.citations ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                    </button>
                    
                    {expandedSections.citations && (
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={filters.minCitations}
                          onChange={(e) => handleFilterChange('minCitations', e.target.value)}
                          placeholder="Minimum citations"
                          min="0"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={applyFilters}
                          className="w-full bg-primary-600 text-white px-3 py-1.5 rounded text-sm hover:bg-primary-700"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Data Source */}
                  <div className="p-4">
                    <button
                      onClick={() => toggleSection('source')}
                      className="w-full flex items-center justify-between mb-3"
                    >
                      <span className="font-medium text-gray-900">Data Source</span>
                      {expandedSections.source ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                    </button>
                    
                    {expandedSections.source && (
                      <div className="space-y-2">
                        {filterOptions.sources.map(source => (
                          <label key={source} className="flex items-center">
                            <input
                              type="radio"
                              name="source"
                              value={source}
                              checked={filters.source.toLowerCase() === source.toLowerCase()}
                              onChange={(e) => handleFilterChange('source', e.target.value)}
                              className="mr-2"
                            />
                            <span className="text-sm">{source}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Area */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading papers...</p>
                </div>
              </div>
            ) : papers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">No papers found</p>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <button onClick={clearAllFilters} className="btn-primary">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {papers.map(paper => (
                    <div key={paper.paper_id || paper._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <PaperCard paper={paper} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
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
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Papers;
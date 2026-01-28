import React, { useState, useEffect } from 'react';
import { paperApi } from '../api/authApi';
import PaperCard from '../components/PaperCard';
import SearchBar from '../components/SearchBar';
import { FaFilter, FaSort } from 'react-icons/fa';

const Papers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    year: '',
    journal: '',
    sort: 'recent',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPapers();
  }, [page, filters]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockPapers = Array.from({ length: 12 }, (_, i) => ({
        _id: i + 1,
        title: `Research Paper on Database Management System ${i + 1}`,
        authors: ['John Smith', 'Jane Doe', 'Robert Johnson'],
        journal: ['Nature', 'Science', 'IEEE'][i % 3],
        year: 2020 + (i % 5),
        abstract: 'This paper discusses advanced database management systems and their applications in modern research data management...',
        citation_count: Math.floor(Math.random() * 100),
        doi: `10.1000/xyz${i}`,
      }));

      setPapers(mockPapers);
      setTotalPages(5);
      
      // Uncomment for real API:
      // const data = await paperApi.searchPapers('', filters);
      // setPapers(data.papers);
      // setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setLoading(true);
    try {
      const data = await paperApi.searchPapers(query, filters);
      setPapers(data.papers);
      setPage(1);
    } catch (error) {
      console.error('Search failed:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Papers</h1>
          <p className="text-gray-600">
            Browse and search through our comprehensive database of research papers
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
            
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="input-field w-40"
            >
              <option value="">All Years</option>
              {[2024, 2023, 2022, 2021, 2020].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filters.journal}
              onChange={(e) => handleFilterChange('journal', e.target.value)}
              className="input-field w-48"
            >
              <option value="">All Journals</option>
              <option value="Nature">Nature</option>
              <option value="Science">Science</option>
              <option value="IEEE">IEEE</option>
              <option value="Elsevier">Elsevier</option>
            </select>

            <div className="flex items-center ml-auto">
              <FaSort className="mr-2 text-gray-500" />
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="input-field w-40"
              >
                <option value="recent">Most Recent</option>
                <option value="citations">Most Cited</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-medium">{papers.length}</span> papers
          </p>
        </div>

        {/* Papers Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading papers...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {papers.map(paper => (
                <PaperCard key={paper._id} paper={paper} />
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
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (page > 3) {
                    pageNum = page - 3 + i;
                  }
                  if (pageNum > totalPages) return null;
                  
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
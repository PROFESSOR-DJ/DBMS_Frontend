import React, { useState, useEffect } from 'react';
import { paperApi } from '../api/authApi';
import { FaUser, FaSort, FaSearch, FaDatabase } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('papers');
  const [filteredAuthors, setFilteredAuthors] = useState([]);

  useEffect(() => {
    fetchAuthors();
  }, [sortBy]);

  useEffect(() => {
    // Filter authors based on search term
    if (searchTerm) {
      const filtered = authors.filter(author =>
        (author.name || author.author || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAuthors(filtered);
    } else {
      setFilteredAuthors(authors);
    }
  }, [searchTerm, authors]);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      // Backend automatically uses MySQL for author relationships (OPTIMIZED)
      const data = await paperApi.getAuthorStats(100);
      
      // Transform the data
      let authorsList = data.authors || [];
      
      // Sort the data
      authorsList = authorsList.sort((a, b) => {
        const countA = a.paper_count || a.count || 0;
        const countB = b.paper_count || b.count || 0;
        const nameA = a.name || a.author || '';
        const nameB = b.name || b.author || '';
        
        if (sortBy === 'papers') return countB - countA;
        if (sortBy === 'name') return nameA.localeCompare(nameB);
        return 0;
      });

      setAuthors(authorsList);
      setFilteredAuthors(authorsList);
      
    } catch (error) {
      console.error('Failed to fetch authors:', error);
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Author Analytics</h1>
          <p className="text-gray-600 flex items-center">
            <FaDatabase className="mr-2 text-blue-600" />
            Database insights: Top authors and their research contributions (MySQL)
          </p>
        </div>

        {/* Search and Sort */}
        <div className="mb-8 space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search authors by name..."
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaUser className="mr-2 text-gray-500" />
              <span className="text-sm font-medium">
                Showing {filteredAuthors.length} authors
              </span>
            </div>
            <div className="flex items-center">
              <FaSort className="mr-2 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field w-40"
              >
                <option value="papers">Most Papers</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Authors Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading authors...</p>
            </div>
          </div>
        ) : filteredAuthors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No authors found</p>
          </div>
        ) : (
          <div className="card overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Papers Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAuthors.map((author, index) => (
                    <tr key={author.author_id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-100 rounded-full">
                            <FaUser className="text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {author.name || author.author || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {author.paper_count || author.count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {author.author_id || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaDatabase className="mr-2 text-blue-600" />
              Database Query Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Database Used</p>
                <p className="text-sm font-medium text-blue-600">MySQL (Optimized)</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Query Type</p>
                <p className="text-sm font-mono">LEFT JOIN + GROUP BY</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Optimization</p>
                <p className="text-sm">Heuristic: GROUP BY before JOIN</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">SQL Query</p>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono overflow-x-auto">
                  {`SELECT a.name, COUNT(pa.paper_id) as paper_count
FROM author a
LEFT JOIN paper_author pa ON a.author_id = pa.author_id
GROUP BY a.author_id
ORDER BY paper_count DESC`}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Author Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Unique Authors</span>
                <span className="font-medium">{authors.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Papers/Author</span>
                <span className="font-medium">
                  {authors.length > 0 
                    ? (authors.reduce((sum, a) => sum + (a.paper_count || a.count || 0), 0) / authors.length).toFixed(1)
                    : 0
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Most Prolific</span>
                <span className="font-medium text-sm truncate max-w-[150px]">
                  {authors[0]?.name || authors[0]?.author || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Top Author Papers</span>
                <span className="font-medium">
                  {authors[0]?.paper_count || authors[0]?.count || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Why MySQL?</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Normalized Schema</p>
                <p className="text-xs text-blue-700">Many-to-many relationships through paper_author table</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-1">Referential Integrity</p>
                <p className="text-xs text-green-700">Foreign keys ensure data consistency</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-1">Query Optimization</p>
                <p className="text-xs text-purple-700">JOIN operations optimized with indexes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authors;
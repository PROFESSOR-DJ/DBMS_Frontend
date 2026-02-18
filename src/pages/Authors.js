import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { paperApi, authorApi } from '../api/authApi';
import { FaUser, FaSort, FaSearch, FaDatabase, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Authors = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('papers');

  // Fetch data (Top 100 OR Search Results)
  const fetchAuthors = async () => {
    setLoading(true);
    try {
      let data;
      if (searchTerm.trim()) {
        // Server-side search
        data = await authorApi.searchAuthors(searchTerm);
      } else {
        // Default: Top 100 authors
        data = await paperApi.getAuthorStats(100);
      }
      setAuthors(data.authors || []);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAuthors();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Client-side Sort (Derived State)
  const sortedAuthors = useMemo(() => {
    return [...authors].sort((a, b) => {
      const countA = a.paper_count || a.count || 0;
      const countB = b.paper_count || b.count || 0;
      const nameA = a.name || a.author_name || a.author || '';
      const nameB = b.name || b.author_name || b.author || '';

      if (sortBy === 'papers') return countB - countA;
      if (sortBy === 'name') return nameA.localeCompare(nameB);
      return 0;
    });
  }, [authors, sortBy]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      try {
        await authorApi.deleteAuthor(id);
        toast.success('Author deleted');
        fetchAuthors(); // Refresh current view
      } catch (error) {
        console.error('Delete author failed', error);
        toast.error('Failed to delete author (check if papers exist)');
      }
    }
  };

  const handleEdit = (author) => {
    navigate(`/authors/edit/${author.author_id}`);
  };

  const handleCreate = () => {
    navigate('/authors/new');
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
          <button onClick={handleCreate} className="mt-4 bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700">
            <FaPlus /> Add Author
          </button>
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
              placeholder="Search authors in database..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaUser className="mr-2 text-gray-500" />
              <span className="text-sm font-medium">
                Showing {sortedAuthors.length} authors {searchTerm && '(Search Results)'}
              </span>
            </div>
            <div className="flex items-center">
              <FaSort className="mr-2 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
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
        ) : sortedAuthors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600 text-lg">No authors found matching "{searchTerm}"</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-primary-600 hover:text-primary-800 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAuthors.map((author, index) => (
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
                              {author.name || author.author_name || author.author || 'Unknown'}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEdit(author)} className="text-blue-600 hover:text-blue-900 mr-3">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(author.author_id)} className="text-red-600 hover:text-red-900">
                          <FaTrash />
                        </button>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaDatabase className="mr-2 text-blue-600" />
              Database Query Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Query Mode</p>
                <p className="text-sm font-medium text-blue-600">
                  {searchTerm ? 'Server-Side Search (Indexed)' : 'Top Authors Aggregation'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">SQL Query</p>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono overflow-x-auto">
                  {searchTerm ?
                    `SELECT a.*, COUNT(pa.paper_id) ... WHERE name LIKE %${searchTerm}%` :
                    `SELECT a.name, COUNT(pa.paper_id) ... ORDER BY count DESC LIMIT 100`
                  }
                </div>
              </div>
            </div>
          </div>

          {/* ... Other cards can remain static or basic ... */}
        </div>
      </div>
    </div>
  );
};

export default Authors;
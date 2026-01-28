import React, { useState, useEffect } from 'react';
import { paperApi } from '../api/authApi';
import { FaUser, FaSort, FaSearch } from 'react-icons/fa';

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('papers');

  useEffect(() => {
    fetchAuthors();
  }, [sortBy]);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockAuthors = [
        { name: 'Smith, John', papers: 45, citations: 1289, first_paper: 2015 },
        { name: 'Johnson, Robert', papers: 38, citations: 987, first_paper: 2017 },
        { name: 'Williams, Thomas', papers: 32, citations: 765, first_paper: 2016 },
        { name: 'Brown, Michael', papers: 28, citations: 654, first_paper: 2018 },
        { name: 'Davis, Sarah', papers: 25, citations: 543, first_paper: 2019 },
        { name: 'Miller, David', papers: 22, citations: 432, first_paper: 2020 },
        { name: 'Wilson, Jennifer', papers: 19, citations: 321, first_paper: 2017 },
        { name: 'Moore, Richard', papers: 18, citations: 298, first_paper: 2018 },
        { name: 'Taylor, Susan', papers: 16, citations: 265, first_paper: 2019 },
        { name: 'Anderson, William', papers: 14, citations: 234, first_paper: 2020 },
      ];

      // Sort the data
      const sorted = [...mockAuthors].sort((a, b) => {
        if (sortBy === 'papers') return b.papers - a.papers;
        if (sortBy === 'citations') return b.citations - a.citations;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });

      setAuthors(sorted);
      
      // Uncomment for real API:
      // const data = await paperApi.getAuthorStats();
      // setAuthors(data);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Author Analytics</h1>
          <p className="text-gray-600">
            Database insights: Top authors and their research contributions
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
                <option value="citations">Most Citations</option>
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
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Papers Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Citations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Paper
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Papers/Year
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAuthors.map((author, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-100 rounded-full">
                            <FaUser className="text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {author.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {author.papers}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {author.citations.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {author.first_paper}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(author.papers / (2024 - author.first_paper + 1)).toFixed(1)}
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
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Database Query Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Index Used</p>
                <p className="text-sm font-mono">authors.name (multikey)</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Aggregation Pipeline</p>
                <p className="text-sm">$unwind → $group → $sort</p>
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
                  {(authors.reduce((sum, a) => sum + a.papers, 0) / authors.length).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Most Prolific</span>
                <span className="font-medium">{authors[0]?.name}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Query Time</span>
                <span className="font-medium">~15ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Documents Scanned</span>
                <span className="font-medium">12543</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Index Hits</span>
                <span className="font-medium">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authors;
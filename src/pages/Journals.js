import React, { useState, useEffect } from 'react';
import { paperApi } from '../api/authApi';
import { FaNewspaper, FaChartBar, FaSort } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Journals = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('count');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchJournals();
  }, [sortBy]);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockJournals = [
        { name: 'Nature', count: 1256, impact_factor: 42.8, first_year: 2015 },
        { name: 'Science', count: 987, impact_factor: 41.8, first_year: 2016 },
        { name: 'Cell', count: 765, impact_factor: 38.6, first_year: 2015 },
        { name: 'PNAS', count: 543, impact_factor: 9.4, first_year: 2017 },
        { name: 'IEEE Transactions', count: 432, impact_factor: 8.9, first_year: 2018 },
        { name: 'Elsevier', count: 398, impact_factor: 7.2, first_year: 2019 },
        { name: 'Springer', count: 356, impact_factor: 6.8, first_year: 2017 },
        { name: 'Wiley', count: 287, impact_factor: 5.9, first_year: 2018 },
        { name: 'ACM', count: 234, impact_factor: 5.2, first_year: 2019 },
        { name: 'arXiv', count: 198, impact_factor: 4.8, first_year: 2020 },
      ];

      // Sort the data
      const sorted = [...mockJournals].sort((a, b) => {
        if (sortBy === 'count') return b.count - a.count;
        if (sortBy === 'impact') return b.impact_factor - a.impact_factor;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });

      setJournals(sorted);
      setChartData(sorted.slice(0, 8).map(j => ({ 
        name: j.name, 
        papers: j.count,
        impact: j.impact_factor 
      })));
      
      // Uncomment for real API:
      // const data = await paperApi.getJournalStats();
      // setJournals(data);
    } catch (error) {
      console.error('Failed to fetch journals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Journal Analytics</h1>
          <p className="text-gray-600">
            Publication venues and their contributions to the research database
          </p>
        </div>

        {/* Sort Controls */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaNewspaper className="mr-2 text-gray-500" />
              <span className="text-sm font-medium">
                Journals in Database: {journals.length}
              </span>
            </div>
            <div className="flex items-center">
              <FaSort className="mr-2 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field w-40"
              >
                <option value="count">Most Papers</option>
                <option value="impact">Highest Impact</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="card mb-8">
          <div className="flex items-center mb-6">
            <FaChartBar className="mr-2 text-gray-500" />
            <h3 className="text-lg font-semibold">Top Journals by Publication Count</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="papers" fill="#3b82f6" name="Papers Published" />
                <Bar dataKey="impact" fill="#10b981" name="Impact Factor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Journals Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading journals...</p>
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Journal Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Papers in DB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impact Factor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Year in DB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Papers/Year
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {journals.map((journal, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {journal.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {journal.count.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {journal.impact_factor.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {journal.first_year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(journal.count / (2024 - journal.first_year + 1)).toFixed(1)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Database Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Database Performance</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Index Strategy</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <code className="text-sm text-gray-700">
                    {`db.papers.createIndex({ "journal": 1 })`}
                  </code>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Aggregation Query</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <code className="text-sm text-gray-700">
                    {`db.papers.aggregate([
  { "$group": { "_id": "$journal", "count": { "$sum": 1 } } }
])`}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Journal Coverage</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Journals</span>
                <span className="font-medium">{journals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Papers</span>
                <span className="font-medium">
                  {journals.reduce((sum, j) => sum + j.count, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Papers/Journal</span>
                <span className="font-medium">
                  {Math.round(journals.reduce((sum, j) => sum + j.count, 0) / journals.length)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Query Execution Time</span>
                <span className="font-medium">~8ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journals;
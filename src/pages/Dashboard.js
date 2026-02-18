import React, { useState, useEffect } from 'react';
import { paperApi, statsApi } from '../api/authApi';
import StatCard from '../components/StatCard';
import {
  PapersPerYearChart,
  TopJournalsChart,
  AuthorPublicationsChart
} from '../components/Charts';
import SearchBar from '../components/SearchBar';
import {
  FaSearch,
  FaChartLine,
  FaDatabase
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPapers: 0,
    uniqueAuthors: 0,
    totalJournals: 0,
    papersPerYear: [],
    topJournals: [],
    topAuthors: [],
    dataSources: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch actual data from backend (HYBRID/MySQL approach)
      const overview = await statsApi.getOverview();
      const data = overview; // statsApi.getOverview likely returns the same structure as paperApi.getDashboardStats did/would

      // Transform the data to match the expected format
      const transformedStats = {
        totalPapers: data.database_overview?.mysql?.total_papers || 0,
        uniqueAuthors: data.database_overview?.mysql?.total_authors || 0,
        totalJournals: data.database_overview?.mongodb?.unique_journals || 0, // Fallback to Mongo stats if populated
        // ... rest stays same if property names match
        papersPerYear: data.analytics?.papers_per_year?.map(item => ({
          year: item.publish_year, // MySQL returns publish_year
          count: item.count
        })) || [],
        topJournals: data.analytics?.top_journals?.map(item => ({
          name: item.journal, // MySQL returns journal
          value: item.count
        })).slice(0, 5) || [],
        topAuthors: data.analytics?.top_authors?.map(item => ({
          author: item.name, // MySQL returns name
          papers: item.paper_count // MySQL returns paper_count
        })).slice(0, 5) || [],
        dataSources: {
          mysql: data.database_overview?.mysql?.role || 'SQL Database',
          mongodb: data.database_overview?.mongodb?.role || 'MongoDB Database'
        }
      };

      setStats(transformedStats);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Navigate to papers page with search query
    window.location.href = `/papers?q=${encodeURIComponent(query)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">
            Hybrid Database Architecture: MySQL for relationships, MongoDB for search & analytics
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FaSearch className="mr-2 text-gray-500" />
            <h2 className="text-lg font-semibold">Quick Search</h2>
          </div>
          <SearchBar onSearch={handleSearch} placeholder="Search papers by title, author, or keyword..." />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Papers"
            value={stats.totalPapers}
            type="papers"
          />
          <StatCard
            title="Unique Authors"
            value={stats.uniqueAuthors}
            type="authors"
          />
          <StatCard
            title="Journals"
            value={stats.totalJournals}
            type="journals"
          />
          <StatCard
            title="Years Covered"
            value={stats.papersPerYear.length}
            type="years"
          />
        </div>

        {/* Charts Section */}
        {stats.papersPerYear.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <PapersPerYearChart data={stats.papersPerYear} />
            {stats.topJournals.length > 0 && (
              <TopJournalsChart data={stats.topJournals} />
            )}
          </div>
        )}

        {/* Top Authors Section */}
        {stats.topAuthors.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <FaChartLine className="mr-2 text-gray-500" />
              <h2 className="text-lg font-semibold">Top Publishing Authors</h2>
            </div>
            <AuthorPublicationsChart data={stats.topAuthors} />
          </div>
        )}

        {/* Database Architecture Information */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FaDatabase className="mr-2 text-gray-500" />
            <h2 className="text-lg font-semibold">Hybrid Database Architecture</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MySQL Card */}
            <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg mr-3">
                  <FaDatabase className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">MySQL Database</h3>
                  <p className="text-sm text-gray-600">Core Transactional Data</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Purpose</span>
                  <span className="text-sm font-medium text-gray-900">Normalized Relationships</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strengths</span>
                  <span className="text-sm font-medium text-gray-900">ACID, Constraints</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Used For</span>
                  <span className="text-sm font-medium text-gray-900">Users, Author-Paper Links</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Total Papers</span>
                  <span className="text-lg font-bold text-blue-600">{stats.totalPapers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Authors</span>
                  <span className="text-lg font-bold text-blue-600">{stats.uniqueAuthors.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* MongoDB Card */}
            <div className="card bg-gradient-to-br from-green-50 to-white border-green-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg mr-3">
                  <FaDatabase className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">MongoDB Database</h3>
                  <p className="text-sm text-gray-600">Search & Analytics Engine</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Purpose</span>
                  <span className="text-sm font-medium text-gray-900">Full-Text Search</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strengths</span>
                  <span className="text-sm font-medium text-gray-900">Flexible, Scalable</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Used For</span>
                  <span className="text-sm font-medium text-gray-900">Metadata, Aggregations</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Unique Journals</span>
                  <span className="text-lg font-bold text-green-600">{stats.totalJournals.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Indexed Fields</span>
                  <span className="text-sm font-medium text-gray-900">Title, Abstract, Year</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions and Database Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/papers'}
                className="w-full btn-secondary text-left p-3 flex items-center justify-between hover:bg-primary-50 transition-colors"
              >
                <span>Browse All Papers</span>
                <span className="text-sm text-gray-500">MongoDB</span>
              </button>
              <button
                onClick={() => window.location.href = '/authors'}
                className="w-full btn-secondary text-left p-3 flex items-center justify-between hover:bg-primary-50 transition-colors"
              >
                <span>View Author Statistics</span>
                <span className="text-sm text-gray-500">MySQL</span>
              </button>
              <button
                onClick={() => window.location.href = '/journals'}
                className="w-full btn-secondary text-left p-3 flex items-center justify-between hover:bg-primary-50 transition-colors"
              >
                <span>Explore Journals</span>
                <span className="text-sm text-gray-500">MongoDB</span>
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Polyglot Persistence</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">MySQL Queries</p>
                <p className="text-xs text-blue-700">Optimized with heuristic: GROUP BY before JOIN</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-1">MongoDB Queries</p>
                <p className="text-xs text-green-700">Aggregation pipelines with compound indexes</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-1">Hybrid Approach</p>
                <p className="text-xs text-purple-700">Right database for the right job</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
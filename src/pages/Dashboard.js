import React, { useState, useEffect } from 'react';
import { paperApi } from '../api/authApi';
import StatCard from '../components/StatCard';
import { 
  PapersPerYearChart, 
  TopJournalsChart, 
  AuthorPublicationsChart 
} from '../components/Charts';
import SearchBar from '../components/SearchBar';
import { 
  FaSearch,
  FaChartLine
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPapers: 0,
    uniqueAuthors: 0,
    totalJournals: 0,
    papersPerYear: [],
    topJournals: [],
    topAuthors: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch actual data from backend
      const data = await paperApi.getDashboardStats();
      
      // Transform the data to match the expected format
      const transformedStats = {
        totalPapers: data.database_overview?.mysql?.total_papers || 0,
        uniqueAuthors: data.database_overview?.mysql?.total_authors || 0,
        totalJournals: data.database_overview?.mongodb?.unique_journals || 0,
        papersPerYear: data.analytics?.papers_per_year?.map(item => ({
          year: item._id,
          count: item.count
        })) || [],
        topJournals: data.analytics?.top_journals?.map(item => ({
          name: item.journal || item._id,
          value: item.count
        })).slice(0, 5) || [],
        topAuthors: data.analytics?.top_authors?.map(item => ({
          author: item.author || item._id,
          papers: item.count
        })).slice(0, 5) || []
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
            Analytics and insights from the research papers database (MySQL)
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

        {/* Recent Activity / Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Database Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database Type</span>
                <span className="font-medium">MySQL 8.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Records</span>
                <span className="font-medium">{stats.totalPapers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tables</span>
                <span className="font-medium">paper, author, paper_author, users</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Indexed Fields</span>
                <span className="font-medium">Primary Keys + Foreign Keys</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/papers'}
                className="w-full btn-secondary text-left p-3"
              >
                Browse All Papers
              </button>
              <button 
                onClick={() => window.location.href = '/authors'}
                className="w-full btn-secondary text-left p-3"
              >
                View Author Statistics
              </button>
              <button 
                onClick={() => window.location.href = '/journals'}
                className="w-full btn-secondary text-left p-3"
              >
                Explore Journals
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
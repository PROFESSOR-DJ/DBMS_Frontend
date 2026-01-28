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
  FaFileAlt, 
  FaUsers, 
  FaNewspaper, 
  FaCalendarAlt,
  FaSearch,
  FaChartLine
} from 'react-icons/fa';

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
      // Mock data for demonstration - replace with actual API call
      const mockData = {
        totalPapers: 12543,
        uniqueAuthors: 8921,
        totalJournals: 342,
        papersPerYear: [
          { year: 2019, count: 856 },
          { year: 2020, count: 1243 },
          { year: 2021, count: 1876 },
          { year: 2022, count: 2456 },
          { year: 2023, count: 2987 },
          { year: 2024, count: 3125 },
        ],
        topJournals: [
          { name: 'Nature', value: 1256 },
          { name: 'Science', value: 987 },
          { name: 'Cell', value: 765 },
          { name: 'PNAS', value: 543 },
          { name: 'Elsevier', value: 432 },
        ],
        topAuthors: [
          { author: 'Smith, J.', papers: 45 },
          { author: 'Johnson, R.', papers: 38 },
          { author: 'Williams, T.', papers: 32 },
          { author: 'Brown, M.', papers: 28 },
          { author: 'Davis, S.', papers: 25 },
        ]
      };
      
      // Uncomment for real API call:
      // const data = await paperApi.getDashboardStats();
      // setStats(data);
      
      setStats(mockData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // In a real app, this would trigger navigation to search page
    console.log('Searching for:', query);
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
            Analytics and insights from the research papers database
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
            change={12.5}
          />
          <StatCard 
            title="Unique Authors" 
            value={stats.uniqueAuthors} 
            type="authors"
            change={8.3}
          />
          <StatCard 
            title="Journals" 
            value={stats.totalJournals} 
            type="journals"
            change={5.2}
          />
          <StatCard 
            title="Years Covered" 
            value={stats.papersPerYear.length} 
            type="years"
            change={0}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <PapersPerYearChart data={stats.papersPerYear} />
          <TopJournalsChart data={stats.topJournals} />
        </div>

        {/* Top Authors Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FaChartLine className="mr-2 text-gray-500" />
            <h2 className="text-lg font-semibold">Top Publishing Authors</h2>
          </div>
          <AuthorPublicationsChart data={stats.topAuthors} />
        </div>

        {/* Recent Activity / Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Database Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database Size</span>
                <span className="font-medium">~450 MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">2024-01-15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Indexed Fields</span>
                <span className="font-medium">15</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-secondary text-left p-3">
                Export Analytics Data
              </button>
              <button className="w-full btn-secondary text-left p-3">
                View Database Schema
              </button>
              <button className="w-full btn-secondary text-left p-3">
                Query Performance Metrics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
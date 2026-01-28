import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaUser, FaChartBar, FaSignOutAlt, FaHome } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-primary-700">
                Research<span className="text-primary-500">DB</span>
              </Link>
            </div>
            
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'text-primary-600 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaHome className="mr-2" /> Dashboard
                </Link>
                <Link
                  to="/papers"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive('/papers')
                      ? 'text-primary-600 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaSearch className="mr-2" /> Papers
                </Link>
                <Link
                  to="/authors"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive('/authors')
                      ? 'text-primary-600 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaUser className="mr-2" /> Authors
                </Link>
                <Link
                  to="/journals"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive('/journals')
                      ? 'text-primary-600 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaChartBar className="mr-2" /> Journals
                </Link>
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="text-gray-600 hover:text-primary-600 flex items-center"
              >
                <FaUser className="mr-2" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-primary-600">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
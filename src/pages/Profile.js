import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaEdit, 
  FaSave,
  FaTimes
} from 'react-icons/fa';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: user?.email || 'john.doe@example.com',
    joined: '2023-05-15',
    lastLogin: '2024-01-15 14:30:00',
  });
  const [formData, setFormData] = useState({ ...profile });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      // const data = await authApi.getProfile();
      // setProfile(data);
      // setFormData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      // Cancel editing
      setFormData({ ...profile });
    }
    setEditing(!editing);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Mock update - replace with actual API call
      // await authApi.updateProfile(formData);
      setProfile({ ...formData });
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && !profile.name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaUser className="mr-2" />
                  Personal Information
                </h2>
                <button
                  onClick={handleEditToggle}
                  className="btn-secondary flex items-center"
                >
                  {editing ? (
                    <>
                      <FaTimes className="mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <FaEdit className="mr-2" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    {editing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-400" />
                      <p className="text-gray-900">
                        {new Date(profile.joined).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Login
                    </label>
                    <p className="text-gray-900">{profile.lastLogin}</p>
                  </div>
                </div>

                {editing && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="btn-primary flex items-center"
                    >
                      <FaSave className="mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Security */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Account Security</h2>
              <div className="space-y-4">
                <button className="w-full btn-secondary text-left p-4">
                  Change Password
                </button>
                <button className="w-full btn-secondary text-left p-4">
                  Two-Factor Authentication
                </button>
                <button className="w-full btn-secondary text-left p-4">
                  Login History
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* User Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Your Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Papers Viewed</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Searches Made</span>
                  <span className="font-medium">128</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saved Papers</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sessions</span>
                  <span className="font-medium">35</span>
                </div>
              </div>
            </div>

            {/* Database Info */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Database Access</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">User Role</p>
                  <p className="font-medium">Researcher</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Access Level</p>
                  <p className="font-medium">Full Read Access</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">API Queries</p>
                  <p className="font-medium">Unlimited</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <p className="font-medium text-green-600">Active</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
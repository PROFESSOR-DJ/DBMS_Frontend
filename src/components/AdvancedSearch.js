import React, { useState } from 'react';
import { FaSearch, FaTimes, FaInfoCircle } from 'react-icons/fa';

const AdvancedSearch = ({ onSearch, onClose }) => {
  const [searchMode, setSearchMode] = useState('all');
  const [fields, setFields] = useState({
    title: '',
    author: '',
    abstract: '',
    keywords: '',
    journal: '',
    yearFrom: '',
    yearTo: '',
    doi: ''
  });

  const handleFieldChange = (field, value) => {
    setFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    const query = buildQuery();
    onSearch(query, fields);
  };

  const buildQuery = () => {
    const parts = [];
    
    if (fields.title) parts.push(fields.title);
    if (fields.author) parts.push(fields.author);
    if (fields.abstract) parts.push(fields.abstract);
    if (fields.keywords) parts.push(fields.keywords);
    
    return parts.join(' ');
  };

  const clearAll = () => {
    setFields({
      title: '',
      author: '',
      abstract: '',
      keywords: '',
      journal: '',
      yearFrom: '',
      yearTo: '',
      doi: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Advanced Search</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Search Mode */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Search mode:</span>
            <label className="flex items-center">
              <input
                type="radio"
                name="searchMode"
                value="all"
                checked={searchMode === 'all'}
                onChange={(e) => setSearchMode(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Find all terms</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="searchMode"
                value="any"
                checked={searchMode === 'any'}
                onChange={(e) => setSearchMode(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Find any term</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="searchMode"
                value="exact"
                checked={searchMode === 'exact'}
                onChange={(e) => setSearchMode(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Exact phrase</span>
            </label>
          </div>
        </div>

        {/* Search Fields */}
        <div className="px-6 py-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={fields.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter title keywords"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author(s)
            </label>
            <input
              type="text"
              value={fields.author}
              onChange={(e) => handleFieldChange('author', e.target.value)}
              placeholder="Enter author name(s)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple authors with commas
            </p>
          </div>

          {/* Abstract/Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Abstract contains
              </label>
              <input
                type="text"
                value={fields.abstract}
                onChange={(e) => handleFieldChange('abstract', e.target.value)}
                placeholder="Keywords in abstract"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={fields.keywords}
                onChange={(e) => handleFieldChange('keywords', e.target.value)}
                placeholder="Subject keywords"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Journal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Journal/Conference
            </label>
            <input
              type="text"
              value={fields.journal}
              onChange={(e) => handleFieldChange('journal', e.target.value)}
              placeholder="Publication name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Year Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publication Year
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={fields.yearFrom}
                  onChange={(e) => handleFieldChange('yearFrom', e.target.value)}
                  placeholder="From year"
                  min="1900"
                  max="2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={fields.yearTo}
                  onChange={(e) => handleFieldChange('yearTo', e.target.value)}
                  placeholder="To year"
                  min="1900"
                  max="2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* DOI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DOI
            </label>
            <input
              type="text"
              value={fields.doi}
              onChange={(e) => handleFieldChange('doi', e.target.value)}
              placeholder="10.1000/xyz123"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Search Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start">
              <FaInfoCircle className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Search Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use quotation marks for exact phrases: "machine learning"</li>
                  <li>Use AND, OR, NOT for boolean searches</li>
                  <li>Use * as a wildcard: comput* finds computer, computing, etc.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <button
            onClick={clearAll}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear all fields
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
            >
              <FaSearch className="mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
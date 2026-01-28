import React from 'react';
import { FaFileAlt, FaUsers, FaNewspaper, FaCalendarAlt } from 'react-icons/fa';

const iconMap = {
  papers: FaFileAlt,
  authors: FaUsers,
  journals: FaNewspaper,
  years: FaCalendarAlt,
};

const StatCard = ({ title, value, type, change }) => {
  const Icon = iconMap[type] || FaFileAlt;
  
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          {change && (
            <p className={`text-sm mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-primary-50 text-primary-600`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const PapersPerYearChart = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Papers Published Per Year</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Papers" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const TopJournalsChart = ({ data }) => {
  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Top Journals</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const AuthorPublicationsChart = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Top Authors by Publications</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="author" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="papers" fill="#10b981" name="Publications" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
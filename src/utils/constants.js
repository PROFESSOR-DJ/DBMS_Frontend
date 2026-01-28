export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/papers', label: 'Papers', icon: 'papers' },
  { path: '/authors', label: 'Authors', icon: 'authors' },
  { path: '/journals', label: 'Journals', icon: 'journals' },
];

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'citations', label: 'Most Cited' },
  { value: 'title', label: 'Title A-Z' },
];

export const FILTER_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018];
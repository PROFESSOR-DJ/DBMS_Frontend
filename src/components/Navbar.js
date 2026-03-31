import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FaSearch, FaUser, FaChartBar, FaSignOutAlt, FaHome,
  FaDatabase, FaBars, FaTimes, FaSun, FaMoon, FaProjectDiagram
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { to: '/papers', icon: FaSearch, label: 'Papers'},
    { to: '/authors', icon: FaUser, label: 'Authors'},
    { to: '/journals', icon: FaChartBar, label: 'Journals'},
    { to: '/graph',     icon: FaProjectDiagram,  label: 'Network'},
  ];

  /* ── theme-aware values ── */
  const navBg = isDark
    ? (scrolled ? 'rgba(10,15,30,0.95)' : 'rgba(10,15,30,0.78)')
    : (scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.88)');
  const navBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const textActive = isDark ? '#22d3ee' : '#0891b2';
  const activeBg = isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.10)';
  const activeBorder = isDark ? 'rgba(6,182,212,0.35)' : 'rgba(6,182,212,0.4)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const hoverText = isDark ? '#f1f5f9' : '#0f172a';

  /* ── accent: cyan/teal ── */
  const accentGrad = 'linear-gradient(135deg, #06b6d4, #0ea5e9)';
  const accentGlow = 'rgba(6,182,212,0.5)';

  return (
    <nav
      style={{
        background: navBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${navBorder}`,
        boxShadow: scrolled
          ? `0 4px 30px rgba(0,0,0,0.3), 0 0 40px rgba(6,182,212,0.05)`
          : 'none',
        transition: 'all 0.3s ease',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ── Logo ── */}
          <Link to="/dashboard" className="flex items-center gap-2 group" style={{ textDecoration: 'none' }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: accentGrad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 16px ${accentGlow}`,
                transition: 'box-shadow 0.3s ease, transform 0.3s ease',
              }}
              className="group-hover:scale-110"
            >
              <FaDatabase style={{ color: 'white', fontSize: 16 }} />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              <span style={{
                background: accentGrad,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Research</span>
              <span style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>DB</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          {user && (
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.45rem 0.9rem', borderRadius: 10,
                    fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                    transition: 'all 0.25s ease',
                    background: isActive(to) ? activeBg : 'transparent',
                    color: isActive(to) ? textActive : textMuted,
                    border: isActive(to) ? `1px solid ${activeBorder}` : '1px solid transparent',
                    boxShadow: isActive(to) ? `0 0 12px rgba(6,182,212,0.2)` : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive(to)) {
                      e.currentTarget.style.background = hoverBg;
                      e.currentTarget.style.color = hoverText;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive(to)) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = textMuted;
                    }
                  }}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* ── Right Side ── */}
          <div className="flex items-center gap-2">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                width: 36, height: 36, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
                cursor: 'pointer',
                color: isDark ? '#fbbf24' : '#0891b2',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isDark ? 'rgba(251,191,36,0.15)' : 'rgba(8,145,178,0.10)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(251,191,36,0.35)' : 'rgba(8,145,178,0.35)';
                e.currentTarget.style.transform = 'rotate(20deg) scale(1.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
                e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
              }}
            >
              {isDark ? <FaSun size={15} /> : <FaMoon size={15} />}
            </button>

            {user ? (
              <>
                <Link
                  to="/profile"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.4rem 0.85rem', borderRadius: 10,
                    fontSize: '0.875rem', fontWeight: 500,
                    color: textMuted, textDecoration: 'none',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = hoverText;
                    e.currentTarget.style.background = hoverBg;
                    e.currentTarget.style.borderColor = activeBorder;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = textMuted;
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                  }}
                >
                  <FaUser size={12} />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.4rem 0.85rem', borderRadius: 10,
                    fontSize: '0.875rem', fontWeight: 500,
                    color: '#f87171',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    cursor: 'pointer', transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(239,68,68,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FaSignOutAlt size={12} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>Login</Link>
                <Link to="/register" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>Register</Link>
              </>
            )}

            {/* Mobile toggle */}
            {user && (
              <button
                className="sm:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ color: textMuted, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && mobileOpen && (
          <div
            className="sm:hidden pb-4 animate-fade-in"
            style={{ borderTop: `1px solid ${navBorder}`, paddingTop: '0.75rem' }}
          >
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.65rem 0.75rem', borderRadius: 10, marginBottom: '0.25rem',
                  color: isActive(to) ? textActive : textMuted,
                  background: isActive(to) ? activeBg : 'transparent',
                  textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500,
                }}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect } from 'react';
import { paperApi, statsApi } from '../api/authApi';
import StatCard from '../components/StatCard';
import { PapersPerYearChart, TopJournalsChart, AuthorPublicationsChart } from '../components/Charts';
import SearchBar from '../components/SearchBar';
import { FaSearch, FaChartLine, FaDatabase, FaArrowRight, FaFileAlt, FaUsers, FaNewspaper } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';

const Dashboard = () => {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const [stats, setStats] = useState({
    totalPapers: 0, uniqueAuthors: 0, totalJournals: 0,
    papersPerYear: [], topJournals: [], topAuthors: [], dataSources: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await statsApi.getOverview();
      setStats({
        totalPapers: data.database_overview?.mysql?.total_papers || 0,
        uniqueAuthors: data.database_overview?.mysql?.total_authors || 0,
        totalJournals: data.database_overview?.mongodb?.unique_journals || 0,
        papersPerYear: data.analytics?.papers_per_year?.map(i => ({ year: i.publish_year, count: i.count })) || [],
        topJournals: data.analytics?.top_journals?.map(i => ({ name: i.journal, value: i.count })).slice(0, 5) || [],
        topAuthors: data.analytics?.top_authors?.map(i => ({ author: i.name, papers: i.paper_count })).slice(0, 5) || [],
        dataSources: {
          mysql: data.database_overview?.mysql?.role || 'SQL Database',
          mongodb: data.database_overview?.mongodb?.role || 'MongoDB Database',
        }
      });
    } catch { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  const handleSearch = (query) => { window.location.href = `/papers?q=${encodeURIComponent(query)}`; };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.pageBg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${t.accentBg}`, borderTopColor: t.accent, animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: t.textMuted, fontSize: '0.9rem' }}>Loading dashboard…</p>
      </div>
    </div>
  );

  const SectionLabel = ({ icon: Icon, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: t.sectionIconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.sectionIconGlow }}>
        <Icon size={14} color="white" />
      </div>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: t.textPrimary }}>{text}</h2>
    </div>
  );

  const glassPanel = { background: t.cardBg, backdropFilter: 'blur(16px)', border: `1px solid ${t.cardBorder}`, borderRadius: 18, padding: '1.5rem', boxShadow: t.cardShadow };

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, transition: 'background 0.4s ease' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* HERO */}
        <div className="animate-fade-in" style={{ marginBottom: '2.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -40, left: -40, width: 300, height: 200, background: `radial-gradient(circle,${t.accentBg} 0%,transparent 70%)`, filter: 'blur(40px)', pointerEvents: 'none' }} />
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>✦ Research Intelligence Platform</p>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, background: t.accentGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.15, marginBottom: '0.6rem', letterSpacing: '-0.03em' }}>
            Dashboard Overview
          </h1>
          <p style={{ color: t.textMuted, fontSize: '0.95rem', maxWidth: 520 }}>Hybrid Database Architecture — MySQL for relationships, MongoDB for search &amp; analytics</p>
        </div>

        {/* SEARCH */}
        <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
          <SectionLabel icon={FaSearch} text="Quick Search" />
          <SearchBar onSearch={handleSearch} placeholder="Search papers by title, author, or keyword..." />
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <StatCard title="Total Papers" value={stats.totalPapers} type="papers" delay={0} />
          <StatCard title="Unique Authors" value={stats.uniqueAuthors} type="authors" delay={100} />
          <StatCard title="Journals" value={stats.totalJournals} type="journals" delay={200} />
          <StatCard title="Years Covered" value={stats.papersPerYear.length} type="years" delay={300} />
        </div>

        {/* CHARTS */}
        {stats.papersPerYear.length > 0 && (
          <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
            <SectionLabel icon={FaChartLine} text="Analytics" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '1.5rem' }}>
              <div style={glassPanel}><PapersPerYearChart data={stats.papersPerYear} /></div>
              {stats.topJournals.length > 0 && <div style={glassPanel}><TopJournalsChart data={stats.topJournals} /></div>}
            </div>
          </div>
        )}

        {/* TOP AUTHORS */}
        {stats.topAuthors.length > 0 && (
          <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
            <SectionLabel icon={FaUsers} text="Top Publishing Authors" />
            <div style={glassPanel}><AuthorPublicationsChart data={stats.topAuthors} /></div>
          </div>
        )}

        {/* DB ARCHITECTURE */}
        <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
          <SectionLabel icon={FaDatabase} text="Hybrid Database Architecture" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
            {[
              { label: 'MySQL Database', sub: 'Core Transactional Data', grad: 'linear-gradient(135deg,#06b6d4,#0ea5e9)', glow: 'rgba(6,182,212,0.4)', border: 'rgba(6,182,212,0.2)', borderH: 'rgba(6,182,212,0.4)', glowH: 'rgba(6,182,212,0.1)', rows: [['Purpose', 'Normalized Relationships'], ['Strengths', 'ACID, Constraints'], ['Used For', 'Users, Author-Paper Links']], stats: [['Total Papers', stats.totalPapers], ['Total Authors', stats.uniqueAuthors]] },
              { label: 'MongoDB Database', sub: 'Search & Analytics Engine', grad: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.4)', border: 'rgba(16,185,129,0.2)', borderH: 'rgba(16,185,129,0.4)', glowH: 'rgba(16,185,129,0.1)', rows: [['Purpose', 'Full-Text Search'], ['Strengths', 'Flexible, Scalable'], ['Used For', 'Metadata, Aggregations']], stats: [['Unique Journals', stats.totalJournals], ['Indexed Fields', 'Title, Abstract, Year']] },
            ].map(({ label, sub, grad, glow, border, borderH, glowH, rows, stats: dbStats }) => (
              <div key={label}
                style={{ background: t.cardBg, backdropFilter: 'blur(16px)', border: `1px solid ${border}`, borderRadius: 18, padding: '1.5rem', boxShadow: t.cardShadow, transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = borderH; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${glowH}`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = t.cardShadow; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${glow}` }}>
                    <FaDatabase size={18} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: t.textPrimary }}>{label}</h3>
                    <p style={{ fontSize: '0.78rem', color: t.textMuted }}>{sub}</p>
                  </div>
                </div>
                {rows.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${t.divider}` }}>
                    <span style={{ fontSize: '0.82rem', color: t.textMuted }}>{k}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: t.textSecondary }}>{v}</span>
                  </div>
                ))}
                {dbStats.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', color: t.textMuted }}>{k}</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{typeof v === 'number' ? v.toLocaleString() : v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS + POLYGLOT */}
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
          <div style={glassPanel}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: t.textPrimary, marginBottom: '1.25rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Browse All Papers', href: '/papers', tag: 'MongoDB', icon: FaFileAlt, color: t.accent },
                { label: 'View Author Statistics', href: '/authors', tag: 'MySQL', icon: FaUsers, color: '#a855f7' },
                { label: 'Explore Journals', href: '/journals', tag: 'MongoDB', icon: FaNewspaper, color: '#10b981' },
              ].map(({ label, href, tag, icon: Icon, color }) => (
                <button key={href} onClick={() => window.location.href = href}
                  style={{ width: '100%', padding: '0.85rem 1rem', background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.cardHover; e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = t.cardBg; e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: t.textSecondary }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: t.textMuted, background: t.cardBg, padding: '0.2rem 0.55rem', borderRadius: 999, border: `1px solid ${t.cardBorder}` }}>{tag}</span>
                    <FaArrowRight size={11} style={{ color: t.textMuted }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={glassPanel}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: t.textPrimary, marginBottom: '1.25rem' }}>Polyglot Persistence</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { title: 'MySQL Queries', desc: 'Optimized with heuristic: GROUP BY before JOIN', bg: t.accentBg, border: t.accentBorder, tc: t.accentText, dc: t.accent },
                { title: 'MongoDB Queries', desc: 'Aggregation pipelines with compound indexes', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.2)', tc: '#6ee7b7', dc: '#34d399' },
                { title: 'Hybrid Approach', desc: 'Right database for the right job', bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.2)', tc: '#d8b4fe', dc: '#c084fc' },
              ].map(({ title, desc, bg, border, tc, dc }) => (
                <div key={title} style={{ padding: '0.85rem 1rem', background: bg, border: `1px solid ${border}`, borderRadius: 12 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: tc, marginBottom: '0.25rem' }}>{title}</p>
                  <p style={{ fontSize: '0.78rem', color: dc, opacity: 0.85 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
// Dashboard renders the dashboard page.
import React, { useState, useEffect } from 'react';
import { statsApi } from '../api/authApi';
import StatCard from '../components/StatCard';
import { PapersPerYearChart, TopJournalsChart, AuthorPublicationsChart } from '../components/Charts';
import SearchBar from '../components/SearchBar';
import {
  FaSearch, FaChartLine, FaDatabase, FaArrowRight,
  FaFileAlt, FaUsers, FaNewspaper,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';

const Dashboard = () => {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const [stats, setStats] = useState({
    totalPapers: 0,
    uniqueAuthors: 0,
    totalJournals: 0,
    rankedJournals: 0,
    papersPerYear: [],
    topJournals: [],
    topAuthors: [],
    importantPapers: [],
    topKeywords: [],
    topCollaborators: [],
    incompletePaperCount: 0,
    activeUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await statsApi.getOverview();

      const rawPPY = data.analytics?.papers_per_year || data.papers_per_year || [];
      const papersPerYear = rawPPY
        .map(i => ({ year: i._id ?? i.publish_year ?? i.year, count: i.count ?? i.paper_count ?? 0 }))
        .filter(i => i.year != null && i.count > 0)
        .sort((a, b) => a.year - b.year);

      const rawJournals = data.analytics?.top_journals || data.top_journals || [];
      const topJournals = rawJournals
        .map(i => ({ name: i.journal ?? i._id ?? i.name, value: i.count ?? i.paper_count ?? 0 }))
        .filter(i => i.name)
        .slice(0, 5);

      const rawAuthors = data.analytics?.top_authors || data.top_authors || [];
      const topAuthors = rawAuthors
        .map(i => ({ author: i.author ?? i._id ?? i.name, papers: i.count ?? i.paper_count ?? 0 }))
        .filter(i => i.author)
        .slice(0, 10);

      const totalPapers   = data.database_overview?.mysql?.total_papers
                         ?? data.database_overview?.mongodb?.total_papers ?? 0;
      const uniqueAuthors = data.database_overview?.mysql?.total_authors
                         ?? data.stats?.uniqueAuthorCount ?? 0;
      const totalJournals = data.database_overview?.mongodb?.unique_journals
                         ?? data.stats?.uniqueJournalCount ?? 0;
      const rankedJournals = data.database_overview?.neo4j?.ranked_journals ?? 0;
      const importantPapers = data.research_highlights?.mysql_curation?.important_papers || [];
      const topKeywords = data.research_highlights?.mongodb_discovery?.top_keywords || [];
      const topCollaborators = data.research_highlights?.neo4j_network?.top_collaborators || [];
      const incompletePaperCount = data.research_highlights?.mysql_curation?.incomplete_paper_count || 0;
      const activeUsers = data.research_highlights?.mysql_curation?.active_users || [];

      setStats({
        totalPapers,
        uniqueAuthors,
        totalJournals,
        rankedJournals,
        papersPerYear,
        topJournals,
        topAuthors,
        importantPapers,
        topKeywords,
        topCollaborators,
        incompletePaperCount,
        activeUsers
      });
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = query => {
    window.location.href = `/papers?q=${encodeURIComponent(query)}`;
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: t.pageBg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%',
                      border: `3px solid ${t.accentBg}`, borderTopColor: t.accent,
                      animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: t.textMuted, fontSize: '0.9rem' }}>Loading dashboard…</p>
      </div>
    </div>
  );

  const SectionLabel = ({ icon: Icon, text, sub }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: t.sectionIconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: t.sectionIconGlow }}>
        <Icon size={14} color="white" />
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: t.textPrimary }}>{text}</h2>
        {sub && <p style={{ margin: 0, fontSize: '0.72rem', color: t.textMuted }}>{sub}</p>}
      </div>
    </div>
  );

  const glassPanel = {
    background: t.cardBg, backdropFilter: 'blur(16px)',
    border: `1px solid ${t.cardBorder}`, borderRadius: 18,
    padding: '1.5rem', boxShadow: t.cardShadow,
  };

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, transition: 'background 0.4s ease' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ── Hero header ─────────────────────────────────────────────── */}
        <div className="animate-fade-in" style={{ marginBottom: '2.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -40, left: -40, width: 300, height: 200,
                        background: `radial-gradient(circle,${t.accentBg} 0%,transparent 70%)`,
                        filter: 'blur(40px)', pointerEvents: 'none' }} />
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: t.accent,
                      textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
            ✦ Research Intelligence Platform
          </p>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900,
                       background: t.accentGrad, WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                       lineHeight: 1.15, marginBottom: '0.6rem', letterSpacing: '-0.03em' }}>
            Dashboard Overview
          </h1>
          <p style={{ color: t.textMuted, fontSize: '0.95rem', maxWidth: 520 }}>
            Unified analytics and discovery across your research data
          </p>
        </div>

        {/* ── Quick Search ─────────────────────────────────────────────── */}
        <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
          <SectionLabel icon={FaSearch} text="Quick Search" />
          <SearchBar onSearch={handleSearch} placeholder="Search papers by title, author, or keyword..." />
        </div>

        {/* ── Stat Cards ───────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                      gap: '1.25rem', marginBottom: '2.5rem' }}>
          <StatCard title="Total Papers"    value={stats.totalPapers}   type="papers"  delay={0}   />
          <StatCard title="Unique Authors"  value={stats.uniqueAuthors} type="authors" delay={100} />
          <StatCard title="Journals"        value={stats.totalJournals} type="journals" delay={200} />
          <StatCard title="Years Covered"   value={stats.papersPerYear.length} type="years" delay={300} />
        </div>

        <div className="animate-fade-in" style={{ ...glassPanel, marginBottom: '2.5rem' }}>
          <SectionLabel icon={FaDatabase} text="Live Database Activity" sub="Three specialised stores, one unified view" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { type: 'Primary Registry', role: 'Structured records', detail: `${stats.totalPapers?.toLocaleString()} papers · ${stats.uniqueAuthors?.toLocaleString()} authors`, color: '#06b6d4' },
              { type: 'Discovery Engine', role: 'Full-text search', detail: `${stats.totalJournals?.toLocaleString()} journals · ${stats.uniqueAuthors?.toLocaleString()} active authors`, color: '#10b981' },
              { type: 'Relationship Map', role: 'Collaboration graph', detail: `${stats.totalPapers?.toLocaleString()} linked records`, color: '#a855f7' },
            ].map(item => (
              <div key={item.type} style={{ padding: '1.1rem', borderRadius: 16, background: `${item.color}10`, border: `1px solid ${item.color}28` }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: item.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                  {item.type}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: t.textPrimary, marginBottom: '0.3rem' }}>{item.role}</div>
                <div style={{ fontSize: '0.78rem', color: item.color, fontWeight: 600 }}>{item.detail}</div>
              </div>
            ))}
          </div>

          {stats.importantPapers.length > 0 && (
            <div>
              <p style={{ fontSize: '0.78rem', color: t.textMuted, marginBottom: '0.75rem', fontWeight: 600 }}>
                HIGHLY COLLABORATIVE PAPERS
              </p>
              <div style={{ display: 'grid', gap: '0.55rem' }}>
                {stats.importantPapers.slice(0, 4).map(paper => (
                  <button key={paper.paper_id} onClick={() => window.location.href = `/papers/${paper.paper_id}`}
                    style={{ width: '100%', textAlign: 'left', padding: '0.75rem 0.9rem', background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12, cursor: 'pointer' }}>
                    <div style={{ color: t.textPrimary, fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem', lineHeight: 1.4 }}>{paper.title}</div>
                    <div style={{ color: t.textMuted, fontSize: '0.74rem' }}>
                      {paper.author_count_display} · {paper.journal || 'Journal n/a'} · {paper.year || 'Year n/a'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Analytics charts ─────────────────────────────────────────── */}
        {stats.papersPerYear.length > 0 && (
          <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
            <SectionLabel icon={FaChartLine} text="Analytics" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))',
                          gap: '1.5rem' }}>
              <div style={glassPanel}><PapersPerYearChart data={stats.papersPerYear} /></div>
              {stats.topJournals.length > 0 && (
                <div style={glassPanel}><TopJournalsChart data={stats.topJournals} /></div>
              )}
            </div>
          </div>
        )}

        {/* ── Top Authors chart ─────────────────────────────────────────── */}
        {stats.topAuthors.length > 0 && (
          <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
            <SectionLabel icon={FaUsers} text="Top Publishing Authors" />
            <div style={glassPanel}><AuthorPublicationsChart data={stats.topAuthors} /></div>
          </div>
        )}


        {/* ── Platform Overview cards ───────────────────────────────────── */}

        {/* ══ NEW: Data Quality & Activity drawer (procedures + trigger) ═ */}

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <div className="animate-fade-in"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
                   gap: '1.5rem' }}>
          <div style={glassPanel}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: t.textPrimary,
                         marginBottom: '1.25rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Browse All Papers',      href: '/papers',  tag: 'Papers',  icon: FaFileAlt, color: t.accent },
                { label: 'View Author Statistics', href: '/authors', tag: 'Authors', icon: FaUsers,   color: '#a855f7' },
                { label: 'Explore Journals',       href: '/journals',tag: 'Papers',  icon: FaNewspaper, color: '#10b981' },
              ].map(({ label, href, tag, icon: Icon, color }) => (
                <button key={href} onClick={() => window.location.href = href}
                  style={{ width: '100%', padding: '0.85rem 1rem', background: t.cardBg,
                           border: `1px solid ${t.cardBorder}`, borderRadius: 12, cursor: 'pointer',
                           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                           transition: 'all 0.25s ease' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = t.cardHover;
                    e.currentTarget.style.borderColor = `${color}40`;
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = t.cardBg;
                    e.currentTarget.style.borderColor = t.cardBorder;
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9,
                                  background: `${color}20`, display: 'flex',
                                  alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: t.textSecondary }}>
                      {label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: t.textMuted,
                                   background: t.cardBg, padding: '0.2rem 0.55rem',
                                   borderRadius: 999, border: `1px solid ${t.cardBorder}` }}>
                      {tag}
                    </span>
                    <FaArrowRight size={11} style={{ color: t.textMuted }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={glassPanel}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: t.textPrimary,
                         marginBottom: '1.25rem' }}>Platform Highlights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { title: 'Trending Papers',     desc: 'Ranked by collaboration breadth via GetTrendingPapers()',
                  bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.2)',
                  tc: '#fcd34d', dc: '#f59e0b' },
                { title: 'Paper List Badges',   desc: 'Important and incomplete states now appear directly on each paper card',
                  bg: t.accentBg, border: t.accentBorder, tc: t.accentText, dc: t.accent },
                { title: 'Collaboration Trigger', desc: 'trg_mark_important_paper is surfaced in the papers list instead of the dashboard',
                  bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.2)',
                  tc: '#6ee7b7', dc: '#34d399' },
                { title: 'Live User Activity',  desc: 'trg_update_last_login keeps sessions current automatically',
                  bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.2)',
                  tc: '#d8b4fe', dc: '#c084fc' },
              ].map(({ title, desc, bg, border, tc, dc }) => (
                <div key={title} style={{ padding: '0.85rem 1rem', background: bg,
                                          border: `1px solid ${border}`, borderRadius: 12 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: tc,
                               marginBottom: '0.25rem' }}>{title}</p>
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

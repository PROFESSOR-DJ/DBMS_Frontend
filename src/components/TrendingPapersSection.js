// TrendingPapersSection displays results from the GetTrendingPapers stored procedure.
// Papers are ranked by author_count DESC (broadest collaboration = most trending).
// Shown on the Dashboard below the charts.
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaUsers, FaNewspaper, FaCalendar, FaArrowRight, FaChevronDown } from 'react-icons/fa';
import { statsApi } from '../api/authApi';

const YEAR_OPTIONS = [
  { label: 'Last 5 years', value: new Date().getFullYear() - 4 },
  { label: 'Last 10 years', value: new Date().getFullYear() - 9 },
  { label: 'Since 2015', value: 2015 },
  { label: 'Since 2010', value: 2010 },
  { label: 'All time', value: 2000 },
];

const TrendingPapersSection = ({ isDark, t }) => {
  const [papers, setPapers]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [yearIdx, setYearIdx]     = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [fromYear, setFromYear]   = useState(YEAR_OPTIONS[0].value);
  const [fromLabel, setFromLabel] = useState(YEAR_OPTIONS[0].label);

  const load = useCallback(async (year) => {
    setLoading(true);
    try {
      const data = await statsApi.getTrendingPapers(year, 6);
      setPapers(data.papers || []);
    } catch {
      setPapers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(fromYear); }, [fromYear, load]);

  const handleYearSelect = (opt) => {
    setFromYear(opt.value);
    setFromLabel(opt.label);
    setShowPicker(false);
  };

  const accentFire   = '#f59e0b';
  const accentFireBg = 'rgba(245,158,11,0.12)';
  const accentFireBorder = 'rgba(245,158,11,0.25)';

  return (
    <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10,
                        background: `linear-gradient(135deg, ${accentFire}, #ef4444)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 12px rgba(245,158,11,0.4)` }}>
            <FaFire size={14} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: t.textPrimary, margin: 0 }}>
              Trending Papers
            </h2>
            <p style={{ fontSize: '0.72rem', color: t.textMuted, margin: 0 }}>
              Ranked by collaboration breadth · <code style={{ color: accentFire,
                background: accentFireBg, padding: '0 4px', borderRadius: 4,
                fontSize: '0.68rem' }}>GetTrendingPapers()</code>
            </p>
          </div>
        </div>

        {/* Year picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPicker(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 6,
                     padding: '0.45rem 0.85rem', borderRadius: 10,
                     background: accentFireBg, border: `1px solid ${accentFireBorder}`,
                     color: accentFire, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
            <FaCalendar size={11} /> {fromLabel} <FaChevronDown size={10} />
          </button>
          {showPicker && (
            <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 50,
                          background: isDark ? '#0f172a' : '#fff',
                          border: `1px solid ${t.cardBorder}`, borderRadius: 12,
                          boxShadow: '0 12px 32px rgba(0,0,0,0.4)', minWidth: 160, overflow: 'hidden' }}>
              {YEAR_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => handleYearSelect(opt)}
                  style={{ width: '100%', padding: '0.6rem 1rem', textAlign: 'left',
                           background: opt.value === fromYear ? accentFireBg : 'none',
                           border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                           color: opt.value === fromYear ? accentFire : t.textSecondary,
                           fontWeight: opt.value === fromYear ? 700 : 400 }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
                      gap: '1rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 130, borderRadius: 14,
                                  background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                                  animation: 'pulse 1.5s ease-in-out infinite',
                                  animationDelay: `${i * 100}ms` }} />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>
        </div>
      ) : papers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem',
                      background: t.cardBg, border: `1px dashed ${accentFireBorder}`,
                      borderRadius: 16, color: t.textMuted, fontSize: '0.875rem' }}>
          No trending papers found for this period.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
                      gap: '1rem' }}>
          {papers.map((paper, i) => (
            <TrendingCard key={paper.paper_id || i} paper={paper} rank={i + 1}
                          isDark={isDark} t={t} accentFire={accentFire}
                          accentFireBg={accentFireBg} accentFireBorder={accentFireBorder} />
          ))}
        </div>
      )}
    </div>
  );
};

const RANK_STYLES = [
  { bg: 'linear-gradient(135deg,#f59e0b,#ef4444)', glow: 'rgba(245,158,11,0.5)' },
  { bg: 'linear-gradient(135deg,#94a3b8,#cbd5e1)', glow: 'rgba(148,163,184,0.4)' },
  { bg: 'linear-gradient(135deg,#b45309,#d97706)', glow: 'rgba(180,83,9,0.4)' },
];

const TrendingCard = ({ paper, rank, isDark, t, accentFire, accentFireBg, accentFireBorder }) => {
  const [hovered, setHovered] = useState(false);
  const rs = RANK_STYLES[rank - 1] || null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? t.cardHover : t.cardBg,
               border: `1px solid ${hovered ? accentFireBorder : t.cardBorder}`,
               borderRadius: 14, padding: '1rem 1.1rem',
               transition: 'all 0.25s ease',
               transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
               boxShadow: hovered ? `0 8px 28px rgba(0,0,0,0.3),0 0 16px rgba(245,158,11,0.12)`
                                  : '0 2px 8px rgba(0,0,0,0.2)',
               position: 'relative', overflow: 'hidden' }}>
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: rs ? rs.bg : accentFire,
                    borderRadius: '14px 0 0 14px', opacity: hovered ? 1 : 0.5 }} />

      <div style={{ paddingLeft: '0.4rem' }}>
        {/* Rank + author count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {rs ? (
              <div style={{ width: 22, height: 22, borderRadius: 6,
                            background: rs.bg, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', boxShadow: `0 2px 6px ${rs.glow}`,
                            fontSize: '0.65rem', fontWeight: 800, color: 'white' }}>
                #{rank}
              </div>
            ) : (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted }}>#{rank}</span>
            )}
            <FaFire size={11} style={{ color: accentFire, opacity: 0.7 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4,
                        background: accentFireBg, border: `1px solid ${accentFireBorder}`,
                        borderRadius: 999, padding: '0.15rem 0.6rem' }}>
            <FaUsers size={10} style={{ color: accentFire }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: accentFire }}>
              {paper.author_count || 0} authors
            </span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/papers/${paper.paper_id}`} style={{ textDecoration: 'none' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600,
                      color: hovered ? '#fcd34d' : t.textPrimary,
                      lineHeight: 1.45, marginBottom: '0.5rem',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      transition: 'color 0.2s ease' }}>
            {paper.title}
          </p>
        </Link>

        {/* Meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
          {paper.journal && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4,
                           fontSize: '0.72rem', color: t.textMuted }}>
              <FaNewspaper size={10} style={{ color: '#a855f7' }} />
              <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis',
                             whiteSpace: 'nowrap' }}>{paper.journal}</span>
            </span>
          )}
          {paper.year && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4,
                           fontSize: '0.72rem', color: t.textMuted }}>
              <FaCalendar size={10} style={{ color: '#10b981' }} /> {paper.year}
            </span>
          )}
        </div>

        {/* View link */}
        <Link to={`/papers/${paper.paper_id}`}
          style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: 4,
                   fontSize: '0.72rem', fontWeight: 600, color: accentFire,
                   textDecoration: 'none', opacity: hovered ? 1 : 0,
                   transition: 'opacity 0.2s ease' }}>
          View paper <FaArrowRight size={9} />
        </Link>
      </div>
    </div>
  );
};

export default TrendingPapersSection;
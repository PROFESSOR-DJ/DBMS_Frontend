// ImportantPapersSection shows papers where is_important=TRUE,
// automatically flagged by trigger trg_mark_important_paper (author_count >= 5).
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaUsers, FaNewspaper, FaCalendar, FaArrowRight, FaChevronRight } from 'react-icons/fa';
import { statsApi } from '../api/authApi';

const ImportantPapersSection = ({ isDark, t }) => {
  const [papers, setPapers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await statsApi.getImportantPapers(expanded ? 12 : 4);
        setPapers(data.papers || []);
      } catch {
        setPapers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [expanded]);

  const accentStar   = '#6366f1';
  const accentStarBg = 'rgba(99,102,241,0.12)';
  const accentStarBorder = 'rgba(99,102,241,0.28)';

  if (!loading && papers.length === 0) return null;

  return (
    <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
            <FaStar size={14} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: t.textPrimary, margin: 0 }}>
              Highly Collaborative Papers
            </h2>
            <p style={{ fontSize: '0.72rem', color: t.textMuted, margin: 0 }}>
              Auto-flagged by database trigger ·{' '}
              <code style={{ color: accentStar, background: accentStarBg,
                             padding: '0 4px', borderRadius: 4, fontSize: '0.68rem' }}>
                trg_mark_important_paper
              </code>
              {' '}(≥ 5 authors)
            </p>
          </div>
        </div>

        {papers.length >= 4 && (
          <button onClick={() => setExpanded(e => !e)}
            style={{ display: 'flex', alignItems: 'center', gap: 6,
                     padding: '0.45rem 0.85rem', borderRadius: 10,
                     background: accentStarBg, border: `1px solid ${accentStarBorder}`,
                     color: accentStar, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
            {expanded ? 'Show less' : 'Show more'} <FaChevronRight size={10}
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 68, borderRadius: 12, background: t.cardBg,
                                  border: `1px solid ${t.cardBorder}`,
                                  animation: 'pulse 1.5s ease-in-out infinite',
                                  animationDelay: `${i * 80}ms` }} />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {papers.map((paper, i) => (
            <ImportantPaperRow key={paper.paper_id || i} paper={paper}
                               t={t} isDark={isDark}
                               accentStar={accentStar}
                               accentStarBg={accentStarBg}
                               accentStarBorder={accentStarBorder} />
          ))}
        </div>
      )}
    </div>
  );
};

const ImportantPaperRow = ({ paper, t, isDark, accentStar, accentStarBg, accentStarBorder }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '1rem',
               padding: '0.75rem 1rem', borderRadius: 12,
               background: hovered ? t.cardHover : t.cardBg,
               border: `1px solid ${hovered ? accentStarBorder : t.cardBorder}`,
               transition: 'all 0.22s ease',
               transform: hovered ? 'translateX(4px)' : 'translateX(0)' }}>

      {/* Star badge */}
      <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}>
        <FaStar size={13} color="white" />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/papers/${paper.paper_id}`} style={{ textDecoration: 'none' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600,
                      color: hovered ? '#a5b4fc' : t.textPrimary,
                      margin: 0, marginBottom: '0.2rem',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      transition: 'color 0.2s ease' }}>
            {paper.title}
          </p>
        </Link>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {paper.year && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4,
                           fontSize: '0.72rem', color: t.textMuted }}>
              <FaCalendar size={9} style={{ color: '#10b981' }} /> {paper.year}
            </span>
          )}
          {paper.journal && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4,
                           fontSize: '0.72rem', color: t.textMuted, maxWidth: 220,
                           overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <FaNewspaper size={9} style={{ color: '#a855f7' }} /> {paper.journal}
            </span>
          )}
        </div>
      </div>

      {/* Author count pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                    background: accentStarBg, border: `1px solid ${accentStarBorder}`,
                    borderRadius: 999, padding: '0.25rem 0.65rem' }}>
        <FaUsers size={10} style={{ color: accentStar }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: accentStar }}>
          {paper.author_count}
        </span>
      </div>

      {/* Arrow */}
      <Link to={`/papers/${paper.paper_id}`}
        style={{ color: t.textMuted, opacity: hovered ? 1 : 0,
                 transition: 'opacity 0.2s ease', flexShrink: 0 }}>
        <FaArrowRight size={12} />
      </Link>
    </div>
  );
};

export default ImportantPapersSection;
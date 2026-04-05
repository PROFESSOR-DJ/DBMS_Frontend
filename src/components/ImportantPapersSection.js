import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaCalendar,
  FaChevronRight,
  FaLayerGroup,
  FaNewspaper,
  FaStar,
  FaUsers,
} from 'react-icons/fa';
import { statsApi } from '../api/authApi';
import useDeferredSectionLoad from '../hooks/useDeferredSectionLoad';

const ImportantPapersSection = ({ isDark, t }) => {
  const [papers, setPapers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { ref, shouldLoad } = useDeferredSectionLoad();

  useEffect(() => {
    if (!shouldLoad) return;

    const fetchPapers = async () => {
      setLoading(true);
      try {
        const data = await statsApi.getImportantPapers(expanded ? 10 : 4, 0, { curated: true });
        setPapers(data.papers || []);
        setMeta(data.meta || null);
      } catch {
        setPapers([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [expanded, shouldLoad]);

  const accentStar = '#6366f1';
  const accentStarBg = 'rgba(99,102,241,0.12)';
  const accentStarBorder = 'rgba(99,102,241,0.28)';

  if (shouldLoad && !loading && papers.length === 0) return null;

  return (
    <div ref={ref} className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
          }}>
            <FaStar size={14} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: t.textPrimary, margin: 0 }}>
              Highly Collaborative Papers
            </h2>
            <p style={{ fontSize: '0.72rem', color: t.textMuted, margin: 0 }}>
              Trigger-flagged papers with readable collaboration previews first
            </p>
          </div>
        </div>

        {(loading || papers.length >= 4) && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.45rem 0.85rem', borderRadius: 10,
              background: accentStarBg, border: `1px solid ${accentStarBorder}`,
              color: accentStar, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
            }}>
            {expanded ? 'Show less' : 'Show more'}
            <FaChevronRight
              size={10}
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
            />
          </button>
        )}
      </div>

      {meta?.extreme_in_sample > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          marginBottom: '1rem', padding: '0.75rem 0.9rem',
          background: accentStarBg, border: `1px solid ${accentStarBorder}`,
          borderRadius: 12, color: accentStar,
        }}>
          <FaLayerGroup size={12} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
            Preview prioritises {meta.preferred_author_range}. Very large collaborations are grouped lower so this section stays useful.
          </span>
        </div>
      )}

      {!shouldLoad || loading ? (
        <LoadingList t={t} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {papers.map((paper, i) => (
            <ImportantPaperRow
              key={paper.paper_id || i}
              paper={paper}
              t={t}
              isDark={isDark}
              accentStar={accentStar}
              accentStarBg={accentStarBg}
              accentStarBorder={accentStarBorder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LoadingList = ({ t }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        style={{
          height: 84, borderRadius: 12, background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 80}ms`,
        }}
      />
    ))}
    <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>
  </div>
);

const ImportantPaperRow = ({ paper, t, accentStar, accentStarBg, accentStarBorder }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.9rem 1rem', borderRadius: 12,
        background: hovered ? t.cardHover : t.cardBg,
        border: `1px solid ${hovered ? accentStarBorder : t.cardBorder}`,
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
      }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: 'linear-gradient(135deg,#6366f1,#a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
      }}>
        <FaStar size={13} color="white" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '0.18rem 0.55rem', borderRadius: 999,
            background: accentStarBg, color: accentStar,
            fontSize: '0.68rem', fontWeight: 700,
          }}>
            <FaLayerGroup size={9} />
            {paper.collaboration_band}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(168,85,247,0.12)', color: '#c084fc',
            borderRadius: 999, padding: '0.18rem 0.55rem',
            fontSize: '0.68rem', fontWeight: 700,
          }}>
            <FaUsers size={9} />
            {paper.author_count_display || `${paper.author_count} authors`}
          </span>
        </div>

        <Link to={`/papers/${paper.paper_id}`} style={{ textDecoration: 'none' }}>
          <p style={{
            fontSize: '0.875rem', fontWeight: 600,
            color: hovered ? '#a5b4fc' : t.textPrimary,
            margin: 0, marginBottom: '0.2rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            transition: 'color 0.2s ease',
          }}>
            {paper.title}
          </p>
        </Link>

        <p style={{ margin: 0, marginBottom: '0.35rem', fontSize: '0.72rem', color: t.textMuted }}>
          {paper.collaboration_note}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {paper.year && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: t.textMuted }}>
              <FaCalendar size={9} style={{ color: '#10b981' }} /> {paper.year}
            </span>
          )}
          {paper.journal && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.72rem', color: t.textMuted, maxWidth: 220,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              <FaNewspaper size={9} style={{ color: '#a855f7' }} /> {paper.journal}
            </span>
          )}
        </div>
      </div>

      <Link
        to={`/papers/${paper.paper_id}`}
        style={{
          color: accentStar, opacity: hovered ? 1 : 0.75,
          transition: 'opacity 0.2s ease', flexShrink: 0,
        }}>
        <FaArrowRight size={12} />
      </Link>
    </div>
  );
};

export default ImportantPapersSection;

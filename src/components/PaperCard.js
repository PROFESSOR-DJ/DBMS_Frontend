import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBookmark,
  FaCalendar,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaNewspaper,
  FaQuoteRight,
  FaRegBookmark,
  FaStar,
  FaUser,
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';

const PaperCard = ({ paper }) => {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const paperId = paper.paper_id || paper._id;
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  const toggleBookmark = (event) => {
    event.preventDefault();
    setIsBookmarked(prev => !prev);
  };

  const formatAuthors = (authors) => {
    if (!authors) return 'Unknown';
    const authorList = typeof authors === 'string' ? authors.split(', ') : authors;
    if (Array.isArray(authorList)) {
      if (authorList.length === 0) return 'Unknown';
      if (authorList.length === 1) return authorList[0];
      if (authorList.length === 2) return authorList.join(' and ');
      if (authorList.length > 3) return `${authorList.slice(0, 3).join(', ')} et al.`;
      return `${authorList.slice(0, -1).join(', ')} and ${authorList[authorList.length - 1]}`;
    }
    return authors;
  };

  const isPotentiallyCollaborative = paper.is_important === true || paper.is_important === 1;
  const isIncomplete = !paper.abstract || !paper.journal || !paper.year;

  const badgeBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '0.2rem 0.6rem',
    borderRadius: 999,
    fontSize: '0.68rem',
    fontWeight: 700,
    cursor: 'default',
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? t.cardHover : t.cardBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? t.accentBorder : t.cardBorder}`,
        borderRadius: 16,
        padding: '1.35rem',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `${t.cardShadow}, 0 0 18px ${t.accentGlow}` : t.cardShadow,
        position: 'relative',
        overflow: 'hidden',
      }}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: isPotentiallyCollaborative
          ? 'linear-gradient(180deg,#f59e0b,#ef4444)'
          : isIncomplete
            ? 'linear-gradient(180deg,#10b981,#06b6d4)'
            : t.accentGrad,
        borderRadius: '16px 0 0 16px',
        opacity: hovered ? 1 : 0.65,
      }} />

      <div style={{ paddingLeft: '0.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '0.75rem',
          marginBottom: '0.65rem',
        }}>
          <Link to={`/papers/${paperId}`} style={{ flex: 1, textDecoration: 'none' }}>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              lineHeight: 1.45,
              color: hovered ? t.accentText : t.textPrimary,
              transition: 'color 0.2s ease',
            }}>
              {paper.title}
            </h3>
          </Link>

          <button
            onClick={toggleBookmark}
            style={{
              color: isBookmarked ? '#f59e0b' : t.textMuted,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s ease, transform 0.2s ease',
              transform: isBookmarked ? 'scale(1.12)' : 'scale(1)',
            }}
            aria-label="Bookmark">
            {isBookmarked ? <FaBookmark size={16} /> : <FaRegBookmark size={16} />}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem' }}>
          {isPotentiallyCollaborative && (
            <span
              title="Marked as potentially collaborative by trg_mark_important_paper when author_count >= 5"
              style={{
                ...badgeBase,
                color: '#f59e0b',
                background: 'rgba(245,158,11,0.14)',
                border: '1px solid rgba(245,158,11,0.35)',
            }}>
              <FaStar size={9} />
              Potentially Collaborative
            </span>
          )}
          {isIncomplete && (
            <span
              title="Matches the GetIncompletePapers logic because abstract, journal, or year is missing"
              style={{
                ...badgeBase,
                color: '#10b981',
                background: 'rgba(16,185,129,0.14)',
                border: '1px solid rgba(16,185,129,0.35)',
              }}>
              <FaExclamationTriangle size={9} />
              Incomplete
            </span>
          )}
          {paper.has_full_text && (
            <span style={{
              ...badgeBase,
              color: '#0ea5e9',
              background: 'rgba(14,165,233,0.12)',
              border: '1px solid rgba(14,165,233,0.28)',
            }}>
              Full Text
            </span>
          )}
          {paper.is_covid19 && (
            <span style={{
              ...badgeBase,
              color: '#ef4444',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.28)',
            }}>
              COVID-19
            </span>
          )}
        </div>

        {paper.authors && (
          <div style={{ marginBottom: '0.65rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: t.textSecondary, fontWeight: 500 }}>
              <FaUser size={11} style={{ display: 'inline', marginRight: 5, color: t.accent }} />
              {formatAuthors(paper.authors)}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.8rem' }}>
          <MetaItem icon={FaNewspaper} color="#a855f7" value={paper.journal || 'Journal missing'} t={t} />
          <MetaItem icon={FaCalendar} color="#10b981" value={paper.year || 'Year missing'} t={t} />
          {paper.citation_count !== undefined && (
            <MetaItem icon={FaQuoteRight} color="#f59e0b" value={`${paper.citation_count} citations`} t={t} />
          )}
        </div>

        {paper.abstract ? (
          <p style={{
            margin: 0,
            marginBottom: '0.8rem',
            fontSize: '0.83rem',
            color: t.textSecondary,
            lineHeight: 1.65,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {paper.abstract}
          </p>
        ) : (
          <p style={{
            margin: 0,
            marginBottom: '0.8rem',
            fontSize: '0.83rem',
            color: '#10b981',
            lineHeight: 1.65,
            fontWeight: 600,
          }}>
            Missing abstract. This paper is flagged as incomplete in the list.
          </p>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          paddingTop: '0.75rem',
          borderTop: `1px solid ${t.divider}`,
          flexWrap: 'wrap',
        }}>
          <Link
            to={`/papers/${paperId}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.82rem',
              fontWeight: 700,
              color: t.accentText,
              textDecoration: 'none',
            }}>
            View details <FaArrowRight size={11} />
          </Link>

          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.82rem',
                fontWeight: 700,
                color: t.textSecondary,
                textDecoration: 'none',
              }}>
              DOI <FaExternalLinkAlt size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const MetaItem = ({ icon: Icon, color, value, t }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: t.textMuted }}>
    <Icon size={11} style={{ color }} />
    <span>{value}</span>
  </span>
);

export default PaperCard;

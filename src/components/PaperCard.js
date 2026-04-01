// PaperCard renders the paper card UI component.
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaUser, FaNewspaper, FaQuoteRight, FaExternalLinkAlt, FaBookmark, FaRegBookmark, FaArrowRight } from 'react-icons/fa';
const PaperCard = ({
  paper
}) => {
  const paperId = paper.paper_id || paper._id;
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const toggleBookmark = e => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
  };
  const formatAuthors = authors => {
    if (!authors) return 'Unknown';
    const authorList = typeof authors === 'string' ? authors.split(', ') : authors;
    if (Array.isArray(authorList)) {
      if (authorList.length === 0) return 'Unknown';
      if (authorList.length === 1) return authorList[0];
      if (authorList.length === 2) return authorList.join(' and ');
      if (authorList.length > 3) return `${authorList.slice(0, 3).join(', ')} et al.`;
      return authorList.slice(0, -1).join(', ') + ' and ' + authorList[authorList.length - 1];
    }
    return authors;
  };
  const keywordColors = [{
    bg: 'rgba(99,102,241,0.15)',
    color: '#a5b4fc',
    border: 'rgba(99,102,241,0.3)'
  }, {
    bg: 'rgba(168,85,247,0.15)',
    color: '#d8b4fe',
    border: 'rgba(168,85,247,0.3)'
  }, {
    bg: 'rgba(16,185,129,0.15)',
    color: '#6ee7b7',
    border: 'rgba(16,185,129,0.3)'
  }, {
    bg: 'rgba(245,158,11,0.15)',
    color: '#fcd34d',
    border: 'rgba(245,158,11,0.3)'
  }, {
    bg: 'rgba(239,68,68,0.15)',
    color: '#fca5a5',
    border: 'rgba(239,68,68,0.3)'
  }];
  return <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
    background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: hovered ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '1.4rem',
    transition: 'all 0.3s ease',
    transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
    boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(99,102,241,0.12)' : '0 2px 12px rgba(0,0,0,0.3)',
    position: 'relative',
    overflow: 'hidden'
  }}>
      {}
      <div style={{
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: 'linear-gradient(180deg, #6366f1, #a855f7)',
      borderRadius: '16px 0 0 16px',
      opacity: hovered ? 1 : 0.4,
      transition: 'opacity 0.3s ease'
    }} />

      <div style={{
      paddingLeft: '0.5rem'
    }}>
        {}
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.6rem'
      }}>
          <Link to={`/papers/${paperId}`} style={{
          flex: 1,
          textDecoration: 'none'
        }}>
            <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: hovered ? '#c7d2fe' : '#a5b4fc',
            lineHeight: 1.45,
            transition: 'color 0.2s ease'
          }}>
              {paper.title}
            </h3>
          </Link>
          <button onClick={toggleBookmark} style={{
          marginLeft: '0.75rem',
          color: isBookmarked ? '#f59e0b' : '#475569',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.2s ease, transform 0.2s ease',
          transform: isBookmarked ? 'scale(1.15)' : 'scale(1)',
          flexShrink: 0
        }} aria-label="Bookmark">
            {isBookmarked ? <FaBookmark size={16} /> : <FaRegBookmark size={16} />}
          </button>
        </div>

        {}
        {paper.authors && <div style={{
        marginBottom: '0.6rem'
      }}>
            <p style={{
          fontSize: '0.85rem',
          color: '#94a3b8',
          fontWeight: 500
        }}>
              <FaUser size={11} style={{
            display: 'inline',
            marginRight: 5,
            color: '#6366f1'
          }} />
              {formatAuthors(paper.authors)}
            </p>
          </div>}

        {}
        <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
          {paper.journal && <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
              <FaNewspaper size={11} style={{
            color: '#a855f7'
          }} />
              <span style={{
            maxWidth: 180,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
                {paper.journal}
              </span>
            </span>}
          {paper.year && <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
              <FaCalendar size={11} style={{
            color: '#10b981'
          }} />
              {paper.year}
            </span>}
          {paper.citation_count !== undefined && <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
              <FaQuoteRight size={11} style={{
            color: '#f59e0b'
          }} />
              {paper.citation_count} citations
            </span>}
        </div>

        {}
        {paper.abstract && <p style={{
        fontSize: '0.83rem',
        color: '#64748b',
        lineHeight: 1.65,
        marginBottom: '0.75rem',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
            {paper.abstract}
          </p>}

        {}
        {paper.keywords && paper.keywords.length > 0 && <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.4rem',
        marginBottom: '0.85rem'
      }}>
            {paper.keywords.slice(0, 5).map((keyword, index) => {
          const kc = keywordColors[index % keywordColors.length];
          return <span key={index} style={{
            padding: '0.2rem 0.6rem',
            borderRadius: 999,
            fontSize: '0.72rem',
            fontWeight: 500,
            background: kc.bg,
            color: kc.color,
            border: `1px solid ${kc.border}`
          }}>
                  {keyword}
                </span>;
        })}
            {paper.keywords.length > 5 && <span style={{
          padding: '0.2rem 0.6rem',
          fontSize: '0.72rem',
          color: '#475569'
        }}>
                +{paper.keywords.length - 5} more
              </span>}
          </div>}

        {}
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
          <Link to={`/papers/${paperId}`} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '0.82rem',
          fontWeight: 600,
          color: '#818cf8',
          textDecoration: 'none',
          transition: 'color 0.2s ease'
        }} onMouseEnter={e => {
          e.currentTarget.style.color = '#a5b4fc';
        }} onMouseLeave={e => {
          e.currentTarget.style.color = '#818cf8';
        }}>
            View details
            <FaArrowRight size={11} style={{
            transition: 'transform 0.2s ease'
          }} />
          </Link>

          {paper.doi && <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '0.82rem',
          fontWeight: 600,
          color: '#818cf8',
          textDecoration: 'none'
        }}>
              DOI <FaExternalLinkAlt size={10} />
            </a>}

          {paper.has_full_text && <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#6ee7b7',
          background: 'rgba(16,185,129,0.12)',
          padding: '0.2rem 0.6rem',
          borderRadius: 999,
          border: '1px solid rgba(16,185,129,0.25)'
        }}>
              Full text
            </span>}

          {paper.is_covid19 && <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#fca5a5',
          background: 'rgba(239,68,68,0.12)',
          padding: '0.2rem 0.6rem',
          borderRadius: 999,
          border: '1px solid rgba(239,68,68,0.25)'
        }}>
              COVID-19
            </span>}
        </div>
      </div>
    </div>;
};
export default PaperCard;

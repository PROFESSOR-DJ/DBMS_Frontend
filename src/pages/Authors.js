// Authors renders the authors page.
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { paperApi, authorApi } from '../api/authApi';
import { FaUser, FaSort, FaSearch, FaEdit, FaTrash, FaPlus, FaTrophy } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';
const rankColors = [{
  bg: 'linear-gradient(135deg,#f59e0b,#ef4444)',
  glow: 'rgba(245,158,11,0.4)'
}, {
  bg: 'linear-gradient(135deg,#94a3b8,#cbd5e1)',
  glow: 'rgba(148,163,184,0.3)'
}, {
  bg: 'linear-gradient(135deg,#b45309,#d97706)',
  glow: 'rgba(180,83,9,0.4)'
}];
const Authors = () => {
  const {
    isDark
  } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState('papers');
  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const data = searchTerm.trim() ? await authorApi.searchAuthors(searchTerm) : await paperApi.getAuthorStats(100);
      setAuthors(data.authors || []);
    } catch {
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const t = setTimeout(fetchAuthors, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);
  const sortedAuthors = useMemo(() => [...authors].sort((a, b) => {
    const cA = a.paper_count || a.count || 0,
      cB = b.paper_count || b.count || 0;
    const nA = a.name || a.author_name || a.author || '',
      nB = b.name || b.author_name || b.author || '';
    if (sortBy === 'papers') return cB - cA;
    if (sortBy === 'name') return nA.localeCompare(nB);
    return 0;
  }), [authors, sortBy]);
  const handleDelete = async id => {
    if (window.confirm('Delete this author?')) {
      try {
        await authorApi.deleteAuthor(id);
        toast.success('Author deleted');
        fetchAuthors();
      } catch {
        toast.error('Failed to delete author');
      }
    }
  };
  const maxPapers = sortedAuthors[0]?.paper_count || sortedAuthors[0]?.count || 1;
  return <div style={{
    minHeight: '100vh',
    background: t.pageBg,
    transition: 'background 0.4s ease'
  }}>
      <div style={{
      maxWidth: 1280,
      margin: '0 auto',
      padding: '2rem 1.5rem'
    }}>

        {}
        <div className="animate-fade-in" style={{
        marginBottom: '2rem'
      }}>
<div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
            <div>
              <h1 style={{
              fontSize: 'clamp(1.5rem,3vw,2.2rem)',
              fontWeight: 900,
              background: t.accentGrad,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em'
            }}>Author Analytics</h1>
              <p style={{ color: t.textMuted, fontSize: '0.875rem', marginTop: '0.25rem' }}>Top authors and their research contributions</p>
            </div>
            <button onClick={() => navigate('/authors/new')} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '0.6rem 1.1rem',
            borderRadius: 11,
            background: t.accentGrad,
            border: 'none',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: `0 4px 14px ${t.accentGlow}`,
            transition: 'all 0.2s ease'
          }} onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }} onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}><FaPlus size={12} /> Add Author</button>
          </div>
        </div>

        {}
        <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
          <div style={{
          flex: 1,
          minWidth: 240,
          position: 'relative'
        }}>
            <FaSearch size={14} style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: searchFocused ? t.accent : t.textMuted,
            transition: 'color 0.2s ease'
          }} />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} placeholder="Search authors..." style={{
            width: '100%',
            padding: '0.8rem 1rem 0.8rem 2.6rem',
            borderRadius: 12,
            background: searchFocused ? t.cardHover : t.inputBg,
            border: `1px solid ${searchFocused ? t.accentBorder : t.inputBorder}`,
            color: t.inputColor,
            fontSize: '0.9rem',
            outline: 'none',
            boxShadow: searchFocused ? `0 0 0 3px ${t.accentBg}` : 'none',
            transition: 'all 0.3s ease'
          }} />
          </div>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
            <FaSort size={13} style={{
            color: t.textMuted
          }} />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
            padding: '0.8rem 0.9rem',
            borderRadius: 12,
            background: t.inputBg,
            border: `1px solid ${t.inputBorder}`,
            color: t.textSecondary,
            fontSize: '0.875rem',
            outline: 'none',
            cursor: 'pointer'
          }}>
              <option value="papers">Most Papers</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        <div style={{
        marginBottom: '1rem'
      }}>
          <span style={{
          fontSize: '0.82rem',
          color: t.textMuted
        }}>Showing <span style={{
            fontWeight: 700,
            color: t.textPrimary
          }}>{sortedAuthors.length}</span> authors{searchTerm && <span style={{
            color: t.accentText
          }}> (search results)</span>}</span>
        </div>

        {}
        {loading ? <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '4rem 0'
      }}>
            <div style={{
          textAlign: 'center'
        }}>
              <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: `3px solid ${t.accentBg}`,
            borderTopColor: t.accent,
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{
            color: t.textMuted,
            fontSize: '0.875rem'
          }}>Loading authors…</p>
            </div>
          </div> : sortedAuthors.length === 0 ? <div style={{
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: 16,
        padding: '3rem',
        textAlign: 'center'
      }}>
            <p style={{
          color: t.textSecondary,
          fontSize: '1.05rem',
          marginBottom: '0.5rem'
        }}>No authors found matching "{searchTerm}"</p>
            {searchTerm && <button onClick={() => setSearchTerm('')} style={{
          color: t.accentText,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600
        }}>Clear search</button>}
          </div> : <div className="animate-fade-in" style={{
        background: t.cardBg,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${t.cardBorder}`,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
            <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 160px 120px 120px',
          padding: '0.75rem 1.25rem',
          borderBottom: `1px solid ${t.divider}`,
          background: t.tableHeaderBg
        }}>
              {['Rank', 'Author Name', 'Papers Published', 'Author ID', 'Actions'].map(h => <span key={h} style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: t.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.07em'
          }}>{h}</span>)}
            </div>
            {sortedAuthors.map((author, index) => {
          const paperCount = author.paper_count || author.count || 0;
          const name = author.name || author.author_name || author.author || 'Unknown';
          const barWidth = Math.max(4, paperCount / maxPapers * 100);
          const rc = rankColors[index] || null;
          return <div key={author.author_id || index} style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 160px 120px 120px',
            padding: '0.9rem 1.25rem',
            borderBottom: `1px solid ${t.tableDivider}`,
            alignItems: 'center',
            transition: 'background 0.2s ease'
          }} onMouseEnter={e => {
            e.currentTarget.style.background = t.tableRowHover;
          }} onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}>
                  <div>
                    {index < 3 ? <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: rc.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 2px 8px ${rc.glow}`
              }}><FaTrophy size={12} color="white" /></div> : <span style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: t.textMuted
              }}>#{index + 1}</span>}
                  </div>
                  <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
                    <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: t.accentGrad,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}><FaUser size={14} color="white" /></div>
                    <span style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: t.textPrimary
              }}>{name}</span>
                  </div>
                  <div>
                    <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                      <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: t.accentText,
                  minWidth: 32
                }}>{paperCount}</span>
                      <div style={{
                  flex: 1,
                  height: 5,
                  background: t.cardBorder,
                  borderRadius: 999,
                  overflow: 'hidden'
                }}>
                        <div style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    background: t.accentGrad,
                    borderRadius: 999
                  }} />
                      </div>
                    </div>
                  </div>
                  <span style={{
              fontSize: '0.78rem',
              color: t.textMuted,
              fontFamily: 'monospace'
            }}>{author.author_id || 'N/A'}</span>
                  <div style={{
              display: 'flex',
              gap: 6
            }}>
                    <button onClick={() => navigate(`/authors/edit/${author.author_id}`)} style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: t.accentBg,
                border: `1px solid ${t.accentBorder}`,
                color: t.accentText,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}><FaEdit size={12} /></button>
                    <button onClick={() => handleDelete(author.author_id)} style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}><FaTrash size={12} /></button>
                  </div>
                </div>;
        })}
          </div>}
      </div>
    </div>;
};
export default Authors;




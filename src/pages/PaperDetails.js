// PaperDetails renders the paper details page.
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { paperApi } from '../api/authApi';
import { FaCalendar, FaUser, FaNewspaper, FaLink, FaArrowLeft, FaQuoteRight, FaTag, FaCheckCircle, FaVirus } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';
import { cleanDisplayName } from '../utils/cleanName';
const PaperDetails = () => {
  const {
    id
  } = useParams();
  const {
    isDark
  } = useTheme();
  const t = getTheme(isDark);
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  useEffect(() => {
    if (id) fetchPaperDetails();
  }, [id]);
  const fetchPaperDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[PaperDetails] Fetching paper id:', id);
      const response = await paperApi.getPaperById(id);
      console.log('[PaperDetails] Raw response:', JSON.stringify(response).substring(0, 300));
      setRawResponse(response);
      const paperData = response?.paper || response;
      console.log('[PaperDetails] paperData.title:', paperData?.title);
      if (paperData && (paperData.title || paperData.paper_id)) {
        setPaper(paperData);
      } else {
        setError('Paper not found or has no data');
      }
    } catch (err) {
      console.error('[PaperDetails] Error:', err);
      setError('Failed to load: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  const getAuthorsArray = authors => {
    if (!authors) return [];
    if (Array.isArray(authors)) return authors.filter(Boolean);
    if (typeof authors === 'string') return authors.split(', ').map(a => a.trim()).filter(Boolean);
    return [];
  };
  if (loading) return <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: t.pageBg
  }}>
      <div style={{
      textAlign: 'center'
    }}>
        <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '3px solid rgba(6,182,212,0.2)',
        borderTopColor: '#06b6d4',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 1rem'
      }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{
        color: t.textMuted
      }}>Loading paper… (ID: {id})</p>
      </div>
    </div>;
  if (error || !paper) return <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: t.pageBg
  }}>
      <div style={{
      textAlign: 'center',
      maxWidth: 500,
      padding: '2rem'
    }}>
        <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        color: t.textPrimary,
        marginBottom: '1rem'
      }}>{error || 'Paper Not Found'}</h1>
        <p style={{
        color: t.textMuted,
        fontSize: '0.875rem',
        marginBottom: '0.5rem'
      }}>ID: <code style={{
          color: '#22d3ee'
        }}>{id}</code></p>
        {rawResponse && <pre style={{
        background: 'rgba(0,0,0,0.3)',
        color: '#94a3b8',
        borderRadius: 8,
        padding: '1rem',
        fontSize: '0.7rem',
        textAlign: 'left',
        maxHeight: 180,
        overflow: 'auto',
        marginBottom: '1rem'
      }}>
            {JSON.stringify(rawResponse, null, 2).substring(0, 400)}
          </pre>}
        <Link to="/papers" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '0.6rem 1.2rem',
        borderRadius: 10,
        background: 'linear-gradient(135deg,#06b6d4,#0ea5e9)',
        color: 'white',
        textDecoration: 'none',
        fontWeight: 600
      }}>
          <FaArrowLeft size={13} /> Back to Papers
        </Link>
      </div>
    </div>;
  const authors = getAuthorsArray(paper.authors);
  const card = {
    background: t.cardBg,
    backdropFilter: 'blur(16px)',
    border: '1px solid ' + t.cardBorder,
    borderRadius: 18,
    padding: '1.5rem',
    boxShadow: t.cardShadow,
    marginBottom: '1.5rem'
  };
  return <div style={{
    minHeight: '100vh',
    background: t.pageBg,
    transition: 'background 0.4s ease'
  }}>
      <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: '2rem 1.5rem'
    }}>

        <div style={{
        marginBottom: '1.5rem'
      }}>
          <Link to="/papers" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          fontSize: '0.875rem',
          fontWeight: 600,
          color: t.accentText,
          textDecoration: 'none'
        }}>
            <FaArrowLeft size={12} /> Back to Papers
          </Link>
        </div>

        {}
        <div style={{
        ...card,
        borderLeft: '4px solid ' + t.accent
      }}>
          <div style={{
          marginBottom: '0.5rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
            {paper.is_covid19 && <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#fca5a5',
            background: 'rgba(239,68,68,0.12)',
            padding: '0.2rem 0.65rem',
            borderRadius: 999,
            border: '1px solid rgba(239,68,68,0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}><FaVirus size={10} /> COVID-19</span>}
            {paper.has_full_text && <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#6ee7b7',
            background: 'rgba(16,185,129,0.12)',
            padding: '0.2rem 0.65rem',
            borderRadius: 999,
            border: '1px solid rgba(16,185,129,0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}><FaCheckCircle size={10} /> Full Text</span>}
          </div>
          <h1 style={{
          fontSize: 'clamp(1.2rem,2.5vw,1.7rem)',
          fontWeight: 800,
          color: t.textPrimary,
          lineHeight: 1.4,
          marginBottom: '1.25rem'
        }}>{paper.title}</h1>
          <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
            {paper.year && <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.875rem',
            color: t.textSecondary
          }}><FaCalendar size={13} style={{
              color: '#10b981'
            }} /><span>{paper.year}</span></div>}
            {paper.journal && <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.875rem',
            color: t.textSecondary
          }}><FaNewspaper size={13} style={{
              color: '#a855f7'
            }} /><span>{paper.journal}</span></div>}
            {paper.citation_count != null && <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.875rem',
            color: t.textSecondary
          }}><FaQuoteRight size={13} style={{
              color: '#f59e0b'
            }} /><span>{paper.citation_count} citations</span></div>}
            {paper.doi && <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.875rem'
          }}><FaLink size={13} style={{
              color: t.accent
            }} /><a href={'https://doi.org/' + paper.doi} target="_blank" rel="noopener noreferrer" style={{
              color: t.accentText,
              textDecoration: 'none',
              fontWeight: 500
            }}>{paper.doi}</a></div>}
          </div>
        </div>

        <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
          <div>
            {authors.length > 0 && <div style={card}>
                <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: t.textPrimary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}><FaUser size={14} style={{
                color: t.accent
              }} /> Authors ({authors.length})</h3>
                <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
                  {authors.map((a, i) => <span key={i} style={{
                padding: '0.3rem 0.85rem',
                borderRadius: 999,
                fontSize: '0.82rem',
                fontWeight: 500,
                background: t.accentBg,
                color: t.accentText,
                border: '1px solid ' + t.accentBorder
              }}>{cleanDisplayName(a)}</span>)}
                </div>
              </div>}

            <div style={card}>
              <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: t.textPrimary,
              marginBottom: '1rem'
            }}>Abstract</h3>
              {paper.abstract && paper.abstract.trim() !== '' ? <p style={{
              fontSize: '0.9rem',
              color: t.textSecondary,
              lineHeight: 1.75
            }}>{paper.abstract}</p> : <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '1rem',
              borderRadius: 10,
              background: 'rgba(148,163,184,0.06)',
              border: '1px dashed rgba(148,163,184,0.2)'
            }}>
                  <span style={{
                fontSize: '1.5rem'
              }}>📄</span>
                  <div>
                    <p style={{
                  color: t.textMuted,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: '0.2rem'
                }}>No abstract available</p>
                    <p style={{
                  color: t.textMuted,
                  fontSize: '0.78rem',
                  opacity: 0.7
                }}>This paper does not have an abstract stored.</p>
                  </div>
                </div>}
            </div>

            {paper.keywords && paper.keywords.length > 0 && <div style={card}>
                <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: t.textPrimary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}><FaTag size={13} style={{
                color: t.accent
              }} /> Keywords</h3>
                <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
                  {paper.keywords.map((kw, i) => <span key={i} style={{
                padding: '0.25rem 0.75rem',
                borderRadius: 999,
                fontSize: '0.78rem',
                fontWeight: 500,
                background: 'rgba(168,85,247,0.12)',
                color: '#d8b4fe',
                border: '1px solid rgba(168,85,247,0.25)'
              }}>{kw}</span>)}
                </div>
              </div>}
          </div>

          <div>
            <div style={card}>
              <h3 style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: t.textPrimary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}><FaNewspaper size={13} style={{
                color: '#a855f7'
              }} /> Publication Details</h3>
              <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
                {[['Journal', paper.journal], ['Year', paper.year], ['DOI', paper.doi], ['Paper ID', paper.paper_id]].filter(([, v]) => v !== undefined && v !== null && v !== '').map(([label, value]) => <div key={label} style={{
                borderBottom: '1px solid ' + t.divider,
                paddingBottom: '0.6rem'
              }}>
                      <p style={{
                  fontSize: '0.72rem',
                  color: t.textMuted,
                  marginBottom: '0.2rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>{label}</p>
                      <p style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: t.textSecondary,
                  wordBreak: 'break-all'
                }}>{String(value)}</p>
                    </div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default PaperDetails;


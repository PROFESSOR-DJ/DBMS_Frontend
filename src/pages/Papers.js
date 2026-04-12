// Papers renders the papers page.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paperApi } from '../api/authApi';
import PaperCard from '../components/PaperCard';
import { FaFilter, FaSort, FaSearch, FaTimes, FaChevronDown, FaChevronUp, FaCalendarAlt, FaNewspaper, FaUser, FaStar, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';
const Papers = () => {
  const {
    isDark
  } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    yearFrom: '',
    yearTo: '',
    journal: '',
    author: '',
    highlyCollaborative: false,
    sortBy: 'recent'
  });
  const [expandedSections, setExpandedSections] = useState({
    year: true,
    journal: false,
    author: false,
    collaboration: false
  });
  const [showFilters, setShowFilters] = useState(true);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [filterOptions] = useState({
    years: Array.from({
      length: 20
    }, (_, i) => 2024 - i)
  });
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) {
      setSearchQuery(q);
      handleSearch(q, filtersRef.current, page);
    } else {
      fetchPapers(filtersRef.current, page);
    }
  }, [page, filters.sortBy]);
  useEffect(() => {
    setActiveFiltersCount(Object.entries(filters).filter(([k, v]) => k !== 'sortBy' && ((typeof v === 'boolean' && v) || (typeof v !== 'boolean' && v))).length);
  }, [filters]);
  const fetchPapers = async (filterSnapshot = filtersRef.current, pageSnapshot = page) => {
    setLoading(true);
    try {
      const d = await paperApi.getAllPapers(pageSnapshot, 20, filterSnapshot.sortBy, {
        ...(filterSnapshot.yearFrom && {
          yearFrom: filterSnapshot.yearFrom
        }),
        ...(filterSnapshot.yearTo && {
          yearTo: filterSnapshot.yearTo
        }),
        ...(filterSnapshot.journal && {
          journal: filterSnapshot.journal
        }),
        ...(filterSnapshot.author && {
          author: filterSnapshot.author
        }),
        highlyCollaborative: filterSnapshot.highlyCollaborative
      });
      setPapers(d.papers || []);
      setTotalPages(d.pagination?.pages || 1);
      setTotal(d.pagination?.total || 0);
    } catch {
      toast.error('Failed to load papers');
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = async (query = searchQuery, filterSnapshot = filtersRef.current, pageSnapshot = 1) => {
    if (!query.trim()) {
      fetchPapers(filterSnapshot, pageSnapshot);
      return;
    }
    setLoading(true);
    try {
      const sf = {
        ...(filterSnapshot.yearFrom && {
          yearFrom: filterSnapshot.yearFrom
        }),
        ...(filterSnapshot.yearTo && {
          yearTo: filterSnapshot.yearTo
        }),
        ...(filterSnapshot.journal && {
          journal: filterSnapshot.journal
        }),
        ...(filterSnapshot.author && {
          author: filterSnapshot.author
        }),
        ...(filterSnapshot.highlyCollaborative && {
          highlyCollaborative: true
        }),
        sortBy: filterSnapshot.sortBy,
        page: pageSnapshot,
        limit: 20
      };
      const d = await paperApi.searchPapers(query, sf);
      setPapers(d.papers || []);
      setTotal(d.total || 0);
      setTotalPages(d.pagination?.pages || 1);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = (k, v) => setFilters(p => ({
    ...p,
    [k]: v
  }));
  const applyFilters = () => {
    const nextFilters = {
      ...filtersRef.current
    };

    if (page !== 1) {
      setPage(1);
      return;
    }

    searchQuery ? handleSearch(searchQuery, nextFilters, 1) : fetchPapers(nextFilters, 1);
  };
  const clearAllFilters = () => {
    setFilters({
      yearFrom: '',
      yearTo: '',
      journal: '',
      author: '',
      highlyCollaborative: false,
      sortBy: 'recent'
    });
    setSearchQuery('');
    setPage(1);
  };
  const toggleSection = s => setExpandedSections(p => ({
    ...p,
    [s]: !p[s]
  }));
  const removeFilter = k => setFilters(p => ({
    ...p,
    [k]: typeof p[k] === 'boolean' ? false : ''
  }));
  const handleToggleHighlyCollaborative = () => {
    setFilters(prev => ({
      ...prev,
      highlyCollaborative: !prev.highlyCollaborative
    }));
  };
  const handleEdit = paper => navigate(`/papers/edit/${paper.paper_id || paper._id}`);
  const handleDelete = async id => {
    if (window.confirm('Delete this paper?')) {
      try {
        await paperApi.deletePaper(id);
        toast.success('Deleted');
        fetchPapers();
      } catch {
        toast.error('Failed to delete');
      }
    }
  };
  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: 10,
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    color: t.inputColor,
    fontSize: '0.85rem',
    outline: 'none'
  };
  const applyBtn = <button onClick={applyFilters} style={{
    width: '100%',
    padding: '0.45rem',
    borderRadius: 8,
    background: t.accentGrad,
    border: 'none',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer'
  }}>Apply</button>;
  const FilterSection = ({
    id,
    icon: Icon,
    label,
    children
  }) => <div style={{
    borderBottom: `1px solid ${t.divider}`,
    padding: '0.85rem 1rem'
  }}>
      <button onClick={() => toggleSection(id)} style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      marginBottom: expandedSections[id] ? '0.75rem' : 0
    }}>
        <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        fontSize: '0.85rem',
        fontWeight: 600,
        color: t.textSecondary
      }}>
          <Icon size={13} style={{
          color: t.accent
        }} /> {label}
        </span>
        {expandedSections[id] ? <FaChevronUp size={11} color={t.textMuted} /> : <FaChevronDown size={11} color={t.textMuted} />}
      </button>
      {expandedSections[id] && <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>{children}</div>}
    </div>;
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
        marginBottom: '1.75rem'
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
            }}>Research Papers</h1>
              <p style={{ color: t.textMuted, fontSize: '0.875rem', marginTop: '0.25rem' }}>Browse and explore research papers</p>
            </div>
            <button onClick={() => navigate('/papers/new')} style={{
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
            e.currentTarget.style.boxShadow = `0 8px 20px ${t.accentGlow}`;
          }} onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 14px ${t.accentGlow}`;
          }}><FaPlus size={12} /> Add Paper</button>
          </div>
        </div>

        {}
        <div style={{
        marginBottom: '1.25rem',
        position: 'relative'
      }}>
          <FaSearch size={15} style={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          color: searchFocused ? t.accent : t.textMuted,
          transition: 'color 0.2s ease',
          zIndex: 1
        }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} placeholder="Search by title, author, keyword, or abstract..." style={{
          width: '100%',
          padding: '0.9rem 8rem 0.9rem 2.75rem',
          borderRadius: 14,
          background: searchFocused ? t.cardHover : t.inputBg,
          border: `1px solid ${searchFocused ? t.accentBorder : t.inputBorder}`,
          color: t.inputColor,
          fontSize: '0.95rem',
          outline: 'none',
          boxShadow: searchFocused ? `0 0 0 3px ${t.accentBg}` : 'none',
          transition: 'all 0.3s ease'
        }} />
          <button onClick={() => handleSearch()} style={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '0.5rem 1.2rem',
          borderRadius: 10,
          background: t.accentGrad,
          border: 'none',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: 'pointer'
        }}>Search</button>
        </div>

        {}
        {activeFiltersCount > 0 && <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
            <span style={{
          fontSize: '0.78rem',
          color: t.textMuted,
          fontWeight: 600
        }}>Active filters:</span>
            {[['yearFrom', 'Year from'], ['yearTo', 'Year to'], ['journal', 'Journal'], ['author', 'Author']].map(([k, label]) => filters[k] ? <span key={k} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '0.25rem 0.7rem',
          borderRadius: 999,
          fontSize: '0.78rem',
          background: t.accentBg,
          color: t.accentText,
          border: `1px solid ${t.accentBorder}`
        }}>
                  {label}: {filters[k]}
                  <button onClick={() => removeFilter(k)} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: t.accentText,
            display: 'flex'
          }}><FaTimes size={10} /></button>
                </span> : null)}
            {filters.highlyCollaborative && <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '0.25rem 0.7rem',
          borderRadius: 999,
          fontSize: '0.78rem',
          background: t.accentBg,
          color: t.accentText,
          border: `1px solid ${t.accentBorder}`
        }}>
                Potentially collaborative
                <button onClick={() => removeFilter('highlyCollaborative')} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: t.accentText,
            display: 'flex'
          }}><FaTimes size={10} /></button>
              </span>}
            <button onClick={clearAllFilters} style={{
          fontSize: '0.78rem',
          color: t.accentText,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600
        }}>Clear all</button>
          </div>}

        {}
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
            <p style={{
            fontSize: '0.875rem',
            color: t.textSecondary
          }}>
              <span style={{
              fontWeight: 700,
              color: t.textPrimary
            }}>{total.toLocaleString()}</span> results
              {searchQuery && <span> for "<strong style={{
                color: t.accentText
              }}>{searchQuery}</strong>"</span>}
            </p>
            <button onClick={() => setShowFilters(!showFilters)} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: t.accentText,
            background: t.accentBg,
            border: `1px solid ${t.accentBorder}`,
            borderRadius: 8,
            padding: '0.35rem 0.75rem',
            cursor: 'pointer'
          }}>
              <FaFilter size={11} />{showFilters ? 'Hide' : 'Show'} Filters
              {activeFiltersCount > 0 && <span style={{
              background: t.accentGrad,
              color: 'white',
              borderRadius: 999,
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700
            }}>{activeFiltersCount}</span>}
            </button>
          </div>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
            <FaSort size={13} style={{
            color: t.textMuted
          }} />
            <select value={filters.sortBy} onChange={e => handleFilterChange('sortBy', e.target.value)} style={{
            ...inputStyle,
            width: 'auto',
            padding: '0.4rem 0.75rem'
          }}>
              <option value="recent">Most Recent</option>
              <option value="citations">Most Cited</option>
              <option value="title">Title A-Z</option>
              <option value="relevance">Relevance</option>
            </select>
          </div>
        </div>

        {}
        <div style={{
        display: 'grid',
        gridTemplateColumns: showFilters ? '240px 1fr' : '1fr',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
          {showFilters && <div style={{
          background: t.cardBg,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${t.cardBorder}`,
          borderRadius: 16,
          overflow: 'hidden',
          position: 'sticky',
          top: '5rem'
        }}>
              <div style={{
            padding: '0.85rem 1rem',
            borderBottom: `1px solid ${t.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
                <span style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: t.textPrimary
            }}>Refine Results</span>
                {activeFiltersCount > 0 && <button onClick={clearAllFilters} style={{
              fontSize: '0.75rem',
              color: t.accentText,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}>Clear all</button>}
              </div>
              <FilterSection id="year" icon={FaCalendarAlt} label="Publication Year">
                <div><label style={{
                display: 'block',
                fontSize: '0.72rem',
                color: t.textMuted,
                marginBottom: '0.3rem'
              }}>From</label><select value={filters.yearFrom} onChange={e => handleFilterChange('yearFrom', e.target.value)} style={inputStyle}><option value="">Any year</option>{filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                <div><label style={{
                display: 'block',
                fontSize: '0.72rem',
                color: t.textMuted,
                marginBottom: '0.3rem'
              }}>To</label><select value={filters.yearTo} onChange={e => handleFilterChange('yearTo', e.target.value)} style={inputStyle}><option value="">Any year</option>{filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                {applyBtn}
              </FilterSection>
              <FilterSection id="journal" icon={FaNewspaper} label="Journal"><input type="text" value={filters.journal} onChange={e => handleFilterChange('journal', e.target.value)} placeholder="Enter journal name" style={inputStyle} />{applyBtn}</FilterSection>
              <FilterSection id="author" icon={FaUser} label="Author"><input type="text" value={filters.author} onChange={e => handleFilterChange('author', e.target.value)} placeholder="Enter author name" style={inputStyle} />{applyBtn}</FilterSection>
              <FilterSection id="collaboration" icon={FaStar} label="Collaboration">
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.82rem',
                  color: t.textSecondary,
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={filters.highlyCollaborative}
                    onChange={handleToggleHighlyCollaborative}
                    style={{ accentColor: t.accent, width: 15, height: 15 }}
                  />
                  Show only potentially collaborative papers
                </label>
                <p style={{ margin: 0, fontSize: '0.72rem', color: t.textMuted, lineHeight: 1.45 }}>
                  Uses `trg_mark_important_paper` to surface papers with broader collaboration potential.
                </p>
                {applyBtn}
              </FilterSection>
            </div>}

          <div>
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
              }}>Loading papers…</p>
                </div>
              </div> : papers.length === 0 ? <div style={{
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
            }}>No papers found</p>
                <p style={{
              color: t.textMuted,
              fontSize: '0.875rem',
              marginBottom: '1.25rem'
            }}>Try adjusting your search or filters</p>
                <button onClick={clearAllFilters} className="btn-primary">Clear all filters</button>
              </div> : <>
                <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
                  {papers.map(paper => <div key={paper.paper_id || paper._id} style={{
                position: 'relative'
              }} className="group">
                      <PaperCard paper={paper} />
                      <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  display: 'flex',
                  gap: 6,
                  opacity: 0,
                  zIndex: 10,
                  transition: 'opacity 0.2s ease'
                }} className="group-hover-actions">
                        <button onClick={e => {
                    e.preventDefault();
                    handleEdit(paper);
                  }} style={{
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
                  }} title="Edit"><FaEdit size={12} /></button>
                        <button onClick={e => {
                    e.preventDefault();
                    handleDelete(paper.paper_id || paper._id);
                  }} style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }} title="Delete"><FaTrash size={12} /></button>
                      </div>
                    </div>)}
                </div>
                {totalPages > 1 && <div style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                padding: '0.5rem 1rem',
                borderRadius: 10,
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                color: t.textSecondary,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.4 : 1,
                fontSize: '0.85rem'
              }}>← Prev</button>
                    {Array.from({
                length: Math.min(5, totalPages)
              }, (_, i) => {
                let pn;
                if (totalPages <= 5) pn = i + 1;else if (page <= 3) pn = i + 1;else if (page >= totalPages - 2) pn = totalPages - 4 + i;else pn = page - 2 + i;
                if (pn < 1 || pn > totalPages) return null;
                return <button key={pn} onClick={() => setPage(pn)} style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: page === pn ? t.accentGrad : t.cardBg,
                  border: page === pn ? 'none' : `1px solid ${t.cardBorder}`,
                  color: page === pn ? 'white' : t.textSecondary,
                  boxShadow: page === pn ? `0 4px 12px ${t.accentGlow}` : 'none'
                }}>{pn}</button>;
              })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                padding: '0.5rem 1rem',
                borderRadius: 10,
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                color: t.textSecondary,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.4 : 1,
                fontSize: '0.85rem'
              }}>Next →</button>
                  </div>}
              </>}
          </div>
        </div>
      </div>
      <style>{`.group:hover .group-hover-actions{opacity:1!important}`}</style>
    </div>;
};
export default Papers;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorApi } from '../api/authApi';
import {
  FaArrowRight,
  FaDatabase,
  FaEdit,
  FaLightbulb,
  FaPlus,
  FaSearch,
  FaSort,
  FaTrash,
  FaTrophy,
  FaUser,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';
import { cleanDisplayName } from '../utils/cleanName';

const rankColors = [
  { bg: 'linear-gradient(135deg,#f59e0b,#ef4444)', glow: 'rgba(245,158,11,0.4)' },
  { bg: 'linear-gradient(135deg,#94a3b8,#cbd5e1)', glow: 'rgba(148,163,184,0.3)' },
  { bg: 'linear-gradient(135deg,#b45309,#d97706)', glow: 'rgba(180,83,9,0.4)' },
];

const Authors = () => {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();

  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [dataSource, setDataSource] = useState('table');
  const [selectedAuthorId, setSelectedAuthorId] = useState(null);
  const [authorInsights, setAuthorInsights] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    try {
      if (searchTerm.trim()) {
        const data = await authorApi.searchAuthors(searchTerm);
        setAuthors(data.authors || []);
        setDataSource('search');
      } else {
        const data = await authorApi.getAllAuthors({ limit: 250, offset: 0, sortBy });
        setAuthors(data.authors || []);
        setDataSource('table');
      }
    } catch {
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchAuthors, 400);
    return () => clearTimeout(timer);
  }, [fetchAuthors]);

  const sortedAuthors = useMemo(() => (
    [...authors].sort((a, b) => {
      const cA = a.total_papers ?? a.paper_count ?? a.count ?? 0;
      const cB = b.total_papers ?? b.paper_count ?? b.count ?? 0;
      const nA = cleanDisplayName(a.author_name ?? a.name ?? a.author ?? '');
      const nB = cleanDisplayName(b.author_name ?? b.name ?? b.author ?? '');
      const dA = new Date(a.created_at || 0).getTime();
      const dB = new Date(b.created_at || 0).getTime();
      if (sortBy === 'papers') return cB - cA;
      if (sortBy === 'name') return nA.localeCompare(nB);
      return dB - dA;
    })
  ), [authors, sortBy]);

  const selectedAuthor = useMemo(
    () => sortedAuthors.find(author => author.author_id === selectedAuthorId) || null,
    [sortedAuthors, selectedAuthorId]
  );

  const maxPapers = sortedAuthors[0]
    ? (sortedAuthors[0].total_papers ?? sortedAuthors[0].paper_count ?? sortedAuthors[0].count ?? 1)
    : 1;

  const loadAuthorInsights = useCallback(async author => {
    if (!author?.author_id) return;
    setSelectedAuthorId(author.author_id);
    setInsightLoading(true);
    try {
      const data = await authorApi.getAuthorInsights(author.author_id);
      setAuthorInsights(data);
    } catch {
      toast.error('Failed to load author insight panel');
      setAuthorInsights(null);
    } finally {
      setInsightLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sortedAuthors.length) {
      setSelectedAuthorId(null);
      setAuthorInsights(null);
      return;
    }

    if (!selectedAuthorId || !sortedAuthors.some(author => author.author_id === selectedAuthorId)) {
      loadAuthorInsights(sortedAuthors[0]);
    }
  }, [sortedAuthors, selectedAuthorId, loadAuthorInsights]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this author?')) return;
    try {
      await authorApi.deleteAuthor(id);
      toast.success('Author deleted');
      fetchAuthors();
      if (selectedAuthorId === id) {
        setSelectedAuthorId(null);
        setAuthorInsights(null);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete author';
      toast.error(msg);
    }
  };

  const cardStyle = {
    background: t.cardBg,
    border: `1px solid ${t.cardBorder}`,
    borderRadius: 18,
    boxShadow: t.cardShadow,
    backdropFilter: 'blur(16px)',
  };

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, transition: 'background 0.4s ease' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, background: t.accentGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em' }}>
                Author Analytics
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.3rem', flexWrap: 'wrap' }}>
                <p style={{ color: t.textMuted, fontSize: '0.875rem', margin: 0 }}>
                  Researcher discovery, publication strength, topic signals, and collaboration context
                </p>
                {dataSource === 'table' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.15rem 0.55rem', borderRadius: 999, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', fontSize: '0.68rem', fontWeight: 700, color: '#22d3ee' }}>
                    <FaDatabase size={8} />
                    mysql + mongodb + neo4j
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => navigate('/authors/new')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '0.6rem 1.1rem', borderRadius: 11, background: t.accentGrad, border: 'none', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: `0 4px 14px ${t.accentGlow}` }}>
              <FaPlus size={12} /> Add Author
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <FaSearch size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: searchFocused ? t.accent : t.textMuted }} />
            <input
              type="text"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search authors…"
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.6rem', borderRadius: 12, background: searchFocused ? t.cardHover : t.inputBg, border: `1px solid ${searchFocused ? t.accentBorder : t.inputBorder}`, color: t.inputColor, fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaSort size={13} style={{ color: t.textMuted }} />
            <select value={sortBy} onChange={event => setSortBy(event.target.value)} style={{ padding: '0.8rem 0.9rem', borderRadius: 12, background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textSecondary, fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}>
              <option value="papers">Most Papers</option>
              <option value="recent">Recently Added</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            ['Visible Authors', sortedAuthors.length, '#06b6d4'],
            ['Most Papers', maxPapers, '#10b981'],
            ['Selected', selectedAuthor ? cleanDisplayName(selectedAuthor.author_name ?? selectedAuthor.name ?? selectedAuthor.author ?? 'Unknown') : '—', '#a855f7'],
          ].map(([label, value, color]) => (
            <div key={label} style={{ ...cardStyle, padding: '1rem 1.1rem' }}>
              <div style={{ fontSize: '0.72rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              <div style={{ marginTop: '0.35rem', color, fontSize: typeof value === 'number' ? '1.8rem' : '1rem', fontWeight: 800, lineHeight: 1.2 }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${t.accentBg}`, borderTopColor: t.accent, animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ color: t.textMuted, fontSize: '0.875rem' }}>Loading authors…</p>
            </div>
          </div>
        ) : sortedAuthors.length === 0 ? (
          <div style={{ ...cardStyle, padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: t.textSecondary, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
              No authors found{searchTerm ? ` matching "${searchTerm}"` : ''}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(320px,0.8fr)', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 160px 120px 120px', padding: '0.75rem 1.25rem', borderBottom: `1px solid ${t.divider}`, background: t.tableHeaderBg }}>
                {['Rank', 'Author Name', 'Papers Published', 'Author ID', 'Actions'].map(header => (
                  <span key={header} style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{header}</span>
                ))}
              </div>

              {sortedAuthors.map((author, index) => {
                const paperCount = author.total_papers ?? author.paper_count ?? author.count ?? 0;
                const name = cleanDisplayName(author.author_name ?? author.name ?? author.author ?? 'Unknown');
                const barWidth = Math.max(4, (paperCount / maxPapers) * 100);
                const rc = rankColors[index] || null;
                const active = author.author_id === selectedAuthorId;

                return (
                  <div
                    key={author.author_id || index}
                    style={{ display: 'grid', gridTemplateColumns: '60px 1fr 160px 120px 120px', padding: '0.9rem 1.25rem', borderBottom: `1px solid ${t.tableDivider}`, alignItems: 'center', background: active ? t.tableRowHover : 'transparent', cursor: 'pointer' }}
                    onClick={() => loadAuthorInsights(author)}
                  >
                    <div>
                      {index < 3 ? (
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px ${rc.glow}` }}>
                          <FaTrophy size={12} color="white" />
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: t.textMuted }}>#{index + 1}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FaUser size={14} color="white" />
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: t.textPrimary }}>{name}</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: t.accentText, minWidth: 32 }}>{paperCount}</span>
                        <div style={{ flex: 1, height: 5, background: t.cardBorder, borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${barWidth}%`, height: '100%', background: t.accentGrad, borderRadius: 999 }} />
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.78rem', color: t.textMuted, fontFamily: 'monospace' }}>{author.author_id || 'N/A'}</span>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={event => { event.stopPropagation(); navigate(`/authors/edit/${author.author_id}`); }} style={{ width: 30, height: 30, borderRadius: 8, background: t.accentBg, border: `1px solid ${t.accentBorder}`, color: t.accentText, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaEdit size={12} />
                      </button>
                      <button onClick={event => { event.stopPropagation(); handleDelete(author.author_id); }} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ ...cardStyle, padding: '1.25rem', position: 'sticky', top: 92 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: t.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaLightbulb size={14} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: t.textPrimary, fontSize: '1rem', fontWeight: 700 }}>Author Research Profile</h3>
                  <p style={{ margin: 0, color: t.textMuted, fontSize: '0.74rem' }}>Structured identity, topical signal, collaboration map</p>
                </div>
              </div>

              {insightLoading ? (
                <p style={{ color: t.textMuted, fontSize: '0.85rem' }}>Loading author insights…</p>
              ) : !authorInsights ? (
                <p style={{ color: t.textMuted, fontSize: '0.85rem' }}>Select an author to view their profile.</p>
              ) : (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: t.textPrimary, fontSize: '1.05rem', fontWeight: 800 }}>{cleanDisplayName(authorInsights.author.author_name)}</div>
                    <div style={{ marginTop: '0.3rem', color: t.textMuted, fontSize: '0.78rem' }}>
                      {authorInsights.mysql.paper_count} MySQL papers • {authorInsights.mongodb.total_citations || 0} citations • {authorInsights.neo4j.coauthors?.length || 0} co-authors
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                    {[
                      ['Papers', authorInsights.mysql.paper_count, '#06b6d4'],
                      ['Avg citations', authorInsights.mongodb.avg_citations ?? 0, '#10b981'],
                      ['First year', authorInsights.mongodb.first_year || '—', '#f59e0b'],
                      ['Collab score', authorInsights.neo4j.collaboration_strength || 0, '#a855f7'],
                    ].map(([label, value, color]) => (
                      <div key={label} style={{ padding: '0.8rem', borderRadius: 14, background: t.inputBg, border: `1px solid ${t.inputBorder}` }}>
                        <div style={{ color: t.textMuted, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ marginTop: '0.3rem', color, fontSize: '1.1rem', fontWeight: 800 }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: t.textPrimary, fontWeight: 700, marginBottom: '0.55rem' }}>Top topics</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(authorInsights.mongodb.top_keywords || []).slice(0, 6).map(item => (
                        <span key={item.keyword} style={{ padding: '0.32rem 0.6rem', borderRadius: 999, background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textSecondary, fontSize: '0.74rem', fontWeight: 600 }}>
                          {item.keyword} ({item.count})
                        </span>
                      ))}
                      {!authorInsights.mongodb.top_keywords?.length && <span style={{ color: t.textMuted, fontSize: '0.8rem' }}>No keyword signal available.</span>}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: t.textPrimary, fontWeight: 700, marginBottom: '0.55rem' }}>Top collaborators</div>
                    <div style={{ display: 'grid', gap: '0.55rem' }}>
                      {(authorInsights.neo4j.coauthors || []).slice(0, 4).map(item => (
                        <button key={item.name} onClick={() => navigate('/graph')} style={{ width: '100%', textAlign: 'left', padding: '0.72rem 0.8rem', background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12, cursor: 'pointer' }}>
                          <div style={{ color: t.textPrimary, fontWeight: 700, fontSize: '0.83rem' }}>{cleanDisplayName(item.name)}</div>
                          <div style={{ color: t.textMuted, fontSize: '0.75rem' }}>{item.shared_papers} shared papers</div>
                        </button>
                      ))}
                      {!authorInsights.neo4j.coauthors?.length && <p style={{ color: t.textMuted, fontSize: '0.8rem', margin: 0 }}>No collaboration links found in Neo4j.</p>}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: t.textPrimary, fontWeight: 700, marginBottom: '0.55rem' }}>Recent papers from MongoDB</div>
                    <div style={{ display: 'grid', gap: '0.55rem' }}>
                      {(authorInsights.mongodb.recent_papers || []).slice(0, 4).map(paper => (
                        <button key={paper.paper_id || paper.title} onClick={() => paper.paper_id && navigate(`/papers/${paper.paper_id}`)} style={{ width: '100%', textAlign: 'left', padding: '0.72rem 0.8rem', background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12, cursor: paper.paper_id ? 'pointer' : 'default' }}>
                          <div style={{ color: t.textPrimary, fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.45 }}>{paper.title}</div>
                          <div style={{ color: t.textMuted, fontSize: '0.75rem', marginTop: '0.2rem' }}>{paper.year || 'Year n/a'} • {paper.journal || 'Journal n/a'} • {paper.citation_count || 0} citations</div>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => navigate('/graph')} style={{ marginTop: '0.85rem', width: '100%', padding: '0.8rem 1rem', borderRadius: 12, background: t.accentGrad, border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                      Explore collaboration graph <FaArrowRight size={10} style={{ marginLeft: 6 }} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Authors;

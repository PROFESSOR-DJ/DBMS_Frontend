// GraphExplorer renders graph analytics, publication stats, and author network exploration.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as d3 from 'd3';
import { cleanDisplayName } from '../utils/cleanName';
import { graphApi } from '../api/graphApi';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';
import { FaProjectDiagram, FaUser, FaNewspaper, FaDatabase, FaSearch, FaSpinner, FaNetworkWired, FaChartBar, FaArrowRight, FaTimes, FaInfoCircle, FaRoute } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import toast from 'react-hot-toast';

const ForceGraph = ({ author, coAuthors, t }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!coAuthors?.length || !svgRef.current) return;

    const width = svgRef.current.clientWidth || 600;
    const height = 420;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes = [
      { id: author, group: 0 },
      ...coAuthors.slice(0, 20).map(c => ({ id: cleanDisplayName(c.name), group: 1, papers: c.sharedPapers }))
    ];

    const links = coAuthors.slice(0, 20).map(c => ({
      source: author,
      target: cleanDisplayName(c.name),
      value: c.sharedPapers
    }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(168,85,247,0.35)')
      .attr('stroke-width', d => Math.min(d.value, 5));

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.group === 0 ? 14 : 8)
      .attr('fill', d => d.group === 0 ? '#a855f7' : '#06b6d4')
      .attr('stroke', d => d.group === 0 ? '#d8b4fe' : '#22d3ee')
      .attr('stroke-width', 2)
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.id.length > 18 ? d.id.slice(0, 18) + '…' : d.id)
      .attr('font-size', d => d.group === 0 ? 13 : 10)
      .attr('fill', t.textSecondary)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.group === 0 ? -18 : -12);

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('cx', d => d.x).attr('cy', d => d.y);
      label.attr('x', d => d.x).attr('y', d => d.y);
    });

    return () => simulation.stop();
  }, [author, coAuthors, t]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={420}
      style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 14, cursor: 'grab' }}
    />
  );
};


const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];
const quartileTone = quartile => ({
  Q1: { bg: 'rgba(16,185,129,0.16)', border: 'rgba(16,185,129,0.28)', text: '#34d399' },
  Q2: { bg: 'rgba(14,165,233,0.16)', border: 'rgba(14,165,233,0.28)', text: '#38bdf8' },
  Q3: { bg: 'rgba(245,158,11,0.16)', border: 'rgba(245,158,11,0.28)', text: '#fbbf24' },
  Q4: { bg: 'rgba(239,68,68,0.16)', border: 'rgba(239,68,68,0.28)', text: '#f87171' },
  fallback: { bg: 'rgba(148,163,184,0.16)', border: 'rgba(148,163,184,0.28)', text: '#cbd5e1' }
}[quartile] || { bg: 'rgba(148,163,184,0.16)', border: 'rgba(148,163,184,0.28)', text: '#cbd5e1' });
const formatMetric = (value, digits = 2) => value === null || value === undefined || value === '' ? '—' : Number(value).toLocaleString(undefined, {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
});
const CustomTooltip = ({
  active,
  payload,
  label
}) => {
  if (!active || !payload?.length) return null;
  return <div style={{
    background: 'rgba(10,15,30,0.97)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '0.65rem 0.9rem',
    fontSize: '0.8rem',
    color: '#f1f5f9'
  }}>
      <p style={{
      fontWeight: 700,
      marginBottom: '0.3rem',
      color: '#a5b4fc'
    }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{
      color: p.color
    }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong></p>)}
    </div>;
};
const StatPill = ({
  label,
  value,
  sub,
  color,
  loading
}) => <div style={{
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${color}30`,
  borderRadius: 16,
  padding: '1.1rem 1.3rem'
}}>
    <p style={{
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '0.35rem'
  }}>{label}</p>
    <p style={{
    fontSize: '1.65rem',
    fontWeight: 800,
    background: `linear-gradient(135deg,${color},${color}bb)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.1,
    marginBottom: '0.25rem'
  }}>
      {loading ? '…' : typeof value === 'number' ? value.toLocaleString() : value}
    </p>
    {sub && <p style={{
    fontSize: '0.72rem',
    color: '#475569',
    lineHeight: 1.4
  }}>{sub}</p>}
  </div>;
const GraphExplorer = () => {
  const {
    isDark
  } = useTheme();
  const t = getTheme(isDark);
  const [stats, setStats] = useState(null);
  const [topAuthors, setTopAuthors] = useState([]);
  const [topJournals, setTopJournals] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [neo4jOnline, setNeo4jOnline] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [authorSearch, setAuthorSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [loadingNetwork, setLoadingNetwork] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [pathFromSearching, setPathFromSearching] = useState(false);
  const [pathToSearching, setPathToSearching] = useState(false);
  const [pathFrom, setPathFrom] = useState('');
  const [pathTo, setPathTo] = useState('');
  const [pathFromResults, setPathFromResults] = useState([]);
  const [pathToResults, setPathToResults] = useState([]);
  const [pathResult, setPathResult] = useState(null);
  const [loadingPath, setLoadingPath] = useState(false);

  const loadAuthorNetwork = async name => {
    setSelectedAuthor(name);
    setSearchResults([]);
    setAuthorSearch('');
    setLoadingNetwork(true);
    setActiveTab('network');
    try {
      const data = await graphApi.getAuthorNetwork(name, 30);
      setNetworkData(data);
    } catch {
      toast.error('Failed to load author network');
    } finally {
      setLoadingNetwork(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'pathfinder') return;
    const q = pathFrom.trim();
    if (q.length < 2) {
      setPathFromResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setPathFromSearching(true);
      try {
        const data = await graphApi.searchAuthors(q);
        setPathFromResults(data.authors || []);
      } catch {
        setPathFromResults([]);
      } finally {
        setPathFromSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [pathFrom, activeTab]);

  useEffect(() => {
    if (activeTab !== 'pathfinder') return;
    const q = pathTo.trim();
    if (q.length < 2) {
      setPathToResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setPathToSearching(true);
      try {
        const data = await graphApi.searchAuthors(q);
        setPathToResults(data.authors || []);
      } catch {
        setPathToResults([]);
      } finally {
        setPathToSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [pathTo, activeTab]);

  const findPath = async () => {
    if (!pathFrom.trim() || !pathTo.trim()) {
      toast.error('Enter both author names to find a path.');
      return;
    }
    setLoadingPath(true);
    setPathResult(null);
    try {
      const data = await graphApi.findResearchPath(pathFrom, pathTo);
      setPathResult(data);
    } catch {
      toast.error('Path search failed. Try different names.');
    } finally {
      setLoadingPath(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authorParam = params.get('author');
    const tabParam = params.get('tab');
    if (tabParam) setActiveTab(tabParam);
    if (authorParam && tabParam === 'network') {
      loadAuthorNetwork(authorParam);
    }
  }, []); // runs once on mount

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const h = await graphApi.getHealth();
      setNeo4jOnline(h.status === 'connected');
      if (h.status === 'connected') loadOverviewData();
    } catch {
      setNeo4jOnline(false);
    }
  };

  const toNum = (val) => {
    if (val && typeof val === 'object' && 'low' in val) return Number(val.low);
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  const loadOverviewData = async () => {
    setLoadingStats(true);
    try {
      const [s, a, j, y, src] = await Promise.allSettled([
        graphApi.getStats(),
        graphApi.getTopAuthors(10),
        graphApi.getTopJournals(10),
        graphApi.getPapersByYear(),
        graphApi.getPapersBySource()
      ]);

      if (s.status === 'fulfilled') setStats(s.value.stats);
      if (a.status === 'fulfilled') setTopAuthors(a.value.authors || []);
      if (j.status === 'fulfilled') setTopJournals(j.value.journals || []);

      if (y.status === 'fulfilled') {
        const rawYears = y.value.papersPerYear || [];
        setYearData(rawYears.map(d => ({
          year: toNum(d.year),
          count: toNum(d.paperCount)
        })).filter(d => d.year > 0));
      }

      if (src.status === 'fulfilled') {
        const records = src.value.sources || [];
        setSourceData(records.map(r => ({
          name: r.source,
          value: toNum(r.paperCount),
        })));
      }
    } catch (err) {
      console.error('Overview data error:', err);
      toast.error('Failed to load graph stats items');
    } finally {
      setLoadingStats(false);
    }
  };
  useEffect(() => {
    if (authorSearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await graphApi.searchAuthors(authorSearch);
        setSearchResults(data.authors || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [authorSearch]);
  const card = {
    background: t.cardBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${t.cardBorder}`,
    borderRadius: 18,
    padding: '1.5rem',
    boxShadow: t.cardShadow
  };
  const sectionTitle = (text, icon) => <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: '1.25rem'
  }}>
      <div style={{
      width: 34,
      height: 34,
      borderRadius: 10,
      background: 'linear-gradient(135deg,#a855f7,#6366f1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(168,85,247,0.35)'
    }}>
        {icon}
      </div>
      <h3 style={{
      fontSize: '1rem',
      fontWeight: 700,
      color: t.textPrimary
    }}>{text}</h3>
    </div>;
  if (neo4jOnline === false) {
    return <div style={{
      minHeight: '100vh',
      background: t.pageBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
        <div style={{
        ...card,
        maxWidth: 480,
        textAlign: 'center',
        padding: '2.5rem'
      }}>
          <div style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
            <FaProjectDiagram size={24} color="#f87171" />
          </div>
          <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: t.textPrimary,
          marginBottom: '0.75rem'
        }}>Service Not Connected</h2>
          <p style={{
          fontSize: '0.875rem',
          color: t.textMuted,
          lineHeight: 1.7,
          marginBottom: '1.5rem'
        }}>
            The graph service is not reachable. Please verify the connection at <code style={{
            color: '#a5b4fc',
            background: 'rgba(99,102,241,0.12)',
            padding: '0.1rem 0.4rem',
            borderRadius: 5
          }}>bolt://localhost:7687</code> and the credentials in <code style={{
            color: '#a5b4fc',
            background: 'rgba(99,102,241,0.12)',
            padding: '0.1rem 0.4rem',
            borderRadius: 5
          }}>.env</code> are correct.
          </p>
          <div style={{
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 12,
          padding: '1rem',
          textAlign: 'left'
        }}>
            <p style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#a5b4fc',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Required configuration</p>
            <pre style={{
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            color: '#94a3b8',
            margin: 0
          }}>
            {`NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password`}
            </pre>
          </div>
        </div>
      </div>;
  }
  if (neo4jOnline === null) {
    return <div style={{
      minHeight: '100vh',
      background: t.pageBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
        <div style={{
        textAlign: 'center'
      }}>
          <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid rgba(168,85,247,0.2)',
          borderTopColor: '#a855f7',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem'
        }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{
          color: t.textMuted
        }}>Connecting...</p>
        </div>
      </div>;
  }
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
          <p style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#a855f7',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '0.4rem'
        }}>✦ Graph Insights</p>
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
              background: 'linear-gradient(135deg,#a855f7,#6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em'
            }}>
                Graph Explorer
              </h1>
              <p style={{
              color: t.textMuted,
              fontSize: '0.875rem',
              marginTop: '0.25rem'
            }}>
                <FaNetworkWired size={11} style={{
                display: 'inline',
                marginRight: 5,
                color: '#a855f7'
              }} />
                Research Knowledge Graph — authors, papers, journals &amp; relationships
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="animate-fade-in" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
          <StatPill label="Papers" value={stats?.papers} sub="nodes in graph" color="#6366f1" loading={loadingStats} />
          <StatPill label="Authors" value={stats?.authors} sub="unique researchers" color="#a855f7" loading={loadingStats} />
          <StatPill label="Journals" value={stats?.journals} sub="publication venues" color="#06b6d4" loading={loadingStats} />
          <StatPill label="Sources" value={stats?.sources} sub="data origins" color="#10b981" loading={loadingStats} />
          <StatPill label="Relationships" value={stats?.relationships} sub="graph edges total" color="#f59e0b" loading={loadingStats} />
        </div>

        {}
        <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.75rem',
        borderBottom: `1px solid ${t.divider}`,
        paddingBottom: '0.75rem'
      }}>
          {[{
          id: 'overview',
          label: 'Overview',
          icon: <FaChartBar size={12} />
        }, {
          id: 'network',
          label: 'Author Network',
          icon: <FaNetworkWired size={12} />
        }, {
          id: 'sources',
          label: 'Data Sources',
          icon: <FaDatabase size={12} />
        }, {
          id: 'pathfinder',
          label: 'Connect Authors',
          icon: <FaRoute size={12} />
        }].map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '0.5rem 1rem',
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          background: activeTab === tab.id ? 'linear-gradient(135deg,#a855f7,#6366f1)' : t.inputBg,
          color: activeTab === tab.id ? 'white' : t.textMuted,
          boxShadow: activeTab === tab.id ? '0 4px 12px rgba(168,85,247,0.35)' : 'none'
        }}>
              {tab.icon} {tab.label}
            </button>)}
        </div>

        {}
        {activeTab === 'overview' && <div className="animate-fade-in">

            {}
            <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))',
          gap: '1.5rem',
          marginBottom: '1.75rem'
        }}>

              {}
              <div style={card}>
                {sectionTitle('Top Authors by Paper Count', <FaUser size={14} color="white" />)}
                {loadingStats ? <p style={{
              color: t.textMuted,
              fontSize: '0.875rem'
            }}>Loading…</p> : <div style={{
              height: 240
            }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topAuthors.slice(0, 8).map(a => ({
                  name: cleanDisplayName(a.name).length > 18 ? cleanDisplayName(a.name).slice(0, 18) + '…' : cleanDisplayName(a.name),
                  Papers: a.paperCount
                }))} layout="vertical" margin={{
                  left: 10,
                  right: 20
                }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} horizontal={false} />
                        <XAxis type="number" tick={{
                    fill: t.textMuted,
                    fontSize: 10
                  }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={130} tick={{
                    fill: t.textSecondary,
                    fontSize: 11
                  }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{
                    fill: 'rgba(255,255,255,0.04)'
                  }} />
                        <Bar dataKey="Papers" radius={[0, 5, 5, 0]} maxBarSize={20}>
                          {topAuthors.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>}
                {!loadingStats && topJournals.length > 0 && <div style={{
              marginTop: '1rem',
              display: 'grid',
              gap: '0.6rem',
              maxHeight: 240,
              overflowY: 'auto'
            }}>
                    {topJournals.slice(0, 6).map((journal, index) => {
                const tone = quartileTone(journal.quartile);
                return <div key={`${journal.name}-${index}`} style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: 12,
                  background: t.inputBg,
                  border: `1px solid ${t.inputBorder}`
                }}>
                          <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '0.45rem'
                  }}>
                            <div style={{
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: t.textPrimary,
                      lineHeight: 1.35
                    }}>{journal.name}</div>
                            <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: COLORS[(index + 3) % COLORS.length],
                      whiteSpace: 'nowrap'
                    }}>{journal.paperCount} papers</div>
                          </div>
                          <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap'
                  }}>
                            <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 46,
                      padding: '0.22rem 0.5rem',
                      borderRadius: 999,
                      background: tone.bg,
                      border: `1px solid ${tone.border}`,
                      color: tone.text,
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>{journal.quartile || 'NR'}</span>
                            <span style={{
                      fontSize: '0.75rem',
                      color: t.textMuted
                    }}>SJR {formatMetric(journal.sjrIndex)}</span>
                            <span style={{
                      fontSize: '0.75rem',
                      color: t.textMuted
                    }}>H {journal.hIndex ?? '—'}</span>
                            <span style={{
                      fontSize: '0.75rem',
                      color: t.textMuted
                    }}>{journal.country || 'Country n/a'}</span>
                            {journal.openAccess === true && <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#34d399'
                    }}>OA</span>}
                          </div>
                        </div>;
              })}
                  </div>}
              </div>

              {}
              <div style={card}>
                {sectionTitle('Top Journals by Paper Count', <FaNewspaper size={14} color="white" />)}
                {loadingStats ? <p style={{
              color: t.textMuted,
              fontSize: '0.875rem'
            }}>Loading…</p> : <div style={{
              height: 240
            }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topJournals.slice(0, 8).map(j => ({
                  name: j.name.length > 18 ? j.name.slice(0, 18) + '…' : j.name,
                  Papers: j.paperCount
                }))} layout="vertical" margin={{
                  left: 10,
                  right: 20
                }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} horizontal={false} />
                        <XAxis type="number" tick={{
                    fill: t.textMuted,
                    fontSize: 10
                  }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={130} tick={{
                    fill: t.textSecondary,
                    fontSize: 11
                  }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{
                    fill: 'rgba(255,255,255,0.04)'
                  }} />
                        <Bar dataKey="Papers" radius={[0, 5, 5, 0]} maxBarSize={20}>
                          {topJournals.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>}
              </div>
            </div>

            {}
            {(() => {
          const validYearData = yearData.filter(d => Number.isFinite(Number(d.count)) && Number(d.count) > 0);
          if (validYearData.length === 0) return null;
          const sortedYearData = [...validYearData].sort((a, b) => Number(a.year) - Number(b.year));
          const latestYear = sortedYearData[sortedYearData.length - 1];
          const earliestYear = sortedYearData[0];
          const peakYear = sortedYearData.reduce((best, item) => !best || item.count > best.count ? item : best, null);
          const totalYearPapers = sortedYearData.reduce((sum, item) => sum + item.count, 0);
          const averagePerActiveYear = Math.round(totalYearPapers / sortedYearData.length);
          const recentYearData = sortedYearData.slice(-10).reverse();
          const previousYear = sortedYearData.length > 1 ? sortedYearData[sortedYearData.length - 2] : null;
          const yearlyChange = previousYear ? latestYear.count - previousYear.count : null;
          return <div style={{
            ...card,
            marginBottom: '1.75rem'
          }}>
                  {sectionTitle('Publication Statistics', <FaChartBar size={14} color="white" />)}
                  <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
              gap: '1.25rem'
            }}>
                    <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                gap: '0.9rem'
              }}>
                      {[{
                  label: 'Latest Recorded Year',
                  value: latestYear.year,
                  sub: `${latestYear.count.toLocaleString()} papers`,
                  color: '#a855f7'
                }, {
                  label: 'Peak Publication Year',
                  value: peakYear.year,
                  sub: `${peakYear.count.toLocaleString()} papers reached the highest output`,
                  color: '#6366f1'
                }, {
                  label: 'Average Per Active Year',
                  value: averagePerActiveYear,
                  sub: `${earliestYear.year} to ${latestYear.year}`,
                  color: '#06b6d4'
                }, {
                  label: 'Yearly Change',
                  value: yearlyChange === null ? 'N/A' : `${yearlyChange > 0 ? '+' : ''}${yearlyChange.toLocaleString()}`,
                  sub: previousYear ? `${yearlyChange > 0 ? '+' : ''}${yearlyChange.toLocaleString()} vs ${previousYear.year}` : 'No previous year to compare',
                  color: yearlyChange !== null && yearlyChange < 0 ? '#ef4444' : '#10b981'
                }].map(item => <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${item.color}30`,
                  borderRadius: 16,
                  padding: '1rem 1.1rem'
                }}>
                          <p style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: t.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.5rem'
                  }}>
                            {item.label}
                          </p>
                          <p style={{
                    fontSize: '1.55rem',
                    fontWeight: 800,
                    color: item.color,
                    lineHeight: 1.1,
                    marginBottom: '0.35rem'
                  }}>
                            {item.value !== null && item.value !== undefined ? (typeof item.value === 'object' ? JSON.stringify(item.value) : item.value.toLocaleString()) : '—'}
                          </p>
                          <p style={{
                    fontSize: '0.78rem',
                    color: t.textSecondary,
                    lineHeight: 1.5
                  }}>
                            {item.sub}
                          </p>
                        </div>)}
                    </div>
                  </div>
                </div>
        })()}
      </div>}

        {}
        {activeTab === 'network' && <div className="animate-fade-in">

            {/* Search Card */}
            <div style={{
          ...card,
          marginBottom: '1.5rem'
        }}>
              {sectionTitle('Author Co-authorship Network', <FaNetworkWired size={14} color="white" />)}
              <p style={{
            fontSize: '0.875rem',
            color: t.textMuted,
            marginBottom: '1rem'
          }}>
                Search for an author to see their co-authors and papers.
              </p>
              <div style={{
            position: 'relative'
          }}>
                <FaSearch size={13} style={{
              position: 'absolute',
              left: 13,
              top: '50%',
              transform: 'translateY(-50%)',
              color: t.textMuted,
              pointerEvents: 'none'
            }} />
                <input type="text" value={authorSearch} onChange={e => setAuthorSearch(e.target.value)} placeholder="Type an author name…" style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.4rem',
              borderRadius: 12,
              background: t.inputBg,
              border: `1px solid ${t.inputBorder}`,
              color: t.inputColor,
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box'
            }} />
                {searching && <FaSpinner size={13} style={{
              position: 'absolute',
              right: 13,
              top: '50%',
              transform: 'translateY(-50%)',
              color: t.textMuted,
              animation: 'spin 0.8s linear infinite'
            }} />}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && <div style={{
            marginTop: '0.5rem',
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            borderRadius: 12,
            overflow: 'hidden',
            maxHeight: 240,
            overflowY: 'auto'
          }}>
                  {searchResults.map((a, i) => <button key={i} onClick={() => loadAuthorNetwork(cleanDisplayName(a.name))} style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.7rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: `1px solid ${t.tableDivider}`,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              color: t.textPrimary
            }} onMouseEnter={e => {
              e.currentTarget.style.background = t.tableRowHover;
            }} onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
            }}>
                      <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                        <FaUser size={11} style={{
                  color: '#a855f7'
                }} />
                        <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}>{cleanDisplayName(a.name)}</span>
                      </span>
                      <span style={{
                fontSize: '0.78rem',
                color: t.textMuted
              }}>{a.paperCount} papers</span>
                    </button>)}
                </div>}
            </div>

            {/* Loading State */}
            {loadingNetwork && <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '3rem 0'
        }}>
                <div style={{
            textAlign: 'center'
          }}>
                  <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '3px solid rgba(168,85,247,0.2)',
              borderTopColor: '#a855f7',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem'
            }} />
                  <p style={{
              color: t.textMuted
            }}>Loading network for "{selectedAuthor}"…</p>
                </div>
              </div>}

            {networkData && !loadingNetwork && <div>
                {/* Profile Header */}
                <div style={{
            ...card,
            marginBottom: '1.25rem',
            background: 'rgba(168,85,247,0.06)',
            border: '1px solid rgba(168,85,247,0.25)'
          }}>
                  <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
                    <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                      <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg,#a855f7,#6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(168,85,247,0.4)'
                }}>
                        <FaUser size={20} color="white" />
                      </div>
                      <div>
                        <h2 style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: t.textPrimary
                  }}>{networkData.author}</h2>
                        <p style={{
                    fontSize: '0.8rem',
                    color: '#d8b4fe'
                  }}>
                          {networkData.paperCount} papers · {networkData.totalCoAuthors} co-authors
                        </p>
                      </div>
                    </div>
                    <button onClick={() => {
                setNetworkData(null);
                setSelectedAuthor(null);
              }} style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                      <FaTimes size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <ForceGraph author={networkData.author} coAuthors={networkData.coAuthors} t={t} />
                    <p style={{ color: t.textMuted, fontSize: '0.74rem', marginTop: '0.5rem', textAlign: 'center' }}>
                      Drag nodes to explore • Top 20 co-authors shown • Node size = connection strength
                    </p>
                  </div>

                  <div style={card}>
                    <h3 style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: t.textPrimary,
                marginBottom: '1rem'
              }}>
                      Papers ({networkData.papers.length})
                    </h3>
                    <div style={{
                maxHeight: 340,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}>
                      {networkData.papers.map((p, i) => <div key={i} style={{
                  padding: '0.7rem 0.85rem',
                  background: t.inputBg,
                  border: `1px solid ${t.inputBorder}`,
                  borderRadius: 10
                }}>
                          <p style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: t.textPrimary,
                    marginBottom: '0.25rem',
                    lineHeight: 1.4
                  }}>{p.title || 'Untitled'}</p>
                          <p style={{
                    fontSize: '0.75rem',
                    color: t.textMuted
                  }}>
                            {p.year && <span>{p.year}</span>}
                            {p.journal && <span> · {p.journal}</span>}
                          </p>
                        </div>)}
                    </div>
                  </div>
                </div>
              </div>}

            {!networkData && !loadingNetwork && !selectedAuthor && <div style={{
          ...card,
          textAlign: 'center',
          padding: '3rem',
          border: '1px dashed rgba(168,85,247,0.3)'
        }}>
                <FaNetworkWired size={36} style={{
            color: 'rgba(168,85,247,0.3)',
            marginBottom: '1rem'
          }} />
                <p style={{
            color: t.textMuted,
            fontSize: '0.9rem'
          }}>Search for an author above to explore their co-authorship network.</p>
              </div>}
          </div>}

        {activeTab === 'sources' && <div className="animate-fade-in">
            <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))',
          gap: '1.5rem'
        }}>

              {}
              <div style={card}>
                {sectionTitle('Papers by Data Source', <FaDatabase size={14} color="white" />)}
                {loadingStats ? <p style={{
              color: t.textMuted
            }}>Loading…</p> : <div style={{
              height: 280
            }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sourceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({
                    name,
                    percent
                  }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>}
              </div>

              {}
              <div style={card}>
                {sectionTitle('Source Breakdown', <FaDatabase size={14} color="white" />)}
                <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: 320,
              overflowY: 'auto'
            }}>
                  {sourceData.map((s, i) => {
                const total = sourceData.reduce((acc, d) => acc + d.value, 0);
                const pct = total ? (s.value / total * 100).toFixed(1) : '0.0';
                const color = COLORS[i % COLORS.length];
                return <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: t.inputBg,
                  border: `1px solid ${color}25`,
                  borderRadius: 10
                }}>
                        <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                          <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: color,
                      flexShrink: 0
                    }} />
                          <span style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: t.textPrimary
                    }}>{s.name}</span>
                        </div>
                        <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                          <span style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color
                    }}>{s.value.toLocaleString()}</span>
                          <span style={{
                      fontSize: '0.75rem',
                      color: t.textMuted,
                      minWidth: 42,
                      textAlign: 'right'
                    }}>{pct}%</span>
                        </div>
                      </div>;
              })}
                </div>
              </div>
            </div>
          </div>}

        {activeTab === 'pathfinder' && (
          <div className="animate-fade-in">
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#a855f7,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaRoute size={14} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: t.textPrimary, fontSize: '1rem', fontWeight: 700 }}>
                    Connect Any Two Researchers
                  </h3>
                  <p style={{ margin: 0, color: t.textMuted, fontSize: '0.74rem' }}>
                    Finds the shortest collaboration path via CO_AUTHORED edges (up to 6 hops)
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'start', marginBottom: '1rem' }}>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    From Researcher
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={pathFrom}
                      onChange={e => setPathFrom(e.target.value)}
                      placeholder="Start author name..."
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {pathFromResults.length > 0 && (
                      <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 10, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 12, maxHeight: 180, overflowY: 'auto' }}>
                        {pathFromResults.slice(0, 8).map((a, i) => (
                          <button key={i} onClick={() => { setPathFrom(a.name); setPathFromResults([]); }} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', background: 'none', border: 'none', cursor: 'pointer', color: t.textPrimary, fontSize: '0.85rem' }}>
                            <span>{cleanDisplayName(a.name)}</span>
                            <span style={{ color: t.textMuted, fontSize: '0.76rem' }}>{a.paperCount} papers</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ paddingTop: '1.8rem', color: t.textMuted, fontSize: '1.2rem', textAlign: 'center' }}>
                  →
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    To Researcher
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={pathTo}
                      onChange={e => setPathTo(e.target.value)}
                      placeholder="End author name..."
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {pathToResults.length > 0 && (
                      <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 10, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 12, maxHeight: 180, overflowY: 'auto' }}>
                        {pathToResults.slice(0, 8).map((a, i) => (
                          <button key={i} onClick={() => { setPathTo(a.name); setPathToResults([]); }} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', background: 'none', border: 'none', cursor: 'pointer', color: t.textPrimary, fontSize: '0.85rem' }}>
                            <span>{cleanDisplayName(a.name)}</span>
                            <span style={{ color: t.textMuted, fontSize: '0.76rem' }}>{a.paperCount} papers</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={findPath}
                disabled={loadingPath}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.75rem 1.25rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#a855f7,#6366f1)', color: 'white', fontWeight: 700, cursor: loadingPath ? 'wait' : 'pointer', opacity: loadingPath ? 0.7 : 1 }}>
                {loadingPath ? <FaSpinner size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <FaRoute size={12} />}
                {loadingPath ? 'Searching...' : 'Find Path'}
              </button>
            </div>

            {pathResult && (
              <div style={{ ...card, marginTop: '1.25rem', padding: '1.5rem' }}>
                {pathResult.connected ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                      <span style={{ padding: '0.3rem 0.8rem', borderRadius: 999, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '0.78rem', fontWeight: 700 }}>
                        {pathResult.hops} hop{pathResult.hops !== 1 ? 's' : ''} apart
                      </span>
                      <span style={{ color: t.textMuted, fontSize: '0.82rem' }}>
                        {pathResult.hops === 1 ? 'Direct collaborators!' : `Connected through ${pathResult.hops - 1} intermediary${pathResult.hops > 2 ? 'ies' : ''}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {pathResult.path.map((authorName, i) => (
                        <React.Fragment key={i}>
                          <div style={{ padding: '0.5rem 0.85rem', borderRadius: 10, background: i === 0 || i === pathResult.path.length - 1 ? 'linear-gradient(135deg,#a855f7,#6366f1)' : t.inputBg, border: `1px solid ${i === 0 || i === pathResult.path.length - 1 ? 'transparent' : t.inputBorder}`, color: i === 0 || i === pathResult.path.length - 1 ? 'white' : t.textPrimary, fontSize: '0.82rem', fontWeight: 700 }}>
                            {cleanDisplayName(authorName)}
                          </div>
                          {i < pathResult.path.length - 1 && (
                            <div style={{ color: t.textMuted, fontSize: '0.78rem' }}>
                              ── {pathResult.shared_papers_along_path[i]} papers ──▶
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ color: t.textMuted, fontSize: '0.875rem' }}>
                    No collaboration path found within 6 hops between these researchers.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>;
};
export default GraphExplorer;


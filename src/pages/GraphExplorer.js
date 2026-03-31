/**
 * src/pages/GraphExplorer.js
 * Neo4j graph analytics page — Research Knowledge Graph
 */
import React, { useState, useEffect, useCallback } from 'react';
import { graphApi } from '../api/graphApi';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';
import {
  FaProjectDiagram, FaUser, FaNewspaper, FaDatabase,
  FaSearch, FaSpinner, FaNetworkWired, FaChartBar,
  FaArrowRight, FaTimes, FaInfoCircle,
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import toast from 'react-hot-toast';

/* ─── colours ─── */
const COLORS = ['#6366f1','#a855f7','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6','#14b8a6','#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(10,15,30,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'0.65rem 0.9rem', fontSize:'0.8rem', color:'#f1f5f9' }}>
      <p style={{ fontWeight:700, marginBottom:'0.3rem', color:'#a5b4fc' }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color:p.color }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong></p>)}
    </div>
  );
};

/* ─── small reusable stat pill ─── */
const StatPill = ({ label, value, sub, color, loading }) => (
  <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${color}30`, borderRadius:16, padding:'1.1rem 1.3rem' }}>
    <p style={{ fontSize:'0.7rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.35rem' }}>{label}</p>
    <p style={{ fontSize:'1.65rem', fontWeight:800, background:`linear-gradient(135deg,${color},${color}bb)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:1.1, marginBottom:'0.25rem' }}>
      {loading ? '…' : (typeof value === 'number' ? value.toLocaleString() : value)}
    </p>
    {sub && <p style={{ fontSize:'0.72rem', color:'#475569', lineHeight:1.4 }}>{sub}</p>}
  </div>
);

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
const GraphExplorer = () => {
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  /* ── global state ── */
  const [stats,        setStats]        = useState(null);
  const [topAuthors,   setTopAuthors]   = useState([]);
  const [topJournals,  setTopJournals]  = useState([]);
  const [yearData,     setYearData]     = useState([]);
  const [sourceData,   setSourceData]   = useState([]);
  const [neo4jOnline,  setNeo4jOnline]  = useState(null); // null=checking
  const [loadingStats, setLoadingStats] = useState(true);

  /* ── author network state ── */
  const [authorSearch,  setAuthorSearch]  = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching,     setSearching]     = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [networkData,   setNetworkData]   = useState(null);
  const [loadingNetwork, setLoadingNetwork] = useState(false);

  /* ── active tab ── */
  const [activeTab, setActiveTab] = useState('overview'); // overview | network | sources

  /* ─────────────── boot ─────────────── */
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
      setLoadingStats(false);
    }
  };

  const loadOverviewData = async () => {
    setLoadingStats(true);
    try {
      const [s, a, j, y, src] = await Promise.allSettled([
        graphApi.getStats(),
        graphApi.getTopAuthors(10),
        graphApi.getTopJournals(10),
        graphApi.getPapersByYear(),
        graphApi.getPapersBySource(),
      ]);

      if (s.status  === 'fulfilled') setStats(s.value.stats);
      if (a.status  === 'fulfilled') setTopAuthors(a.value.authors  || []);
      if (j.status  === 'fulfilled') setTopJournals(j.value.journals || []);
      if (y.status  === 'fulfilled') setYearData(
        (y.value.papersPerYear || []).map(d => ({ year: String(d.year), count: d.paperCount }))
      );
      if (src.status === 'fulfilled') setSourceData(
        (src.value.sources || []).map(d => ({ name: d.source, value: d.paperCount }))
      );
    } catch (err) {
      toast.error('Failed to load graph data');
    } finally {
      setLoadingStats(false);
    }
  };

  /* ─────────────── author search ─────────────── */
  useEffect(() => {
    if (authorSearch.trim().length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await graphApi.searchAuthors(authorSearch);
        setSearchResults(data.authors || []);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [authorSearch]);

  const loadAuthorNetwork = async (name) => {
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

  /* ─────────────── shared styles ─────────────── */
  const card = { background:t.cardBg, backdropFilter:'blur(16px)', border:`1px solid ${t.cardBorder}`, borderRadius:18, padding:'1.5rem', boxShadow:t.cardShadow };
  const sectionTitle = (text, icon) => (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.25rem' }}>
      <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#a855f7,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(168,85,247,0.35)' }}>
        {icon}
      </div>
      <h3 style={{ fontSize:'1rem', fontWeight:700, color:t.textPrimary }}>{text}</h3>
    </div>
  );

  /* ─────────────── offline banner ─────────────── */
  if (neo4jOnline === false) {
    return (
      <div style={{ minHeight:'100vh', background:t.pageBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ ...card, maxWidth:480, textAlign:'center', padding:'2.5rem' }}>
          <div style={{ width:60, height:60, borderRadius:16, background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
            <FaProjectDiagram size={24} color="#f87171" />
          </div>
          <h2 style={{ fontSize:'1.25rem', fontWeight:700, color:t.textPrimary, marginBottom:'0.75rem' }}>Neo4j Not Connected</h2>
          <p style={{ fontSize:'0.875rem', color:t.textMuted, lineHeight:1.7, marginBottom:'1.5rem' }}>
            The Neo4j graph database is not reachable. Make sure it is running on <code style={{ color:'#a5b4fc', background:'rgba(99,102,241,0.12)', padding:'0.1rem 0.4rem', borderRadius:5 }}>bolt://localhost:7687</code> and the credentials in <code style={{ color:'#a5b4fc', background:'rgba(99,102,241,0.12)', padding:'0.1rem 0.4rem', borderRadius:5 }}>.env</code> are correct.
          </p>
          <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12, padding:'1rem', textAlign:'left' }}>
            <p style={{ fontSize:'0.75rem', fontWeight:700, color:'#a5b4fc', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Required .env keys</p>
            <pre style={{ fontFamily:'monospace', fontSize:'0.78rem', color:'#94a3b8', margin:0 }}>
{`NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────── loading ─────────────── */
  if (neo4jOnline === null) {
    return (
      <div style={{ minHeight:'100vh', background:t.pageBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid rgba(168,85,247,0.2)', borderTopColor:'#a855f7', animation:'spin 0.8s linear infinite', margin:'0 auto 1rem' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color:t.textMuted }}>Connecting to Neo4j…</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     MAIN RENDER
  ═══════════════════════════════════════════ */
  return (
    <div style={{ minHeight:'100vh', background:t.pageBg, transition:'background 0.4s ease' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 1.5rem' }}>

        {/* ── HEADER ── */}
        <div className="animate-fade-in" style={{ marginBottom:'2rem' }}>
          <p style={{ fontSize:'0.75rem', fontWeight:700, color:'#a855f7', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>✦ Neo4j Graph Database</p>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <h1 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, background:'linear-gradient(135deg,#a855f7,#6366f1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', letterSpacing:'-0.02em' }}>
                Graph Explorer
              </h1>
              <p style={{ color:t.textMuted, fontSize:'0.875rem', marginTop:'0.25rem' }}>
                <FaNetworkWired size={11} style={{ display:'inline', marginRight:5, color:'#a855f7' }} />
                Research Knowledge Graph — authors, papers, journals &amp; relationships
              </p>
            </div>
            {/* Neo4j online badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'0.45rem 0.9rem', borderRadius:999, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', fontSize:'0.8rem', fontWeight:600, color:'#6ee7b7' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block' }} />
              Neo4j Connected
            </div>
          </div>
        </div>

        {/* ── STAT PILLS ── */}
        <div className="animate-fade-in" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
          <StatPill label="Papers"        value={stats?.papers}        sub="nodes in graph"        color="#6366f1" loading={loadingStats} />
          <StatPill label="Authors"       value={stats?.authors}       sub="unique researchers"    color="#a855f7" loading={loadingStats} />
          <StatPill label="Journals"      value={stats?.journals}      sub="publication venues"    color="#06b6d4" loading={loadingStats} />
          <StatPill label="Sources"       value={stats?.sources}       sub="data origins"          color="#10b981" loading={loadingStats} />
          <StatPill label="Relationships" value={stats?.relationships} sub="graph edges total"     color="#f59e0b" loading={loadingStats} />
        </div>

        {/* ── TABS ── */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.75rem', borderBottom:`1px solid ${t.divider}`, paddingBottom:'0.75rem' }}>
          {[
            { id:'overview', label:'Overview',       icon:<FaChartBar size={12} /> },
            { id:'network',  label:'Author Network', icon:<FaNetworkWired size={12} /> },
            { id:'sources',  label:'Data Sources',   icon:<FaDatabase size={12} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'0.5rem 1rem', borderRadius:10, border:'none', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, transition:'all 0.2s ease',
                background: activeTab === tab.id ? 'linear-gradient(135deg,#a855f7,#6366f1)' : t.inputBg,
                color:      activeTab === tab.id ? 'white' : t.textMuted,
                boxShadow:  activeTab === tab.id ? '0 4px 12px rgba(168,85,247,0.35)' : 'none',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════ TAB: OVERVIEW ══════════════ */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">

            {/* Top Authors + Top Journals side by side */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:'1.5rem', marginBottom:'1.75rem' }}>

              {/* Top Authors */}
              <div style={card}>
                {sectionTitle('Top Authors by Paper Count', <FaUser size={14} color="white" />)}
                {loadingStats ? (
                  <p style={{ color:t.textMuted, fontSize:'0.875rem' }}>Loading…</p>
                ) : (
                  <div style={{ height:260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topAuthors.slice(0,8).map(a => ({ name: a.name.length > 18 ? a.name.slice(0,18)+'…' : a.name, Papers: a.paperCount }))} layout="vertical" margin={{ left:10, right:20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} horizontal={false} />
                        <XAxis type="number" tick={{ fill:t.textMuted, fontSize:10 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={130} tick={{ fill:t.textSecondary, fontSize:11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
                        <Bar dataKey="Papers" radius={[0,5,5,0]} maxBarSize={20}>
                          {topAuthors.slice(0,8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Top Journals */}
              <div style={card}>
                {sectionTitle('Top Journals by Paper Count', <FaNewspaper size={14} color="white" />)}
                {loadingStats ? (
                  <p style={{ color:t.textMuted, fontSize:'0.875rem' }}>Loading…</p>
                ) : (
                  <div style={{ height:260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topJournals.slice(0,8).map(j => ({ name: j.name.length > 18 ? j.name.slice(0,18)+'…' : j.name, Papers: j.paperCount }))} layout="vertical" margin={{ left:10, right:20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} horizontal={false} />
                        <XAxis type="number" tick={{ fill:t.textMuted, fontSize:10 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={130} tick={{ fill:t.textSecondary, fontSize:11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
                        <Bar dataKey="Papers" radius={[0,5,5,0]} maxBarSize={20}>
                          {topJournals.slice(0,8).map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Papers per Year */}
            {yearData.length > 0 && (
              <div style={{ ...card, marginBottom:'1.75rem' }}>
                {sectionTitle('Papers Published Per Year (Graph)', <FaChartBar size={14} color="white" />)}
                <div style={{ height:280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearData} margin={{ top:5, right:20, left:10, bottom:40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                      <XAxis dataKey="year" angle={-45} textAnchor="end" height={60} tick={{ fill:t.textMuted, fontSize:10 }} axisLine={{ stroke:t.cardBorder }} tickLine={false} />
                      <YAxis tick={{ fill:t.textMuted, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="count" name="Papers" fill="url(#yearGrad)" radius={[4,4,0,0]} maxBarSize={40} />
                      <defs>
                        <linearGradient id="yearGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Graph schema info */}
            <div style={{ ...card, background:'rgba(168,85,247,0.06)', border:'1px solid rgba(168,85,247,0.2)' }}>
              <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#d8b4fe', marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
                <FaInfoCircle size={13} style={{ color:'#a855f7' }} /> Graph Schema
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'0.75rem' }}>
                {[
                  { rel:'(Author) ──WROTE──▶ (Paper)',          color:'#a855f7' },
                  { rel:'(Paper) ──PUBLISHED_IN──▶ (Journal)',  color:'#6366f1' },
                  { rel:'(Paper) ──FROM_SOURCE──▶ (Source)',    color:'#06b6d4' },
                  { rel:'(Paper) ──PUBLISHED_YEAR──▶ (Year)',   color:'#10b981' },
                ].map(({ rel, color }) => (
                  <div key={rel} style={{ background:`${color}10`, border:`1px solid ${color}25`, borderRadius:10, padding:'0.6rem 0.85rem' }}>
                    <code style={{ fontSize:'0.75rem', color, fontFamily:'monospace' }}>{rel}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TAB: AUTHOR NETWORK ══════════════ */}
        {activeTab === 'network' && (
          <div className="animate-fade-in">

            {/* Search box */}
            <div style={{ ...card, marginBottom:'1.5rem' }}>
              {sectionTitle('Author Co-authorship Network', <FaNetworkWired size={14} color="white" />)}
              <p style={{ fontSize:'0.875rem', color:t.textMuted, marginBottom:'1rem' }}>
                Search for an author to see their co-authors and papers from the graph database.
              </p>
              <div style={{ position:'relative' }}>
                <FaSearch size={13} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:t.textMuted, pointerEvents:'none' }} />
                <input
                  type="text"
                  value={authorSearch}
                  onChange={e => setAuthorSearch(e.target.value)}
                  placeholder="Type an author name…"
                  style={{ width:'100%', padding:'0.75rem 1rem 0.75rem 2.4rem', borderRadius:12, background:t.inputBg, border:`1px solid ${t.inputBorder}`, color:t.inputColor, fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }}
                />
                {searching && <FaSpinner size={13} style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', color:t.textMuted, animation:'spin 0.8s linear infinite' }} />}
              </div>

              {/* Autocomplete dropdown */}
              {searchResults.length > 0 && (
                <div style={{ marginTop:'0.5rem', background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:12, overflow:'hidden', maxHeight:240, overflowY:'auto' }}>
                  {searchResults.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => loadAuthorNetwork(a.name)}
                      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.7rem 1rem', background:'none', border:'none', borderBottom:`1px solid ${t.tableDivider}`, cursor:'pointer', transition:'background 0.15s ease', color:t.textPrimary }}
                      onMouseEnter={e => { e.currentTarget.style.background = t.tableRowHover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <FaUser size={11} style={{ color:'#a855f7' }} />
                        <span style={{ fontSize:'0.875rem', fontWeight:500 }}>{a.name}</span>
                      </span>
                      <span style={{ fontSize:'0.78rem', color:t.textMuted }}>{a.paperCount} papers</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Network result */}
            {loadingNetwork && (
              <div style={{ display:'flex', justifyContent:'center', padding:'3rem 0' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid rgba(168,85,247,0.2)', borderTopColor:'#a855f7', animation:'spin 0.8s linear infinite', margin:'0 auto 1rem' }} />
                  <p style={{ color:t.textMuted }}>Loading network for "{selectedAuthor}"…</p>
                </div>
              </div>
            )}

            {networkData && !loadingNetwork && (
              <div>
                {/* Author header */}
                <div style={{ ...card, marginBottom:'1.25rem', background:'rgba(168,85,247,0.06)', border:'1px solid rgba(168,85,247,0.25)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#a855f7,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(168,85,247,0.4)' }}>
                        <FaUser size={20} color="white" />
                      </div>
                      <div>
                        <h2 style={{ fontSize:'1.15rem', fontWeight:700, color:t.textPrimary }}>{networkData.author}</h2>
                        <p style={{ fontSize:'0.8rem', color:'#d8b4fe' }}>
                          {networkData.paperCount} papers · {networkData.totalCoAuthors} co-authors
                        </p>
                      </div>
                    </div>
                    <button onClick={() => { setNetworkData(null); setSelectedAuthor(null); }} style={{ width:32, height:32, borderRadius:8, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <FaTimes size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:'1.5rem' }}>

                  {/* Co-authors */}
                  <div style={card}>
                    <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:t.textPrimary, marginBottom:'1rem' }}>
                      Co-authors ({networkData.totalCoAuthors})
                    </h3>
                    {networkData.coAuthors.length === 0 ? (
                      <p style={{ color:t.textMuted, fontSize:'0.875rem' }}>No co-authors found in the graph.</p>
                    ) : (
                      <div style={{ maxHeight:340, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                        {networkData.coAuthors.map((ca, i) => (
                          <button
                            key={i}
                            onClick={() => loadAuthorNetwork(ca.name)}
                            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.6rem 0.85rem', borderRadius:10, background:t.inputBg, border:`1px solid ${t.inputBorder}`, cursor:'pointer', transition:'all 0.2s ease', color:t.textPrimary }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'; e.currentTarget.style.background = 'rgba(168,85,247,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.inputBorder; e.currentTarget.style.background = t.inputBg; }}
                          >
                            <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:24, height:24, borderRadius:6, background:COLORS[i % COLORS.length] + '22', border:`1px solid ${COLORS[i % COLORS.length]}44`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <FaUser size={10} style={{ color:COLORS[i % COLORS.length] }} />
                              </div>
                              <span style={{ fontSize:'0.85rem', fontWeight:500 }}>{ca.name}</span>
                            </span>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontSize:'0.75rem', color:'#a855f7', fontWeight:600 }}>{ca.sharedPapers} shared</span>
                              <FaArrowRight size={10} style={{ color:t.textMuted }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Papers */}
                  <div style={card}>
                    <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:t.textPrimary, marginBottom:'1rem' }}>
                      Papers ({networkData.papers.length})
                    </h3>
                    <div style={{ maxHeight:340, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                      {networkData.papers.map((p, i) => (
                        <div key={i} style={{ padding:'0.7rem 0.85rem', background:t.inputBg, border:`1px solid ${t.inputBorder}`, borderRadius:10 }}>
                          <p style={{ fontSize:'0.85rem', fontWeight:600, color:t.textPrimary, marginBottom:'0.25rem', lineHeight:1.4 }}>{p.title || 'Untitled'}</p>
                          <p style={{ fontSize:'0.75rem', color:t.textMuted }}>
                            {p.year && <span>{p.year}</span>}
                            {p.journal && <span> · {p.journal}</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!networkData && !loadingNetwork && !selectedAuthor && (
              <div style={{ ...card, textAlign:'center', padding:'3rem', border:'1px dashed rgba(168,85,247,0.3)' }}>
                <FaNetworkWired size={36} style={{ color:'rgba(168,85,247,0.3)', marginBottom:'1rem' }} />
                <p style={{ color:t.textMuted, fontSize:'0.9rem' }}>Search for an author above to explore their co-authorship network.</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ TAB: DATA SOURCES ══════════════ */}
        {activeTab === 'sources' && (
          <div className="animate-fade-in">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:'1.5rem' }}>

              {/* Pie chart */}
              <div style={card}>
                {sectionTitle('Papers by Data Source', <FaDatabase size={14} color="white" />)}
                {loadingStats ? <p style={{ color:t.textMuted }}>Loading…</p> : (
                  <div style={{ height:280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sourceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Source table */}
              <div style={card}>
                {sectionTitle('Source Breakdown', <FaDatabase size={14} color="white" />)}
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', maxHeight:320, overflowY:'auto' }}>
                  {sourceData.map((s, i) => {
                    const total = sourceData.reduce((acc, d) => acc + d.value, 0);
                    const pct   = total ? ((s.value / total) * 100).toFixed(1) : '0.0';
                    const color = COLORS[i % COLORS.length];
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.65rem 0.85rem', background:t.inputBg, border:`1px solid ${color}25`, borderRadius:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0 }} />
                          <span style={{ fontSize:'0.875rem', fontWeight:600, color:t.textPrimary }}>{s.name}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:'0.875rem', fontWeight:700, color }}>{s.value.toLocaleString()}</span>
                          <span style={{ fontSize:'0.75rem', color:t.textMuted, minWidth:42, textAlign:'right' }}>{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GraphExplorer;
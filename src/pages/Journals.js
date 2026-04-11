import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { journalApi } from '../api/authApi';
import { BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  FaArrowRight,
  FaBookOpen,
  FaChartLine,
  FaChevronLeft,
  FaChevronRight,
  FaDatabase,
  FaExternalLinkAlt,
  FaFilter,
  FaGlobeAsia,
  FaHashtag,
  FaLayerGroup,
  FaNewspaper,
  FaSearch,
  FaSortAmountDown,
  FaStar,
  FaUserFriends,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';

const PAGE_SIZE = 18;
const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899'];
const Q = {
  Q1: { bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.34)', text: '#34d399' },
  Q2: { bg: 'rgba(14,165,233,0.16)', border: 'rgba(14,165,233,0.3)', text: '#38bdf8' },
  Q3: { bg: 'rgba(245,158,11,0.16)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
  Q4: { bg: 'rgba(239,68,68,0.16)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  UNRANKED: { bg: 'rgba(148,163,184,0.16)', border: 'rgba(148,163,184,0.28)', text: '#cbd5e1' },
};

const fmt = (value, digits = 0) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const compact = value => {
  const num = Number(value || 0);
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toLocaleString();
};

const chips = value => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return Object.values(parsed);
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
};

const qStyle = quartile => Q[quartile] || Q.UNRANKED;

const tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(15,23,42,0.96)', color: '#e2e8f0', border: '1px solid rgba(148,163,184,0.25)', borderRadius: 14, padding: '0.75rem 0.9rem' }}>
      <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#7dd3fc' }}>{label}</div>
      {payload.map(item => <div key={item.name} style={{ color: item.color, fontSize: '0.82rem' }}>{item.name}: <strong>{fmt(item.value, item.name === 'SJR' ? 3 : 0)}</strong></div>)}
    </div>
  );
};

const Journals = () => {
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();
  const card = { background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 24, boxShadow: t.cardShadow, backdropFilter: 'blur(16px)' };

  const [filters, setFilters] = useState({ q: '', country: '', quartile: '', oa: 'all', sortBy: 'rank' });
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [journals, setJournals] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, offset: 0 });
  const [loadingList, setLoadingList] = useState(true);
  const [selectedJournalId, setSelectedJournalId] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.q]);

  useEffect(() => {
    let cancelled = false;
    const fetchJournals = async () => {
      setLoadingList(true);
      try {
        const data = await journalApi.searchJournals({
          q: debouncedQuery || undefined,
          country: filters.country.trim() || undefined,
          quartile: filters.quartile || undefined,
          oa: filters.oa === 'all' ? undefined : filters.oa === 'true',
          sortBy: filters.sortBy,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        });
        if (cancelled) return;
        const rows = data.journals || [];
        setJournals(rows);
        setPagination(data.pagination || { total: rows.length, offset: 0 });
        if (!rows.length) {
          setSelectedJournalId(null);
          setSelectedJournal(null);
          return;
        }
        setSelectedJournalId(current => rows.some(item => String(item.journal_ranking_id) === String(current)) ? current : rows[0].journal_ranking_id);
      } catch (error) {
        if (!cancelled) {
          toast.error(error.response?.data?.error || 'Failed to load journal rankings');
          setJournals([]);
          setSelectedJournal(null);
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    };
    fetchJournals();
    return () => { cancelled = true; };
  }, [debouncedQuery, filters.country, filters.quartile, filters.oa, filters.sortBy, page]);

  useEffect(() => {
    if (!selectedJournalId) return;
    let cancelled = false;
    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const data = await journalApi.getJournalById(selectedJournalId);
        if (!cancelled) setSelectedJournal(data);
      } catch (error) {
        if (!cancelled) {
          toast.error(error.response?.data?.error || 'Failed to load journal details');
          setSelectedJournal(null);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    fetchDetail();
    return () => { cancelled = true; };
  }, [selectedJournalId]);

  const selectedMeta = selectedJournal?.journal || null;
  const selectedEntities = selectedJournal?.connected_entities || {};
  const selectedPapers = selectedEntities.papers || [];
  const selectedAuthors = selectedEntities.top_authors || [];
  const selectedCategories = useMemo(() => chips(selectedMeta?.best_categories), [selectedMeta?.best_categories]);
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / PAGE_SIZE));
  const localCoverageCount = journals.filter(item => Number(item.local_paper_count || 0) > 0).length;
  const countriesCount = new Set(journals.map(item => item.country).filter(Boolean)).size;
  const chartData = journals.slice(0, 8).map(item => ({
    name: item.title.length > 24 ? `${item.title.slice(0, 24)}...` : item.title,
    title: item.title,
    SJR: Number(item.sjr_index || 0),
  })).filter(item => item.SJR > 0);

  const resetFilters = () => {
    setFilters({ q: '', country: '', quartile: '', oa: 'all', sortBy: 'rank' });
    setPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg }}>
      <div style={{ maxWidth: 1380, margin: '0 auto', padding: '2rem 1.25rem 3rem' }}>
        <div style={{ ...card, marginBottom: '1.5rem', padding: '1.75rem', background: isDark ? 'radial-gradient(circle at top left, rgba(14,165,233,0.22), transparent 35%), radial-gradient(circle at top right, rgba(16,185,129,0.18), transparent 30%), rgba(255,255,255,0.04)' : 'radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 35%), radial-gradient(circle at top right, rgba(16,185,129,0.14), transparent 30%), rgba(255,255,255,0.9)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 760 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.35rem 0.75rem', borderRadius: 999, background: 'rgba(14,165,233,0.14)', border: '1px solid rgba(14,165,233,0.24)', color: '#7dd3fc', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <FaChartLine size={11} /> Journal Rankings
              </div>
              <h1 style={{ margin: '0.9rem 0 0.5rem', fontSize: 'clamp(1.9rem, 3.8vw, 3.2rem)', lineHeight: 1.05, fontWeight: 900, letterSpacing: '-0.04em', color: t.textPrimary }}>
                Explore journals the way Scimago feels,
                <span style={{ display: 'block', color: '#38bdf8' }}>but connected to your own dataset.</span>
              </h1>
              <p style={{ margin: 0, color: t.textSecondary, fontSize: '0.97rem', lineHeight: 1.7 }}>
                Search ranked journals, compare quartiles and SJR metrics, and open a venue profile that immediately shows the papers and authors already present in your DBMS project.
              </p>
            </div>
            <div style={{ minWidth: 260, flex: '1 1 280px', display: 'grid', gap: '0.9rem' }}>
              <div style={{ ...card, padding: '1rem 1.1rem', borderRadius: 20, background: isDark ? 'rgba(2,6,23,0.35)' : 'rgba(255,255,255,0.72)' }}>
                <div style={{ color: t.textMuted, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Current View</div>
                <div style={{ marginTop: '0.45rem', color: t.textPrimary, fontWeight: 800, fontSize: '1.65rem' }}>{compact(pagination.total || 0)}</div>
                <div style={{ marginTop: '0.3rem', color: t.textSecondary, fontSize: '0.82rem' }}>{countriesCount} countries, {localCoverageCount} with local papers</div>
              </div>
              <div style={{ ...card, padding: '1rem 1.1rem', borderRadius: 20, background: isDark ? 'rgba(2,6,23,0.35)' : 'rgba(255,255,255,0.72)' }}>
                <div style={{ color: t.textMuted, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Selected</div>
                <div style={{ marginTop: '0.45rem', color: t.textPrimary, fontWeight: 800, fontSize: '1rem', lineHeight: 1.4 }}>{selectedMeta?.title || 'Pick a journal'}</div>
                <div style={{ marginTop: '0.35rem', color: t.textSecondary, fontSize: '0.82rem' }}>{selectedMeta ? `${selectedMeta.best_quartile || 'Unranked'} • ${selectedMeta.country || 'Country not listed'}` : 'Select a row to open a profile.'}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            ['Results', fmt(pagination.total || 0), 'matching the current filters', '#38bdf8', FaDatabase],
            ['Q1 in View', fmt(journals.filter(item => item.best_quartile === 'Q1').length), 'top-tier venues in this page', '#34d399', FaStar],
            ['Open Access', fmt(journals.filter(item => item.oa).length), 'journals marked OA', '#f59e0b', FaBookOpen],
            ['Local Matches', fmt(localCoverageCount), 'already connected to your papers', '#a78bfa', FaNewspaper],
          ].map(([label, value, note, color, Icon]) => (
            <div key={label} style={{ ...card, padding: '1rem 1.1rem', borderRadius: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ color: t.textMuted, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ marginTop: '0.35rem', color, fontSize: '1.9rem', fontWeight: 900 }}>{value}</div>
                  <div style={{ marginTop: '0.2rem', color: t.textSecondary, fontSize: '0.8rem' }}>{note}</div>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', background: `${color}22`, border: `1px solid ${color}40`, color }}>
                  <Icon size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, color: t.textPrimary, fontSize: '1.05rem', fontWeight: 800 }}>Find the right journal</h2>
              <p style={{ margin: '0.3rem 0 0', color: t.textMuted, fontSize: '0.82rem' }}>Filter by venue name, country, quartile, open-access status, and ranking order.</p>
            </div>
            <button onClick={resetFilters} style={{ padding: '0.7rem 1rem', borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.btnGhost.background, color: t.btnGhost.color, cursor: 'pointer', fontWeight: 700 }}>
              Reset filters
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.9rem' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch size={13} style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: t.textMuted }} />
              <input value={filters.q} onChange={event => setFilters(current => ({ ...current, q: event.target.value }))} placeholder="Search title, publisher, or subject area" style={{ width: '100%', boxSizing: 'border-box', padding: '0.9rem 1rem 0.9rem 2.5rem', borderRadius: 14, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.inputColor, outline: 'none' }} />
            </div>
            <input value={filters.country} onChange={event => { setFilters(current => ({ ...current, country: event.target.value })); setPage(1); }} placeholder="Country" style={{ width: '100%', boxSizing: 'border-box', padding: '0.9rem 1rem', borderRadius: 14, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.inputColor, outline: 'none' }} />
            <select value={filters.quartile} onChange={event => { setFilters(current => ({ ...current, quartile: event.target.value })); setPage(1); }} style={{ width: '100%', boxSizing: 'border-box', padding: '0.9rem 1rem', borderRadius: 14, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.inputColor, outline: 'none' }}>
              <option value="">All quartiles</option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
              <option value="UNRANKED">Unranked</option>
            </select>
            <select value={filters.oa} onChange={event => { setFilters(current => ({ ...current, oa: event.target.value })); setPage(1); }} style={{ width: '100%', boxSizing: 'border-box', padding: '0.9rem 1rem', borderRadius: 14, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.inputColor, outline: 'none' }}>
              <option value="all">All access models</option>
              <option value="true">Open access only</option>
              <option value="false">Subscription or hybrid</option>
            </select>
            <select value={filters.sortBy} onChange={event => { setFilters(current => ({ ...current, sortBy: event.target.value })); setPage(1); }} style={{ width: '100%', boxSizing: 'border-box', padding: '0.9rem 1rem', borderRadius: 14, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.inputColor, outline: 'none' }}>
              <option value="rank">Best rank first</option>
              <option value="sjr">Highest SJR</option>
              <option value="citescore">Highest CiteScore</option>
              <option value="hindex">Highest H-index</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {!loadingList && chartData.length > 0 && (
          <div style={{ ...card, padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, color: t.textPrimary, fontSize: '1.05rem', fontWeight: 800 }}>What stands out in this result set</h2>
                <p style={{ margin: '0.3rem 0 0', color: t.textMuted, fontSize: '0.82rem' }}>A quick comparison of the strongest SJR values in the journals currently in view.</p>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.4rem 0.8rem', borderRadius: 999, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.24)', color: '#6ee7b7', fontSize: '0.76rem', fontWeight: 700 }}>
                <FaFilter size={10} /> Filter-aware top 8
              </div>
            </div>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 16, left: 4, bottom: 80 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={t.divider} />
                  <XAxis dataKey="name" angle={-28} textAnchor="end" height={82} tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={tip} />
                  <Bar dataKey="SJR" radius={[8, 8, 0, 0]}>
                    {chartData.map((item, index) => <Cell key={`${item.title}-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ ...card, overflow: 'hidden auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '70px minmax(0, 1.8fr) 92px 92px 92px 120px', gap: '0.75rem', padding: '1rem 1.1rem', borderBottom: `1px solid ${t.divider}`, background: t.tableHeaderBg, color: t.textMuted, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
              <span><FaHashtag size={11} style={{ marginRight: 6 }} />Rank</span>
              <span>Journal</span>
              <span>Quartile</span>
              <span>SJR</span>
              <span>H</span>
              <span>Local papers</span>
            </div>

            {loadingList ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: t.textMuted }}>Loading ranked journals...</div>
            ) : journals.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <div style={{ color: t.textPrimary, fontWeight: 800, fontSize: '1rem' }}>No journals matched these filters.</div>
                <div style={{ marginTop: '0.4rem', color: t.textMuted, fontSize: '0.86rem' }}>Try removing a country filter or switching back to all quartiles.</div>
              </div>
            ) : journals.map(journal => {
              const quartile = journal.best_quartile || 'UNRANKED';
              const style = qStyle(quartile);
              const active = String(journal.journal_ranking_id) === String(selectedJournalId);
              return (
                <button key={journal.journal_ranking_id} type="button" onClick={() => setSelectedJournalId(journal.journal_ranking_id)} style={{ width: '100%', display: 'grid', gridTemplateColumns: '70px minmax(0, 1.8fr) 92px 92px 92px 120px', gap: '0.75rem', padding: '1rem 1.1rem', border: 'none', borderBottom: `1px solid ${t.tableDivider}`, background: active ? (isDark ? 'rgba(14,165,233,0.12)' : 'rgba(14,165,233,0.08)') : 'transparent', color: t.textPrimary, textAlign: 'left', cursor: 'pointer' }}>
                  <div style={{ alignSelf: 'center' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>{journal.rank || '-'}</div>
                    <div style={{ color: t.textMuted, fontSize: '0.74rem' }}>{journal.oa ? 'OA' : 'Closed'}</div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, lineHeight: 1.4, marginBottom: '0.25rem' }}>{journal.title}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', color: t.textMuted, fontSize: '0.78rem' }}>
                      <span>{journal.country || 'Country n/a'}</span>
                      <span>{journal.publisher || 'Publisher n/a'}</span>
                    </div>
                    <div style={{ marginTop: '0.35rem', color: t.textSecondary, fontSize: '0.78rem' }}>{journal.best_subject_area || 'Subject area not listed'}</div>
                  </div>
                  <div style={{ alignSelf: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 56, padding: '0.35rem 0.5rem', borderRadius: 999, background: style.bg, border: `1px solid ${style.border}`, color: style.text, fontWeight: 800, fontSize: '0.75rem' }}>{quartile}</span>
                  </div>
                  <div style={{ alignSelf: 'center', fontWeight: 800 }}>{fmt(journal.sjr_index, 3)}</div>
                  <div style={{ alignSelf: 'center', fontWeight: 800 }}>{fmt(journal.h_index)}</div>
                  <div style={{ alignSelf: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#6ee7b7' }}>{fmt(journal.local_paper_count)}</div>
                    <div style={{ color: t.textMuted, fontSize: '0.74rem' }}>in project</div>
                  </div>
                </button>
              );
            })}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem 1.1rem', flexWrap: 'wrap' }}>
              <div style={{ color: t.textMuted, fontSize: '0.82rem' }}>Showing {(pagination.offset || 0) + (journals.length ? 1 : 0)}-{(pagination.offset || 0) + journals.length} of {fmt(pagination.total || 0)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page <= 1} style={{ padding: '0.65rem 0.9rem', borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: page <= 1 ? t.textMuted : t.textPrimary, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}><FaChevronLeft size={12} /></button>
                <div style={{ color: t.textPrimary, fontWeight: 700, minWidth: 86, textAlign: 'center' }}>Page {page} / {totalPages}</div>
                <button type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page >= totalPages} style={{ padding: '0.65rem 0.9rem', borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: page >= totalPages ? t.textMuted : t.textPrimary, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}><FaChevronRight size={12} /></button>
              </div>
            </div>
          </div>

          <div style={{ ...card, padding: '1.2rem', position: 'sticky', top: 92 }}>
            {detailLoading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: t.textMuted }}>Loading journal profile...</div>
            ) : !selectedMeta ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div style={{ color: t.textPrimary, fontWeight: 800, fontSize: '1rem' }}>Select a journal</div>
                <div style={{ marginTop: '0.35rem', color: t.textMuted, fontSize: '0.84rem' }}>The right panel will show ranking metrics, top authors, and connected papers.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.28rem 0.65rem', borderRadius: 999, background: qStyle(selectedMeta.best_quartile || 'UNRANKED').bg, border: `1px solid ${qStyle(selectedMeta.best_quartile || 'UNRANKED').border}`, color: qStyle(selectedMeta.best_quartile || 'UNRANKED').text, fontSize: '0.74rem', fontWeight: 800 }}><FaLayerGroup size={10} />{selectedMeta.best_quartile || 'UNRANKED'}</div>
                    <h2 style={{ margin: '0.75rem 0 0.4rem', color: t.textPrimary, fontSize: '1.3rem', lineHeight: 1.3, fontWeight: 900 }}>{selectedMeta.title}</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, color: t.textSecondary, fontSize: '0.82rem' }}>
                      <span><FaGlobeAsia size={11} style={{ marginRight: 5 }} />{selectedMeta.country || 'Country n/a'}</span>
                      <span><FaSortAmountDown size={11} style={{ marginRight: 5 }} />Rank {selectedMeta.sjr_rank || '-'}</span>
                      <span><FaBookOpen size={11} style={{ marginRight: 5 }} />{selectedMeta.oa ? 'Open access' : 'Subscription / hybrid'}</span>
                    </div>
                  </div>
                  <div style={{ minWidth: 88, textAlign: 'right', color: '#7dd3fc', fontWeight: 900, fontSize: '1.75rem', lineHeight: 1 }}>{fmt(selectedMeta.sjr_index, 3)}<div style={{ marginTop: '0.3rem', color: t.textMuted, fontSize: '0.72rem', fontWeight: 700 }}>SJR</div></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
                  {[
                    ['CiteScore', fmt(selectedMeta.citescore, 2), '#34d399'],
                    ['H-index', fmt(selectedMeta.h_index), '#f59e0b'],
                    ['Total docs', fmt(selectedMeta.total_docs), '#a78bfa'],
                    ['Local papers', fmt(selectedEntities.paper_count || selectedMeta.local_paper_count || 0), '#38bdf8'],
                  ].map(([label, value, color]) => <div key={label} style={{ padding: '0.9rem', borderRadius: 18, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)', border: `1px solid ${t.cardBorder}` }}><div style={{ color: t.textMuted, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div><div style={{ marginTop: '0.35rem', color, fontSize: '1.4rem', fontWeight: 900 }}>{value}</div></div>)}
                </div>

                <div style={{ display: 'grid', gap: '0.7rem', marginBottom: '1rem' }}>
                  {[
                    ['Publisher', selectedMeta.publisher || '-'],
                    ['Best subject area', selectedMeta.best_subject_area || '-'],
                    ['Coverage', selectedMeta.coverage || '-'],
                    ['Language', selectedMeta.iso_language_code || '-'],
                  ].map(([label, value]) => <div key={label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.8rem' }}><div style={{ color: t.textMuted, fontSize: '0.78rem', fontWeight: 700 }}>{label}</div><div style={{ color: t.textPrimary, fontSize: '0.84rem', lineHeight: 1.5 }}>{value}</div></div>)}
                </div>

                {!!selectedCategories.length && <div style={{ marginBottom: '1rem' }}><div style={{ color: t.textMuted, fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.55rem' }}>Best categories</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{selectedCategories.slice(0, 8).map((category, index) => <span key={`${category}-${index}`} style={{ padding: '0.42rem 0.7rem', borderRadius: 999, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>{String(category)}</span>)}</div></div>}

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: '0.65rem' }}><div style={{ color: t.textPrimary, fontWeight: 800 }}>Top authors in your data</div><div style={{ color: t.textMuted, fontSize: '0.74rem' }}>{selectedAuthors.length} shown</div></div>
                  {!selectedAuthors.length ? <div style={{ color: t.textMuted, fontSize: '0.83rem', lineHeight: 1.6 }}>No linked authors from your local papers yet for this journal.</div> : <div style={{ display: 'grid', gap: '0.6rem' }}>{selectedAuthors.slice(0, 6).map((author, index) => <div key={author.author_id || `${author.author_name}-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0.78rem 0.85rem', borderRadius: 16, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)', border: `1px solid ${t.cardBorder}` }}><div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}><div style={{ width: 32, height: 32, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(14,165,233,0.16)', color: '#38bdf8', flexShrink: 0 }}><FaUserFriends size={12} /></div><div style={{ minWidth: 0 }}><div style={{ color: t.textPrimary, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{author.author_name}</div><div style={{ color: t.textMuted, fontSize: '0.76rem' }}>Author ID {author.author_id}</div></div></div><div style={{ color: '#34d399', fontWeight: 800, fontSize: '0.86rem' }}>{fmt(author.paper_count)} papers</div></div>)}</div>}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: '0.7rem' }}>
                    <div style={{ color: t.textPrimary, fontWeight: 800 }}>Connected papers</div>
                    <button type="button" onClick={() => navigate(`/papers?q=${encodeURIComponent(selectedMeta.title)}`)} style={{ padding: '0.5rem 0.85rem', borderRadius: 12, border: '1px solid rgba(14,165,233,0.22)', background: 'rgba(14,165,233,0.1)', color: '#7dd3fc', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>Open in papers <FaExternalLinkAlt size={10} style={{ marginLeft: 6 }} /></button>
                  </div>
                  {!selectedPapers.length ? <div style={{ color: t.textMuted, fontSize: '0.83rem', lineHeight: 1.6 }}>Your database does not currently have linked paper records for this venue.</div> : <div style={{ display: 'grid', gap: '0.7rem' }}>{selectedPapers.slice(0, 5).map(paper => <button key={paper.paper_id} type="button" onClick={() => navigate(`/papers/${paper.paper_id}`)} style={{ width: '100%', textAlign: 'left', padding: '0.9rem', borderRadius: 18, border: `1px solid ${t.cardBorder}`, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)', cursor: 'pointer' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: '0.35rem' }}><div style={{ color: t.textPrimary, fontWeight: 800, lineHeight: 1.45 }}>{paper.title}</div><div style={{ color: '#7dd3fc', fontWeight: 800, whiteSpace: 'nowrap' }}>{paper.year || '-'}</div></div><div style={{ color: t.textSecondary, fontSize: '0.79rem', lineHeight: 1.55 }}>{paper.authors || 'Authors not available'}</div><div style={{ marginTop: '0.45rem', color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 700 }}>View paper details <FaArrowRight size={10} style={{ marginLeft: 4 }} /></div></button>)}</div>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journals;

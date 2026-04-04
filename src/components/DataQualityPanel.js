// DataQualityPanel — collapsible insight drawer on Dashboard.
// Surfaces:
//   • GetIncompletePapers() — papers missing abstract / journal / publish_year
//   • GetActiveUsers()      — users by last_login (trg_update_last_login)
// Designed to be compact and non-intrusive: collapsed by default.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaShieldAlt, FaExclamationTriangle, FaUsers, FaChevronDown,
  FaChevronUp, FaEdit, FaCircle, FaClock,
} from 'react-icons/fa';
import { statsApi } from '../api/authApi';

const DataQualityPanel = ({ isDark, t }) => {
  const [open, setOpen]                   = useState(false);
  const [activeTab, setActiveTab]         = useState('incomplete');
  const [incompletePapers, setIncomplete] = useState([]);
  const [activeUsers, setActiveUsers]     = useState([]);
  const [loadingInc, setLoadingInc]       = useState(false);
  const [loadingUsers, setLoadingUsers]   = useState(false);
  const [incError, setIncError]           = useState(null);
  const [usersError, setUsersError]       = useState(null);
  const [fetched, setFetched]             = useState(false);

  // Lazy-load only when panel is first opened
  useEffect(() => {
    if (!open || fetched) return;
    setFetched(true);

    setLoadingInc(true);
    statsApi.getIncompletePapers()
      .then(d => setIncomplete(d.papers || []))
      .catch(() => setIncError('Could not load (check server connection)'))
      .finally(() => setLoadingInc(false));

    setLoadingUsers(true);
    statsApi.getActiveUsers()
      .then(d => setActiveUsers(d.users || []))
      .catch(() => setUsersError('Could not load (auth may be required)'))
      .finally(() => setLoadingUsers(false));
  }, [open, fetched]);

  const amber  = '#f59e0b';
  const amberBg     = 'rgba(245,158,11,0.10)';
  const amberBorder = 'rgba(245,158,11,0.22)';
  const teal        = '#06b6d4';
  const tealBg      = 'rgba(6,182,212,0.10)';
  const tealBorder  = 'rgba(6,182,212,0.22)';

  const tabStyle = (id) => ({
    flex: 1, padding: '0.5rem', borderRadius: 9, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s ease',
    background: activeTab === id
      ? (id === 'incomplete' ? amberBg : tealBg)
      : 'transparent',
    color: activeTab === id
      ? (id === 'incomplete' ? amber : teal)
      : t.textMuted,
  });

  return (
    <div style={{ marginBottom: '2.5rem', borderRadius: 18,
                  border: `1px solid ${open ? amberBorder : t.cardBorder}`,
                  background: t.cardBg, backdropFilter: 'blur(16px)',
                  overflow: 'hidden', transition: 'border-color 0.3s ease' }}>

      {/* Toggle header */}
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                 padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                 borderBottom: open ? `1px solid ${t.divider}` : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9,
                        background: `linear-gradient(135deg, ${amber}, #ef4444)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 3px 10px rgba(245,158,11,0.35)` }}>
            <FaShieldAlt size={14} color="white" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: t.textPrimary }}>
              Data Quality & Activity Insights
            </p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: t.textMuted }}>
              Incomplete papers · Active users · Powered by stored procedures
            </p>
          </div>
        </div>
        <div style={{ color: t.textMuted }}>
          {open ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </div>
      </button>

      {/* Panel body */}
      {open && (
        <div style={{ padding: '1.25rem' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem',
                        background: t.inputBg, borderRadius: 11, padding: '0.3rem' }}>
            <button style={tabStyle('incomplete')} onClick={() => setActiveTab('incomplete')}>
              <FaExclamationTriangle size={11} style={{ marginRight: 5 }} />
              Incomplete Papers
              {!loadingInc && incompletePapers.length > 0 && (
                <span style={{ marginLeft: 6, background: amber, color: '#0f172a',
                               borderRadius: 999, padding: '0 6px', fontSize: '0.68rem',
                               fontWeight: 800 }}>{incompletePapers.length}</span>
              )}
            </button>
            <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
              <FaUsers size={11} style={{ marginRight: 5 }} />
              Active Users
              {!loadingUsers && activeUsers.length > 0 && (
                <span style={{ marginLeft: 6, background: teal, color: '#0f172a',
                               borderRadius: 999, padding: '0 6px', fontSize: '0.68rem',
                               fontWeight: 800 }}>{activeUsers.length}</span>
              )}
            </button>
          </div>

          {/* ── Incomplete Papers tab ── */}
          {activeTab === 'incomplete' && (
            <div>
              <p style={{ fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.85rem' }}>
                <code style={{ color: amber, background: amberBg,
                               padding: '1px 5px', borderRadius: 4, fontSize: '0.7rem' }}>
                  GetIncompletePapers()
                </code>
                {' '}— papers missing abstract, journal, or publish year.
              </p>

              {loadingInc ? (
                <Skeleton t={t} rows={4} />
              ) : incError ? (
                <ErrorMsg msg={incError} color={amber} bg={amberBg} border={amberBorder} />
              ) : incompletePapers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem',
                              color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>
                  ✓ All papers are complete — great data quality!
                </div>
              ) : (
                <div style={{ maxHeight: 280, overflowY: 'auto',
                              display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {incompletePapers.map((p, i) => (
                    <div key={p.paper_id || i}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem',
                               padding: '0.6rem 0.85rem', borderRadius: 10,
                               background: amberBg, border: `1px solid ${amberBorder}` }}>
                      <FaExclamationTriangle size={11} style={{ color: amber, flexShrink: 0 }} />
                      <p style={{ flex: 1, margin: 0, fontSize: '0.82rem', color: t.textSecondary,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title || p.paper_id || 'Unknown paper'}
                      </p>
                      <Link to={`/papers/edit/${p.paper_id}`}
                        style={{ color: amber, flexShrink: 0, opacity: 0.7 }}
                        title="Edit paper">
                        <FaEdit size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Active Users tab ── */}
          {activeTab === 'users' && (
            <div>
              <p style={{ fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.85rem' }}>
                <code style={{ color: teal, background: tealBg,
                               padding: '1px 5px', borderRadius: 4, fontSize: '0.7rem' }}>
                  GetActiveUsers()
                </code>
                {' '}— ordered by last_login maintained by{' '}
                <code style={{ color: teal, background: tealBg,
                               padding: '1px 5px', borderRadius: 4, fontSize: '0.7rem' }}>
                  trg_update_last_login
                </code>.
              </p>

              {loadingUsers ? (
                <Skeleton t={t} rows={4} />
              ) : usersError ? (
                <ErrorMsg msg={usersError} color={teal} bg={tealBg} border={tealBorder} />
              ) : activeUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem',
                              color: t.textMuted, fontSize: '0.875rem' }}>
                  No user data available.
                </div>
              ) : (
                <div style={{ maxHeight: 280, overflowY: 'auto',
                              display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeUsers.map((u, i) => (
                    <div key={u.user_id || i}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.85rem',
                               padding: '0.6rem 0.85rem', borderRadius: 10,
                               background: tealBg, border: `1px solid ${tealBorder}` }}>
                      {/* Avatar */}
                      <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                    background: 'linear-gradient(135deg,#06b6d4,#0ea5e9)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>
                        {(u.name || u.username || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600,
                                    color: t.textPrimary, overflow: 'hidden',
                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.name || u.username || `User #${u.user_id}`}
                        </p>
                        {u.last_login && (
                          <p style={{ margin: 0, fontSize: '0.68rem', color: t.textMuted,
                                      display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FaClock size={9} style={{ color: teal }} />
                            {new Date(u.last_login).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {/* Online indicator — green if logged in within 24h */}
                      {u.last_login && (Date.now() - new Date(u.last_login).getTime()) < 86400000 && (
                        <FaCircle size={8} style={{ color: '#10b981', flexShrink: 0 }} title="Active today" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Skeleton = ({ t, rows }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    {[...Array(rows)].map((_, i) => (
      <div key={i} style={{ height: 44, borderRadius: 10, background: t.cardBorder,
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: `${i * 80}ms` }} />
    ))}
    <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.9}}`}</style>
  </div>
);

const ErrorMsg = ({ msg, color, bg, border }) => (
  <div style={{ padding: '0.85rem 1rem', borderRadius: 10,
                background: bg, border: `1px solid ${border}`,
                fontSize: '0.82rem', color, fontWeight: 500 }}>
    ⚠ {msg}
  </div>
);

export default DataQualityPanel;
// Journals renders the journals page.
import React, { useState, useEffect } from 'react';
import api from '../api/authApi';
import { FaNewspaper, FaChartBar, FaSort, FaDatabase, FaSearch } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';
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
    color: '#f1f5f9',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
  }}>
      <p style={{
      fontWeight: 700,
      marginBottom: '0.35rem',
      color: '#a5b4fc',
      maxWidth: 220
    }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{
      color: p.color
    }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </p>)}
    </div>;
};
const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
const Journals = () => {
  const {
    isDark
  } = useTheme();
  const t = getTheme(isDark);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('count');
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    fetchJournals();
  }, []);
  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stats/journals', {
        params: {
          limit: 200
        }
      });
      const raw = res.data?.journals ?? [];
      const normalised = raw.map(j => ({
        name: j.journal ?? j._id ?? j.name ?? 'Unknown',
        count: Number(j.count) || 0
      })).filter(j => j.name && j.name.trim() !== '' && j.name !== 'Unknown');
      setJournals(normalised);
    } catch (err) {
      console.error('Journals fetch error:', err);
      toast.error('Failed to load journals');
    } finally {
      setLoading(false);
    }
  };
  const sorted = [...journals].sort((a, b) => {
    if (sortBy === 'count') return b.count - a.count;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });
  const visible = sorted.filter(j => j.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalJournals = journals.length;
  const maxCount = sorted[0]?.count ?? 1;
  const topJournalName = sorted[0]?.name ?? '—';
  const topJournalCount = sorted[0]?.count ?? 0;
  const totalAllPapers = journals.reduce((s, j) => s + j.count, 0);
  const avgPerJournal = totalJournals ? Math.round(totalAllPapers / totalJournals) : 0;
  const chartData = [...journals].sort((a, b) => b.count - a.count).slice(0, 8).map(j => ({
    name: j.name.length > 20 ? j.name.slice(0, 20) + '…' : j.name,
    Papers: j.count
  }));
  const card = {
    background: t.cardBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${t.cardBorder}`,
    borderRadius: 18,
    padding: '1.5rem',
    boxShadow: t.cardShadow
  };
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
          color: '#10b981',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '0.4rem'
        }}>
            ✦ MongoDB Aggregation
          </p>
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
              background: 'linear-gradient(135deg,#10b981,#06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em'
            }}>
                Journal Analytics
              </h1>
              <p style={{
              color: t.textMuted,
              fontSize: '0.875rem',
              marginTop: '0.25rem'
            }}>
                <FaDatabase size={11} style={{
                display: 'inline',
                marginRight: 5,
                color: '#10b981'
              }} />
                Publication venues ranked by paper count — powered by MongoDB
              </p>
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
              padding: '0.65rem 0.9rem',
              borderRadius: 11,
              background: t.inputBg,
              border: `1px solid ${t.inputBorder}`,
              color: t.textSecondary,
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer'
            }}>
                <option value="count">Most Papers</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {}
        <div className="animate-fade-in" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
          {[{
          label: 'Total Journals',
          value: loading ? '…' : totalJournals.toLocaleString(),
          sub: 'unique publication venues',
          color: '#10b981'
        }, {
          label: 'Top Journal',
          value: loading ? '…' : topJournalCount.toLocaleString(),
          sub: loading ? '' : topJournalName.length > 30 ? topJournalName.slice(0, 30) + '…' : topJournalName,
          color: '#6366f1'
        }, {
          label: 'Avg Papers / Journal',
          value: loading ? '…' : avgPerJournal.toLocaleString(),
          sub: 'across all venues',
          color: '#a855f7'
        }].map(({
          label,
          value,
          sub,
          color
        }) => <div key={label} style={{
          background: t.cardBg,
          backdropFilter: 'blur(12px)',
          border: `1px solid ${color}30`,
          borderRadius: 16,
          padding: '1.1rem 1.3rem'
        }}>
              <p style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: t.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.4rem'
          }}>
                {label}
              </p>
              <p style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            background: `linear-gradient(135deg,${color},${color}bb)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
            marginBottom: '0.3rem'
          }}>
                {value}
              </p>
              {sub && <p style={{
            fontSize: '0.73rem',
            color: t.textMuted,
            lineHeight: 1.4
          }}>{sub}</p>}
            </div>)}
        </div>

        {}
        {!loading && chartData.length > 0 && <div className="animate-fade-in" style={{
        ...card,
        marginBottom: '2rem'
      }}>
            <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: '1.25rem'
        }}>
              <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg,#10b981,#06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16,185,129,0.35)'
          }}>
                <FaChartBar size={14} color="white" />
              </div>
              <div>
                <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: t.textPrimary
            }}>Top 8 Journals by Paper Count</h3>
                <p style={{
              fontSize: '0.75rem',
              color: t.textMuted,
              marginTop: 2
            }}>Papers indexed in MongoDB per venue</p>
              </div>
            </div>
            <div style={{
          height: 320
        }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{
              top: 5,
              right: 20,
              left: 10,
              bottom: 80
            }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                  <XAxis dataKey="name" angle={-35} textAnchor="end" height={90} tick={{
                fill: t.textMuted,
                fontSize: 11
              }} axisLine={{
                stroke: t.cardBorder
              }} tickLine={false} />
                  <YAxis tick={{
                fill: t.textMuted,
                fontSize: 11
              }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                  <Tooltip content={<CustomTooltip />} cursor={{
                fill: 'rgba(255,255,255,0.04)'
              }} />
                  <Bar dataKey="Papers" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>}

        {}
        <div style={{
        marginBottom: '1rem',
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
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Filter journals by name…" style={{
          width: '100%',
          padding: '0.72rem 1rem 0.72rem 2.4rem',
          borderRadius: 12,
          background: t.inputBg,
          border: `1px solid ${t.inputBorder}`,
          color: t.inputColor,
          fontSize: '0.875rem',
          outline: 'none',
          boxSizing: 'border-box'
        }} />
        </div>

        <p style={{
        fontSize: '0.82rem',
        color: t.textMuted,
        marginBottom: '1rem'
      }}>
          Showing <strong style={{
          color: t.textPrimary
        }}>{visible.length}</strong> of {totalJournals} journals
          {searchTerm && <span> matching "<strong style={{
            color: '#10b981'
          }}>{searchTerm}</strong>"</span>}
        </p>

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
            border: '3px solid rgba(16,185,129,0.2)',
            borderTopColor: '#10b981',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{
            color: t.textMuted,
            fontSize: '0.875rem'
          }}>Loading journals…</p>
            </div>
          </div> : visible.length === 0 ? <div style={{
        ...card,
        textAlign: 'center',
        padding: '3rem'
      }}>
            <p style={{
          color: t.textSecondary,
          fontSize: '1rem'
        }}>
              No journals found{searchTerm ? ` matching "${searchTerm}"` : ''}.
            </p>
            {searchTerm && <button onClick={() => setSearchTerm('')} style={{
          marginTop: '0.75rem',
          color: '#10b981',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600
        }}>
                Clear search
              </button>}
          </div> : <div className="animate-fade-in" style={{
        background: t.cardBg,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${t.cardBorder}`,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
            {}
            <div style={{
          display: 'grid',
          gridTemplateColumns: '44px 1fr 120px 140px',
          padding: '0.75rem 1.25rem',
          borderBottom: `1px solid ${t.divider}`,
          background: t.tableHeaderBg
        }}>
              {['#', 'Journal Name', 'Papers', '% of Total'].map(h => <span key={h} style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: t.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.07em'
          }}>{h}</span>)}
            </div>

            {visible.map((journal, index) => {
          const pct = totalAllPapers ? (journal.count / totalAllPapers * 100).toFixed(2) : '0.00';
          const barW = Math.max(3, journal.count / maxCount * 100);
          const color = BAR_COLORS[index % BAR_COLORS.length];
          return <div key={`${journal.name}-${index}`} style={{
            display: 'grid',
            gridTemplateColumns: '44px 1fr 120px 140px',
            padding: '0.9rem 1.25rem',
            borderBottom: `1px solid ${t.tableDivider}`,
            alignItems: 'center',
            transition: 'background 0.2s ease'
          }} onMouseEnter={e => {
            e.currentTarget.style.background = t.tableRowHover;
          }} onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}>
                  {}
                  <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: t.textMuted
            }}>{index + 1}</span>

                  {}
                  <div>
                    <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: '0.3rem'
              }}>
                      <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `${color}22`,
                  border: `1px solid ${color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                        <FaNewspaper size={11} style={{
                    color
                  }} />
                      </div>
                      <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: t.textPrimary,
                  wordBreak: 'break-word'
                }}>{journal.name}</span>
                    </div>
                    <div style={{
                height: 3,
                width: '70%',
                marginLeft: 36,
                background: t.cardBorder,
                borderRadius: 999
              }}>
                      <div style={{
                  width: `${barW}%`,
                  height: '100%',
                  background: `linear-gradient(90deg,${color},${color}66)`,
                  borderRadius: 999
                }} />
                    </div>
                  </div>

                  {}
                  <span style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#6ee7b7'
            }}>
                    {journal.count.toLocaleString()}
                  </span>

                  {}
                  <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
                    <div style={{
                width: 48,
                height: 5,
                background: t.cardBorder,
                borderRadius: 999,
                overflow: 'hidden'
              }}>
                      <div style={{
                  width: `${Math.min(100, journal.count / maxCount * 100)}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 999
                }} />
                    </div>
                    <span style={{
                fontSize: '0.78rem',
                color: t.textMuted,
                minWidth: 44
              }}>{pct}%</span>
                  </div>
                </div>;
        })}
          </div>}

        {}
        <div className="animate-fade-in" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
        gap: '1.5rem'
      }}>
          <div style={{
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 16,
          padding: '1.25rem 1.5rem'
        }}>
            <h3 style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#6ee7b7',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
              <FaDatabase size={14} style={{
              color: '#10b981'
            }} /> Aggregation Pipeline
            </h3>
            <pre style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '0.75rem',
            borderRadius: 10,
            fontFamily: 'monospace',
            fontSize: '0.72rem',
            color: '#6ee7b7',
            overflowX: 'auto',
            margin: 0
          }}>
            {`[
  { $group: {
      _id: "$journal",
      count: { $sum: 1 }
  }},
  { $sort:  { count: -1 } },
  { $limit: 200 }
]`}
            </pre>
          </div>

          <div style={{
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: 16,
          padding: '1.25rem 1.5rem'
        }}>
            <h3 style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: t.textPrimary,
            marginBottom: '1rem'
          }}>
              Why MongoDB for Journals?
            </h3>
            <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
              {[{
              title: 'Single-pass Aggregation',
              desc: '$group + $sort in one pipeline — no JOIN overhead like SQL',
              bg: 'rgba(16,185,129,0.10)',
              border: 'rgba(16,185,129,0.2)',
              tc: '#6ee7b7'
            }, {
              title: 'Flexible Schema',
              desc: 'journal field lives on every document, no separate table needed',
              bg: 'rgba(99,102,241,0.10)',
              border: 'rgba(99,102,241,0.2)',
              tc: '#a5b4fc'
            }, {
              title: 'idx_journal Index',
              desc: 'Dedicated index makes $group scans fast at 200k+ documents',
              bg: 'rgba(168,85,247,0.10)',
              border: 'rgba(168,85,247,0.2)',
              tc: '#d8b4fe'
            }].map(({
              title,
              desc,
              bg,
              border,
              tc
            }) => <div key={title} style={{
              padding: '0.7rem 0.9rem',
              background: bg,
              border: `1px solid ${border}`,
              borderRadius: 10
            }}>
                  <p style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: tc,
                marginBottom: '0.2rem'
              }}>{title}</p>
                  <p style={{
                fontSize: '0.75rem',
                color: t.textMuted
              }}>{desc}</p>
                </div>)}
            </div>
          </div>
        </div>

      </div>
    </div>;
};
export default Journals;

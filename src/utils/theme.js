// theme exports the color tokens used by the frontend theme system.
export const getTheme = isDark => ({
  pageBg: isDark ? 'linear-gradient(135deg,#0a0f1e 0%,#0d1b2a 50%,#0f172a 100%)' : 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 50%,#e2e8f0 100%)',
  textPrimary: isDark ? '#f1f5f9' : '#0f172a',
  textSecondary: isDark ? '#94a3b8' : '#475569',
  textMuted: isDark ? '#64748b' : '#94a3b8',
  accent: isDark ? '#06b6d4' : '#0891b2',
  accentAlt: isDark ? '#0ea5e9' : '#0284c7',
  accentText: isDark ? '#22d3ee' : '#0891b2',
  accentGlow: isDark ? 'rgba(6,182,212,0.4)' : 'rgba(8,145,178,0.25)',
  accentGrad: 'linear-gradient(135deg,#06b6d4,#0ea5e9)',
  accentBg: isDark ? 'rgba(6,182,212,0.12)' : 'rgba(8,145,178,0.10)',
  accentBorder: isDark ? 'rgba(6,182,212,0.3)' : 'rgba(8,145,178,0.35)',
  cardBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)',
  cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  cardHover: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.95)',
  cardShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
  inputBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  inputBorder: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)',
  inputColor: isDark ? '#f1f5f9' : '#0f172a',
  tableHeaderBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  tableRowHover: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
  tableDivider: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
  divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  codeBg: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.06)',
  codeText: isDark ? '#94a3b8' : '#334155',
  btnPrimary: {
    background: 'linear-gradient(135deg,#06b6d4,#0ea5e9)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 14px rgba(6,182,212,0.4)'
  },
  btnPrimaryHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(6,182,212,0.55)'
  },
  btnGhost: {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
    color: isDark ? '#94a3b8' : '#475569'
  },
  btnGhostHover: {
    background: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
    color: isDark ? '#f1f5f9' : '#0f172a'
  },
  sectionIconBg: 'linear-gradient(135deg,#06b6d4,#0ea5e9)',
  sectionIconGlow: '0 4px 12px rgba(6,182,212,0.35)'
});

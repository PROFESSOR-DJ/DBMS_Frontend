// StatCard renders the stat card UI component.
import React, { useEffect, useRef, useState } from 'react';
import { FaFileAlt, FaUsers, FaNewspaper, FaCalendarAlt } from 'react-icons/fa';
import { cleanDisplayName } from '../utils/cleanName';
const config = {
  papers: {
    icon: FaFileAlt,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    glow: 'rgba(99,102,241,0.4)',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.25)',
    label: 'Total Papers'
  },
  authors: {
    icon: FaUsers,
    gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    glow: 'rgba(168,85,247,0.4)',
    bg: 'rgba(168,85,247,0.12)',
    border: 'rgba(168,85,247,0.25)',
    label: 'Unique Authors'
  },
  journals: {
    icon: FaNewspaper,
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    glow: 'rgba(16,185,129,0.4)',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)',
    label: 'Journals'
  },
  years: {
    icon: FaCalendarAlt,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    glow: 'rgba(245,158,11,0.4)',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
    label: 'Years Covered'
  }
};
const useCountUp = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const raf = useRef(null);
  useEffect(() => {
    if (!target) return;
    const animate = timestamp => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
};
const StatCard = ({
  title,
  value,
  type,
  change,
  delay = 0
}) => {
  const cfg = config[type] || config.papers;
  const Icon = cfg.icon;
  const animatedValue = useCountUp(value);
  return <div className="animate-fade-in" style={{
    animationDelay: `${delay}ms`,
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${cfg.border}`,
    borderRadius: 18,
    padding: '1.5rem',
    boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden'
  }} onMouseEnter={e => {
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.5), 0 0 24px ${cfg.glow}`;
  }} onMouseLeave={e => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`;
  }}>
      {}
      <div style={{
      position: 'absolute',
      top: -20,
      right: -20,
      width: 100,
      height: 100,
      borderRadius: '50%',
      background: cfg.gradient,
      opacity: 0.08,
      filter: 'blur(20px)',
      pointerEvents: 'none'
    }} />

      <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }}>
        <div>
          <p style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.5rem'
        }}>
            {cleanDisplayName(title)}
          </p>
          <p style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          background: cfg.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.1,
          letterSpacing: '-0.02em'
        }}>
            {animatedValue.toLocaleString()}
          </p>
          {change && <p style={{
          fontSize: '0.78rem',
          marginTop: '0.4rem',
          color: change > 0 ? '#6ee7b7' : '#fca5a5',
          fontWeight: 500
        }}>
              {change > 0 ? '▲' : '▼'} {Math.abs(change)}% from last month
            </p>}
        </div>

        <div style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: cfg.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 16px ${cfg.glow}`,
        flexShrink: 0
      }}>
          <Icon size={20} color="white" />
        </div>
      </div>
    </div>;
};
export default StatCard;

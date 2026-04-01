// Login renders the login page.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt, FaDatabase } from 'react-icons/fa';
const Orb = ({
  style
}) => <div style={{
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(60px)',
  pointerEvents: 'none',
  animation: 'orbFloat 8s ease-in-out infinite',
  ...style
}} />;
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({});
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const handleChange = e => setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) navigate('/dashboard');
    setLoading(false);
  };
  const inputStyle = name => ({
    width: '100%',
    padding: '0.85rem 1rem 0.85rem 2.8rem',
    borderRadius: 12,
    background: focused[name] ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
    border: focused[name] ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.10)',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: focused[name] ? '0 0 0 3px rgba(99,102,241,0.15), 0 0 20px rgba(99,102,241,0.08)' : 'none'
  });
  return <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden'
  }}>
      {}
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(30px, -40px) scale(1.06); }
          66%  { transform: translate(-25px, 20px) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(-40px, 30px) scale(1.08); }
          66%  { transform: translate(20px, -25px) scale(0.93); }
        }
        @keyframes formIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes logoIn {
          from { opacity: 0; transform: scale(0.8) rotate(-10deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>

      <Orb style={{
      width: 400,
      height: 400,
      background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
      top: '-100px',
      left: '-100px',
      animation: 'orbFloat 9s ease-in-out infinite'
    }} />
      <Orb style={{
      width: 350,
      height: 350,
      background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
      bottom: '-80px',
      right: '-80px',
      animation: 'orbFloat2 11s ease-in-out infinite'
    }} />
      <Orb style={{
      width: 200,
      height: 200,
      background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
      top: '60%',
      left: '10%',
      animation: 'orbFloat 13s ease-in-out infinite reverse'
    }} />

      {}
      <div style={{
      width: '100%',
      maxWidth: 420,
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 24,
      padding: '2.5rem',
      boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      animation: 'formIn 0.6s cubic-bezier(0.16,1,0.3,1) both',
      position: 'relative',
      zIndex: 1
    }}>
        {}
        <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
          <div style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
          animation: 'logoIn 0.5s ease-out 0.2s both'
        }}>
            <FaDatabase size={26} color="white" />
          </div>
          <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #f1f5f9, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.35rem'
        }}>
            Welcome Back
          </h1>
          <p style={{
          color: '#64748b',
          fontSize: '0.9rem'
        }}>
            Sign in to your <span style={{
            color: '#818cf8'
          }}>ResearchDB</span> account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
          {}
          <div>
            <label style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#94a3b8',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
              Email Address
            </label>
            <div style={{
            position: 'relative'
          }}>
              <FaEnvelope size={14} style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused.email ? '#818cf8' : '#475569',
              transition: 'color 0.3s ease'
            }} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => setFocused(f => ({
              ...f,
              email: true
            }))} onBlur={() => setFocused(f => ({
              ...f,
              email: false
            }))} placeholder="you@example.com" required style={inputStyle('email')} />
            </div>
          </div>

          {}
          <div>
            <label style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#94a3b8',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
              Password
            </label>
            <div style={{
            position: 'relative'
          }}>
              <FaLock size={14} style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused.password ? '#818cf8' : '#475569',
              transition: 'color 0.3s ease'
            }} />
              <input type="password" name="password" value={formData.password} onChange={handleChange} onFocus={() => setFocused(f => ({
              ...f,
              password: true
            }))} onBlur={() => setFocused(f => ({
              ...f,
              password: false
            }))} placeholder="••••••••" required style={inputStyle('password')} />
            </div>
          </div>

          {}
          <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
            <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer'
          }}>
              <input type="checkbox" style={{
              accentColor: '#6366f1',
              width: 15,
              height: 15
            }} />
              <span style={{
              fontSize: '0.85rem',
              color: '#64748b'
            }}>Remember me</span>
            </label>
            <Link to="/forgot-password" style={{
            fontSize: '0.85rem',
            color: '#818cf8',
            textDecoration: 'none',
            fontWeight: 500
          }}>
              Forgot password?
            </Link>
          </div>

          {}
          <button type="submit" disabled={loading} style={{
          width: '100%',
          padding: '0.9rem',
          borderRadius: 12,
          border: 'none',
          background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          color: 'white',
          fontSize: '0.95rem',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.45)',
          transition: 'all 0.3s ease',
          letterSpacing: '0.02em'
        }} onMouseEnter={e => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.6)';
          }
        }} onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.45)';
        }}>
            <FaSignInAlt size={15} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {}
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '1.5rem 0'
      }}>
          <div style={{
          flex: 1,
          height: 1,
          background: 'rgba(255,255,255,0.08)'
        }} />
          <span style={{
          fontSize: '0.78rem',
          color: '#475569'
        }}>or</span>
          <div style={{
          flex: 1,
          height: 1,
          background: 'rgba(255,255,255,0.08)'
        }} />
        </div>

        <p style={{
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#64748b'
      }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
          color: '#818cf8',
          fontWeight: 600,
          textDecoration: 'none'
        }}>
            Sign up now →
          </Link>
        </p>
      </div>
    </div>;
};
export default Login;

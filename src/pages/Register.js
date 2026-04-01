// Register renders the register page.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaDatabase } from 'react-icons/fa';
const Orb = ({
  style
}) => <div style={{
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(60px)',
  pointerEvents: 'none',
  ...style
}} />;
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({});
  const {
    register
  } = useAuth();
  const navigate = useNavigate();
  const handleChange = e => setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    if (result.success) navigate('/login');
    setLoading(false);
  };
  const inputStyle = name => ({
    width: '100%',
    padding: '0.8rem 1rem 0.8rem 2.8rem',
    borderRadius: 12,
    background: focused[name] ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
    border: focused[name] ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.10)',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: focused[name] ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none'
  });
  const fields = [{
    name: 'name',
    type: 'text',
    icon: FaUser,
    label: 'Full Name',
    placeholder: 'John Doe',
    required: true
  }, {
    name: 'email',
    type: 'email',
    icon: FaEnvelope,
    label: 'Email Address',
    placeholder: 'you@example.com',
    required: true
  }, {
    name: 'password',
    type: 'password',
    icon: FaLock,
    label: 'Password',
    placeholder: '••••••••',
    required: true,
    minLength: 6
  }, {
    name: 'confirmPassword',
    type: 'password',
    icon: FaLock,
    label: 'Confirm Password',
    placeholder: '••••••••',
    required: true,
    minLength: 6
  }];
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
      <style>{`
        @keyframes orbFloat  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-40px) scale(1.06)} 66%{transform:translate(-25px,20px) scale(0.95)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-40px,30px) scale(1.08)} 66%{transform:translate(20px,-25px) scale(0.93)} }
        @keyframes formIn    { from{opacity:0;transform:translateY(30px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes logoIn    { from{opacity:0;transform:scale(0.8) rotate(-10deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
      `}</style>

      <Orb style={{
      width: 380,
      height: 380,
      background: 'radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)',
      top: '-80px',
      right: '-80px',
      animation: 'orbFloat 9s ease-in-out infinite'
    }} />
      <Orb style={{
      width: 300,
      height: 300,
      background: 'radial-gradient(circle,rgba(168,85,247,0.18) 0%,transparent 70%)',
      bottom: '-60px',
      left: '-60px',
      animation: 'orbFloat2 11s ease-in-out infinite'
    }} />
      <Orb style={{
      width: 180,
      height: 180,
      background: 'radial-gradient(circle,rgba(16,185,129,0.10) 0%,transparent 70%)',
      top: '40%',
      right: '15%',
      animation: 'orbFloat 14s ease-in-out infinite reverse'
    }} />

      <div style={{
      width: '100%',
      maxWidth: 440,
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 24,
      padding: '2.25rem',
      boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      animation: 'formIn 0.6s cubic-bezier(0.16,1,0.3,1) both',
      position: 'relative',
      zIndex: 1
    }}>
        {}
        <div style={{
        textAlign: 'center',
        marginBottom: '1.75rem'
      }}>
          <div style={{
          width: 58,
          height: 58,
          borderRadius: 16,
          background: 'linear-gradient(135deg,#6366f1,#a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.85rem',
          boxShadow: '0 8px 28px rgba(99,102,241,0.5)',
          animation: 'logoIn 0.5s ease-out 0.2s both'
        }}>
            <FaDatabase size={22} color="white" />
          </div>
          <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg,#f1f5f9,#a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.3rem'
        }}>Create Account</h1>
          <p style={{
          color: '#64748b',
          fontSize: '0.875rem'
        }}>
            Join <span style={{
            color: '#818cf8'
          }}>ResearchDB</span> and explore research papers
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
          {fields.map(({
          name,
          type,
          icon: Icon,
          label,
          placeholder,
          required,
          minLength
        }) => <div key={name}>
              <label style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#94a3b8',
            marginBottom: '0.4rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
                {label}
              </label>
              <div style={{
            position: 'relative'
          }}>
                <Icon size={13} style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused[name] ? '#818cf8' : '#475569',
              transition: 'color 0.3s ease'
            }} />
                <input type={type} name={name} value={formData[name]} onChange={handleChange} onFocus={() => setFocused(f => ({
              ...f,
              [name]: true
            }))} onBlur={() => setFocused(f => ({
              ...f,
              [name]: false
            }))} placeholder={placeholder} required={required} minLength={minLength} style={inputStyle(name)} />
              </div>
            </div>)}

          <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          marginTop: '0.25rem'
        }}>
            <input type="checkbox" required style={{
            accentColor: '#6366f1',
            width: 15,
            height: 15
          }} />
            <span style={{
            fontSize: '0.83rem',
            color: '#64748b'
          }}>
              I agree to the{' '}
              <Link to="/terms" style={{
              color: '#818cf8',
              textDecoration: 'none',
              fontWeight: 500
            }}>Terms &amp; Conditions</Link>
            </span>
          </label>

          <button type="submit" disabled={loading} style={{
          width: '100%',
          padding: '0.85rem',
          borderRadius: 12,
          border: 'none',
          background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)',
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
          marginTop: '0.25rem'
        }} onMouseEnter={e => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.6)';
          }
        }} onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.45)';
        }}>
            <FaUserPlus size={15} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '1.25rem 0'
      }}>
          <div style={{
          flex: 1,
          height: 1,
          background: 'rgba(255,255,255,0.08)'
        }} />
          <span style={{
          fontSize: '0.75rem',
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
        fontSize: '0.875rem',
        color: '#64748b'
      }}>
          Already have an account?{' '}
          <Link to="/login" style={{
          color: '#818cf8',
          fontWeight: 600,
          textDecoration: 'none'
        }}>Sign in →</Link>
        </p>
      </div>
    </div>;
};
export default Register;

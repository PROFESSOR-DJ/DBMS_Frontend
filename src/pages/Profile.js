import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaCalendarAlt,
  FaEdit,
  FaEnvelope,
  FaSave,
  FaSignOutAlt,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateStoredAuthUser } from '../utils/auth';
import { getTheme } from '../utils/theme';

const EMPTY_PROFILE = {
  name: '',
  email: '',
  role: 'researcher',
  created_at: null,
  last_login: null,
};

const formatDate = (value, options) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString(undefined, options);
};

const prettyRole = (role) => {
  if (!role) return 'Research User';
  return role
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getAccessDescription = (role) => {
  if (role === 'admin') return 'Full system access';
  if (role === 'viewer') return 'Read-only access';
  return 'Research workspace access';
};

const getStatus = (lastLogin) => {
  if (!lastLogin) return { label: 'Unavailable', color: '#94a3b8' };
  const diff = Date.now() - new Date(lastLogin).getTime();
  if (diff < 24 * 60 * 60 * 1000) return { label: 'Active today', color: '#10b981' };
  if (diff < 7 * 24 * 60 * 60 * 1000) return { label: 'Active this week', color: '#f59e0b' };
  return { label: 'Inactive', color: '#94a3b8' };
};

const cardBase = (t) => ({
  background: t.cardBg,
  backdropFilter: 'blur(16px)',
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 20,
  boxShadow: t.cardShadow,
});

const Profile = () => {
  const { logout, user, setUser } = useAuth();
  const { isDark } = useTheme();
  const t = getTheme(isDark);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    ...EMPTY_PROFILE,
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'researcher',
  });
  const [formData, setFormData] = useState({
    ...EMPTY_PROFILE,
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'researcher',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await authApi.getProfile();
        const nextProfile = {
          name: data.name || '',
          email: data.email || user?.email || '',
          role: data.role || 'researcher',
          created_at: data.created_at || null,
          last_login: data.last_login || null,
        };
        setProfile(nextProfile);
        setFormData(nextProfile);
        const nextSessionUser = {
          ...(user || {}),
          name: nextProfile.name,
          email: nextProfile.email,
          role: nextProfile.role,
        };
        setUser(nextSessionUser);
        updateStoredAuthUser(nextSessionUser);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.email]);

  const handleEditToggle = () => {
    if (editing) setFormData(profile);
    setEditing(prev => !prev);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };
      const response = await authApi.updateProfile(payload);
      const updatedUser = response.user || payload;
      const nextProfile = {
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        role: updatedUser.role || profile.role,
        created_at: updatedUser.created_at || profile.created_at,
        last_login: updatedUser.last_login || profile.last_login,
      };
      setProfile(nextProfile);
      setFormData(nextProfile);
      const nextSessionUser = {
        ...(user || {}),
        name: nextProfile.name,
        email: nextProfile.email,
        role: nextProfile.role,
      };
      setUser(nextSessionUser);
      updateStoredAuthUser(nextSessionUser);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const status = getStatus(profile.last_login);
  const profileName = profile.name || 'Research Member';
  const profileEmail = profile.email || 'No email on file';

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: t.pageBg,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            border: `3px solid ${t.accentBg}`, borderTopColor: t.accent,
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: t.textMuted, fontSize: '0.9rem' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: -30, left: -40, width: 280, height: 180,
            background: `radial-gradient(circle,${t.accentBg} 0%,transparent 70%)`,
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />
          <p style={{
            fontSize: '0.78rem', fontWeight: 700, color: t.accent,
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem',
          }}>
            Account Overview
          </p>
          <h1 style={{
            fontSize: 'clamp(1.9rem,4vw,2.9rem)', fontWeight: 900,
            background: t.accentGrad, WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            lineHeight: 1.1, marginBottom: '0.6rem', letterSpacing: '-0.03em',
          }}>
            Profile Settings
          </h1>
          <p style={{ color: t.textMuted, fontSize: '0.95rem', maxWidth: 620 }}>
            Your profile is now mapped from the SQL users table and respects the global theme.
          </p>
        </div>

        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <section style={{ ...cardBase(t), padding: '1.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, background: t.sectionIconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: t.sectionIconGlow,
                  }}>
                    <FaUser color="white" size={18} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: t.textPrimary }}>
                      Personal Information
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: t.textMuted }}>
                      Synced from your `users` table record
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEditToggle}
                  style={{
                    ...t.btnGhost,
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '0.75rem 1rem', borderRadius: 12, cursor: 'pointer',
                    fontWeight: 700,
                  }}>
                  {editing ? <FaTimes size={13} /> : <FaEdit size={13} />}
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' }}>
                <FieldCard
                  icon={FaUser}
                  label="Full Name"
                  t={t}
                  editing={editing}
                  name="name"
                  value={editing ? formData.name : profileName}
                  placeholder="Research Member Name"
                  onChange={handleChange}
                />
                <FieldCard
                  icon={FaEnvelope}
                  label="Email Address"
                  t={t}
                  editing={editing}
                  name="email"
                  value={editing ? formData.email : profileEmail}
                  placeholder="member@researchhub.edu"
                  onChange={handleChange}
                  type="email"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginTop: '1rem' }}>
                <InfoStat
                  t={t}
                  label="Member Since"
                  value={formatDate(profile.created_at, { year: 'numeric', month: 'long', day: 'numeric' })}
                  icon={FaCalendarAlt}
                  accent="#10b981"
                />
                <InfoStat
                  t={t}
                  label="Last Login"
                  value={formatDate(profile.last_login, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  icon={FaCalendarAlt}
                  accent={t.accent}
                />
              </div>

              {editing && (
                <div style={{ paddingTop: '1.25rem', marginTop: '1.25rem', borderTop: `1px solid ${t.divider}` }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      ...t.btnPrimary,
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '0.85rem 1.2rem', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1, fontWeight: 700,
                    }}>
                    <FaSave size={13} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </section>

            <section style={{ ...cardBase(t), padding: '1.5rem' }}>
              <h2 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.35rem', fontWeight: 800, color: t.textPrimary }}>
                Account Security
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {[
                  'Change Password',
                  'Two-Factor Authentication',
                  'Login History',
                ].map((label) => (
                  <button
                    key={label}
                    type="button"
                    style={{
                      ...t.btnGhost,
                      width: '100%',
                      padding: '1rem 1.1rem',
                      textAlign: 'left',
                      borderRadius: 14,
                      fontWeight: 700,
                      cursor: 'default',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <section style={{ ...cardBase(t), padding: '1.5rem' }}>
              <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 800, color: t.textPrimary }}>
                Account Access
              </h3>
              <SideStat t={t} label="User Role" value={prettyRole(profile.role)} />
              <SideStat t={t} label="Access Level" value={getAccessDescription(profile.role)} />
              <SideStat t={t} label="Contact Email" value={profileEmail} />
              <SideStat t={t} label="Account Status" value={status.label} valueColor={status.color} />
            </section>

            <section style={{ ...cardBase(t), padding: '1.5rem' }}>
              <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 800, color: t.textPrimary }}>
                Session
              </h3>
              <p style={{ margin: 0, marginBottom: '0.55rem', fontSize: '0.8rem', color: t.textMuted }}>
                Signed in as
              </p>
              <p style={{ margin: 0, marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700, color: t.textPrimary }}>
                {profileEmail}
              </p>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '0.95rem 1rem',
                  borderRadius: 14,
                  border: '1px solid rgba(239,68,68,0.25)',
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: 'white',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 22px rgba(239,68,68,0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}>
                <FaSignOutAlt size={13} />
                Logout Account
              </button>
            </section>
          </aside>
        </div>

        <style>{`
          @media (max-width: 960px) {
            .profile-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

const FieldCard = ({ icon: Icon, label, t, editing, name, value, placeholder, onChange, type = 'text' }) => (
  <div style={{
    padding: '1rem', borderRadius: 16,
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.6rem', color: t.textMuted }}>
      <Icon size={12} />
      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{label}</span>
    </div>
    {editing ? (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '0.85rem 0.95rem', borderRadius: 12,
          background: t.cardBg, border: `1px solid ${t.inputBorder}`,
          color: t.inputColor, outline: 'none', fontSize: '0.95rem',
        }}
      />
    ) : (
      <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: t.textPrimary }}>
        {value || placeholder}
      </p>
    )}
  </div>
);

const InfoStat = ({ t, label, value, icon: Icon, accent }) => (
  <div style={{
    padding: '1rem', borderRadius: 16,
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
  }}>
    <p style={{ margin: 0, marginBottom: '0.45rem', fontSize: '0.78rem', fontWeight: 700, color: t.textMuted }}>
      {label}
    </p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={13} style={{ color: accent }} />
      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: t.textPrimary }}>{value}</span>
    </div>
  </div>
);

const SideStat = ({ t, label, value, valueColor }) => (
  <div style={{ padding: '0.85rem 0', borderBottom: `1px solid ${t.divider}` }}>
    <p style={{ margin: 0, marginBottom: '0.3rem', fontSize: '0.78rem', color: t.textMuted }}>
      {label}
    </p>
    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: valueColor || t.textPrimary }}>
      {value}
    </p>
  </div>
);

export default Profile;

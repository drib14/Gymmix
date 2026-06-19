// Placeholder stubs for remaining pages — Profile, Analytics, Pricing, Blog

import DashboardLayout from '../../components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { FiUser, FiCamera, FiSave, FiLock, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const toast = useToast();
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    document.title = 'Gymmix | Profile';
  }, []);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    height: user?.height || '',
    weight: user?.weight || '',
    fitnessGoal: user?.fitnessGoal || '',
    activityLevel: user?.activityLevel || 'moderately_active',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/me', form);
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  const tabs = [{ id: 'profile', label: '👤 Profile' }, { id: 'fitness', label: '🏋️ Fitness Info' }, { id: 'security', label: '🔒 Security' }];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>My Profile</h2>
          <p>Manage your personal information and settings</p>
        </div>
      </div>

      {/* Profile header card */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="avatar avatar-xl" />
          ) : (
            <div className="avatar-placeholder avatar-xl">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          )}
          <button
            className="btn btn-ghost btn-icon btn-sm"
            style={{ position: 'absolute', bottom: 0, right: 0, background: '#1A1F2C', border: '2px solid #0D0F14', borderRadius: '50%', width: '28px', height: '28px', padding: '0' }}
            title="Change avatar"
          >
            <FiCamera size={13} />
          </button>
        </div>
        <div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>{user?.firstName} {user?.lastName}</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>@{user?.username} · {user?.email}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>{user?.subscriptionTier} Plan</span>
            <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            {user?.currentStreak > 0 && <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>🔥 {user.currentStreak} day streak</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: '#12151C', borderRadius: '10px', padding: '4px', border: '1px solid #1F2535', width: 'fit-content' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 20px', border: 'none', cursor: 'pointer', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: tab === t.id ? 700 : 500,
              background: tab === t.id ? '#C8F135' : 'transparent',
              color: tab === t.id ? '#0D0F14' : '#6B7280',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ maxWidth: '560px' }}>
        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([key, label]) => (
                <div key={key} className="input-wrapper">
                  <label className="input-label">{label}</label>
                  <input className="input" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} id={`profile-${key}`} />
                </div>
              ))}
            </div>
            <div className="input-wrapper">
              <label className="input-label">Bio</label>
              <textarea className="input" rows={3} placeholder="Tell us about yourself..." value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </div>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-profile-btn">
              {saving ? <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Saving...</> : <><FiSave size={15} /> Save Changes</>}
            </button>
          </div>
        )}

        {tab === 'fitness' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-wrapper">
                <label className="input-label">Height (cm)</label>
                <input className="input" type="number" placeholder="175" value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))} />
              </div>
              <div className="input-wrapper">
                <label className="input-label">Weight (kg)</label>
                <input className="input" type="number" placeholder="75" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
              </div>
            </div>
            <div className="input-wrapper">
              <label className="input-label">Activity Level</label>
              <select className="input" value={form.activityLevel} onChange={(e) => setForm((f) => ({ ...f, activityLevel: e.target.value }))}>
                {['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'].map((l) => (
                  <option key={l} value={l}>{l.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div className="input-wrapper">
              <label className="input-label">Primary Fitness Goal</label>
              <input className="input" placeholder="e.g., Build muscle, lose 10kg..." value={form.fitnessGoal} onChange={(e) => setForm((f) => ({ ...f, fitnessGoal: e.target.value }))} />
            </div>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-fitness-btn">
              {saving ? <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Saving...</> : <><FiSave size={15} /> Save Changes</>}
            </button>
          </div>
        )}

        {tab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', background: 'rgba(200,241,53,0.06)', border: '1px solid rgba(200,241,53,0.15)', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.85rem', color: '#C8F135', fontWeight: 600, marginBottom: '4px' }}>🔒 Change Password</p>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>Use the forgot password flow to reset your password securely via email OTP.</p>
            </div>
            <div style={{ padding: '14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.85rem', color: '#EF4444', fontWeight: 600, marginBottom: '4px' }}>⚠️ Delete Account</p>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '10px' }}>Permanently delete your account and all data. This action cannot be undone.</p>
              <button className="btn btn-danger btn-sm" id="delete-account-btn"><FiTrash2 size={13} /> Delete Account</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;

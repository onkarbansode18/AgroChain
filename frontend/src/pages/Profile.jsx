import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';

export default function Profile() {
  const { user, loginUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    farmName: user?.farmName || '',
    farmLocation: user?.farmLocation || '',
    businessName: user?.businessName || '',
    address: {
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const handleProfile = async e => {
    e.preventDefault(); setLoading(true); setMsg(null);
    try {
      await updateProfile(form);
      loginUser(sessionStorage.getItem('agrochain_token'), { ...user, ...form });
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    }
    setLoading(false);
  };

  const handlePassword = async e => {
    e.preventDefault(); setMsg(null);
    if (pwForm.newPassword !== pwForm.confirm) { setMsg({ type: 'error', text: 'Passwords do not match' }); return; }
    setLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info' },
    { id: 'security', label: 'Security' },
    { id: 'blockchain', label: 'Blockchain' },
  ];

  return (
    <div className="page-container animate-fade">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '28px',
        background: '#ffffff',
        padding: '4px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        width: 'fit-content',
        boxShadow: 'var(--shadow)',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setMsg(null); }}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '5px',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'var(--transition)',
              background: tab === t.id ? 'var(--primary)' : 'transparent',
              color: tab === t.id ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={msg.type === 'success' ? 'alert alert-success' : 'alert alert-error'} style={{ maxWidth: '600px' }}>
          {msg.text}
        </div>
      )}

      {/* ─── Profile Tab ─── */}
      {tab === 'profile' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: '800', color: 'white', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>{user?.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{user?.email}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className={`badge ${user?.isEmailVerified ? 'badge-green' : 'badge-red'}`}>
                  {user?.isEmailVerified ? '✓ Verified' : '✗ Unverified'}
                </span>
                <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfile}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXXXXXXX" />
              </div>
            </div>

            {user?.role === 'farmer' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Farm Name</label>
                  <input className="form-input" value={form.farmName} onChange={e => setForm({ ...form, farmName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Farm Location</label>
                  <input className="form-input" value={form.farmLocation} onChange={e => setForm({ ...form, farmLocation: e.target.value })} />
                </div>
              </div>
            )}

            {(user?.role === 'distributor' || user?.role === 'retailer') && (
              <div className="form-group">
                <label>Business Name</label>
                <input className="form-input" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input className="form-input" value={form.address.city} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input className="form-input" value={form.address.state} onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ─── Security Tab ─── */}
      {tab === 'security' && (
        <div className="card" style={{ maxWidth: '480px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>Change Password</h3>
          <form onSubmit={handlePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input className="form-input" type="password" required value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input className="form-input" type="password" required minLength={6} placeholder="Min. 6 characters" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input className="form-input" type="password" required value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* ─── Blockchain Tab ─── */}
      {tab === 'blockchain' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>Blockchain Identity</h3>
          <div style={{ display: 'grid', gap: '20px' }}>
            {[
              {
                label: 'Blockchain Address',
                value: (
                  <code style={{
                    display: 'block', fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem',
                    color: 'var(--primary-dark)', wordBreak: 'break-all', padding: '12px 14px',
                    background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    marginTop: '6px',
                  }}>
                    {user?.blockchainAddress || 'Not assigned'}
                  </code>
                )
              },
              { label: 'Account Created', value: user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A' },
              { label: 'Last Login', value: user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A' },
            ].map((row, i) => (
              <div key={i}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
                  {row.label}
                </span>
                {typeof row.value === 'string'
                  ? <div style={{ marginTop: '6px', fontWeight: '500', color: 'var(--text-primary)' }}>{row.value}</div>
                  : row.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

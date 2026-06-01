import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';
import './Auth.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-wrap animate-fade">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-icon">🌾</span>
            <span className="auth-logo-text">AgroChain</span>
          </Link>
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: '#e2fbe8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 20px' }}>
              ✅
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '10px', letterSpacing: '-0.02em' }}>Password reset!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Your password has been updated. Redirecting you to sign in…
            </p>
            <Link to="/login" className="btn btn-primary btn-full">Go to Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-wrap animate-fade">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">🌾</span>
          <span className="auth-logo-text">AgroChain</span>
        </Link>
        <div className="card" style={{ padding: '36px' }}>
          <div className="auth-header">
            <h1>Reset your password</h1>
            <p>Choose a new secure password for your account</p>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="rp-password">New Password</label>
              <div className="input-password-wrap">
                <input
                  id="rp-password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="input-eye-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="rp-confirm">Confirm New Password</label>
              <input
                id="rp-confirm"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="auth-footer" style={{ marginTop: '24px' }}>
            <Link to="/login">← Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devResetUrl, setDevResetUrl] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await forgotPassword(email);
      setSent(true);
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-wrap animate-fade">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-icon">🌾</span>
            <span className="auth-logo-text">AgroChain</span>
          </Link>
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: '#e2fbe8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 20px' }}>
              📬
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Check your inbox</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
              If <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> is registered, we've sent a reset link valid for 30 minutes.
            </p>

            {devResetUrl && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: '20px', textAlign: 'left' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>⚠️ Dev Mode — Reset Link</p>
                <a href={devResetUrl} className="btn btn-primary btn-full" style={{ justifyContent: 'center' }}>
                  Reset Password →
                </a>
              </div>
            )}

            <Link to="/login" className="btn btn-secondary btn-full">← Back to Sign In</Link>
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
            <h1>Forgot your password?</h1>
            <p>Enter your email and we'll send you a reset link</p>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fp-email">Email address</label>
              <input
                id="fp-email"
                className="form-input"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
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

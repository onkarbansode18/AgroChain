import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.token, data.user);
      if (!data.user.isEmailVerified) {
        navigate('/verify-email');
      } else {
        navigate(data.user.role === 'consumer' ? '/consumer' : `/${data.user.role}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap animate-fade">

        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">🌾</span>
          <span className="auth-logo-text">AgroChain</span>
        </Link>

        <div className="card" style={{ padding: '36px' }}>
          <div className="auth-header">
            <h1>Welcome back</h1>
            <p>Sign in to your AgroChain account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="password" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem' }}>Forgot password?</Link>
              </div>
              <div className="input-password-wrap">
                <input
                  id="password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: '24px' }}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Demo Accounts — password: <code style={{ color: 'var(--primary)', background: 'none', padding: 0 }}>password123</code>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['admin@agrochain.com', 'farmer@agrochain.com', 'distributor@agrochain.com', 'retailer@agrochain.com'].map(email => (
                <button
                  key={email}
                  type="button"
                  onClick={() => setForm({ email, password: 'password123' })}
                  style={{
                    padding: '4px 10px',
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    fontFamily: 'inherit',
                    transition: 'var(--transition)',
                  }}
                >
                  {email.split('@')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

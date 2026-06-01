import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Auth.css';

const ROLES = [
  { value: 'consumer', icon: '🛒', label: 'Consumer' },
  { value: 'farmer', icon: '🌾', label: 'Farmer' },
  { value: 'distributor', icon: '🏭', label: 'Distributor' },
  { value: 'retailer', icon: '🏪', label: 'Retailer' },
];

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'consumer' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`reg-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`reg-otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = e => {
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(''));
      e.preventDefault();
    }
  };

  const handleSendOTP = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/send-otp', { email: form.email, name: form.name });
      setSuccess('OTP sent! Check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async e => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { setError('Please enter the complete 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', { ...form, otp: otpString });
      loginUser(data.token, data.user);
      navigate(data.user.role === 'consumer' ? '/consumer' : `/${data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap animate-fade">

        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">🌾</span>
          <span className="auth-logo-text">AgroChain</span>
        </Link>

        <div className="card" style={{ padding: '36px' }}>

          {/* Step Indicator */}
          <div className="step-indicator" style={{ marginBottom: '28px' }}>
            <div className={`step-dot ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
              <div className="step-dot-num">{step > 1 ? '✓' : '1'}</div>
              <span className="step-dot-label">Your Details</span>
            </div>
            <div className="step-line" />
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>
              <div className="step-dot-num">2</div>
              <span className="step-dot-label">Verify Email</span>
            </div>
          </div>

          <div className="auth-header">
            <h1>{step === 1 ? 'Create your account' : 'Verify your email'}</h1>
            <p>
              {step === 1
                ? 'Join AgroChain to get started'
                : <>OTP sent to <strong>{form.email}</strong></>
              }
            </p>
          </div>

          {success && <div className="auth-success">{success}</div>}
          {error && <div className="auth-error">{error}</div>}

          {/* ─── Step 1: Details ─── */}
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <input id="reg-name" name="name" className="form-input" placeholder="Onkar Bansode" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-email">Email</label>
                  <input id="reg-email" name="email" type="email" className="form-input" placeholder="you@email.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-password-wrap">
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min. 6 characters"
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="input-eye-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label>I am a...</label>
                <div className="role-grid">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      className={`role-option ${form.role === r.value ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    >
                      <span className="role-option-icon">{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Continue →'}
              </button>

              <p className="auth-footer" style={{ marginTop: '20px' }}>
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </form>
          )}

          {/* ─── Step 2: OTP ─── */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister}>
              <div className="otp-group">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`reg-otp-${i}`}
                    className={`otp-input${digit ? ' filled' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                  />
                ))}
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginBottom: '12px' }}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-full"
                onClick={() => { setStep(1); setError(''); setSuccess(''); setOtp(['','','','','','']); }}
              >
                ← Change Email
              </button>

              <p className="auth-footer" style={{ marginTop: '20px' }}>
                Didn't receive the OTP? Check your spam folder or{' '}
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit', fontSize: '0.875rem', padding: 0 }}
                  onClick={handleSendOTP}>
                  resend
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

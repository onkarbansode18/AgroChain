import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyEmail, resendOTP } from '../services/api';
import './Auth.css';

export default function VerifyEmail() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialDevOtp = location.state?.devOtp || sessionStorage.getItem('agrochain_dev_otp') || null;
  if (location.state?.devOtp) sessionStorage.setItem('agrochain_dev_otp', location.state.devOtp);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtp, setDevOtpState] = useState(initialDevOtp);

  const setDevOtp = val => {
    val ? sessionStorage.setItem('agrochain_dev_otp', val) : sessionStorage.removeItem('agrochain_dev_otp');
    setDevOtpState(val);
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handlePaste = e => {
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) { setOtp(pasted.split('')); e.preventDefault(); }
  };

  const handleVerify = async e => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { setError('Please enter the complete 6-digit OTP'); return; }
    setError(''); setLoading(true);
    try {
      await verifyEmail(otpString);
      setSuccess('Email verified successfully!');
      sessionStorage.removeItem('agrochain_dev_otp');
      const updatedUser = { ...user, isEmailVerified: true };
      loginUser(localStorage.getItem('agrochain_token'), updatedUser);
      setTimeout(() => navigate(user?.role === 'consumer' ? '/consumer' : `/${user?.role}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const { data } = await resendOTP();
      if (data.devOtp) {
        setDevOtp(data.devOtp);
        setSuccess(`New OTP generated (Dev: ${data.devOtp})`);
      } else {
        setSuccess('New OTP sent to your email!');
      }
      setError('');
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap animate-fade">

        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">🌾</span>
          <span className="auth-logo-text">AgroChain</span>
        </Link>

        <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: '#e2fbe8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 20px' }}>
            📧
          </div>

          <div className="auth-header" style={{ textAlign: 'center' }}>
            <h1>Check your email</h1>
            <p>Enter the 6-digit OTP sent to <strong style={{ color: 'var(--primary)' }}>{user?.email}</strong></p>
          </div>

          {/* Dev mode panel */}
          {devOtp && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: '20px', textAlign: 'left' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>⚠️ Dev Mode — Email Preview</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Your OTP (shown because email is in test mode):</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                <code style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '10px', color: 'var(--primary)', background: 'var(--bg-primary)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  {devOtp}
                </code>
                <button onClick={() => setOtp(devOtp.split(''))} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '600' }}>
                  Auto-fill
                </button>
              </div>
            </div>
          )}

          {error && <div className="auth-error" style={{ textAlign: 'left' }}>{error}</div>}
          {success && <div className="auth-success" style={{ textAlign: 'left' }}>{success}</div>}

          <form onSubmit={handleVerify}>
            <div className="otp-group">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  className={`otp-input${digit ? ' filled' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                />
              ))}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>
              Didn't receive the email?
            </p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                cursor: resendCooldown > 0 ? 'default' : 'pointer',
                fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: '600'
              }}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

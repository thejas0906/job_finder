import React, { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

/* ─── step constants ────────────────────────────────────────────────────────── */
const STEP_EMAIL   = 1;   // enter email → send OTP
const STEP_OTP     = 2;   // enter 6-digit OTP
const STEP_RESET   = 3;   // enter new password + confirm
const STEP_SUCCESS = 4;   // success screen

const API = 'http://localhost:5000/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(STEP_EMAIL);
  const [email, setEmail]     = useState('');
  const [otp, setOtp]         = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');

  /* ── helpers ─────────────────────────────────────────────────────────────── */
  const post = async (endpoint, body) => {
    const res  = await fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
  };

  /* ── Step 1: send OTP ────────────────────────────────────────────────────── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!email) return setError('Please enter your email.');
    setLoading(true);
    try {
      await post('/forgot-password', { email });
      setInfo('OTP sent! Check your inbox.');
      setStep(STEP_OTP);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: verify OTP ──────────────────────────────────────────────────── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (otp.length !== 6) return setError('Enter the 6-digit OTP.');
    setLoading(true);
    try {
      await post('/verify-otp', { email, otp });
      setStep(STEP_RESET);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 3: reset password ──────────────────────────────────────────────── */
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass.length < 6) return setError('Password must be at least 6 characters.');
    if (newPass !== confirmPass) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await post('/reset-password', { email, newPassword: newPass });
      setStep(STEP_SUCCESS);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── step indicator ──────────────────────────────────────────────────────── */
  const stepLabels = ['Email', 'OTP', 'New Password'];
  const stepBar = step < STEP_SUCCESS && (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '32px' }}>
      {stepLabels.map((label, i) => {
        const idx   = i + 1;
        const done  = step > idx;
        const active = step === idx;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '0.9rem',
                background: done ? '#22c55e' : active ? 'var(--primary-blue)' : '#e2e8f0',
                color: (done || active) ? 'white' : '#94a3b8',
                transition: 'all 0.3s',
              }}>
                {done ? '✓' : idx}
              </div>
              <span style={{ fontSize: '0.75rem', color: active ? 'var(--primary-blue)' : '#94a3b8', fontWeight: active ? '600' : '400' }}>
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: step > idx ? '#22c55e' : '#e2e8f0', margin: '0 8px 22px', transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ── shared feedback ─────────────────────────────────────────────────────── */
  const feedback = (
    <>
      {error && <div style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
      {info  && <div style={{ color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.9rem' }}>{info}</div>}
    </>
  );

  /* ── render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="login-page">
      <Header />
      <main className="auth-container">
        <div className="auth-form">
          {/* ── Success screen ─────────────────────────────────────────────── */}
          {step === STEP_SUCCESS && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <h2 style={{ marginBottom: '8px' }}>Password Changed!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
                Your password has been updated successfully.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
            </div>
          )}

          {/* ── Step 1: Email ───────────────────────────────────────────────── */}
          {step === STEP_EMAIL && (
            <form onSubmit={handleSendOtp}>
              <h2 style={{ marginBottom: '8px' }}>Forgot Password</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.95rem' }}>
                Enter your registered email and we'll send you a 6-digit OTP.
              </p>
              {stepBar}
              {feedback}
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                <span
                  style={{ color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: '500' }}
                  onClick={() => navigate('/login')}
                >
                  ← Back to Login
                </span>
              </div>
            </form>
          )}

          {/* ── Step 2: OTP ─────────────────────────────────────────────────── */}
          {step === STEP_OTP && (
            <form onSubmit={handleVerifyOtp}>
              <h2 style={{ marginBottom: '8px' }}>Enter OTP</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.95rem' }}>
                We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
              </p>
              {stepBar}
              {feedback}
              <div className="form-group">
                <label>6-Digit OTP</label>
                <input
                  type="text"
                  placeholder="_ _ _ _ _ _"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ letterSpacing: '10px', fontSize: '1.5rem', textAlign: 'center', fontWeight: '700' }}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Didn't receive it?{' '}
                <span
                  style={{ color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: '500' }}
                  onClick={() => { setStep(STEP_EMAIL); setError(''); setInfo(''); setOtp(''); }}
                >
                  Resend OTP
                </span>
              </div>
            </form>
          )}

          {/* ── Step 3: New Password ─────────────────────────────────────────── */}
          {step === STEP_RESET && (
            <form onSubmit={handleReset}>
              <h2 style={{ marginBottom: '8px' }}>Set New Password</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.95rem' }}>
                Choose a strong new password for your account.
              </p>
              {stepBar}
              {feedback}
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  required
                />
                {confirmPass && newPass !== confirmPass && (
                  <small style={{ color: '#ef4444', marginTop: '4px', display: 'block' }}>Passwords do not match</small>
                )}
                {confirmPass && newPass === confirmPass && (
                  <small style={{ color: '#16a34a', marginTop: '4px', display: 'block' }}>✓ Passwords match</small>
                )}
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '20px' }} disabled={loading}>
                {loading ? 'Changing Password…' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;

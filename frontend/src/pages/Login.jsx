import React, { useState } from 'react';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [role, setRole] = useState('seeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('All fields are required.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        // ── Store all three items the app needs ──────────────────────────────
        localStorage.setItem('token',    data.token);    // ← was missing before
        localStorage.setItem('userId',   data.userId);
        localStorage.setItem('userRole', data.role);
        window.location.href = `/dashboard/${data.role}`;
      } else {
        setError(data.error || data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error, make sure backend is running.');
    }
  };

  return (
    <div className="login-page">
      <Header />
      <main className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Login to Hirely</h2>

          <div className="role-selector" style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', padding: '8px', borderRadius: '8px' }}>
            <button type="button" onClick={() => setRole('seeker')} style={{ flex: 1, padding: '8px', borderRadius: '6px', background: role === 'seeker' ? 'var(--primary-blue)' : 'transparent', color: role === 'seeker' ? 'white' : 'var(--text-dark)', fontWeight: '500' }}>Job Seeker</button>
            <button type="button" onClick={() => setRole('recruiter')} style={{ flex: 1, padding: '8px', borderRadius: '6px', background: role === 'recruiter' ? 'var(--primary-blue)' : 'transparent', color: role === 'recruiter' ? 'white' : 'var(--text-dark)', fontWeight: '500' }}>Recruiter</button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: '500', textDecoration: 'none' }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary">
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary-blue)', fontWeight: '500' }}>Register here</Link>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Login;

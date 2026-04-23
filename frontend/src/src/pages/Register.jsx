import React, { useState } from 'react';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [role, setRole] = useState('seeker');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', age: '', degree: '', 
    experience: '', expectedSalary: '', companyName: '', location: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userRole', data.role);
        navigate(`/dashboard/${role}`);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error, ensure backend is running.');
    }
  };

  return (
    <div className="register-page">
      <Header />
      <main className="auth-container register-container" style={{ maxWidth: '800px' }}>
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Register for Hirely</h2>

          <div className="role-selector" style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', padding: '8px', borderRadius: '8px'}}>
            <button type="button" onClick={() => setRole('seeker')} style={{ flex: 1, padding: '8px', borderRadius: '6px', background: role === 'seeker' ? 'var(--primary-blue)' : 'transparent', color: role === 'seeker' ? 'white' : 'var(--text-dark)', fontWeight: '500' }}>Job Seeker</button>
            <button type="button" onClick={() => setRole('recruiter')} style={{ flex: 1, padding: '8px', borderRadius: '6px', background: role === 'recruiter' ? 'var(--primary-blue)' : 'transparent', color: role === 'recruiter' ? 'white' : 'var(--text-dark)', fontWeight: '500' }}>Recruiter / Employer</button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create Password" required />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Mobile Number" required />
            </div>

            {role === 'seeker' && (
              <>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Your Age" />
                </div>
                <div className="form-group">
                  <label>Highest Degree</label>
                  <input type="text" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g. B.Tech / MCA" />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input type="number" name="experience" value={formData.experience} onChange={handleChange} placeholder="Years of experience" />
                </div>
                <div className="form-group">
                  <label>Expected Salary (LPA)</label>
                  <input type="number" name="expectedSalary" value={formData.expectedSalary} onChange={handleChange} placeholder="e.g. 15" />
                </div>
              </>
            )}

            {(role === 'recruiter' || role === 'admin') && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Company / Organization Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Where do you work?" />
              </div>
            )}

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City or Region" />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '24px' }}>
            Register as {role === 'seeker' ? 'Job Seeker' : role === 'recruiter' ? 'Recruiter' : 'Admin'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: '500'}}>Login here</Link>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Register;

import React, { useState } from 'react';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [role, setRole] = useState('seeker');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name:           '',
    email:          '',
    password:       '',
    phone:          '',
    age:            '',
    degree:         '',
    experience:     '',
    expectedSalary: '',   // ← camelCase matches backend destructuring
    skills:         '',   // ← top skills
    companyName:    '',   // ← camelCase matches backend destructuring
    location:       '',
    workMode:       'On-site', // default value
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => setResumeFile(e.target.files[0] || null);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use FormData so we can send the PDF file
      const body = new FormData();
      Object.entries({ ...formData, role }).forEach(([k, v]) => body.append(k, v));
      if (resumeFile) body.append('resume', resumeFile);

      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        // Do NOT set Content-Type header — browser sets it with boundary for multipart
        body,
      });
      const data = await response.json();
      if (response.ok) {
        // ── Store all three items the app needs ──────────────────────────────
        localStorage.setItem('token',    data.token);    // ← was missing before
        localStorage.setItem('userId',   data.userId);
        localStorage.setItem('userRole', data.role);
        window.location.href = `/dashboard/${role}`;
      } else {
        setError(data.error || data.message || 'Registration failed');
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

          <div className="role-selector" style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', padding: '8px', borderRadius: '8px' }}>
            <button type="button" onClick={() => setRole('seeker')} style={{ flex: 1, padding: '8px', borderRadius: '6px', background: role === 'seeker' ? 'var(--primary-blue)' : 'transparent', color: role === 'seeker' ? 'white' : 'var(--text-dark)', fontWeight: '500' }}>Job Seeker</button>
            <button type="button" onClick={() => setRole('recruiter')} style={{ flex: 1, padding: '8px', borderRadius: '6px', background: role === 'recruiter' ? 'var(--primary-blue)' : 'transparent', color: role === 'recruiter' ? 'white' : 'var(--text-dark)', fontWeight: '500' }}>Recruiter / Employer</button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Full Name</label>
              {/* name="name" → backend reads req.body.name */}
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>

            {role === 'seeker' && (
              <>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Highest Degree</label>
                  <input type="text" name="degree" value={formData.degree} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input type="number" name="experience" value={formData.experience} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Expected Salary (LPA)</label>
                  {/* name="expectedSalary" → backend reads req.body.expectedSalary */}
                  <input type="number" name="expectedSalary" value={formData.expectedSalary} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Top Skills</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Preferred Work Mode</label>
                  <select name="workMode" value={formData.workMode} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Upload Resume (PDF)</label>
                  <input
                    id="resumeInput"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('resumeInput').click()}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: resumeFile ? '1.5px solid #22c55e' : '1.5px solid #cbd5e1',
                      background: resumeFile ? '#f0fdf4' : '#f8fafc',
                      color: resumeFile ? '#16a34a' : '#64748b',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {resumeFile ? `✓ Resume uploaded` : 'Choose File'}
                  </button>
                </div>
              </>
            )}

            {role === 'recruiter' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Company / Organization Name</label>
                {/* name="companyName" → backend reads req.body.companyName */}
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} />
              </div>
            )}

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '24px' }}>
            Register as {role === 'seeker' ? 'Job Seeker' : 'Recruiter'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: '500' }}>Login here</Link>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Register;

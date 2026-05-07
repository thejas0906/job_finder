import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import { FiEdit, FiBookmark, FiFileText } from 'react-icons/fi';
import { JobContext } from '../context/JobContext';
import { Link } from 'react-router-dom';

function JobSeekerDashboard() {
  const { jobs, appliedJobs, currentUser } = useContext(JobContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [resumeFile, setResumeFile] = useState(null);           // newly picked file
  const [hasExistingResume, setHasExistingResume] = useState(false); // from DB

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    skills: '',
    experience: '',
    isEditing: false
  });

  // Fetch real seeker profile (including resume) from backend on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5000/api/seekers/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        setProfile(prev => ({
          ...prev,
          name:       data.name       || '',
          email:      data.email      || '',
          skills:     data.field      || '',
          experience: data.experience ? `${data.experience} Years` : '',
        }));
        // If a resume filename already exists in DB, mark as uploaded
        if (data.resume) setHasExistingResume(true);
      })
      .catch(console.error);
  }, []);

  const handleFileChange = (e) => setResumeFile(e.target.files[0] || null);

  // True when seeker already has a DB resume OR just picked a new file
  const resumeReady = !!resumeFile || hasExistingResume;

  const appliedJobsList = jobs.filter(job => appliedJobs.includes(job.id));

  return (
    <div className="dashboard-page">
      <Header />
      <div className="main-content" style={{ display: 'flex', gap: '32px', maxWidth: '1200px', margin: '32px auto', padding: '0 32px' }}>
        
        {/* Sidebar Nav */}
        <aside style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Seeker Dashboard</h2>
          <button style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'profile' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'profile' ? 'var(--primary-blue)' : 'var(--text-dark)', fontWeight: '600' }} onClick={() => setActiveTab('profile')}>My Profile</button>
          <button style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'applied' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'applied' ? 'var(--primary-blue)' : 'var(--text-dark)', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }} onClick={() => setActiveTab('applied')}>
            Applied Jobs
            {appliedJobsList.length > 0 && <span style={{ background: 'var(--primary-orange)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{appliedJobsList.length}</span>}
          </button>
          <button style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'saved' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'saved' ? 'var(--primary-blue)' : 'var(--text-dark)', fontWeight: '600' }} onClick={() => setActiveTab('saved')}>Saved Jobs</button>
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: 'var(--shadow-md)' }}>
          {activeTab === 'profile' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.5rem' }}>Profile Management</h3>
                <button className="btn-outline" onClick={() => setProfile({...profile, isEditing: !profile.isEditing})}>
                  <FiEdit style={{ marginRight: '8px' }} /> {profile.isEditing ? 'Save Details' : 'Edit Profile'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={profile.name} placeholder="Name" disabled={!profile.isEditing} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email ID</label>
                  <input type="email" value={profile.email} placeholder="Your Mail" disabled={!profile.isEditing} onChange={e => setProfile({...profile, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Top Skills</label>
                  <input type="text" value={profile.skills} disabled={!profile.isEditing} onChange={e => setProfile({...profile, skills: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Update Resume (PDF)</label>
                  <input
                    id="dashResumeInput"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={!profile.isEditing}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    disabled={!profile.isEditing}
                    onClick={() => document.getElementById('dashResumeInput').click()}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: resumeReady ? '1.5px solid #22c55e' : '1.5px solid #cbd5e1',
                      background: resumeReady ? '#f0fdf4' : '#f8fafc',
                      color: resumeReady ? '#16a34a' : '#64748b',
                      fontWeight: '500',
                      cursor: profile.isEditing ? 'pointer' : 'not-allowed',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s',
                      opacity: profile.isEditing ? 1 : 0.6,
                    }}
                  >
                    {resumeReady ? '✓ Resume uploaded' : 'Choose File'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applied' && (
            <div>
              <h3 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Your Applications</h3>
              {appliedJobsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <p>You haven't applied to any jobs yet.</p>
                  <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>Browse Jobs</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {appliedJobsList.map(job => (
                    <div key={job.id} style={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '12px', padding: '20px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Link to={`/job/${job.id}`}><h4 style={{ fontSize: '1.15rem', color: 'var(--primary-blue)', marginBottom: '4px' }}>{job.title}</h4></Link>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{job.company} • Applied recently</p>
                      </div>
                      <div style={{ padding: '6px 16px', borderRadius: '20px', background: '#dcfce7', color: '#166534', fontSize: '0.9rem', fontWeight: '600' }}>In Review</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              <h3 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Saved Jobs</h3>
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                 <p>No jobs saved yet.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default JobSeekerDashboard;

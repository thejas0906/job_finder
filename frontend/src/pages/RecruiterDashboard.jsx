import React, { useState, useContext, useEffect } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { JobContext } from '../context/JobContext';

// ── auth helper ───────────────────────────────────────────────────────────────
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

function RecruiterDashboard() {
  const { addJob } = useContext(JobContext);
  const [activeTab, setActiveTab] = useState('postings');

  // ── local state for this dashboard ─────────────────────────────────────────
  const [myJobs,      setMyJobs]      = useState([]);
  const [applicants,  setApplicants]  = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // ── fetch recruiter's own jobs ──────────────────────────────────────────────
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/recruiters/me/jobs', {
          headers: authHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setMyJobs(data);
        }
      } catch (e) {
        console.error('Failed to load jobs', e);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchMyJobs();
  }, []);

  // ── fetch applicants when tab is opened ────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'applicants' || myJobs.length === 0) return;

    const fetchApplicants = async () => {
      try {
        // Load applicants for the first job as a demo; in production
        // you'd let the recruiter pick which job to view
        const res = await fetch(
          `http://localhost:5000/api/jobs/${myJobs[0].id}/applications`,
          { headers: authHeaders() }
        );
        if (res.ok) setApplicants(await res.json());
      } catch (e) {
        console.error('Failed to load applicants', e);
      }
    };
    fetchApplicants();
  }, [activeTab, myJobs]);

  // ── post a new job ──────────────────────────────────────────────────────────
  const handlePostJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const newJobPayload = {
      title:       formData.get('title'),
      location:    formData.get('location'),
      salary:      formData.get('salary'),
      description: formData.get('description'),
    };

    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify(newJobPayload),
      });

      if (res.ok) {
        const saved = await res.json();
        const newJobLocal = {
          id:         saved.jobId,
          title:      newJobPayload.title,
          location:   newJobPayload.location,
          salary_lpa: newJobPayload.salary,
          description:newJobPayload.description,
          applicants: 0,
          status:     'Active',
          tags:       [],
        };
        setMyJobs(prev => [newJobLocal, ...prev]);
        e.target.reset();
        setActiveTab('postings');
      }
    } catch (err) {
      console.error('Failed to post job', err);
    }
  };

  // ── delete a job ────────────────────────────────────────────────────────────
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method:  'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) {
        setMyJobs(prev => prev.filter(j => j.id !== jobId));
      }
    } catch (err) {
      console.error('Failed to delete job', err);
    }
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="main-content" style={{ display: 'flex', gap: '32px', maxWidth: '1200px', margin: '32px auto', padding: '0 32px' }}>

        <aside style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Recruiter Panel</h2>
          {['postings', 'applicants', 'new'].map(tab => (
            <button key={tab}
              style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === tab ? 'rgba(99,102,241,0.1)' : 'transparent', color: activeTab === tab ? 'var(--primary-blue)' : 'var(--text-dark)', fontWeight: '600' }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'postings' ? 'My Job Postings' : tab === 'applicants' ? 'Manage Applicants' : 'Post a New Job'}
            </button>
          ))}
        </aside>

        <main style={{ flex: 1, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)', boxShadow: 'var(--shadow-md)' }}>

          {/* ── MY JOB POSTINGS ── */}
          {activeTab === 'postings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.5rem' }}>Active Job Postings</h3>
                <button className="btn-primary" onClick={() => setActiveTab('new')}>
                  <FiPlus style={{ marginRight: '8px' }} /> Post Job
                </button>
              </div>
              {loadingJobs ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(226,232,240,0.8)' }}>
                        {['Job Title', 'Applicants', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myJobs.map(job => (
                        <tr key={job.id} style={{ borderBottom: '1px solid rgba(226,232,240,0.4)' }}>
                          <td style={{ padding: '16px 12px', fontWeight: '600', color: 'var(--primary-blue)' }}>{job.title}</td>
                          <td style={{ padding: '16px 12px' }}>{job.applicants || 0}</td>
                          <td style={{ padding: '16px 12px' }}>
                            <span style={{ padding: '4px 12px', borderRadius: '12px', background: '#dcfce7', color: '#166534', fontSize: '0.85rem', fontWeight: '600' }}>
                              {job.status || 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 12px', display: 'flex', gap: '16px' }}>
                            <button style={{ color: 'var(--primary-blue)', cursor: 'pointer', fontSize: '1.2rem' }} title="Edit"><FiEdit2 /></button>
                            <button style={{ color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }} title="Delete" onClick={() => handleDeleteJob(job.id)}><FiTrash2 /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── MANAGE APPLICANTS ── */}
          {activeTab === 'applicants' && (
            <div>
              <h3 style={{ marginBottom: '32px', fontSize: '1.5rem' }}>Applicant Tracking</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(226,232,240,0.8)' }}>
                    {['Applicant Name', 'Applied For', 'Experience', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applicants.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid rgba(226,232,240,0.4)' }}>
                      <td style={{ padding: '16px 12px', fontWeight: '600' }}>{app.name}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--primary-blue)' }}>{app.job}</td>
                      <td style={{ padding: '16px 12px' }}>{app.experience}</td>
                      <td style={{ padding: '16px 12px' }}>
                        {/* Pass seekerId in URL so ApplicationDetails can load it */}
                        <Link to={`/application/${app.id}`}>
                          <button className="btn-outline" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>
                            Review Application
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── POST NEW JOB ── */}
          {activeTab === 'new' && (
            <div>
              <h3 style={{ marginBottom: '32px', fontSize: '1.5rem' }}>Post a New Job</h3>
              <form onSubmit={handlePostJob}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Job Title</label>
                    <input type="text" name="title" placeholder="e.g. Lead Developer" required />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input type="text" name="location" placeholder="e.g. Bangalore / Remote" required />
                  </div>
                  <div className="form-group">
                    <label>Salary (LPA)</label>
                    <input type="text" name="salary" placeholder="e.g. 15" required />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Job Description</label>
                    <textarea name="description" rows="5"
                      style={{ padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', resize: 'vertical', width: '100%' }}
                      placeholder="Detailed job requirements..." required />
                  </div>
                </div>
                <button className="btn-primary" type="submit" style={{ marginTop: '32px', padding: '14px 40px', fontSize: '1.1rem' }}>
                  Publish Job
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default RecruiterDashboard;

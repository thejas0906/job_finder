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
  const { addJob, updateJobContext } = useContext(JobContext);
  const [activeTab, setActiveTab] = useState('postings');

  // ── local state for this dashboard ─────────────────────────────────────────
  const [myJobs,      setMyJobs]      = useState([]);
  const [applicants,  setApplicants]  = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [editingJob, setEditingJob] = useState(null);

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
          if (data.length > 0) setSelectedJobId(data[0].id);
        }
      } catch (e) {
        console.error('Failed to load jobs', e);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchMyJobs();
  }, []);

  // ── fetch applicants when tab is opened or job changes ─────────────────────
  useEffect(() => {
    if (activeTab !== 'applicants' || !selectedJobId) return;

    const fetchApplicants = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/jobs/${selectedJobId}/applications`,
          { headers: authHeaders() }
        );
        if (res.ok) setApplicants(await res.json());
      } catch (e) {
        console.error('Failed to load applicants', e);
      }
    };
    fetchApplicants();
  }, [activeTab, selectedJobId]);

  // ── post or update a job ───────────────────────────────────────────────────
  const handlePostJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const jobPayload = {
      title:       formData.get('title'),
      location:    formData.get('location'),
      salary:      formData.get('salary'),
      description: formData.get('description'),
      experience:  formData.get('experience'),
      skills:      formData.get('skills'),
    };

    try {
      if (editingJob) {
        // UPDATE
        const res = await fetch(`http://localhost:5000/api/jobs/${editingJob.id}`, {
          method:  'PUT',
          headers: authHeaders(),
          body:    JSON.stringify(jobPayload),
        });

        if (res.ok) {
          const updatedJobLocal = {
            ...editingJob,
            title:      jobPayload.title,
            location:   jobPayload.location,
            salary_lpa: jobPayload.salary,
            description:jobPayload.description,
            experience: jobPayload.experience,
            tags:       jobPayload.skills ? jobPayload.skills.split(',').map(s => s.trim()) : [],
          };
          
          setMyJobs(prev => prev.map(j => j.id === editingJob.id ? updatedJobLocal : j));
          
          // Also sync global context so Home page updates
          updateJobContext(editingJob.id, {
            title: jobPayload.title,
            location: jobPayload.location,
            salary: `₹ ${jobPayload.salary} LPA`,
            salary_num: Number(jobPayload.salary) || 0,
            description: jobPayload.description,
            experience: jobPayload.experience,
            tags: jobPayload.skills ? jobPayload.skills.split(',').map(s => s.trim()) : [],
          });

          e.target.reset();
          setEditingJob(null);
          setActiveTab('postings');
        }
      } else {
        // CREATE
        const res = await fetch('http://localhost:5000/api/jobs', {
          method:  'POST',
          headers: authHeaders(),
          body:    JSON.stringify(jobPayload),
        });

        if (res.ok) {
          const saved = await res.json();
          const newJobLocal = {
            id:         saved.jobId,
            title:      jobPayload.title,
            location:   jobPayload.location,
            salary_lpa: jobPayload.salary,
            description:jobPayload.description,
            experience: jobPayload.experience,
            applicants: 0,
            status:     'Active',
            tags:       jobPayload.skills ? jobPayload.skills.split(',').map(s => s.trim()) : [],
          };
          setMyJobs(prev => [newJobLocal, ...prev]);
          addJob(newJobLocal); // Sync with global context
          e.target.reset();
          setActiveTab('postings');
        }
      }
    } catch (err) {
      console.error('Failed to post/update job', err);
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
              onClick={() => {
                if (tab !== 'new') setEditingJob(null);
                setActiveTab(tab);
              }}
            >
              {tab === 'postings' ? 'My Job Postings' : tab === 'applicants' ? 'Manage Applicants' : (editingJob ? 'Edit Job' : 'Post a New Job')}
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
                            <button 
                              style={{ color: 'var(--primary-blue)', cursor: 'pointer', fontSize: '1.2rem', background: 'none', border: 'none' }} 
                              title="Edit"
                              onClick={() => {
                                setEditingJob(job);
                                setActiveTab('new');
                              }}
                            >
                              <FiEdit2 />
                            </button>
                            <button style={{ color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', background: 'none', border: 'none' }} title="Delete" onClick={() => handleDeleteJob(job.id)}>
                              <FiTrash2 />
                            </button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Applicant Tracking</h3>
                {myJobs.length > 0 && (
                  <select 
                    value={selectedJobId} 
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                  >
                    {myJobs.map(job => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                )}
              </div>
              
              {myJobs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You haven't posted any jobs yet.</p>
              ) : applicants.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No applicants for this job yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(226,232,240,0.8)' }}>
                      {['Applicant Name', 'Job Applied', 'Experience', 'Resume', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map(app => (
                      <tr key={app.id} style={{ borderBottom: '1px solid rgba(226,232,240,0.4)' }}>
                        <td style={{ padding: '16px 12px', fontWeight: '600' }}>{app.name}</td>
                        <td style={{ padding: '16px 12px', color: 'var(--primary-blue)' }}>{myJobs.find(j => j.id === selectedJobId)?.title || 'Unknown Job'}</td>
                        <td style={{ padding: '16px 12px' }}>{app.experience} Yrs</td>
                        <td style={{ padding: '16px 12px' }}>
                          {app.resume ? (
                            <a 
                              href={`http://localhost:5000/uploads/resumes/${app.resume}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}
                            >
                              View PDF
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Not provided</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          {/* Pass seekerId in URL so ApplicationDetails can load it */}
                          <Link to={`/application/${app.id}?jobId=${selectedJobId}`}>
                            <button className="btn-outline" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>
                              Review Application
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── POST / EDIT JOB ── */}
          {activeTab === 'new' && (
            <div>
              <h3 style={{ marginBottom: '32px', fontSize: '1.5rem' }}>{editingJob ? 'Edit Job' : 'Post a New Job'}</h3>
              <form onSubmit={handlePostJob}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Job Title</label>
                    <input type="text" name="title" defaultValue={editingJob ? editingJob.title : ''} placeholder="e.g. Lead Developer" required />
                  </div>
                  <div className="form-group">
                    <label>Location / Work Mode</label>
                    <input type="text" name="location" defaultValue={editingJob ? editingJob.location : ''} placeholder="e.g. Bangalore / Remote" required />
                  </div>
                  <div className="form-group">
                    <label>Salary (LPA)</label>
                    <input type="text" name="salary" defaultValue={editingJob ? editingJob.salary_lpa : ''} placeholder="e.g. 15" required />
                  </div>
                  <div className="form-group">
                    <label>Experience Required</label>
                    <select name="experience" defaultValue={editingJob ? editingJob.experience : ''} style={{ padding: '14px', borderRadius: '12px', border: '1.5px solid var(--border-color)', outline: 'none' }} required>
                      <option value="">Select Experience</option>
                      <option value="Entry Level">Entry Level</option>
                      <option value="1-3 Yrs">1-3 Yrs</option>
                      <option value="3-5 Yrs">3-5 Yrs</option>
                      <option value="5-8 Yrs">5-8 Yrs</option>
                      <option value="8+ Yrs">8+ Yrs</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Skills Required</label>
                    <input type="text" name="skills" defaultValue={editingJob ? (editingJob.tags ? editingJob.tags.join(', ') : '') : ''} placeholder="e.g. React, Node.js, SQL" required />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Job Description</label>
                    <textarea name="description" rows="5"
                      defaultValue={editingJob ? editingJob.description : ''}
                      style={{ padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', resize: 'vertical', width: '100%' }}
                      placeholder="Detailed job requirements..." required />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                  {editingJob && (
                    <button type="button" className="btn-outline" style={{ padding: '14px 40px', fontSize: '1.1rem' }} onClick={() => {
                      setEditingJob(null);
                      setActiveTab('postings');
                    }}>
                      Cancel
                    </button>
                  )}
                  <button className="btn-primary" type="submit" style={{ padding: '14px 40px', fontSize: '1.1rem' }}>
                    {editingJob ? 'Update Job' : 'Publish Job'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default RecruiterDashboard;

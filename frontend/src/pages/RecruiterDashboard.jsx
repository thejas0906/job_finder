import React, { useState, useContext } from 'react';
import Header from '../components/Header';
import { FiPlus, FiEdit2, FiTrash2, FiUserCheck, FiUserX, FiEye } from 'react-icons/fi';
import { JobContext } from '../context/JobContext';

function RecruiterDashboard() {
  const { jobs, addJob, currentUser } = useContext(JobContext);
  const [activeTab, setActiveTab] = useState('postings');

  // filter jobs posted by this recruiter (mock using company or assuming all are for demo)
  // in real app, we filter by posted_by === currentUser.id
  const myJobs = jobs; // for demo, show all jobs or slice

  const applicants = [
    { id: 101, name: 'Alice Smith', job: 'Senior Software Engineer', experience: '5 Yrs', status: 'Pending' },
    { id: 102, name: 'Bob Johnson', job: 'Frontend Developer', experience: '2 Yrs', status: 'Pending' },
  ];

  const handlePostJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newJob = {
      title: formData.get('title'),
      location: formData.get('location'),
      salary_lpa: formData.get('salary'),
      description: formData.get('description'),
      company_name: 'TechFlow Corp', // Mock recruiter company
    };
    
    // Convert to the context expected format somewhat
    const newJobContext = {
      title: newJob.title,
      company: newJob.company_name,
      location: newJob.location,
      salary: `₹ ${newJob.salary_lpa} LPA`,
      description: newJob.description,
      tags: [],
      postedAgo: 'Just now',
      applicants: 0,
      status: 'Active'
    };
    
    await addJob(newJobContext);
    setActiveTab('postings');
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="main-content" style={{ display: 'flex', gap: '32px', maxWidth: '1200px', margin: '32px auto', padding: '0 32px' }}>
        
        <aside style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Recruiter Panel</h2>
          <button style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'postings' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'postings' ? 'var(--primary-blue)' : 'var(--text-dark)', fontWeight: '600' }} onClick={() => setActiveTab('postings')}>My Job Postings</button>
          <button style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'applicants' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'applicants' ? 'var(--primary-blue)' : 'var(--text-dark)', fontWeight: '600' }} onClick={() => setActiveTab('applicants')}>Manage Applicants</button>
          <button style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'new' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'new' ? 'var(--primary-blue)' : 'var(--text-dark)', fontWeight: '600' }} onClick={() => setActiveTab('new')}>Post a New Job</button>
        </aside>

        <main style={{ flex: 1, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: 'var(--shadow-md)' }}>
          {activeTab === 'postings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.5rem' }}>Active Job Postings</h3>
                <button className="btn-primary" onClick={() => setActiveTab('new')}><FiPlus style={{ marginRight: '8px' }}/> Post Job</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(226, 232, 240, 0.8)' }}>
                      <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Job Title</th>
                      <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Applicants</th>
                      <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Status</th>
                      <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myJobs.slice(0, 5).map(job => (
                      <tr key={job.id} style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.4)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 12px', fontWeight: '600', color: 'var(--primary-blue)' }}>{job.title}</td>
                        <td style={{ padding: '16px 12px' }}>{job.applicants || 0}</td>
                        <td style={{ padding: '16px 12px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '12px', background: '#dcfce7', color: '#166534', fontSize: '0.85rem', fontWeight: '600' }}>{job.status || 'Active'}</span>
                        </td>
                        <td style={{ padding: '16px 12px', display: 'flex', gap: '16px' }}>
                          <button style={{ color: 'var(--primary-blue)', cursor: 'pointer', fontSize: '1.2rem' }} title="Edit"><FiEdit2 /></button>
                          <button style={{ color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }} title="Delete"><FiTrash2 /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'applicants' && (
            <div>
              <h3 style={{ marginBottom: '32px', fontSize: '1.5rem' }}>Applicant Tracking</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(226, 232, 240, 0.8)' }}>
                    <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Applicant Name</th>
                    <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Applied For</th>
                    <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Experience</th>
                    <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.4)' }}>
                      <td style={{ padding: '16px 12px', fontWeight: '600' }}>{app.name}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--primary-blue)' }}>{app.job}</td>
                      <td style={{ padding: '16px 12px' }}>{app.experience}</td>
                      <td style={{ padding: '16px 12px', display: 'flex', gap: '16px' }}>
                        <Link to={`/application/${app.id}`} style={{ display: 'inline-block' }}>
                           <button className="btn-outline" style={{ padding: '6px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>Review Application</button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
                    <textarea name="description" rows="5" style={{ padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} placeholder="Detailed job requirements..." required></textarea>
                  </div>
                </div>
                <button className="btn-primary" type="submit" style={{ marginTop: '32px', padding: '14px 40px', fontSize: '1.1rem' }}>Publish Job</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default RecruiterDashboard;

import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { JobContext } from '../context/JobContext';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, applyToJob, appliedJobs } = useContext(JobContext);
  const [isApplying, setIsApplying] = useState(false);
  const [applyComplete, setApplyComplete] = useState(false);
  const [error, setError] = useState('');

  const job = jobs.find(j => j.id === parseInt(id));

  // Check if already applied
  useEffect(() => {
    if (appliedJobs.includes(parseInt(id))) {
      setApplyComplete(true);
    }
  }, [appliedJobs, id]);

  if (!job) {
    return (
      <div className="job-details-page">
        <Header />
        <main className="job-details-container" style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2>Job Not Found</h2>
          <button className="btn-primary" onClick={() => navigate('/')}>Go Back Home</button>
        </main>
      </div>
    );
  }

  const handleApplySubmit = (e) => {
    e.preventDefault();
    applyToJob(job.id);
    setApplyComplete(true);
    setIsApplying(false);
  };

  return (
    <div className="job-details-page">
      <Header />
      <main className="job-details-container">
        <div className="job-details-card">
          <div className="job-header">
            <h2>{job.title}</h2>
            <div className="company-info">
              <span className="company-name" style={{ fontWeight: '600' }}>{job.company}</span>
              <span className="rating" style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '0.9rem' }}>★ {job.rating || 'New'}</span>
              <span className="reviews">{job.reviews || 'No reviews'}</span>
            </div>
          </div>
          <div className="job-meta-info" style={{ display: 'flex', gap: '24px', background: 'rgba(241, 245, 249, 0.5)', padding: '20px', borderRadius: '12px', marginBottom: '32px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>💼 <b>{job.experience}</b></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>💰 <b>{job.salary}</b></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📍 <b>{job.location}</b></span>
          </div>
          
          <div className="job-full-description" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Job Description</h3>
            <p style={{ color: 'var(--text-muted)' }}>{job.description}</p>
          </div>

          {job.tags && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Required Skills</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {job.tags.map(skill => (
                  <span key={skill} style={{ padding: '6px 16px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-blue)', borderRadius: '99px', fontSize: '0.95rem', fontWeight: '500' }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          <div className="job-company-details" style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>About the Company</h3>
            <p style={{ color: 'var(--text-muted)' }}>{job.companyDetails || `${job.company} is a leading organization looking for top talent.`}</p>
          </div>

          {!isApplying && !applyComplete && (
            <div className="job-actions">
              <button className="btn-primary" style={{ padding: '14px 40px', fontSize: '1.1rem' }} onClick={() => setIsApplying(true)}>Apply Now</button>
            </div>
          )}

          {isApplying && !applyComplete && (
            <form className="apply-form" style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: 'var(--shadow-md)'}} onSubmit={handleApplySubmit}>
              <h3 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Submit your Application</h3>
              <div className="form-group">
                <label>Upload Resume (PDF format)</label>
                <input type="file" accept=".pdf" required style={{ background: 'white' }} />
              </div>
              <div className="form-group">
                <label>Cover Letter (Optional)</label>
                <textarea rows="4" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} placeholder="Why are you a good fit?"></textarea>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button type="button" className="btn-outline" onClick={() => setIsApplying(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Application</button>
              </div>
            </form>
          )}

          {applyComplete && (
            <div style={{ background: 'rgba(220, 252, 231, 0.8)', color: '#166534', padding: '24px', borderRadius: '16px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '2rem' }}>✅</span>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '4px' }}>Application Submitted Successfully!</strong>
                <span style={{ fontSize: '0.95rem' }}>We have sent a confirmation to your email. You can track this application in your dashboard.</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default JobDetails;

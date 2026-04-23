import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FiCheck, FiX, FiDownload, FiUser, FiBriefcase, FiMail } from 'react-icons/fi';

function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Mock data for the specific application
  const [application, setApplication] = useState({
    id: id,
    name: id === '101' ? 'Alice Smith' : 'Bob Johnson',
    email: id === '101' ? 'alice@example.com' : 'bob@example.com',
    jobTitle: id === '101' ? 'Senior Software Engineer' : 'Frontend Developer',
    experience: id === '101' ? '5 Yrs' : '2 Yrs',
    status: 'Pending',
    coverLetter: "I am very excited to apply for this position. I have been following your company's work for a long time and I believe my skills match completely with what you are looking for.",
    appliedAt: '2 days ago',
    skills: ['React', 'Node.js', 'SQL', 'AWS']
  });

  const handleUpdateStatus = (newStatus) => {
    // In a real app, make an API call to update status here
    setApplication({ ...application, status: newStatus });
    // Simulate API feedback
    setTimeout(() => {
      // navigate back to dashboard after a bit, or stay
      alert(`Application marked as ${newStatus}`);
      navigate('/dashboard/recruiter');
    }, 1000);
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="main-content" style={{ maxWidth: '900px', margin: '40px auto', padding: '0 32px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button className="btn-outline" onClick={() => navigate(-1)}>Back to Dashboard</button>
          <h2 style={{ fontSize: '1.8rem', flex: 1 }}>Review Application</h2>
          {application.status !== 'Pending' && (
             <span style={{ padding: '8px 16px', borderRadius: '12px', background: application.status === 'Accepted' ? '#dcfce7' : '#fee2e2', color: application.status === 'Accepted' ? '#166534' : '#991b1b', fontWeight: '600' }}>
               {application.status}
             </span>
          )}
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: 'var(--shadow-md)' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '32px', marginBottom: '32px', gap: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>
              <FiUser />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-dark)' }}>{application.name}</h3>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '4px' }}><FiBriefcase /> Applied for: <strong style={{ color: 'var(--primary-blue)'}}>{application.jobTitle}</strong></p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}><FiMail /> {application.email}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-dark)' }}>Candidate Info</h4>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <p style={{ marginBottom: '12px' }}><strong>Experience:</strong> {application.experience}</p>
                <p style={{ marginBottom: '12px' }}><strong>Applied Date:</strong> {application.appliedAt}</p>
                <div>
                  <strong style={{ display: 'block', marginBottom: '8px' }}>Top Skills:</strong>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {application.skills.map(s => <span key={s} style={{ background: 'var(--white)', padding: '4px 12px', borderRadius: '99px', border: '1px solid rgba(226, 232, 240, 0.8)', fontSize: '0.9rem' }}>{s}</span>)}
                  </div>
                </div>
              </div>
            </div>

            <div>
               <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-dark)' }}>Documents</h4>
               <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <FiFileText style={{ fontSize: '3rem', color: 'var(--primary-blue)', marginBottom: '16px' }} />
                  <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiDownload /> Download Resume</button>
               </div>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-dark)' }}>Cover Letter</h4>
            <div style={{ padding: '24px', background: 'rgba(241, 245, 249, 0.5)', borderRadius: '12px', fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: '1.8' }}>
              "{application.coverLetter}"
            </div>
          </div>

          {application.status === 'Pending' && (
            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '32px' }}>
              <button 
                onClick={() => handleUpdateStatus('Accepted')}
                style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#16a34a', color: 'white', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'transform 0.2s', border: 'none' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FiCheck style={{ fontSize: '1.4rem' }} /> Accept Candidate
              </button>
              
              <button 
                onClick={() => handleUpdateStatus('Rejected')}
                style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#ef4444', color: 'white', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'transform 0.2s', border: 'none' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FiX style={{ fontSize: '1.4rem' }} /> Reject
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Add FIFileText icon since it wasn't imported initially from react-icons/fi
import { FiFileText } from 'react-icons/fi';

export default ApplicationDetails;

import React, { useState } from 'react';
import Header from '../components/Header';
import { FiTrash2, FiUsers, FiBriefcase, FiActivity } from 'react-icons/fi';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');

  // mock data
  const users = [
    { id: 1, name: 'Shruti', role: 'Seeker', email: 'shruti@example.com' },
    { id: 2, name: 'TechFlow HR', role: 'Recruiter', email: 'hr@techflow.com' },
  ];

  const jobs = [
    { id: 1, title: 'Senior Software Engineer', company: 'TechFlow Corp', status: 'Active' },
    { id: 2, title: 'Earn Money From Home (SCAM)', company: 'Unknown', status: 'Reported' },
  ];

  return (
    <div className="dashboard-page">
      <Header />
      <div className="main-content" style={{ display: 'flex', gap: '32px', maxWidth: '1200px', margin: '32px auto', padding: '0 32px' }}>
        
        <aside style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Admin Control</h2>
          <button style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'stats' ? '#eff6ff' : 'transparent', color: activeTab === 'stats' ? 'var(--primary-blue)' : 'var(--text-dark)', fontWeight: '500' }} onClick={() => setActiveTab('stats')}>Platform Stats</button>
          <button style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'users' ? '#eff6ff' : 'transparent', color: activeTab === 'users' ? 'var(--primary-blue)' : 'var(--text-dark)', fontWeight: '500' }} onClick={() => setActiveTab('users')}>Manage Users</button>
          <button style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'jobs' ? '#eff6ff' : 'transparent', color: activeTab === 'jobs' ? 'var(--primary-blue)' : 'var(--text-dark)', fontWeight: '500' }} onClick={() => setActiveTab('jobs')}>Manage Jobs</button>
        </aside>

        <main style={{ flex: 1, background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          {activeTab === 'stats' && (
            <div>
              <h3 style={{ marginBottom: '24px' }}>DBMS Platform Statistics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '16px', borderRadius: '50%', fontSize: '1.5rem' }}><FiUsers /></div>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>1,240</div>
                    <div style={{ color: 'var(--text-muted)' }}>Total Users</div>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: '#ffedd5', color: '#ea580c', padding: '16px', borderRadius: '50%', fontSize: '1.5rem' }}><FiBriefcase /></div>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>8,590</div>
                    <div style={{ color: 'var(--text-muted)' }}>Active Jobs</div>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '16px', borderRadius: '50%', fontSize: '1.5rem' }}><FiActivity /></div>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>42,100</div>
                    <div style={{ color: 'var(--text-muted)' }}>Applications</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h3 style={{ marginBottom: '24px' }}>Manage Users</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Role</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{user.name}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: user.role === 'Admin' ? '#fee2e2' : user.role === 'Recruiter' ? '#ffedd5' : '#eff6ff', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem' }}>{user.role}</span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>
                        <button style={{ color: 'red', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}><FiTrash2 /> Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <h3 style={{ marginBottom: '24px' }}>Content Moderation (Jobs)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px' }}>Job Title</th>
                    <th style={{ padding: '12px' }}>Company</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{job.title}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{job.company}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: job.status === 'Reported' ? 'red' : 'green', fontWeight: '500' }}>{job.status}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button style={{ color: 'red', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}><FiTrash2 /> Force Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;

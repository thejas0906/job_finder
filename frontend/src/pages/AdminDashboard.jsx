import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { FiTrash2, FiUsers, FiBriefcase, FiActivity } from 'react-icons/fi';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');

  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalApplications: 0 });
  const [users, setUsers] = useState([]);
  const [jobs,  setJobs]  = useState([]);

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'stats') return;
    fetch('http://localhost:5000/api/admin/stats', { headers: authHeaders() })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, [activeTab]);

  // ── Fetch users ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'users') return;
    fetch('http://localhost:5000/api/admin/users', { headers: authHeaders() })
      .then(r => r.json())
      .then(setUsers)
      .catch(console.error);
  }, [activeTab]);

  // ── Fetch jobs ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'jobs') return;
    fetch('http://localhost:5000/api/admin/jobs', { headers: authHeaders() })
      .then(r => r.json())
      .then(setJobs)
      .catch(console.error);
  }, [activeTab]);

  // ── Delete user ─────────────────────────────────────────────────────────────
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Permanently remove this user and all their data?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // ── Force delete job ────────────────────────────────────────────────────────
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Force-delete this job listing?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/jobs/${jobId}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (res.ok) setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="main-content" style={{ display: 'flex', gap: '32px', maxWidth: '1200px', margin: '32px auto', padding: '0 32px' }}>

        <aside style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Admin Control</h2>
          {[['stats','Platform Stats'],['users','Manage Users'],['jobs','Manage Jobs']].map(([tab, label]) => (
            <button key={tab}
              style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', background: activeTab === tab ? '#eff6ff' : 'transparent', color: activeTab === tab ? 'var(--primary-blue)' : 'var(--text-dark)', fontWeight: '500' }}
              onClick={() => setActiveTab(tab)}
            >{label}</button>
          ))}
        </aside>

        <main style={{ flex: 1, background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>

          {/* ── STATS ── */}
          {activeTab === 'stats' && (
            <div>
              <h3 style={{ marginBottom: '24px' }}>Platform Statistics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {[
                  { icon: <FiUsers />, value: stats.totalUsers,        label: 'Total Users',    bg: '#e0e7ff', color: '#4f46e5' },
                  { icon: <FiBriefcase />, value: stats.totalJobs,     label: 'Active Jobs',    bg: '#ffedd5', color: '#ea580c' },
                  { icon: <FiActivity />, value: stats.totalApplications, label: 'Applications', bg: '#dcfce7', color: '#166534' },
                ].map(({ icon, value, label, bg, color }) => (
                  <div key={label} style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: bg, color, padding: '16px', borderRadius: '50%', fontSize: '1.5rem' }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{Number(value).toLocaleString()}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <div>
              <h3 style={{ marginBottom: '24px' }}>Manage Users</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    {['Name', 'Role', 'Email', 'Actions'].map(h => <th key={h} style={{ padding: '12px' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{user.name}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: user.role === 'admin' ? '#fee2e2' : user.role === 'recruiter' ? '#ffedd5' : '#eff6ff', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem' }}>{user.role}</span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          style={{ color: 'red', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}
                          onClick={() => handleDeleteUser(user.id)}
                        ><FiTrash2 /> Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── JOBS ── */}
          {activeTab === 'jobs' && (
            <div>
              <h3 style={{ marginBottom: '24px' }}>Content Moderation (Jobs)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    {['Job Title', 'Company', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '12px' }}>{h}</th>)}
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
                        <button
                          style={{ color: 'red', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}
                          onClick={() => handleDeleteJob(job.id)}
                        ><FiTrash2 /> Force Delete</button>
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

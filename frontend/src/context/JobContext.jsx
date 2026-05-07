import React, { createContext, useState, useEffect } from 'react';

export const JobContext = createContext();

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    id: localStorage.getItem('userId') || null,
    name: 'User', // Would fetch real name in a complete implementation
    role: localStorage.getItem('userRole') || 'seeker'
  });
  
  const [appliedJobs, setAppliedJobs] = useState([]); 
  const [savedJobs, setSavedJobs] = useState([]);
  
  const [users, setUsers] = useState([]); // Mock for admin
  const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`  // ← send JWT
});

  // Fetch jobs dynamically from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs');
        const data = await response.json();
        if (response.ok) {
          const formattedJobs = data.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company_name,
            rating: '4.5', 
            reviews: '100+ Reviews',
            experience: job.experience || 'Any', 
            salary: `₹ ${job.salary_lpa} LPA`,
            salary_num: Number(job.salary_lpa) || 0,
            location: job.location,
            description: job.description,
            tags: job.tags || [], 
            postedAgo: new Date(job.posted_at).toLocaleDateString(),
            applicants: 0,
            status: 'Active'
          }));
          setJobs(formattedJobs);
        }
      } catch (error) {
        console.error('Error fetching jobs. Make sure backend is running.', error);
      }
    };
    fetchJobs();
  }, []);

  // Fetch applied jobs for Seeker
  // Replace the fetchApplied useEffect with:
useEffect(() => {
  const fetchApplied = async () => {
    const token = localStorage.getItem('token');
    if (currentUser.role === 'seeker' && token) {
      try {
        const res = await fetch('http://localhost:5000/api/seekers/me/applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAppliedJobs(data.map(app => app.job_id || app.id));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  fetchApplied();
}, [currentUser]);

  const addJob = async (newJob) => {
    setJobs([{ ...newJob, applicants: 0, status: 'Active' }, ...jobs]);
  };

  const updateJobContext = (jobId, updatedData) => {
    setJobs(prevJobs => prevJobs.map(job => 
      job.id === jobId ? { ...job, ...updatedData } : job
    ));
  };

  const applyToJob = async (jobId) => {
    if (!appliedJobs.includes(jobId) && currentUser.id) {
      try {
        const res = await fetch('http://localhost:5000/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId, seekerId: currentUser.id })
        });
        if (res.ok) {
          setAppliedJobs([...appliedJobs, jobId]);
        }
      } catch (err) {
        console.error('Failed to apply', err);
      }
    }
  };

  const saveJobToggle = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  return (
    <JobContext.Provider value={{
      jobs, 
      setJobs, 
      addJob,
      updateJobContext,
      currentUser, 
      setCurrentUser,
      appliedJobs,
      applyToJob,
      savedJobs,
      saveJobToggle,
      users,
      setUsers
    }}>
      {children}
    </JobContext.Provider>
  );
}

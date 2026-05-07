import React, { useContext } from 'react';
import JobCard from './JobCard';
import Pagination from './Pagination';
import { JobContext } from '../context/JobContext';

function JobList({ searchTerm = '', selectedSalaries = [] }) {
  const { jobs: allJobs } = useContext(JobContext);

  // Filtering based on search term and selected salaries
  let filteredJobs = allJobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (selectedSalaries.length > 0) {
    filteredJobs = filteredJobs.filter(job => {
      const sal = job.salary_num;
      return selectedSalaries.some(range => {
        if (range === '0-3') return sal >= 0 && sal <= 3;
        if (range === '3-6') return sal > 3 && sal <= 6;
        if (range === '6-10') return sal > 6 && sal <= 10;
        if (range === '10-15') return sal > 10 && sal <= 15;
        if (range === '15+') return sal > 15;
        return false;
      });
    });
  }

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <div className="result-count">
          <strong>1 - {filteredJobs.length} of {allJobs.length}</strong> Jobs In India
          {searchTerm && <span> (Filtered)</span>}
        </div>
      </div>
      
      {filteredJobs.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>No jobs found for "{searchTerm}"</h3>
        </div>
      ) : (
        <div className="job-cards">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {filteredJobs.length > 0 && <Pagination />}
    </div>
  );
}

export default JobList;

import React, { useContext } from 'react';
import JobCard from './JobCard';
import Pagination from './Pagination';
import { JobContext } from '../context/JobContext';

function JobList({ searchTerm = '' }) {
  const { jobs: allJobs } = useContext(JobContext);

  // Filtering based on search term
  const filteredJobs = allJobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <div className="result-count">
          <strong>1 - {filteredJobs.length} of {allJobs.length}</strong> Jobs In India
          {searchTerm && <span> (Filtered)</span>}
        </div>
        <div className="sort-by" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Sort by:</span>
          <select style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }}>
            <option>Relevance</option>
            <option>Latest</option>
            <option>Highest Salary</option>
          </select>
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch as IconSearch, FiChevronDown as IconChevronDown } from 'react-icons/fi';
import { BsBagFill } from 'react-icons/bs';

function Header({ searchTerm = '', setSearchTerm }) {
  const [showFilters, setShowFilters] = useState(false);
  const [showPortals, setShowPortals] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    if (setSearchTerm) {
      setSearchTerm(e.target.value);
    }
  };

  const executeSearch = () => {
    if (!setSearchTerm) {
      navigate('/');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <BsBagFill className="bag-icon" />
          </div>
          <h1>HIRELY</h1>
        </Link>
        
        <div className="search-container">
          <span className="search-text">Search for jobs</span>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search by Job title, Company..." 
              style={{ pointerEvents: 'auto' }} 
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => { if (e.key === 'Enter') executeSearch(); }}
            />
            <button className="search-btn" onClick={() => setShowFilters(!showFilters)}>
              <IconChevronDown style={{ fontSize: '1.2rem', marginLeft: '2px', marginRight: '4px' }}/>
              <IconSearch />
            </button>
            {showFilters && (
              <div className="advanced-search-dropdown" onClick={(e) => e.stopPropagation()}>
                <h4>Advanced Search</h4>
                <div className="filter-group">
                  <label>Location</label>
                  <input type="text" placeholder="e.g. Bangalore" />
                </div>
                <div className="filter-group">
                  <label>Salary Range</label>
                  <select>
                    <option>Any Salary</option>
                    <option>0-3 Lakhs</option>
                    <option>3-6 Lakhs</option>
                    <option>6-10 Lakhs</option>
                    <option>10+ Lakhs</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Job Type</label>
                  <select>
                    <option>Any Type</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Internship</option>
                  </select>
                </div>
                <button className="btn-primary full-width" onClick={() => setShowFilters(false)}>Close Filters</button>
              </div>
            )}
          </div>
        </div>

        <div className="header-actions">
          <div className="portals-dropdown" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowPortals(!showPortals)}>
             <div className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Login <IconChevronDown />
             </div>
             {showPortals && (
                <div className="advanced-search-dropdown" style={{ right: 0, left: 'auto', width: '220px', padding: '16px', zIndex: 300 }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sign In As</h4>
                  <Link to="/login" style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontWeight: '500' }}>Job Seeker</Link>
                  <Link to="/login" style={{ display: 'block', padding: '8px 0', fontWeight: '500' }}>Recruiter / Employer</Link>
                </div>
             )}
          </div>
          <Link to="/register" className="btn-primary">Register</Link>
        </div>
      </div>
    </header>
  );
}

export default Header;

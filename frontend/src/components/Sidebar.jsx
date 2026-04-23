import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

function Sidebar() {
  const [companyTypeOpen, setCompanyTypeOpen] = useState(true);
  const [salaryOpen, setSalaryOpen] = useState(true);
  const [workModeOpen, setWorkModeOpen] = useState(true);
  const [experienceOpen, setExperienceOpen] = useState(true);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>All Filters</h3>
        <button className="btn-text">Applied (2)</button>
      </div>

      <div className="filter-section">
        <div className="filter-section-header" onClick={() => setCompanyTypeOpen(!companyTypeOpen)}>
          <h4>Company type</h4>
          {companyTypeOpen ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {companyTypeOpen && (
          <div className="filter-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">Startup</span>
              <span className="count">(20721)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">Foreign MNC</span>
              <span className="count">(125557)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">Corporate</span>
              <span className="count">(108872)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">Indian MNC</span>
              <span className="count">(31666)</span>
            </label>
            <span style={{ color: 'var(--primary-blue)', fontSize: '0.9rem', cursor: 'pointer', marginTop: '4px' }}>View More</span>
          </div>
        )}
      </div>

      <div className="filter-section">
        <div className="filter-section-header" onClick={() => setSalaryOpen(!salaryOpen)}>
          <h4>Salary</h4>
          {salaryOpen ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {salaryOpen && (
          <div className="filter-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">0-3 Lakhs</span>
              <span className="count">(6389)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">3-6 Lakhs</span>
              <span className="count">(12107)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">6-10 Lakhs</span>
              <span className="count">(8998)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">10-15 Lakhs</span>
              <span className="count">(4920)</span>
            </label>
            <span style={{ color: 'var(--primary-blue)', fontSize: '0.9rem', cursor: 'pointer', marginTop: '4px' }}>View More</span>
          </div>
        )}
      </div>

      <div className="filter-section">
        <div className="filter-section-header" onClick={() => setWorkModeOpen(!workModeOpen)}>
          <h4>Work mode</h4>
          {workModeOpen ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {workModeOpen && (
          <div className="filter-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">Work from office</span>
              <span className="count">(19897)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">Hybrid</span>
              <span className="count">(523)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">Remote</span>
              <span className="count">(301)</span>
            </label>
          </div>
        )}
      </div>

      <div className="filter-section">
        <div className="filter-section-header" onClick={() => setExperienceOpen(!experienceOpen)}>
          <h4>Experience</h4>
          {experienceOpen ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {experienceOpen && (
          <div className="filter-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">Fresher</span>
              <span className="count">(8500)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">1-3 Years</span>
              <span className="count">(15200)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">3-5 Years</span>
              <span className="count">(9120)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="label-text">5+ Years</span>
              <span className="count">(12450)</span>
            </label>
          </div>
        )}
      </div>

      <div className="filter-section">
        <div className="filter-section-header">
          <h4>Field / Industry</h4>
          <FiChevronUp />
        </div>
        <div className="filter-options">
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="label-text">Software Eng</span>
            <span className="count">(105k)</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="label-text">Data Science</span>
            <span className="count">(45k)</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="label-text">Cybersecurity</span>
            <span className="count">(15k)</span>
          </label>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-section-header">
          <h4>Degree</h4>
          <FiChevronUp />
        </div>
        <div className="filter-options">
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="label-text">B.Tech / B.E.</span>
            <span className="count">(254k)</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="label-text">MCA</span>
            <span className="count">(64k)</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="label-text">M.Tech</span>
            <span className="count">(32k)</span>
          </label>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

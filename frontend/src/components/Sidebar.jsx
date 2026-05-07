import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

function Sidebar({ selectedSalaries, setSelectedSalaries }) {
  const [salaryOpen, setSalaryOpen] = useState(true);

  const handleCheckboxChange = (range) => {
    if (selectedSalaries.includes(range)) {
      setSelectedSalaries(selectedSalaries.filter((s) => s !== range));
    } else {
      setSelectedSalaries([...selectedSalaries, range]);
    }
  };

  const salaryOptions = [
    { label: '0-3 Lakhs', range: '0-3' },
    { label: '3-6 Lakhs', range: '3-6' },
    { label: '6-10 Lakhs', range: '6-10' },
    { label: '10-15 Lakhs', range: '10-15' },
    { label: '15+ Lakhs', range: '15+' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>All Filters</h3>
        {selectedSalaries.length > 0 && (
          <button className="btn-text" onClick={() => setSelectedSalaries([])}>
            Clear
          </button>
        )}
      </div>

      <div className="filter-section">
        <div className="filter-section-header" onClick={() => setSalaryOpen(!salaryOpen)}>
          <h4>Salary</h4>
          {salaryOpen ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {salaryOpen && (
          <div className="filter-options">
            {salaryOptions.map((opt) => (
              <label key={opt.range} className="checkbox-label" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedSalaries.includes(opt.range)}
                  onChange={() => handleCheckboxChange(opt.range)}
                />
                <span className="label-text">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

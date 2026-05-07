import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import JobList from '../components/JobList';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalaries, setSelectedSalaries] = useState([]);

  return (
    <div className="home-page">
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className="main-content">
        <Sidebar selectedSalaries={selectedSalaries} setSelectedSalaries={setSelectedSalaries} />
        <JobList searchTerm={searchTerm} selectedSalaries={selectedSalaries} />
      </main>
    </div>
  );
}

export default Home;

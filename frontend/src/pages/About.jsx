import React from 'react';
import Header from '../components/Header';

function About() {
  return (
    <div className="about-page">
      <Header />
      <main className="main-content" style={{ display: 'block' }}>
        <div style={{ background: 'white', padding: '48px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '24px', color: 'var(--primary-blue)' }}>About Hirely</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '32px' }}>
            Hirely is a next-generation job portal designed to connect top talent with incredible companies. 
            We believe in creating a seamless, transparent, and efficient hiring process for both seekers and recruiters.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', textAlign: 'left' }}>
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '12px', color: 'var(--text-dark)' }}>For Job Seekers</h3>
              <p style={{ color: 'var(--text-muted)' }}>Find your dream job with advanced filtering, track applications in real-time, and get matched with companies that align with your values.</p>
            </div>
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '12px', color: 'var(--text-dark)' }}>For Recruiters</h3>
              <p style={{ color: 'var(--text-muted)' }}>Post jobs effortlessly, manage an unlimited pipeline of candidates, and use our advanced tools to select the best talent quickly.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default About;

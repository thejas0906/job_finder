import React from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found-page">
      <Header />
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '6rem', color: 'var(--primary-blue)', margin: '0', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center', maxWidth: '400px' }}>
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>Back to Home</Link>
      </main>
    </div>
  );
}

export default NotFound;

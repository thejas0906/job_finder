import React from 'react';
import Header from '../components/Header';

function Contact() {
  return (
    <div className="contact-page">
      <Header />
      <main className="auth-container">
        <form className="auth-form" onSubmit={e => e.preventDefault()}>
          <h2>Contact Us</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Got a question or feedback? We'd love to hear from you.
          </p>
          
          <div className="form-group">
            <label>Name</label>
            <input type="text" placeholder="Your Name" required />
          </div>
          <div className="form-group">
            <label>Email ID</label>
            <input type="email" placeholder="Your Email Address" required />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea rows="5" placeholder="How can we help you?" style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', resize: 'vertical' }} required></textarea>
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '16px', padding: '12px 24px', fontSize: '1.1rem' }}>Send Message</button>
        </form>
      </main>
    </div>
  );
}

export default Contact;

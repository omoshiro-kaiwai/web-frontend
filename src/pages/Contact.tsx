import React, { useEffect, useState } from 'react';
import './Contact.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact: React.FC = () => {
    return (
    <div className="contact-page-container">
      <Header />

      <main className="main-content">
        <div className="container">
            <header className="page-header">
                <h1>Contact</h1>
            </header>
            <div className="no-contact-message">
              <p>このページは準備中です。</p>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
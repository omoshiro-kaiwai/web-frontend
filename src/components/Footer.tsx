import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; 

const Footer: React.FC = () => {
  return (
    <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Omoshiro-kaiwai. All rights reserved.</p>
        </div>
    </footer>
  );
};

export default Footer;
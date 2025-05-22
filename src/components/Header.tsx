import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; 

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container header-content"> {}
        <Link to="/" className="logo-link">
          おもしろ界隈
        </Link>
        <nav className="navigation">
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/blogs">Blogs</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
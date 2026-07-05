import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h2 className="footer-logo">MUVIMAX</h2>
            <p className="footer-description">
              Premium OTT Streaming Platform
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-link-group">
              <h4 className="footer-link-title">Browse</h4>
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/search" className="footer-link">Search</Link>
              <Link to="/watchlist" className="footer-link">Watchlist</Link>
              <Link to="/favorites" className="footer-link">Favorites</Link>
            </div>
            
            <div className="footer-link-group">
              <h4 className="footer-link-title">Support</h4>
              <Link to="/settings" className="footer-link">Settings</Link>
              <Link to="/profile" className="footer-link">Profile</Link>
              <Link to="/notifications" className="footer-link">Notifications</Link>
            </div>
            
            <div className="footer-link-group">
              <h4 className="footer-link-title">Legal</h4>
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>
              <Link to="/terms" className="footer-link">Terms & Conditions</Link>
              <Link to="/about" className="footer-link">About</Link>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} MUVIMAX. All rights reserved.
          </p>
          <p className="footer-version">Version 1.0.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

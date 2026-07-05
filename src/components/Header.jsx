import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { FiSearch, FiBell, FiUser, FiMenu, FiX, FiHome, FiBookmark, FiHeart, FiClock, FiSettings } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: t('home') || 'Home', icon: FiHome },
    { path: '/watchlist', label: t('watchlist') || 'Watchlist', icon: FiBookmark },
    { path: '/favorites', label: t('favorites') || 'Favorites', icon: FiHeart },
    { path: '/history', label: t('history') || 'History', icon: FiClock },
    { path: '/settings', label: t('settings') || 'Settings', icon: FiSettings },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="header-logo-text">MUVIMAX</span>
        </Link>

        <nav className="header-nav">
          <Link to="/" className="header-nav-link">Home</Link>
          <Link to="/watchlist" className="header-nav-link">Watchlist</Link>
          <Link to="/favorites" className="header-nav-link">Favorites</Link>
        </nav>

        <div className="header-actions">
          <button
            className="header-action-btn"
            onClick={() => navigate('/search')}
            aria-label="Search"
          >
            <FiSearch size={22} />
          </button>

          <button
            className="header-action-btn header-notification-btn"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
          >
            <FiBell size={22} />
            {unreadCount > 0 && (
              <span className="header-notification-badge">{unreadCount}</span>
            )}
          </button>

          <button
            className="header-action-btn header-profile-btn"
            onClick={() => navigate('/profile')}
            aria-label="Profile"
          >
            {isAuthenticated && user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="header-avatar"
              />
            ) : (
              <FiUser size={22} />
            )}
          </button>

          <button
            className="header-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="header-mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="header-mobile-menu-content">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  className="header-mobile-nav-item"
                  onClick={() => handleNavClick(item.path)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiClock, FiFilm, FiStar, FiMessageSquare, FiBookmark, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FirebaseService } from '../firebase/services';
import './Profile.css';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    watchTime: 0,
    moviesWatched: 0,
    totalRatings: 0,
    totalReviews: 0,
    watchlistCount: 0,
    favoriteGenres: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      if (user) {
        try {
          const userData = await FirebaseService.getUser(user.uid);
          if (userData) {
            setStats({
              watchTime: userData.watchTime || 0,
              moviesWatched: userData.moviesWatched || 0,
              totalRatings: userData.totalRatings || 0,
              totalReviews: userData.totalReviews || 0,
              watchlistCount: userData.watchlistCount || 0,
              favoriteGenres: userData.favoriteGenres || []
            });
          }
        } catch (error) {
          console.error('Error fetching user stats:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStats();
  }, [user, isAuthenticated, navigate]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatWatchTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-header-skeleton" />
        <div className="profile-stats-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="profile-stat-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} />
          ) : (
            <div className="profile-avatar-placeholder">
              <FiUser size={48} />
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user?.displayName || 'User'}</h1>
          <p className="profile-email">
            <FiMail size={16} />
            {user?.email}
          </p>
          <p className="profile-join-date">
            <FiCalendar size={16} />
            {t('joinDate')}: {formatDate(user?.metadata?.creationTime)}
          </p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <FiClock className="profile-stat-icon" />
          <div className="profile-stat-content">
            <span className="profile-stat-value">{formatWatchTime(stats.watchTime)}</span>
            <span className="profile-stat-label">{t('watchTime')}</span>
          </div>
        </div>
        <div className="profile-stat">
          <FiFilm className="profile-stat-icon" />
          <div className="profile-stat-content">
            <span className="profile-stat-value">{stats.moviesWatched}</span>
            <span className="profile-stat-label">{t('moviesWatched')}</span>
          </div>
        </div>
        <div className="profile-stat">
          <FiStar className="profile-stat-icon" />
          <div className="profile-stat-content">
            <span className="profile-stat-value">{stats.totalRatings}</span>
            <span className="profile-stat-label">{t('totalRatings')}</span>
          </div>
        </div>
        <div className="profile-stat">
          <FiMessageSquare className="profile-stat-icon" />
          <div className="profile-stat-content">
            <span className="profile-stat-value">{stats.totalReviews}</span>
            <span className="profile-stat-label">{t('totalReviews')}</span>
          </div>
        </div>
        <div className="profile-stat">
          <FiBookmark className="profile-stat-icon" />
          <div className="profile-stat-content">
            <span className="profile-stat-value">{stats.watchlistCount}</span>
            <span className="profile-stat-label">{t('watchlistCount')}</span>
          </div>
        </div>
      </div>

      {stats.favoriteGenres.length > 0 && (
        <div className="profile-favorite-genres">
          <h3 className="profile-section-title">{t('favoriteGenres')}</h3>
          <div className="profile-genres-list">
            {stats.favoriteGenres.map((genre) => (
              <span key={genre} className="profile-genre-tag">
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="profile-actions">
        <button
          className="profile-action-btn profile-action-settings"
          onClick={() => navigate('/settings')}
        >
          <FiSettings size={20} />
          <span>{t('settings')}</span>
        </button>
        <button
          className="profile-action-btn profile-action-logout"
          onClick={handleLogout}
        >
          <FiLogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Profile;

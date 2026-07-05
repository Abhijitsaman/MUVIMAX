import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiClock, FiTrash2, FiFilm, FiPlay } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { FirebaseService } from '../firebase/services';
import { useLanguage } from '../context/LanguageContext';
import LoginDialog from '../components/LoginDialog';
import './History.css';

const History = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      setLoading(false);
      return;
    }

    fetchHistory();
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FirebaseService.getHistory(user.uid);
      setHistory(data);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your watch history?')) return;
    
    try {
      await FirebaseService.clearHistory(user.uid);
      setHistory([]);
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  const handleRemove = async (movieId) => {
    setRemovingId(movieId);
    try {
      // Remove from history (we'll use a different approach)
      // For now, just refetch
      await fetchHistory();
    } catch (error) {
      console.error('Error removing from history:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="history-page">
        <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-header">
          <h1 className="history-title">{t('history')}</h1>
        </div>
        <div className="history-list">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="history-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <div className="history-header">
          <h1 className="history-title">{t('history')}</h1>
        </div>
        <div className="history-error">
          <p>{error}</p>
          <button onClick={fetchHistory} className="history-retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h1 className="history-title">
          <FiClock size={28} />
          {t('history')}
        </h1>
        {history.length > 0 && (
          <button
            className="history-clear-btn"
            onClick={handleClearHistory}
          >
            <FiTrash2 size={18} />
            Clear All
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {history.length === 0 ? (
          <motion.div
            key="empty"
            className="history-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="history-empty-icon">
              <FiFilm size={64} />
            </div>
            <h3>{t('emptyHistory')}</h3>
            <p>{t('startWatching')}</p>
            <Link to="/" className="history-empty-btn">
              Browse Movies
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="history-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                className="history-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Link to={`/movie/${item.movieId}`} className="history-item-link">
                  <div className="history-item-poster">
                    <img
                      src={item.movieData?.poster}
                      alt={item.movieData?.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="history-item-info">
                    <h3 className="history-item-title">{item.movieData?.title}</h3>
                    <div className="history-item-meta">
                      <span>{item.movieData?.year}</span>
                      <span>•</span>
                      <span>★ {item.movieData?.rating}</span>
                      {item.progress > 0 && item.progress < 95 && (
                        <>
                          <span>•</span>
                          <span className="history-item-progress">
                            {Math.round(item.progress)}% watched
                          </span>
                        </>
                      )}
                    </div>
                    <span className="history-item-date">
                      {formatDate(item.lastWatched)}
                    </span>
                  </div>
                  {item.progress > 0 && item.progress < 95 && (
                    <div className="history-item-resume">
                      <FiPlay size={16} />
                      <span>Resume</span>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiBookmark, FiTrash2, FiFilm } from 'react-icons/fi';
import { useWatchlist } from '../hooks/useWatchlist';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LoginDialog from '../components/LoginDialog';
import './Watchlist.css';

const Watchlist = () => {
  const { watchlist, loading, error, removeFromWatchlist, refetch } = useWatchlist();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
    }
  }, [isAuthenticated]);

  const handleRemove = async (movieId) => {
    setRemovingId(movieId);
    try {
      await removeFromWatchlist(movieId);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="watchlist-page">
        <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="watchlist-page">
        <div className="watchlist-header">
          <h1 className="watchlist-title">{t('watchlist')}</h1>
        </div>
        <div className="watchlist-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="watchlist-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watchlist-page">
        <div className="watchlist-header">
          <h1 className="watchlist-title">{t('watchlist')}</h1>
        </div>
        <div className="watchlist-error">
          <p>Failed to load watchlist</p>
          <button onClick={refetch} className="watchlist-retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <h1 className="watchlist-title">
          <FiBookmark size={28} />
          {t('watchlist')}
        </h1>
        <span className="watchlist-count">{watchlist.length} movies</span>
      </div>

      <AnimatePresence mode="wait">
        {watchlist.length === 0 ? (
          <motion.div
            key="empty"
            className="watchlist-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="watchlist-empty-icon">
              <FiFilm size={64} />
            </div>
            <h3>{t('emptyWatchlist')}</h3>
            <p>{t('addMovies')}</p>
            <Link to="/" className="watchlist-empty-btn">
              Browse Movies
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="watchlist-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {watchlist.map((item, index) => (
              <motion.div
                key={item.id}
                className="watchlist-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Link to={`/movie/${item.movieId}`} className="watchlist-item-link">
                  <div className="watchlist-item-poster">
                    <img
                      src={item.movieData?.poster}
                      alt={item.movieData?.title}
                      loading="lazy"
                    />
                    <div className="watchlist-item-overlay">
                      <button
                        className="watchlist-item-remove"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(item.movieId);
                        }}
                        disabled={removingId === item.movieId}
                        aria-label="Remove from watchlist"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="watchlist-item-info">
                    <h3 className="watchlist-item-title">{item.movieData?.title}</h3>
                    <div className="watchlist-item-meta">
                      <span>{item.movieData?.year}</span>
                      <span>•</span>
                      <span>★ {item.movieData?.rating}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Watchlist;

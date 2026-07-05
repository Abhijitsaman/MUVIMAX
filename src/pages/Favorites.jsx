import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiFilm } from 'react-icons/fi';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LoginDialog from '../components/LoginDialog';
import './Favorites.css';

const Favorites = () => {
  const { favorites, loading, error, removeFromFavorites, refetch } = useFavorites();
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
      await removeFromFavorites(movieId);
    } catch (error) {
      console.error('Error removing from favorites:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="favorites-page">
        <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-header">
          <h1 className="favorites-title">{t('favorites')}</h1>
        </div>
        <div className="favorites-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="favorites-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-page">
        <div className="favorites-header">
          <h1 className="favorites-title">{t('favorites')}</h1>
        </div>
        <div className="favorites-error">
          <p>Failed to load favorites</p>
          <button onClick={refetch} className="favorites-retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1 className="favorites-title">
          <FiHeart size={28} />
          {t('favorites')}
        </h1>
        <span className="favorites-count">{favorites.length} movies</span>
      </div>

      <AnimatePresence mode="wait">
        {favorites.length === 0 ? (
          <motion.div
            key="empty"
            className="favorites-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="favorites-empty-icon">
              <FiFilm size={64} />
            </div>
            <h3>{t('emptyFavorites')}</h3>
            <p>{t('startFavoriting')}</p>
            <Link to="/" className="favorites-empty-btn">
              Browse Movies
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="favorites-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {favorites.map((item, index) => (
              <motion.div
                key={item.id}
                className="favorites-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Link to={`/movie/${item.movieId}`} className="favorites-item-link">
                  <div className="favorites-item-poster">
                    <img
                      src={item.movieData?.poster}
                      alt={item.movieData?.title}
                      loading="lazy"
                    />
                    <div className="favorites-item-overlay">
                      <button
                        className="favorites-item-remove"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(item.movieId);
                        }}
                        disabled={removingId === item.movieId}
                        aria-label="Remove from favorites"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="favorites-item-info">
                    <h3 className="favorites-item-title">{item.movieData?.title}</h3>
                    <div className="favorites-item-meta">
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

export default Favorites;

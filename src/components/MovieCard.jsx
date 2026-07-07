import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart, FiBookmark, FiImage, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useWatchlist } from '../hooks/useWatchlist';
import LoginDialog from './LoginDialog';
import './MovieCard.css';

const MovieCard = ({ movie, index = 0, isPlaceholder = false }) => {
  const { isAuthenticated } = useAuth();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (isAuthenticated && movie) {
        const fav = await isInFavorites(movie.id);
        const watch = await isInWatchlist(movie.id);
        setIsFavorite(fav);
        setIsWatchlisted(watch);
      }
    };
    checkStatus();
  }, [isAuthenticated, movie, isInFavorites, isInWatchlist]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(movie.id);
        setIsFavorite(false);
      } else {
        await addToFavorites(movie.id, movie);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isWatchlisted) {
        await removeFromWatchlist(movie.id);
        setIsWatchlisted(false);
      } else {
        await addToWatchlist(movie.id, movie);
        setIsWatchlisted(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPlaceholder || !movie) {
    return (
      <motion.div
        className="movie-card movie-card-placeholder"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
      >
        <div className="movie-card-poster movie-card-poster-placeholder">
          <div className="movie-card-placeholder-content">
            <FiImage size={32} />
            <span>No Movie Uploaded</span>
          </div>
        </div>
        <div className="movie-card-info">
          <h3 className="movie-card-title-placeholder">Empty Slot</h3>
          <div className="movie-card-meta-placeholder">
            <span>—</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="movie-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link to={`/movie/${movie.id}`} className="movie-card-link">
          <div className="movie-card-poster">
            <img
              src={movie.poster || movie.backdrop}
              alt={movie.title}
              loading="lazy"
              className="movie-card-image"
              onError={(e) => {
                e.target.src = '';
                e.target.style.background = 'var(--color-background-secondary)';
              }}
            />
            <div className="movie-card-overlay">
              <div className="movie-card-actions">
                <button
                  className={`movie-card-action-btn ${isFavorite ? 'active' : ''}`}
                  onClick={handleFavoriteClick}
                  disabled={isLoading}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <FiHeart size={18} fill={isFavorite ? '#7c3aed' : 'none'} />
                </button>
                <button
                  className={`movie-card-action-btn ${isWatchlisted ? 'active' : ''}`}
                  onClick={handleWatchlistClick}
                  disabled={isLoading}
                  aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  <FiBookmark size={18} fill={isWatchlisted ? '#7c3aed' : 'none'} />
                </button>
              </div>
            </div>
            {movie.rating && (
              <div className="movie-card-rating">
                ★ {typeof movie.rating === 'number' ? movie.rating.toFixed(1) : movie.rating}
              </div>
            )}
          </div>
          <div className="movie-card-info">
            <h3 className="movie-card-title">{movie.title}</h3>
            <div className="movie-card-meta">
              {movie.year && <span className="movie-card-year">{movie.year}</span>}
              {movie.year && movie.genres && movie.genres.length > 0 && (
                <span className="movie-card-dot">•</span>
              )}
              {movie.genres && movie.genres.length > 0 && (
                <span className="movie-card-genre">{movie.genres[0]}</span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>

      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </>
  );
};

export default MovieCard;

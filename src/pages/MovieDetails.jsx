import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay, FiHeart, FiBookmark, FiShare2, FiStar, FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useWatchlist } from '../hooks/useWatchlist';
import { FirebaseService } from '../firebase/services';
import { useLanguage } from '../context/LanguageContext';
import LoginDialog from '../components/LoginDialog';
import MovieRow from '../components/MovieRow';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { movie, loading, error } = useMovieDetails(id);
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (isAuthenticated && movie) {
        const fav = await isInFavorites(movie.id);
        const watch = await isInWatchlist(movie.id);
        const rating = await FirebaseService.getRating(movie.id);
        setIsFavorite(fav);
        setIsWatchlisted(watch);
        setUserRating(rating);
      }
    };
    checkStatus();
  }, [isAuthenticated, movie, isInFavorites, isInWatchlist]);

  useEffect(() => {
    const fetchAverageRating = async () => {
      if (movie) {
        const avg = await FirebaseService.getAverageRating(movie.id);
        setAverageRating(avg);
      }
    };
    fetchAverageRating();
  }, [movie]);

  const handleFavoriteToggle = async () => {
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

  const handleWatchlistToggle = async () => {
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

  const handleShare = async () => {
    const shareData = {
      title: movie?.title,
      text: `Check out ${movie?.title} on MUVIMAX!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleRate = async (rating) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    try {
      await FirebaseService.addRating(user.uid, movie.id, rating);
      setUserRating(rating);
      const avg = await FirebaseService.getAverageRating(movie.id);
      setAverageRating(avg);
    } catch (error) {
      console.error('Error rating:', error);
    }
  };

  if (loading) {
    return (
      <div className="movie-details-loading">
        <div className="movie-details-backdrop-skeleton" />
        <div className="movie-details-content-skeleton">
          <div className="movie-details-title-skeleton" />
          <div className="movie-details-meta-skeleton" />
          <div className="movie-details-description-skeleton" />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-details-error">
        <h2>Movie not found</h2>
        <p>Sorry, we couldn't find the movie you're looking for.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="movie-details">
        <div
          className="movie-details-backdrop"
          style={{ backgroundImage: `url(${movie.backdrop})` }}
        >
          <div className="movie-details-backdrop-overlay" />
        </div>

        <div className="movie-details-content">
          <div className="movie-details-poster">
            <img src={movie.poster} alt={movie.title} />
          </div>

          <div className="movie-details-info">
            <motion.h1
              className="movie-details-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {movie.title}
            </motion.h1>

            <motion.div
              className="movie-details-meta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="movie-details-rating">
                <FiStar /> {averageRating.toFixed(1) || movie.rating}
              </span>
              <span><FiCalendar /> {movie.year}</span>
              <span><FiClock /> {movie.runtime}</span>
            </motion.div>

            <motion.div
              className="movie-details-genres"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {movie.genres.map((genre) => (
                <span key={genre} className="movie-details-genre">
                  {genre}
                </span>
              ))}
            </motion.div>

            <motion.p
              className="movie-details-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {movie.description}
            </motion.p>

            <motion.div
              className="movie-details-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                className="movie-details-btn movie-details-btn-primary"
                onClick={() => navigate(`/watch/${movie.id}`)}
              >
                <FiPlay size={20} />
                <span>{t('watchNow')}</span>
              </button>

              <button
                className={`movie-details-btn ${isFavorite ? 'active' : ''}`}
                onClick={handleFavoriteToggle}
                disabled={isLoading}
              >
                <FiHeart size={20} fill={isFavorite ? '#7c3aed' : 'none'} />
                <span>{isFavorite ? t('unlike') : t('like')}</span>
              </button>

              <button
                className={`movie-details-btn ${isWatchlisted ? 'active' : ''}`}
                onClick={handleWatchlistToggle}
                disabled={isLoading}
              >
                <FiBookmark size={20} fill={isWatchlisted ? '#7c3aed' : 'none'} />
                <span>{isWatchlisted ? t('removeFromWatchlist') : t('addToWatchlist')}</span>
              </button>

              <button
                className="movie-details-btn"
                onClick={handleShare}
              >
                <FiShare2 size={20} />
                <span>{t('share')}</span>
              </button>
            </motion.div>

            {isAuthenticated && (
              <motion.div
                className="movie-details-rating-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4>{t('yourRating')}</h4>
                <div className="movie-details-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`movie-details-star ${userRating >= star ? 'active' : ''}`}
                      onClick={() => handleRate(star)}
                    >
                      <FiStar size={28} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <motion.div
                className="movie-details-cast"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h4>{t('cast')}</h4>
                <div className="movie-details-cast-list">
                  {movie.cast.map((actor) => (
                    <div key={actor} className="movie-details-cast-item">
                      <div className="movie-details-cast-avatar">
                        <FiUser size={24} />
                      </div>
                      <span>{actor}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="movie-details-similar">
          <MovieRow title={t('similarMovies')} category="recommended" />
        </div>
      </div>

      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </>
  );
};

export default MovieDetails;

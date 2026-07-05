import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiHeart, FiBookmark, FiShare2, FiStar, FiClock, FiCalendar, FiUser, FiMessageSquare, FiX } from 'react-icons/fi';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useWatchlist } from '../hooks/useWatchlist';
import { useLanguage } from '../context/LanguageContext';
import { FirebaseService } from '../firebase/services';
import LoginDialog from '../components/LoginDialog';
import MovieRow from '../components/MovieRow';
import { formatDate } from '../utils/helpers';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { movie, loading, error } = useMovieDetails(id);
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (isAuthenticated && movie) {
        const fav = await isInFavorites(movie.id);
        const watch = await isInWatchlist(movie.id);
        const rating = await FirebaseService.getRating(user.uid, movie.id);
        const review = await FirebaseService.getReview(user.uid, movie.id);
        setIsFavorite(fav);
        setIsWatchlisted(watch);
        setUserRating(rating);
        setUserReview(review);
        if (review) {
          setReviewText(review.text || '');
          setReviewRating(review.rating || 0);
        }
      }
    };
    checkStatus();
  }, [isAuthenticated, movie, user, isInFavorites, isInWatchlist]);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (movie) {
        const avg = await FirebaseService.getAverageRating(movie.id);
        const count = await FirebaseService.getRatingCount(movie.id);
        const reviewsData = await FirebaseService.getMovieReviews(movie.id);
        setAverageRating(avg);
        setRatingCount(count);
        setReviews(reviewsData);
      }
    };
    fetchMovieData();
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
      if (userRating) {
        await FirebaseService.updateRating(user.uid, movie.id, rating);
      } else {
        await FirebaseService.addRating(user.uid, movie.id, rating);
      }
      setUserRating(rating);
      const avg = await FirebaseService.getAverageRating(movie.id);
      const count = await FirebaseService.getRatingCount(movie.id);
      setAverageRating(avg);
      setRatingCount(count);
    } catch (error) {
      console.error('Error rating:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    if (!reviewText.trim() && reviewRating === 0) return;

    setIsLoading(true);
    try {
      const reviewData = {
        text: reviewText.trim(),
        rating: reviewRating,
        userDisplayName: user.displayName || 'User',
        userPhotoURL: user.photoURL || null
      };

      if (userReview && isEditingReview) {
        await FirebaseService.updateReview(user.uid, movie.id, reviewData);
      } else {
        await FirebaseService.addReview(user.uid, movie.id, reviewData);
      }

      const updatedReviews = await FirebaseService.getMovieReviews(movie.id);
      setReviews(updatedReviews);
      const updatedUserReview = await FirebaseService.getReview(user.uid, movie.id);
      setUserReview(updatedUserReview);
      setShowReviewForm(false);
      setIsEditingReview(false);
      setReviewText('');
      setReviewRating(0);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete your review?')) return;

    setIsLoading(true);
    try {
      await FirebaseService.deleteReview(user.uid, movie.id);
      const updatedReviews = await FirebaseService.getMovieReviews(movie.id);
      setReviews(updatedReviews);
      setUserReview(null);
      setReviewText('');
      setReviewRating(0);
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReview = () => {
    if (userReview) {
      setReviewText(userReview.text || '');
      setReviewRating(userReview.rating || 0);
      setIsEditingReview(true);
      setShowReviewForm(true);
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
                <FiStar /> {averageRating > 0 ? averageRating.toFixed(1) : movie.rating}
                {ratingCount > 0 && <span className="movie-details-rating-count">({ratingCount})</span>}
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
                      aria-label={`Rate ${star} stars`}
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

        {/* Reviews Section */}
        <div className="movie-details-reviews">
          <div className="movie-details-reviews-header">
            <h3 className="movie-details-reviews-title">
              <FiMessageSquare size={20} />
              {t('reviews')} ({reviews.length})
            </h3>
            {isAuthenticated && !userReview && (
              <button
                className="movie-details-review-btn"
                onClick={() => {
                  setIsEditingReview(false);
                  setReviewText('');
                  setReviewRating(0);
                  setShowReviewForm(!showReviewForm);
                }}
              >
                {t('writeReview')}
              </button>
            )}
            {isAuthenticated && userReview && (
              <div className="movie-details-review-actions">
                <button
                  className="movie-details-review-btn"
                  onClick={handleEditReview}
                >
                  {t('editReview')}
                </button>
                <button
                  className="movie-details-review-btn movie-details-review-btn-danger"
                  onClick={handleDeleteReview}
                >
                  {t('deleteReview')}
                </button>
              </div>
            )}
          </div>

          {showReviewForm && isAuthenticated && (
            <motion.div
              className="movie-details-review-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="movie-details-review-form-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`movie-details-star ${reviewRating >= star ? 'active' : ''}`}
                    onClick={() => setReviewRating(star)}
                    aria-label={`Rate ${star} stars`}
                  >
                    <FiStar size={24} />
                  </button>
                ))}
              </div>
              <textarea
                className="movie-details-review-textarea"
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />
              <div className="movie-details-review-form-actions">
                <button
                  className="movie-details-review-submit"
                  onClick={handleSubmitReview}
                  disabled={isLoading || (!reviewText.trim() && reviewRating === 0)}
                >
                  {isEditingReview ? t('editReview') : t('writeReview')}
                </button>
                <button
                  className="movie-details-review-cancel"
                  onClick={() => {
                    setShowReviewForm(false);
                    setIsEditingReview(false);
                    setReviewText('');
                    setReviewRating(0);
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          <div className="movie-details-reviews-list">
            <AnimatePresence>
              {reviews.length === 0 ? (
                <p className="movie-details-reviews-empty">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    className="movie-details-review-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="movie-details-review-header">
                      <div className="movie-details-review-user">
                        {review.userPhotoURL ? (
                          <img
                            src={review.userPhotoURL}
                            alt={review.userDisplayName}
                            className="movie-details-review-avatar"
                          />
                        ) : (
                          <div className="movie-details-review-avatar-placeholder">
                            <FiUser size={16} />
                          </div>
                        )}
                        <div>
                          <span className="movie-details-review-username">
                            {review.userDisplayName}
                          </span>
                          <span className="movie-details-review-date">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="movie-details-review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={16}
                            className={i < review.rating ? 'active' : ''}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="movie-details-review-text">{review.text}</p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
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

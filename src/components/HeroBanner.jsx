import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiInfo, FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { movieService } from '../services/movieService';
import './HeroBanner.css';

const HeroBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await movieService.getHeroBanners();
        setBanners(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hero banners:', error);
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (isPaused || loading || banners.length === 0 || banners.length === 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(timerRef.current);
  }, [isPaused, loading, banners.length]);

  const handlePrev = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    resetTimer();
  };

  const handleNext = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    resetTimer();
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    if (!isPaused && banners.length > 0 && banners.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 6000);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setIsPaused(false);
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (loading) {
    return (
      <div className="hero-banner hero-banner-loading">
        <div className="hero-banner-skeleton" />
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="hero-banner hero-banner-empty">
        <div className="hero-banner-empty-content">
          <FiImage size={48} />
          <h2>No Banner Uploaded</h2>
          <p>Hero banners will appear here once uploaded from the Admin Panel</p>
        </div>
        <div className="hero-banner-empty-overlay" />
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div
      className="hero-banner"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="hero-banner-slide"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <div
            className="hero-banner-backdrop"
            style={{ backgroundImage: `url(${currentBanner.imageUrl || currentBanner.backdrop})` }}
          >
            <div className="hero-banner-overlay">
              <div className="hero-banner-gradient" />
            </div>
          </div>

          <div className="hero-banner-content">
            <div className="hero-banner-info">
              <motion.h1
                className="hero-banner-title"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {currentBanner.title || 'Untitled'}
              </motion.h1>

              {currentBanner.rating && (
                <motion.div
                  className="hero-banner-meta"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <span className="hero-banner-rating">★ {currentBanner.rating}</span>
                  {currentBanner.year && <span className="hero-banner-year">{currentBanner.year}</span>}
                  {currentBanner.runtime && <span className="hero-banner-runtime">{currentBanner.runtime}</span>}
                  {currentBanner.genres && currentBanner.genres.length > 0 && (
                    <div className="hero-banner-genres">
                      {currentBanner.genres.slice(0, 3).map((genre) => (
                        <span key={genre} className="hero-banner-genre">{genre}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              <motion.p
                className="hero-banner-description"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {currentBanner.description || 'No description available'}
              </motion.p>

              <motion.div
                className="hero-banner-actions"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {currentBanner.movieId && (
                  <button
                    className="hero-banner-btn hero-banner-btn-primary"
                    onClick={() => navigate(`/watch/${currentBanner.movieId}`)}
                  >
                    <FiPlay size={20} />
                    <span>{t('watchNow')}</span>
                  </button>
                )}
                {currentBanner.movieId && (
                  <button
                    className="hero-banner-btn hero-banner-btn-secondary"
                    onClick={() => navigate(`/movie/${currentBanner.movieId}`)}
                  >
                    <FiInfo size={20} />
                    <span>{t('moreInfo')}</span>
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <div className="hero-banner-controls">
            <button
              className="hero-banner-control hero-banner-control-prev"
              onClick={handlePrev}
              aria-label="Previous"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              className="hero-banner-control hero-banner-control-next"
              onClick={handleNext}
              aria-label="Next"
            >
              <FiChevronRight size={24} />
            </button>
          </div>

          <div className="hero-banner-dots">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`hero-banner-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentIndex(index);
                  resetTimer();
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroBanner;

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MovieCard from './MovieCard';
import { useMovies } from '../hooks/useMovies';
import './MovieRow.css';

const MovieRow = ({ title, category, delay = 0 }) => {
  const { movies, loading, error } = useMovies(category, 20);
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const DISPLAY_COUNT = 6;
  const displayMovies = loading ? [] : movies;
  const placeholderCount = Math.max(0, DISPLAY_COUNT - displayMovies.length);

  useEffect(() => {
    const checkScroll = () => {
      if (rowRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
      }
    };

    const currentRow = rowRef.current;
    if (currentRow) {
      currentRow.addEventListener('scroll', checkScroll);
      setTimeout(checkScroll, 100);
      return () => currentRow.removeEventListener('scroll', checkScroll);
    }
  }, [movies]);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.8;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - rowRef.current.offsetLeft);
    setScrollLeft(rowRef.current.scrollLeft);
    rowRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    rowRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (rowRef.current) {
      rowRef.current.style.cursor = 'grab';
    }
  };

  if (error) {
    return (
      <div className="movie-row">
        <h2 className="movie-row-title">{title}</h2>
        <div className="movie-row-error">
          <p>Failed to load movies</p>
          <button className="movie-row-retry" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasContent = displayMovies.length > 0 || placeholderCount > 0;

  if (!hasContent && !loading) {
    return null;
  }

  return (
    <motion.div
      className="movie-row"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
    >
      <div className="movie-row-header">
        <h2 className="movie-row-title">{title}</h2>
      </div>

      <div className="movie-row-wrapper">
        {showLeftArrow && (
          <button
            className="movie-row-arrow movie-row-arrow-left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <FiChevronLeft size={32} />
          </button>
        )}

        <div
          ref={rowRef}
          className="movie-row-scroll"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {loading ? (
            [...Array(DISPLAY_COUNT)].map((_, i) => (
              <div key={i} className="movie-card-skeleton" />
            ))
          ) : (
            <>
              {displayMovies.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  index={index}
                />
              ))}
              {[...Array(placeholderCount)].map((_, i) => (
                <MovieCard
                  key={`placeholder-${i}`}
                  movie={null}
                  index={displayMovies.length + i}
                  isPlaceholder={true}
                />
              ))}
            </>
          )}
        </div>

        {showRightArrow && (
          <button
            className="movie-row-arrow movie-row-arrow-right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <FiChevronRight size={32} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default MovieRow;

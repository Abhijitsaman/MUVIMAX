import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiTrendingUp, FiClock, FiFilm } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { movieService } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import './Search.css';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRecent, setShowRecent] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('muvimax-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    // Load trending searches
    setTrendingSearches(['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Animation']);
    
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Debounce search
    clearTimeout(debounceRef.current);
    
    if (query.trim().length === 0) {
      setResults([]);
      setShowRecent(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setShowRecent(false);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await movieService.search(query);
        setResults(data);
        setLoading(false);
      } catch (error) {
        console.error('Search error:', error);
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = (searchQuery) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length === 0) return;

    // Save to recent searches
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('muvimax-recent-searches', JSON.stringify(updated));

    setQuery(trimmed);
    setShowRecent(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowRecent(true);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('muvimax-recent-searches');
  };

  const handleRecentClick = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  const handleTrendingClick = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={t('search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(query);
              }
            }}
            aria-label="Search movies"
          />
          {query && (
            <button className="search-clear" onClick={clearSearch} aria-label="Clear search">
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="search-content">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="search-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="search-loading-spinner" />
              <p>Searching...</p>
            </motion.div>
          ) : showRecent ? (
            <motion.div
              key="recent"
              className="search-suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {recentSearches.length > 0 && (
                <div className="search-suggestion-group">
                  <div className="search-suggestion-header">
                    <h3>
                      <FiClock size={16} />
                      Recent Searches
                    </h3>
                    <button
                      className="search-suggestion-clear"
                      onClick={clearRecentSearches}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="search-suggestion-list">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        className="search-suggestion-item"
                        onClick={() => handleRecentClick(term)}
                      >
                        <FiClock size={14} />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="search-suggestion-group">
                <div className="search-suggestion-header">
                  <h3>
                    <FiTrendingUp size={16} />
                    Trending Searches
                  </h3>
                </div>
                <div className="search-suggestion-list">
                  {trendingSearches.map((term, index) => (
                    <button
                      key={index}
                      className="search-suggestion-item"
                      onClick={() => handleTrendingClick(term)}
                    >
                      <FiTrendingUp size={14} />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              key="results"
              className="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="search-results-title">
                {results.length} result{results.length > 1 ? 's' : ''} for "{query}"
              </h2>
              <div className="search-results-grid">
                {results.map((movie, index) => (
                  <MovieCard key={movie.id} movie={movie} index={index} />
                ))}
              </div>
            </motion.div>
          ) : query.trim().length > 0 && !loading ? (
            <motion.div
              key="empty"
              className="search-empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="search-empty-icon">
                <FiFilm size={48} />
              </div>
              <h3>No results found</h3>
              <p>Try searching for something else</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Search;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { FirebaseService } from '../firebase/services';
import { useLanguage } from '../context/LanguageContext';
import './ContinueWatching.css';

const ContinueWatching = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContinueWatching = async () => {
      if (!isAuthenticated || !user) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await FirebaseService.getContinueWatching(user.uid);
        setItems(data);
      } catch (error) {
        console.error('Error fetching continue watching:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContinueWatching();
  }, [user, isAuthenticated]);

  if (loading) {
    return (
      <div className="continue-watching">
        <h2 className="continue-watching-title">{t('continueWatching')}</h2>
        <div className="continue-watching-scroll">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="continue-watching-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const formatTime = (progress) => {
    const totalMinutes = Math.floor((progress / 100) * 120);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  return (
    <div className="continue-watching">
      <h2 className="continue-watching-title">{t('continueWatching')}</h2>
      <div className="continue-watching-scroll">
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="continue-watching-item"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link to={`/watch/${item.movieId}`} className="continue-watching-link">
              <div className="continue-watching-poster">
                <img
                  src={item.movieData?.poster}
                  alt={item.movieData?.title}
                  loading="lazy"
                />
                <div className="continue-watching-progress-bar">
                  <div
                    className="continue-watching-progress-fill"
                    style={{ width: `${item.progress || 0}%` }}
                  />
                </div>
                <div className="continue-watching-overlay">
                  <button className="continue-watching-play-btn">
                    <FiPlay size={24} />
                  </button>
                </div>
              </div>
              <div className="continue-watching-info">
                <h3 className="continue-watching-movie-title">
                  {item.movieData?.title}
                </h3>
                <p className="continue-watching-remaining">
                  {formatTime(item.progress || 0)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ContinueWatching;

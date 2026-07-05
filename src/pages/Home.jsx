import React from 'react';
import { motion } from 'framer-motion';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import ContinueWatching from '../components/ContinueWatching';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const sections = [
    { id: 'continueWatching', title: t('continueWatching'), category: 'continueWatching' },
    { id: 'trending', title: t('trendingNow'), category: 'trending' },
    { id: 'popular', title: t('popularMovies'), category: 'popular' },
    { id: 'newReleases', title: t('newReleases'), category: 'newReleases' },
    { id: 'topRated', title: t('topRated'), category: 'topRated' },
    { id: 'recommended', title: t('recommendedForYou'), category: 'recommended' },
    { id: 'action', title: t('action'), category: 'action' },
    { id: 'comedy', title: t('comedy'), category: 'comedy' },
    { id: 'drama', title: t('drama'), category: 'drama' },
    { id: 'horror', title: t('horror'), category: 'horror' },
    { id: 'romance', title: t('romance'), category: 'romance' },
    { id: 'thriller', title: t('thriller'), category: 'thriller' },
    { id: 'animation', title: t('animation'), category: 'animation' },
    { id: 'sciFi', title: t('sciFi'), category: 'sciFi' },
    { id: 'family', title: t('family'), category: 'family' },
    { id: 'recentlyAdded', title: t('recentlyAdded'), category: 'recentlyAdded' }
  ];

  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <HeroBanner />

      {isAuthenticated && (
        <section className="home-section">
          <ContinueWatching />
        </section>
      )}

      {sections.map((section, index) => (
        <section key={section.id} className="home-section">
          <MovieRow
            title={section.title}
            category={section.category}
            delay={index * 100}
          />
        </section>
      ))}
    </motion.div>
  );
};

export default Home;

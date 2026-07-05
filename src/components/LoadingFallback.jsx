import React from 'react';
import { motion } from 'framer-motion';
import './LoadingFallback.css';

const LoadingFallback = () => {
  return (
    <div className="loading-fallback">
      <motion.div
        className="loading-spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <div className="loading-spinner-circle" />
      </motion.div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default LoadingFallback;

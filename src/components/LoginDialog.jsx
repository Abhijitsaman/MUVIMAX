import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FiX, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './LoginDialog.css';

const LoginDialog = ({ open, onClose }) => {
  const { signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="login-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="login-dialog"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button className="login-close" onClick={onClose} aria-label="Close">
              <FiX size={24} />
            </button>

            <div className="login-content">
              <div className="login-icon-wrapper">
                <FiLogIn size={40} className="login-icon" />
              </div>

              <h2 className="login-title">Welcome to MUVIMAX</h2>
              <p className="login-subtitle">
                Sign in to access your watchlist, favorites, and personalized recommendations
              </p>

              <button
                className="login-google-btn"
                onClick={handleSignIn}
                disabled={isLoading}
              >
                <FcGoogle size={24} />
                <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>

              <button
                className="login-guest-btn"
                onClick={onClose}
              >
                Continue as Guest
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginDialog;

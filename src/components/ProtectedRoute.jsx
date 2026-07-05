import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginDialog from './LoginDialog';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowLoginDialog(true);
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return <div className="loading-fallback">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />;
  }

  return children;
};

export default ProtectedRoute;

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FirebaseService } from '../firebase/services';

export const useWatchlist = () => {
  const { user, isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWatchlist([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await FirebaseService.getWatchlist(user.uid);
      setWatchlist(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback(async (movieId, movieData) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    try {
      await FirebaseService.addToWatchlist(user.uid, movieId, movieData);
      await fetchWatchlist();
    } catch (err) {
      throw err;
    }
  }, [user, isAuthenticated, fetchWatchlist]);

  const removeFromWatchlist = useCallback(async (movieId) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    try {
      await FirebaseService.removeFromWatchlist(user.uid, movieId);
      await fetchWatchlist();
    } catch (err) {
      throw err;
    }
  }, [user, isAuthenticated, fetchWatchlist]);

  const isInWatchlist = useCallback(async (movieId) => {
    if (!isAuthenticated) return false;
    try {
      return await FirebaseService.isInWatchlist(user.uid, movieId);
    } catch {
      return false;
    }
  }, [user, isAuthenticated]);

  return {
    watchlist,
    loading,
    error,
    refetch: fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist
  };
};

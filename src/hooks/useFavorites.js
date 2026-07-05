import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FirebaseService } from '../firebase/services';

export const useFavorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await FirebaseService.getFavorites(user.uid);
      setFavorites(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addToFavorites = useCallback(async (movieId, movieData) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    try {
      await FirebaseService.addToFavorites(user.uid, movieId, movieData);
      await fetchFavorites();
    } catch (err) {
      throw err;
    }
  }, [user, isAuthenticated, fetchFavorites]);

  const removeFromFavorites = useCallback(async (movieId) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    try {
      await FirebaseService.removeFromFavorites(user.uid, movieId);
      await fetchFavorites();
    } catch (err) {
      throw err;
    }
  }, [user, isAuthenticated, fetchFavorites]);

  const isInFavorites = useCallback(async (movieId) => {
    if (!isAuthenticated) return false;
    try {
      return await FirebaseService.isInFavorites(user.uid, movieId);
    } catch {
      return false;
    }
  }, [user, isAuthenticated]);

  return {
    favorites,
    loading,
    error,
    refetch: fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    isInFavorites
  };
};

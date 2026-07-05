import { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';

export const useMovieDetails = (movieId) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) {
      setLoading(false);
      return;
    }

    const fetchMovie = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await movieService.getMovieById(movieId);
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  return { movie, loading, error };
};

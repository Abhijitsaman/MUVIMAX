import { useState, useEffect, useCallback } from 'react';
import { movieService } from '../services/movieService';

export const useMovies = (category, limit = 20) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        switch (category) {
          case 'trending':
            data = await movieService.getTrending(limit);
            break;
          case 'popular':
            data = await movieService.getPopular(limit);
            break;
          case 'newReleases':
            data = await movieService.getNewReleases(limit);
            break;
          case 'topRated':
            data = await movieService.getTopRated(limit);
            break;
          case 'recommended':
            data = await movieService.getRecommended(limit);
            break;
          case 'action':
            data = await movieService.getByGenre('action', limit);
            break;
          case 'comedy':
            data = await movieService.getByGenre('comedy', limit);
            break;
          case 'drama':
            data = await movieService.getByGenre('drama', limit);
            break;
          case 'horror':
            data = await movieService.getByGenre('horror', limit);
            break;
          case 'romance':
            data = await movieService.getByGenre('romance', limit);
            break;
          case 'thriller':
            data = await movieService.getByGenre('thriller', limit);
            break;
          case 'animation':
            data = await movieService.getByGenre('animation', limit);
            break;
          case 'sciFi':
            data = await movieService.getByGenre('sci-fi', limit);
            break;
          case 'family':
            data = await movieService.getByGenre('family', limit);
            break;
          case 'recentlyAdded':
            data = await movieService.getRecentlyAdded(limit);
            break;
          default:
            data = [];
        }
        setMovies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [category, limit]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      switch (category) {
        case 'trending':
          data = await movieService.getTrending(limit);
          break;
        case 'popular':
          data = await movieService.getPopular(limit);
          break;
        case 'newReleases':
          data = await movieService.getNewReleases(limit);
          break;
        case 'topRated':
          data = await movieService.getTopRated(limit);
          break;
        case 'recommended':
          data = await movieService.getRecommended(limit);
          break;
        case 'action':
          data = await movieService.getByGenre('action', limit);
          break;
        case 'comedy':
          data = await movieService.getByGenre('comedy', limit);
          break;
        case 'drama':
          data = await movieService.getByGenre('drama', limit);
          break;
        case 'horror':
          data = await movieService.getByGenre('horror', limit);
          break;
        case 'romance':
          data = await movieService.getByGenre('romance', limit);
          break;
        case 'thriller':
          data = await movieService.getByGenre('thriller', limit);
          break;
        case 'animation':
          data = await movieService.getByGenre('animation', limit);
          break;
        case 'sciFi':
          data = await movieService.getByGenre('sci-fi', limit);
          break;
        case 'family':
          data = await movieService.getByGenre('family', limit);
          break;
        case 'recentlyAdded':
          data = await movieService.getRecentlyAdded(limit);
          break;
        default:
          data = [];
      }
      setMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  return { movies, loading, error, refetch };
};

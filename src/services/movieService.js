import { db } from '../firebase/config';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';

export const movieService = {
  async getMovies() {
    try {
      const moviesRef = collection(db, 'movies');
      const snapshot = await getDocs(moviesRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
  },

  async getMovieById(id) {
    try {
      const movieRef = doc(db, 'movies', id);
      const movieDoc = await getDoc(movieRef);
      if (movieDoc.exists()) {
        return { id: movieDoc.id, ...movieDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching movie:', error);
      return null;
    }
  },

  async getMoviesByCategory(category, limitCount = 20) {
    try {
      const moviesRef = collection(db, 'movies');
      const q = query(
        moviesRef,
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching movies by category:', error);
      return [];
    }
  },

  async getTrending(limitCount = 20) {
    try {
      const moviesRef = collection(db, 'movies');
      const q = query(
        moviesRef,
        where('isTrending', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      return [];
    }
  },

  async getPopular(limitCount = 20) {
    try {
      const moviesRef = collection(db, 'movies');
      const q = query(
        moviesRef,
        where('isPopular', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return [];
    }
  },

  async getNewReleases(limitCount = 20) {
    try {
      const moviesRef = collection(db, 'movies');
      const q = query(
        moviesRef,
        where('isNewRelease', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching new releases:', error);
      return [];
    }
  },

  async getTopRated(limitCount = 20) {
    try {
      const moviesRef = collection(db, 'movies');
      const q = query(
        moviesRef,
        orderBy('rating', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      return [];
    }
  },

  async getRecommended(limitCount = 20) {
    try {
      const moviesRef = collection(db, 'movies');
      const q = query(
        moviesRef,
        where('isRecommended', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching recommended movies:', error);
      return [];
    }
  },

  async getByGenre(genre, limitCount = 20) {
    try {
      const moviesRef = collection(db, 'movies');
      const q = query(
        moviesRef,
        where('genres', 'array-contains', genre),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      return [];
    }
  },

  async getRecentlyAdded(limitCount = 20) {
    try {
      const moviesRef = collection(db, 'movies');
      const q = query(
        moviesRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching recently added movies:', error);
      return [];
    }
  },

  async getFeatured() {
    try {
      const moviesRef = collection(db, 'movies');
      const q = query(
        moviesRef,
        where('isFeatured', '==', true),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching featured movie:', error);
      return null;
    }
  },

  async getHeroBanners() {
    try {
      const bannersRef = collection(db, 'heroBanners');
      const q = query(
        bannersRef,
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching hero banners:', error);
      return [];
    }
  },

  async search(queryText) {
    try {
      const moviesRef = collection(db, 'movies');
      const snapshot = await getDocs(moviesRef);
      const allMovies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const searchLower = queryText.toLowerCase();
      return allMovies.filter(movie =>
        movie.title?.toLowerCase().includes(searchLower) ||
        movie.genres?.some(g => g.toLowerCase().includes(searchLower)) ||
        movie.description?.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  }
};

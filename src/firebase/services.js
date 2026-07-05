import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './config';

export const FirebaseService = {
  // User
  async createUser(userData) {
    const userRef = doc(db, 'users', userData.uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      watchTime: 0,
      moviesWatched: 0,
      totalRatings: 0,
      totalReviews: 0,
      favoriteGenres: []
    }, { merge: true });
    return userRef;
  },

  async getUser(uid) {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  },

  async updateUser(uid, data) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  // Watchlist
  async addToWatchlist(userId, movieId, movieData) {
    const watchlistRef = doc(db, 'watchlist', `${userId}_${movieId}`);
    await setDoc(watchlistRef, {
      userId,
      movieId,
      movieData,
      addedAt: serverTimestamp()
    });
    
    await this.updateUser(userId, {
      watchlistCount: increment(1)
    });
  },

  async removeFromWatchlist(userId, movieId) {
    const watchlistRef = doc(db, 'watchlist', `${userId}_${movieId}`);
    await deleteDoc(watchlistRef);
    
    await this.updateUser(userId, {
      watchlistCount: increment(-1)
    });
  },

  async getWatchlist(userId) {
    const q = query(
      collection(db, 'watchlist'),
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async isInWatchlist(userId, movieId) {
    const watchlistRef = doc(db, 'watchlist', `${userId}_${movieId}`);
    const docSnap = await getDoc(watchlistRef);
    return docSnap.exists();
  },

  // Favorites
  async addToFavorites(userId, movieId, movieData) {
    const favoriteRef = doc(db, 'favorites', `${userId}_${movieId}`);
    await setDoc(favoriteRef, {
      userId,
      movieId,
      movieData,
      addedAt: serverTimestamp()
    });
  },

  async removeFromFavorites(userId, movieId) {
    const favoriteRef = doc(db, 'favorites', `${userId}_${movieId}`);
    await deleteDoc(favoriteRef);
  },

  async getFavorites(userId) {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async isInFavorites(userId, movieId) {
    const favoriteRef = doc(db, 'favorites', `${userId}_${movieId}`);
    const docSnap = await getDoc(favoriteRef);
    return docSnap.exists();
  },

  // Ratings
  async addRating(userId, movieId, rating) {
    const ratingRef = doc(db, 'ratings', `${userId}_${movieId}`);
    await setDoc(ratingRef, {
      userId,
      movieId,
      rating,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await this.updateUser(userId, {
      totalRatings: increment(1)
    });
  },

  async updateRating(userId, movieId, rating) {
    const ratingRef = doc(db, 'ratings', `${userId}_${movieId}`);
    await updateDoc(ratingRef, {
      rating,
      updatedAt: serverTimestamp()
    });
  },

  async getRating(userId, movieId) {
    const ratingRef = doc(db, 'ratings', `${userId}_${movieId}`);
    const docSnap = await getDoc(ratingRef);
    if (docSnap.exists()) {
      return docSnap.data().rating;
    }
    return null;
  },

  async getAverageRating(movieId) {
    const q = query(
      collection(db, 'ratings'),
      where('movieId', '==', movieId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return 0;
    const total = snapshot.docs.reduce((sum, doc) => sum + doc.data().rating, 0);
    return total / snapshot.size;
  },

  async getRatingCount(movieId) {
    const q = query(
      collection(db, 'ratings'),
      where('movieId', '==', movieId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  },

  // Reviews
  async addReview(userId, movieId, reviewData) {
    const reviewRef = doc(db, 'reviews', `${userId}_${movieId}`);
    await setDoc(reviewRef, {
      userId,
      movieId,
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await this.updateUser(userId, {
      totalReviews: increment(1)
    });
  },

  async updateReview(userId, movieId, reviewData) {
    const reviewRef = doc(db, 'reviews', `${userId}_${movieId}`);
    await updateDoc(reviewRef, {
      ...reviewData,
      updatedAt: serverTimestamp()
    });
  },

  async deleteReview(userId, movieId) {
    const reviewRef = doc(db, 'reviews', `${userId}_${movieId}`);
    await deleteDoc(reviewRef);
    
    await this.updateUser(userId, {
      totalReviews: increment(-1)
    });
  },

  async getReview(userId, movieId) {
    const reviewRef = doc(db, 'reviews', `${userId}_${movieId}`);
    const docSnap = await getDoc(reviewRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  async getMovieReviews(movieId) {
    const q = query(
      collection(db, 'reviews'),
      where('movieId', '==', movieId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Watch History
  async addToHistory(userId, movieId, movieData, progress = 0) {
    const historyRef = doc(db, 'history', `${userId}_${movieId}`);
    await setDoc(historyRef, {
      userId,
      movieId,
      movieData,
      progress,
      lastWatched: serverTimestamp(),
      watchCount: increment(1)
    }, { merge: true });
  },

  async updateProgress(userId, movieId, progress) {
    const historyRef = doc(db, 'history', `${userId}_${movieId}`);
    await updateDoc(historyRef, {
      progress,
      lastWatched: serverTimestamp()
    });
  },

  async getHistory(userId) {
    const q = query(
      collection(db, 'history'),
      where('userId', '==', userId),
      orderBy('lastWatched', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getContinueWatching(userId) {
    const q = query(
      collection(db, 'history'),
      where('userId', '==', userId),
      where('progress', '>', 0),
      where('progress', '<', 95),
      orderBy('lastWatched', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async clearHistory(userId) {
    const q = query(
      collection(db, 'history'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  },

  // Notifications
  async getNotifications(userId) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async markNotificationRead(notificationId) {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  },

  async markAllNotificationsRead(userId) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();
  },

  // Realtime listeners
  subscribeToWatchlist(userId, callback) {
    const q = query(
      collection(db, 'watchlist'),
      where('userId', '==', userId)
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  },

  subscribeToNotifications(userId, callback) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  }
};

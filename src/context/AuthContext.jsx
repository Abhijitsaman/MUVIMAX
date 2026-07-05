import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, provider, db } from '../firebase/config';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseService } from '../firebase/services';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Auth persistence error:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await FirebaseService.getUser(firebaseUser.uid);
        if (!userData) {
          const newUser = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            watchTime: 0,
            moviesWatched: 0,
            totalRatings: 0,
            totalReviews: 0,
            watchlistCount: 0,
            favoriteGenres: []
          };
          await FirebaseService.createUser(newUser);
          setUser({ ...firebaseUser, ...newUser });
        } else {
          setUser({ ...firebaseUser, ...userData });
        }
        setIsGuest(false);
      } else {
        setUser(null);
        setIsGuest(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsGuest(true);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isGuest,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

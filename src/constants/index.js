export const APP_NAME = 'MUVIMAX';
export const APP_VERSION = '1.0.0';

export const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Thriller',
  'Animation',
  'Sci-Fi',
  'Family',
  'Crime',
  'Mystery',
  'Adventure',
  'War',
  'Music'
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'hi', name: 'हिन्दी' }
];

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
export const VIDEO_QUALITIES = ['auto', '1080p', '720p', '480p'];

export const STORAGE_KEYS = {
  THEME: 'muvimax-theme',
  LANGUAGE: 'muvimax-language',
  RECENT_SEARCHES: 'muvimax-recent-searches',
  CONTINUE_WATCHING: 'muvimax-continue-watching'
};

export const ROUTES = {
  HOME: '/',
  MOVIE_DETAILS: '/movie/:id',
  SEARCH: '/search',
  WATCH: '/watch/:id',
  WATCHLIST: '/watchlist',
  FAVORITES: '/favorites',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HISTORY: '/history',
  NOTIFICATIONS: '/notifications'
};

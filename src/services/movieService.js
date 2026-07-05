const MOVIES_DB = [
  {
    id: '1',
    title: 'The Last Horizon',
    description: 'A journey beyond the stars to discover the truth about humanity\'s origins.',
    backdrop: 'https://picsum.photos/1920/1080?random=1',
    poster: 'https://picsum.photos/300/450?random=1',
    year: 2024,
    rating: 8.7,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    runtime: '148 min',
    cast: ['Emma Watson', 'Tom Hanks', 'Scarlett Johansson'],
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    category: 'trending',
    featured: true
  },
  {
    id: '2',
    title: 'Shadows of Eternity',
    description: 'A detective uncovers a conspiracy that spans centuries.',
    backdrop: 'https://picsum.photos/1920/1080?random=2',
    poster: 'https://picsum.photos/300/450?random=2',
    year: 2023,
    rating: 8.4,
    genres: ['Thriller', 'Mystery', 'Crime'],
    runtime: '132 min',
    cast: ['Leonardo DiCaprio', 'Emily Blunt', 'Michael B. Jordan'],
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    category: 'popular'
  },
  {
    id: '3',
    title: 'Celestial Echoes',
    description: 'Music that connects the universe.',
    backdrop: 'https://picsum.photos/1920/1080?random=3',
    poster: 'https://picsum.photos/300/450?random=3',
    year: 2024,
    rating: 9.1,
    genres: ['Drama', 'Music', 'Romance'],
    runtime: '115 min',
    cast: ['Emma Stone', 'Ryan Gosling', 'Meryl Streep'],
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    category: 'newReleases'
  },
  {
    id: '4',
    title: 'The Silent King',
    description: 'A ruler must choose between power and peace.',
    backdrop: 'https://picsum.photos/1920/1080?random=4',
    poster: 'https://picsum.photos/300/450?random=4',
    year: 2023,
    rating: 7.9,
    genres: ['Action', 'Drama', 'War'],
    runtime: '156 min',
    cast: ['Hugh Jackman', 'Christian Bale', 'Zoe Saldana'],
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    category: 'topRated'
  },
  {
    id: '5',
    title: 'Echoes of Tomorrow',
    description: 'A time traveler fights to save the future.',
    backdrop: 'https://picsum.photos/1920/1080?random=5',
    poster: 'https://picsum.photos/300/450?random=5',
    year: 2024,
    rating: 8.2,
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    runtime: '140 min',
    cast: ['Chris Pratt', 'Anne Hathaway', 'Samuel L. Jackson'],
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    category: 'trending'
  },
  {
    id: '6',
    title: 'Whispers in the Dark',
    description: 'A horror story that will keep you awake.',
    backdrop: 'https://picsum.photos/1920/1080?random=6',
    poster: 'https://picsum.photos/300/450?random=6',
    year: 2023,
    rating: 7.6,
    genres: ['Horror', 'Mystery', 'Thriller'],
    runtime: '98 min',
    cast: ['Florence Pugh', 'Willem Dafoe', 'Anya Taylor-Joy'],
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    category: 'popular'
  },
  {
    id: '7',
    title: 'The Laughing Philosopher',
    description: 'A comedy about finding meaning in chaos.',
    backdrop: 'https://picsum.photos/1920/1080?random=7',
    poster: 'https://picsum.photos/300/450?random=7',
    year: 2024,
    rating: 8.0,
    genres: ['Comedy', 'Drama'],
    runtime: '105 min',
    cast: ['Denzel Washington', 'Julia Roberts', 'Kevin Hart'],
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    category: 'newReleases'
  },
  {
    id: '8',
    title: 'Frozen Hearts',
    description: 'A romance that defies all odds.',
    backdrop: 'https://picsum.photos/1920/1080?random=8',
    poster: 'https://picsum.photos/300/450?random=8',
    year: 2023,
    rating: 8.9,
    genres: ['Romance', 'Drama'],
    runtime: '118 min',
    cast: ['Timothée Chalamet', 'Saoirse Ronan', 'Lucas Hedges'],
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    category: 'topRated'
  },
  {
    id: '9',
    title: 'The Animated Universe',
    description: 'An animated adventure for the whole family.',
    backdrop: 'https://picsum.photos/1920/1080?random=9',
    poster: 'https://picsum.photos/300/450?random=9',
    year: 2024,
    rating: 8.3,
    genres: ['Animation', 'Family', 'Adventure'],
    runtime: '90 min',
    cast: ['Tom Holland', 'Zendaya', 'Jack Black'],
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCar.mp4',
    category: 'animation'
  },
  {
    id: '10',
    title: 'Gangster\'s Paradise',
    description: 'The rise and fall of a crime empire.',
    backdrop: 'https://picsum.photos/1920/1080?random=10',
    poster: 'https://picsum.photos/300/450?random=10',
    year: 2023,
    rating: 8.5,
    genres: ['Crime', 'Drama', 'Action'],
    runtime: '162 min',
    cast: ['Robert De Niro', 'Al Pacino', 'Joe Pesci'],
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    category: 'popular'
  }
];

const GENRE_MAP = {
  'action': ['Action', 'Crime', 'War', 'Adventure'],
  'comedy': ['Comedy'],
  'drama': ['Drama'],
  'horror': ['Horror'],
  'romance': ['Romance'],
  'thriller': ['Thriller', 'Mystery', 'Crime'],
  'animation': ['Animation'],
  'sci-fi': ['Sci-Fi'],
  'family': ['Family', 'Animation']
};

export const movieService = {
  async getMovies() {
    return MOVIES_DB;
  },

  async getMovieById(id) {
    const movie = MOVIES_DB.find(m => m.id === id);
    if (!movie) {
      throw new Error('Movie not found');
    }
    return movie;
  },

  async getTrending(limit = 20) {
    const trending = MOVIES_DB.filter(m => m.category === 'trending' || m.featured);
    return trending.slice(0, limit);
  },

  async getPopular(limit = 20) {
    const popular = MOVIES_DB.filter(m => m.category === 'popular');
    return popular.slice(0, limit);
  },

  async getNewReleases(limit = 20) {
    const releases = MOVIES_DB.filter(m => m.category === 'newReleases');
    return releases.slice(0, limit);
  },

  async getTopRated(limit = 20) {
    const topRated = MOVIES_DB.filter(m => m.category === 'topRated');
    return topRated.slice(0, limit);
  },

  async getRecommended(limit = 20) {
    const recommended = MOVIES_DB.filter(m => m.category === 'trending' || m.category === 'topRated');
    return recommended.slice(0, limit);
  },

  async getByGenre(genre, limit = 20) {
    const genreKeywords = GENRE_MAP[genre] || [genre];
    const filtered = MOVIES_DB.filter(movie =>
      movie.genres.some(g => genreKeywords.includes(g))
    );
    return filtered.slice(0, limit);
  },

  async getRecentlyAdded(limit = 20) {
    return MOVIES_DB.slice(0, limit);
  },

  async search(query) {
    const searchLower = query.toLowerCase();
    return MOVIES_DB.filter(movie =>
      movie.title.toLowerCase().includes(searchLower) ||
      movie.genres.some(g => g.toLowerCase().includes(searchLower))
    );
  },

  async getFeatured() {
    return MOVIES_DB.find(m => m.featured) || MOVIES_DB[0];
  }
};

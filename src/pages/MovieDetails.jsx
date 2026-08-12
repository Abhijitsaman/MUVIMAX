// ... (all imports remain the same)

import { normalizeImageUrl } from '../utils/imageHelpers';

// ... (rest of the file remains the same until the poster section)

// In the poster rendering section, replace the img src with normalized URL:

<div className="movie-details-poster">
  <img
    src={normalizeImageUrl(movie.poster)}
    alt={movie.title}
    onError={(e) => {
      e.target.src = '';
      e.target.style.background = 'var(--color-background-secondary)';
    }}
  />
</div>

// ... (rest of the file remains unchanged)

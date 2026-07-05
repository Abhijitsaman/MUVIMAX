import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RouteTracker = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Analytics tracking ready
    // You can add Google Analytics or other tracking here
    const fullPath = pathname + search;
    console.log('Route changed:', fullPath);
    
    // Example: ga('send', 'pageview', fullPath);
  }, [pathname, search]);

  return null;
};

export default RouteTracker;

import { useEffect } from 'react';

function usePageTitle(title, suffix = null) {
  useEffect(() => {
    // Previous title to restore when component unmounts (optional)
    const prevTitle = document.title;
    
    // Set the new title, with optional suffix
    document.title = suffix ? `${title} | ${suffix}` : title;
    
    // Cleanup function to reset title when component unmounts (optional)
    return () => {
      document.title = prevTitle;
    };
  }, [title, suffix]); // Re-run effect when title or suffix changes
}

export default usePageTitle;
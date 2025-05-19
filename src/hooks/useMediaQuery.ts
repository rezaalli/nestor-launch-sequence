import { useState, useEffect } from 'react';

/**
 * A hook that returns whether a media query matches.
 * @param query The media query to check
 * @returns A boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize state with null to indicate it's not been computed yet
  const [matches, setMatches] = useState<boolean>(() => {
    // Initialize with a check if on the client-side
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false; // Default to false for server-side rendering
  });

  useEffect(() => {
    // Don't run on server-side
    if (typeof window === 'undefined') return;

    // Create MediaQueryList object
    const mediaQuery = window.matchMedia(query);
    
    // Define callback function
    const updateMatches = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Add listener
    // Use the newer addEventLister API if available, otherwise use deprecated addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMatches);
    } else {
      // @ts-ignore - For older browsers
      mediaQuery.addListener(updateMatches);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMatches);
      } else {
        // @ts-ignore - For older browsers
        mediaQuery.removeListener(updateMatches);
      }
    };
  }, [query]); // Re-run if query changes

  return matches;
}

export default useMediaQuery; 
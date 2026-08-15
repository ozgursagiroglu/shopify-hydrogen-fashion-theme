import {useEffect} from 'react';
import {useWishlist} from './WishlistContext';
import {useCompare} from './CompareContext';
import {useRecentlyViewed} from './RecentlyViewedContext';

/**
 * Hydration boundary for Zustand stores with persist middleware
 * This component triggers rehydration after the client mounts,
 * preventing hydration mismatches during SSR.
 */
export function HydrationBoundary() {
  useEffect(() => {
    // Rehydrate all stores after mount
    void useWishlist.persist.rehydrate();
    void useCompare.persist.rehydrate();
    void useRecentlyViewed.persist.rehydrate();
  }, []);

  return null;
}

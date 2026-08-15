/**
 * Context Providers Export
 * Centralized exports for all context providers and hooks
 *
 * Usage:
 * import {
 *   WishlistProvider,
 *   useWishlist,
 *   CompareProvider,
 *   useCompare,
 * } from '~/context';
 */

// Wishlist Context
export {
  WishlistProvider,
  useWishlist,
  type WishlistProductInput,
} from './WishlistContext';

// Compare Context
export {
  CompareProvider,
  useCompare,
  type CompareProduct,
} from './CompareContext';

// Recently Viewed Context
export {
  RecentlyViewedProvider,
  useRecentlyViewed,
  type RecentlyViewedProductInput,
} from './RecentlyViewedContext';

// Quick View Context
export {QuickViewProvider, useQuickView} from './QuickViewContext';

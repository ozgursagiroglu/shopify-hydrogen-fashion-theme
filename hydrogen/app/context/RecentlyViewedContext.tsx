import {type ReactNode} from 'react';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {STORAGE_KEYS, TIMING, LIMITS} from '~/lib/constants';

interface RecentlyViewedItem {
  id: string;
  handle: string;
  title: string;
  vendor?: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  };
  image?: {
    url: string;
    altText?: string;
  };
  viewedAt: number;
}

interface RecentlyViewedStore {
  items: RecentlyViewedItem[];
  addItem: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
  clearItems: () => void;
}

export const useRecentlyViewed = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          // Filter out old items
          const thirtyDaysAgo = Date.now() - TIMING.THIRTY_DAYS_MS;
          const validItems = state.items.filter(
            (i) => i.viewedAt > thirtyDaysAgo,
          );

          // Remove if exists (to move to front)
          const filtered = validItems.filter((i) => i.handle !== item.handle);

          // Add to front with timestamp
          const newItems = [{...item, viewedAt: Date.now()}, ...filtered];

          // Keep only MAX_ITEMS
          return {items: newItems.slice(0, LIMITS.MAX_RECENTLY_VIEWED)};
        });
      },

      clearItems: () => {
        set({items: []});
      },
    }),
    {
      name: STORAGE_KEYS.RECENTLY_VIEWED,
      skipHydration: true, // Critical for SSR - prevents hydration mismatch
    },
  ),
);

// Provider component (optional - for backwards compatibility if needed)
export function RecentlyViewedProvider({children}: {children: ReactNode}) {
  return <>{children}</>;
}

export type RecentlyViewedProductInput = Omit<RecentlyViewedItem, 'viewedAt'>;

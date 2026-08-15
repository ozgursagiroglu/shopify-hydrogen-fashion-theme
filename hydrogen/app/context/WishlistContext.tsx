import {type ReactNode} from 'react';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {STORAGE_KEYS} from '~/lib/constants';

interface WishlistItem {
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
  addedAt: number;
}

interface WishlistStore {
  items: WishlistItem[];
  itemCount: number;
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (handle: string) => void;
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  isInWishlist: (handle: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,

      addItem: (item) => {
        set((state) => {
          // Check if item already exists
          if (state.items.some((i) => i.handle === item.handle)) {
            return state;
          }
          const newItems = [...state.items, {...item, addedAt: Date.now()}];
          return {items: newItems, itemCount: newItems.length};
        });
      },

      removeItem: (handle) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.handle !== handle);
          return {items: newItems, itemCount: newItems.length};
        });
      },

      toggleItem: (item) => {
        set((state) => {
          const exists = state.items.some((i) => i.handle === item.handle);
          const newItems = exists
            ? state.items.filter((i) => i.handle !== item.handle)
            : [...state.items, {...item, addedAt: Date.now()}];
          return {items: newItems, itemCount: newItems.length};
        });
      },

      isInWishlist: (handle) => {
        return get().items.some((item) => item.handle === handle);
      },

      clearWishlist: () => {
        set({items: [], itemCount: 0});
      },
    }),
    {
      name: STORAGE_KEYS.WISHLIST,
      skipHydration: true, // Critical for SSR - prevents hydration mismatch
    },
  ),
);

// Provider component (optional - for backwards compatibility if needed)
export function WishlistProvider({children}: {children: ReactNode}) {
  return <>{children}</>;
}

// Type for minimal product data needed for wishlist
export type WishlistProductInput = Omit<WishlistItem, 'addedAt'>;

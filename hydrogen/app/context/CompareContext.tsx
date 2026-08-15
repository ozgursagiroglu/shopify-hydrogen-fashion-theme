import {type ReactNode} from 'react';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {STORAGE_KEYS} from '~/lib/constants';

const MAX_COMPARE_PRODUCTS = 4;

export interface CompareProduct {
  id: string;
  handle: string;
  title: string;
  vendor?: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  } | null;
  options?: Array<{
    name: string;
    values: string[];
  }>;
  description?: string;
  tags?: string[];
}

interface CompareStore {
  products: CompareProduct[];
  canAdd: boolean;
  maxProducts: number;
  addProduct: (product: CompareProduct) => void;
  removeProduct: (productId: string) => void;
  clearAll: () => void;
  isInCompare: (productId: string) => boolean;
}

export const useCompare = create<CompareStore>()(
  persist(
    (set, get) => ({
      products: [],
      canAdd: true,
      maxProducts: MAX_COMPARE_PRODUCTS,

      addProduct: (product) => {
        set((state) => {
          if (state.products.length >= MAX_COMPARE_PRODUCTS) return state;
          if (state.products.some((p) => p.id === product.id)) return state;
          const newProducts = [...state.products, product];
          return {
            products: newProducts,
            canAdd: newProducts.length < MAX_COMPARE_PRODUCTS,
          };
        });
      },

      removeProduct: (productId) => {
        set((state) => {
          const newProducts = state.products.filter((p) => p.id !== productId);
          return {
            products: newProducts,
            canAdd: newProducts.length < MAX_COMPARE_PRODUCTS,
          };
        });
      },

      clearAll: () => {
        set({products: [], canAdd: true});
      },

      isInCompare: (productId) => {
        return get().products.some((p) => p.id === productId);
      },
    }),
    {
      name: STORAGE_KEYS.COMPARE,
      skipHydration: true, // Critical for SSR - prevents hydration mismatch
    },
  ),
);

// Provider component (optional - for backwards compatibility if needed)
export function CompareProvider({children}: {children: ReactNode}) {
  return <>{children}</>;
}

import {vi} from 'vitest';
import {createContext, useContext, useState, type ReactNode} from 'react';

// ============================================================================
// Wishlist Context Mock
// ============================================================================

interface WishlistItem {
  id: string;
  handle: string;
  title: string;
  vendor?: string;
  price: {amount: string; currencyCode: string};
  compareAtPrice?: {amount: string; currencyCode: string} | null;
  image?: {url: string; altText?: string | null} | null;
  addedAt: number;
}

interface MockWishlistContextValue {
  items: WishlistItem[];
  addItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  toggleItem: ReturnType<typeof vi.fn>;
  isInWishlist: ReturnType<typeof vi.fn>;
  clearWishlist: ReturnType<typeof vi.fn>;
  itemCount: number;
}

const MockWishlistContext = createContext<MockWishlistContextValue | null>(null);

export function MockWishlistProvider({
  children,
  initialItems = [],
}: {
  children: ReactNode;
  initialItems?: WishlistItem[];
}) {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);

  const value: MockWishlistContextValue = {
    items,
    addItem: vi.fn((item: Omit<WishlistItem, 'addedAt'>) => {
      setItems((prev) => {
        if (prev.some((i) => i.handle === item.handle)) return prev;
        return [...prev, {...item, addedAt: Date.now()}];
      });
    }),
    removeItem: vi.fn((handle: string) => {
      setItems((prev) => prev.filter((i) => i.handle !== handle));
    }),
    toggleItem: vi.fn((item: Omit<WishlistItem, 'addedAt'>) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.handle === item.handle);
        if (exists) return prev.filter((i) => i.handle !== item.handle);
        return [...prev, {...item, addedAt: Date.now()}];
      });
    }),
    isInWishlist: vi.fn((handle: string) => items.some((i) => i.handle === handle)),
    clearWishlist: vi.fn(() => setItems([])),
    itemCount: items.length,
  };

  return (
    <MockWishlistContext.Provider value={value}>
      {children}
    </MockWishlistContext.Provider>
  );
}

export function useMockWishlist() {
  const context = useContext(MockWishlistContext);
  if (!context) throw new Error('useMockWishlist must be used within MockWishlistProvider');
  return context;
}

// ============================================================================
// Compare Context Mock
// ============================================================================

interface CompareProduct {
  id: string;
  handle: string;
  title: string;
  vendor?: string;
  featuredImage?: {url: string; altText?: string | null} | null;
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
  compareAtPriceRange?: {minVariantPrice: {amount: string; currencyCode: string}} | null;
}

interface MockCompareContextValue {
  products: CompareProduct[];
  addProduct: ReturnType<typeof vi.fn>;
  removeProduct: ReturnType<typeof vi.fn>;
  clearAll: ReturnType<typeof vi.fn>;
  isInCompare: ReturnType<typeof vi.fn>;
  canAdd: boolean;
  maxProducts: number;
}

const MockCompareContext = createContext<MockCompareContextValue | null>(null);

export function MockCompareProvider({
  children,
  initialProducts = [],
  maxProducts = 4,
}: {
  children: ReactNode;
  initialProducts?: CompareProduct[];
  maxProducts?: number;
}) {
  const [products, setProducts] = useState<CompareProduct[]>(initialProducts);

  const value: MockCompareContextValue = {
    products,
    addProduct: vi.fn((product: CompareProduct) => {
      setProducts((prev) => {
        if (prev.length >= maxProducts) return prev;
        if (prev.some((p) => p.id === product.id)) return prev;
        return [...prev, product];
      });
    }),
    removeProduct: vi.fn((productId: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }),
    clearAll: vi.fn(() => setProducts([])),
    isInCompare: vi.fn((productId: string) => products.some((p) => p.id === productId)),
    canAdd: products.length < maxProducts,
    maxProducts,
  };

  return (
    <MockCompareContext.Provider value={value}>
      {children}
    </MockCompareContext.Provider>
  );
}

export function useMockCompare() {
  const context = useContext(MockCompareContext);
  if (!context) throw new Error('useMockCompare must be used within MockCompareProvider');
  return context;
}

// ============================================================================
// QuickView Context Mock
// ============================================================================

interface MockQuickViewContextValue {
  openQuickView: ReturnType<typeof vi.fn>;
  closeQuickView: ReturnType<typeof vi.fn>;
  isOpen: boolean;
  productHandle: string | null;
}

const MockQuickViewContext = createContext<MockQuickViewContextValue | null>(null);

export function MockQuickViewProvider({
  children,
  initialOpen = false,
}: {
  children: ReactNode;
  initialOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [productHandle, setProductHandle] = useState<string | null>(null);

  const value: MockQuickViewContextValue = {
    openQuickView: vi.fn((handle: string) => {
      setProductHandle(handle);
      setIsOpen(true);
    }),
    closeQuickView: vi.fn(() => {
      setIsOpen(false);
      setProductHandle(null);
    }),
    isOpen,
    productHandle,
  };

  return (
    <MockQuickViewContext.Provider value={value}>
      {children}
    </MockQuickViewContext.Provider>
  );
}

export function useMockQuickView() {
  const context = useContext(MockQuickViewContext);
  if (!context) throw new Error('useMockQuickView must be used within MockQuickViewProvider');
  return context;
}

// ============================================================================
// Aside Context Mock (for cart drawer)
// ============================================================================

interface MockAsideContextValue {
  type: string | null;
  open: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

const MockAsideContext = createContext<MockAsideContextValue | null>(null);

export function MockAsideProvider({
  children,
  initialType = null,
}: {
  children: ReactNode;
  initialType?: string | null;
}) {
  const [type, setType] = useState<string | null>(initialType);

  const value: MockAsideContextValue = {
    type,
    open: vi.fn((asideType: string) => setType(asideType)),
    close: vi.fn(() => setType(null)),
  };

  return (
    <MockAsideContext.Provider value={value}>
      {children}
    </MockAsideContext.Provider>
  );
}

export function useMockAside() {
  const context = useContext(MockAsideContext);
  if (!context) throw new Error('useMockAside must be used within MockAsideProvider');
  return context;
}

// ============================================================================
// RecentlyViewed Context Mock
// ============================================================================

interface RecentlyViewedItem {
  id: string;
  handle: string;
  title: string;
  featuredImage?: {url: string; altText?: string | null} | null;
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
  viewedAt: number;
}

interface MockRecentlyViewedContextValue {
  items: RecentlyViewedItem[];
  addItem: ReturnType<typeof vi.fn>;
  clearItems: ReturnType<typeof vi.fn>;
}

const MockRecentlyViewedContext = createContext<MockRecentlyViewedContextValue | null>(null);

export function MockRecentlyViewedProvider({
  children,
  initialItems = [],
}: {
  children: ReactNode;
  initialItems?: RecentlyViewedItem[];
}) {
  const [items, setItems] = useState<RecentlyViewedItem[]>(initialItems);

  const value: MockRecentlyViewedContextValue = {
    items,
    addItem: vi.fn((item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
      setItems((prev) => {
        const filtered = prev.filter((i) => i.handle !== item.handle);
        return [{...item, viewedAt: Date.now()}, ...filtered].slice(0, 20);
      });
    }),
    clearItems: vi.fn(() => setItems([])),
  };

  return (
    <MockRecentlyViewedContext.Provider value={value}>
      {children}
    </MockRecentlyViewedContext.Provider>
  );
}

export function useMockRecentlyViewed() {
  const context = useContext(MockRecentlyViewedContext);
  if (!context) throw new Error('useMockRecentlyViewed must be used within MockRecentlyViewedProvider');
  return context;
}

// Export types
export type {
  WishlistItem,
  CompareProduct,
  RecentlyViewedItem,
  MockWishlistContextValue,
  MockCompareContextValue,
  MockQuickViewContextValue,
  MockAsideContextValue,
  MockRecentlyViewedContextValue,
};

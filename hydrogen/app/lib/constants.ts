/**
 * Centralized Constants
 * All shared constants used throughout the ada ÉLAN starter kit
 *
 * Usage:
 * import { STORAGE_KEYS, COLOR_MAP, THEME } from '~/lib/constants';
 *
 * CONFIGURATION NOTE:
 * Most values in TIMING and LIMITS can be customized to match your business needs.
 * However, some values are tied to UX best practices and should be changed carefully:
 *
 * - SEARCH_DEBOUNCE_MS: Balance between responsiveness and API calls
 * - MODAL_ANIMATION_MS: Should match CSS transition durations
 * - MAX_COMPARE_PRODUCTS: UI is optimized for 4 items, larger numbers need layout updates
 * - PRODUCTS_PER_PAGE: Should be divisible by grid columns (2, 3, 4) for clean layouts
 *
 * For production stores, consider:
 * - Increasing MAX_RECENTLY_VIEWED based on your analytics
 * - Adjusting PRODUCTS_PER_PAGE based on your product catalog size
 * - Tuning cache durations (TIMING values) based on your update frequency
 */

// ============================================================================
// STORAGE KEYS
// ============================================================================

/**
 * Get shop-specific storage key prefix based on hostname
 * This prevents storage conflicts when testing multiple shops or
 * when users visit different stores using the same theme
 *
 * @returns Shop-specific prefix (e.g., "elan-mystore" for mystore.myshopify.com)
 */
function getShopPrefix(): string {
  if (typeof window === 'undefined') return 'elan';

  const hostname = window.location.hostname;

  // Extract shop name from hostname
  // Examples:
  //   mystore.myshopify.com -> mystore
  //   custom-domain.com -> custom-domain
  //   localhost -> localhost
  const shopName =
    hostname.includes('.myshopify.com')
      ? hostname.split('.myshopify.com')[0]
      : hostname.split('.')[0];

  return `elan-${shopName}`;
}

/**
 * Generate shop-specific storage key
 *
 * @param key - Base storage key name
 * @returns Shop-specific storage key
 *
 * @example
 * getStorageKey('wishlist') // Returns "elan-mystore-wishlist" for mystore.myshopify.com
 */
export function getStorageKey(key: string): string {
  return `${getShopPrefix()}-${key}`;
}

/**
 * Storage keys with shop-specific prefixes
 * Each key is generated dynamically based on the shop's hostname
 * to prevent conflicts between different stores
 */
export const STORAGE_KEYS = {
  get WISHLIST() {
    return getStorageKey('wishlist');
  },
  get RECENTLY_VIEWED() {
    return getStorageKey('recently-viewed');
  },
  get STOCK_ALERTS() {
    return getStorageKey('stock-alerts');
  },
  get CART() {
    return getStorageKey('cart');
  },
  get LOCALE() {
    return getStorageKey('locale');
  },
  get CURRENCY() {
    return getStorageKey('currency');
  },
  get COMPARE() {
    return getStorageKey('compare');
  },
  get COOKIE_CONSENT() {
    return getStorageKey('cookie-consent');
  },
} as const;

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

export const TIMING = {
  /** 30 days in milliseconds */
  THIRTY_DAYS_MS: 30 * 24 * 60 * 60 * 1000,
  /** 7 days in milliseconds */
  SEVEN_DAYS_MS: 7 * 24 * 60 * 60 * 1000,
  /** 24 hours in milliseconds */
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  /** 1 hour in milliseconds */
  ONE_HOUR_MS: 60 * 60 * 1000,
  /** Debounce delay for search input */
  SEARCH_DEBOUNCE_MS: 300,
  /** Animation duration for modals */
  MODAL_ANIMATION_MS: 200,
  /** Toast notification display duration */
  TOAST_DURATION_MS: 5000,
  /** Delay before closing dropdown menus */
  MENU_CLOSE_DELAY_MS: 150,
  /** Simulated API delay for form submissions */
  FORM_SUBMIT_DELAY_MS: 1000,
  /** Image loading transition delay */
  IMAGE_LOAD_DELAY_MS: 150,
  /** Success message display duration */
  SUCCESS_MESSAGE_MS: 3000,
  /** Modal transition/animation delay */
  MODAL_TRANSITION_MS: 300,
} as const;

// ============================================================================
// LIMITS
// ============================================================================

export const LIMITS = {
  /** Maximum products for comparison */
  MAX_COMPARE_PRODUCTS: 4,
  /** Maximum recently viewed items */
  MAX_RECENTLY_VIEWED: 20,
  /** Maximum products per page in collection */
  PRODUCTS_PER_PAGE: 12,
  /** Maximum search suggestions */
  MAX_SEARCH_SUGGESTIONS: 8,
  /** Maximum cart quantity per item */
  MAX_CART_QUANTITY: 99,
  /** Products per page in search results */
  SEARCH_RESULTS_PER_PAGE: 8,
  /** Collections per page on collections index */
  COLLECTIONS_PER_PAGE: 8,
  /** Blog posts per page */
  BLOG_POSTS_PER_PAGE: 6,
  /** Blogs per page on blogs index */
  BLOGS_PER_PAGE: 10,
  /** Orders per page in account */
  ORDERS_PER_PAGE: 20,
  /** Featured collections on homepage */
  FEATURED_COLLECTIONS: 8,
  /** Featured/new products on homepage */
  FEATURED_PRODUCTS: 8,
  /** Product images to fetch */
  PRODUCT_IMAGES: 10,
  /** Product recommendations count */
  PRODUCT_RECOMMENDATIONS: 8,
  /** Addresses to fetch per page */
  ADDRESSES_PER_PAGE: 6,
} as const;

// ============================================================================
// COLOR MAP - Product Variant Color Matching
// ============================================================================
/**
 * Maps color names to hex values for product variant color swatches.
 *
 * ## Purpose
 * When products have color variants in Shopify, this map converts the variant
 * option value (e.g., "Navy Blue") to a hex color for displaying color swatches.
 *
 * ## How It Works
 * 1. Product has variants with option "Color": ["Navy", "White", "Charcoal"]
 * 2. Theme looks up each color name in COLOR_MAP
 * 3. Displays color swatch using the hex value
 * 4. Falls back to #CCCCCC (light gray) if color not found
 *
 * ## How to Extend
 * Add new color mappings based on your product catalog:
 *
 * ```typescript
 * export const COLOR_MAP: Record<string, string> = {
 *   // ... existing colors ...
 *
 *   // Add your custom colors:
 *   'forest green': '#228B22',
 *   'dusty rose': '#DCAE96',
 *   'midnight': '#191970',
 * };
 * ```
 *
 * ## Best Practices
 * - Use lowercase keys for consistency
 * - Include common spelling variations (e.g., "gray" and "grey")
 * - Use readable hex values that represent the actual color
 * - Group related colors together (reds, blues, neutrals, etc.)
 * - Consider adding hyphenated versions ("off-white" and "offwhite")
 *
 * ## Currently Supported
 * - 70+ colors covering fashion basics
 * - Neutrals (black, white, gray, beige, tan, camel)
 * - Seasonal colors (burgundy, olive, navy, mustard)
 * - Fashion trends (sage, terracotta, rust, mauve)
 *
 * ## Related Functions
 * - `getColorHex(name)` - Get hex with fallback
 * - `getColorFromName(name)` - Fuzzy matching with null if not found
 *
 * @see CUSTOMIZATION.md for detailed customization guide
 */
export const COLOR_MAP: Record<string, string> = {
  // Basics
  black: '#1C1917',
  white: '#FFFFFF',

  // Neutrals
  gray: '#6B7280',
  grey: '#6B7280',
  charcoal: '#36454F',
  slate: '#708090',
  silver: '#C0C0C0',

  // Whites & Creams
  ivory: '#FFFFF0',
  cream: '#FFFDD0',
  offwhite: '#FAF9F6',
  'off-white': '#FAF9F6',
  ecru: '#C2B280',

  // Browns & Tans
  brown: '#92400E',
  beige: '#D4C4A8',
  tan: '#D2B48C',
  camel: '#C19A6B',
  khaki: '#C3B091',
  taupe: '#483C32',
  chocolate: '#7B3F00',
  espresso: '#3C2415',
  nude: '#E3BC9A',
  sand: '#C2B280',
  stone: '#928E85',
  oatmeal: '#D9C8A9',
  natural: '#E8DCC4',

  // Reds & Pinks
  red: '#DC2626',
  burgundy: '#800020',
  maroon: '#800000',
  wine: '#722F37',
  coral: '#FF7F50',
  salmon: '#FA8072',
  pink: '#EC4899',
  rose: '#FF007F',
  blush: '#DE5D83',

  // Oranges & Yellows
  orange: '#EA580C',
  rust: '#B7410E',
  terracotta: '#E2725B',
  peach: '#FFCBA4',
  yellow: '#EAB308',
  mustard: '#FFDB58',
  gold: '#D4AF37',

  // Greens
  green: '#16A34A',
  olive: '#808000',
  forest: '#228B22',
  sage: '#9DC183',
  mint: '#98FF98',
  teal: '#0D9488',

  // Blues
  blue: '#2563EB',
  navy: '#1E3A5F',
  cobalt: '#0047AB',
  denim: '#1560BD',
  indigo: '#4B0082',
  cyan: '#06B6D4',

  // Purples
  purple: '#9333EA',
  lavender: '#E6E6FA',
  lilac: '#C8A2C8',
  mauve: '#E0B0FF',
  plum: '#8E4585',
} as const;

/**
 * Get hex color from color name
 * Falls back to a neutral gray if color is not found
 */
export function getColorHex(colorName: string): string {
  return COLOR_MAP[colorName.toLowerCase()] || '#CCCCCC';
}

/**
 * Get hex color from color name with fuzzy matching
 * First tries direct match, then checks if name contains a color word
 * Returns null if no match found (useful for conditional rendering)
 */
export function getColorFromName(name: string): string | null {
  const normalized = name.toLowerCase().trim();

  // Direct match
  if (COLOR_MAP[normalized]) {
    return COLOR_MAP[normalized];
  }

  // Check if name contains a color word
  for (const [colorName, hex] of Object.entries(COLOR_MAP)) {
    if (normalized.includes(colorName)) {
      return hex;
    }
  }

  return null;
}

// ============================================================================
// THEME TOKENS
// ============================================================================

export const THEME = {
  colors: {
    primary: '#1C1917',
    accent: '#D97706',
    accentHover: '#B45309',
    background: '#FAF9F7',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F4F1',
    text: '#1C1917',
    textSecondary: '#44403C',
    textMuted: '#78716C',
    border: '#E7E4DD',
    borderStrong: '#A8A29E',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#0284C7',
  },
  fonts: {
    display: 'Cormorant Garamond',
    body: 'Plus Jakarta Sans',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
} as const;

// ============================================================================
// IMAGE SIZES
// ============================================================================

export const IMAGE_SIZES = {
  /** Product card thumbnail */
  productCard: '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw',
  /** Product detail gallery */
  productGallery: '(min-width: 1024px) 50vw, 100vw',
  /** Product thumbnail in gallery */
  productThumb: '80px',
  /** Cart line item */
  cartItem: '80px',
  /** Quick view modal */
  quickView: '(min-width: 768px) 40vw, 90vw',
  /** Hero section */
  hero: '100vw',
  /** Collection header */
  collectionHeader: '100vw',
  /** Compare drawer thumbnail */
  compareThumb: '64px',
  /** Compare table product */
  compareProduct: '200px',
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API = {
  /** Shopify Storefront API version */
  STOREFRONT_API_VERSION: '2025-10',
  DEFAULT_COUNTRY: 'US',
  DEFAULT_LANGUAGE: 'EN',
} as const;

// ============================================================================
// MENU HANDLES (Template defaults - can be overridden by environment variables)
// ============================================================================

export const MENU_HANDLES = {
  header: 'header-menu',
  footerShop: 'footer-shop',
  footerHelp: 'footer-help',
  footerAbout: 'footer-about',
  footerLegal: 'footer-legal',
} as const;

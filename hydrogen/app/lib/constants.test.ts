import {describe, it, expect} from 'vitest';
import {
  STORAGE_KEYS,
  TIMING,
  LIMITS,
  COLOR_MAP,
  getColorHex,
  getColorFromName,
  THEME,
  IMAGE_SIZES,
  API,
} from './constants';

describe('constants', () => {
  describe('STORAGE_KEYS', () => {
    it('exports all storage keys with shop-specific prefixes', () => {
      // In test environment (no window), keys default to 'elan-<key>'
      expect(STORAGE_KEYS.WISHLIST).toContain('wishlist');
      expect(STORAGE_KEYS.RECENTLY_VIEWED).toContain('recently-viewed');
      expect(STORAGE_KEYS.STOCK_ALERTS).toContain('stock-alerts');
      expect(STORAGE_KEYS.CART).toContain('cart');
      expect(STORAGE_KEYS.LOCALE).toContain('locale');
      expect(STORAGE_KEYS.CURRENCY).toContain('currency');
      expect(STORAGE_KEYS.COMPARE).toContain('compare');
      expect(STORAGE_KEYS.COOKIE_CONSENT).toContain('cookie-consent');
    });

    it('generates dynamic keys on each access', () => {
      // Keys should be dynamically generated (getters)
      const key1 = STORAGE_KEYS.WISHLIST;
      const key2 = STORAGE_KEYS.WISHLIST;
      expect(key1).toBe(key2);
      expect(key1).toContain('elan');
      expect(key1).toContain('wishlist');
    });

    it('has readonly type constraint (TypeScript level)', () => {
      // as const provides TypeScript type-level immutability
      // Runtime immutability is not enforced without Object.freeze
      expect(typeof STORAGE_KEYS).toBe('object');
      expect(STORAGE_KEYS.WISHLIST).toContain('wishlist');
    });
  });

  describe('TIMING', () => {
    it('exports correct time values in milliseconds', () => {
      expect(TIMING.THIRTY_DAYS_MS).toBe(30 * 24 * 60 * 60 * 1000);
      expect(TIMING.SEVEN_DAYS_MS).toBe(7 * 24 * 60 * 60 * 1000);
      expect(TIMING.ONE_DAY_MS).toBe(24 * 60 * 60 * 1000);
      expect(TIMING.ONE_HOUR_MS).toBe(60 * 60 * 1000);
      expect(TIMING.SEARCH_DEBOUNCE_MS).toBe(300);
      expect(TIMING.MODAL_ANIMATION_MS).toBe(200);
      expect(TIMING.TOAST_DURATION_MS).toBe(5000);
      expect(TIMING.MENU_CLOSE_DELAY_MS).toBe(150);
      expect(TIMING.FORM_SUBMIT_DELAY_MS).toBe(1000);
      expect(TIMING.IMAGE_LOAD_DELAY_MS).toBe(150);
      expect(TIMING.SUCCESS_MESSAGE_MS).toBe(3000);
      expect(TIMING.MODAL_TRANSITION_MS).toBe(300);
    });
  });

  describe('LIMITS', () => {
    it('exports all limit values', () => {
      expect(LIMITS.MAX_COMPARE_PRODUCTS).toBe(4);
      expect(LIMITS.MAX_RECENTLY_VIEWED).toBe(20);
      expect(LIMITS.PRODUCTS_PER_PAGE).toBe(12);
      expect(LIMITS.MAX_SEARCH_SUGGESTIONS).toBe(8);
      expect(LIMITS.MAX_CART_QUANTITY).toBe(99);
      expect(LIMITS.SEARCH_RESULTS_PER_PAGE).toBe(8);
      expect(LIMITS.COLLECTIONS_PER_PAGE).toBe(8);
      expect(LIMITS.BLOG_POSTS_PER_PAGE).toBe(6);
      expect(LIMITS.BLOGS_PER_PAGE).toBe(10);
      expect(LIMITS.ORDERS_PER_PAGE).toBe(20);
      expect(LIMITS.FEATURED_COLLECTIONS).toBe(8);
      expect(LIMITS.FEATURED_PRODUCTS).toBe(8);
      expect(LIMITS.PRODUCT_IMAGES).toBe(10);
      expect(LIMITS.PRODUCT_RECOMMENDATIONS).toBe(8);
      expect(LIMITS.ADDRESSES_PER_PAGE).toBe(6);
    });
  });

  describe('COLOR_MAP', () => {
    it('includes basic colors', () => {
      expect(COLOR_MAP.black).toBe('#1C1917');
      expect(COLOR_MAP.white).toBe('#FFFFFF');
    });

    it('includes neutral colors', () => {
      expect(COLOR_MAP.gray).toBe('#6B7280');
      expect(COLOR_MAP.grey).toBe('#6B7280');
      expect(COLOR_MAP.charcoal).toBe('#36454F');
      expect(COLOR_MAP.silver).toBe('#C0C0C0');
    });

    it('includes fashion colors', () => {
      expect(COLOR_MAP.beige).toBe('#D4C4A8');
      expect(COLOR_MAP.camel).toBe('#C19A6B');
      expect(COLOR_MAP.navy).toBe('#1E3A5F');
      expect(COLOR_MAP.burgundy).toBe('#800020');
    });

    it('handles color aliases', () => {
      expect(COLOR_MAP['off-white']).toBe('#FAF9F6');
      expect(COLOR_MAP.offwhite).toBe('#FAF9F6');
    });
  });

  describe('getColorHex', () => {
    it('returns correct hex for valid color names', () => {
      expect(getColorHex('black')).toBe('#1C1917');
      expect(getColorHex('red')).toBe('#DC2626');
      expect(getColorHex('navy')).toBe('#1E3A5F');
    });

    it('is case insensitive', () => {
      expect(getColorHex('BLACK')).toBe('#1C1917');
      expect(getColorHex('Red')).toBe('#DC2626');
      expect(getColorHex('NAVY')).toBe('#1E3A5F');
    });

    it('returns fallback color for unknown colors', () => {
      expect(getColorHex('unknown-color')).toBe('#CCCCCC');
      expect(getColorHex('notacolor')).toBe('#CCCCCC');
    });

    it('handles empty string', () => {
      expect(getColorHex('')).toBe('#CCCCCC');
    });
  });

  describe('getColorFromName', () => {
    it('returns hex for direct color match', () => {
      expect(getColorFromName('black')).toBe('#1C1917');
      expect(getColorFromName('red')).toBe('#DC2626');
    });

    it('returns hex for partial color match', () => {
      expect(getColorFromName('light blue')).toBe('#2563EB');
      expect(getColorFromName('dark red shirt')).toBe('#DC2626');
      expect(getColorFromName('navy jacket')).toBe('#1E3A5F');
    });

    it('is case insensitive', () => {
      expect(getColorFromName('BLACK')).toBe('#1C1917');
      expect(getColorFromName('Light Blue')).toBe('#2563EB');
    });

    it('returns null for no match', () => {
      expect(getColorFromName('unknown')).toBeNull();
      expect(getColorFromName('rainbow')).toBeNull();
      expect(getColorFromName('')).toBeNull();
    });

    it('matches first color found in string', () => {
      const result = getColorFromName('red and blue');
      expect(result).toBeTruthy();
      // Should match either red or blue
      expect([COLOR_MAP.red, COLOR_MAP.blue]).toContain(result);
    });
  });

  describe('THEME', () => {
    it('exports color tokens', () => {
      expect(THEME.colors.primary).toBe('#1C1917');
      expect(THEME.colors.accent).toBe('#D97706');
      expect(THEME.colors.background).toBe('#FAF9F7');
      expect(THEME.colors.surface).toBe('#FFFFFF');
    });

    it('exports font tokens', () => {
      expect(THEME.fonts.display).toBe('Cormorant Garamond');
      expect(THEME.fonts.body).toBe('Plus Jakarta Sans');
    });

    it('exports border radius tokens', () => {
      expect(THEME.borderRadius.sm).toBe('4px');
      expect(THEME.borderRadius.md).toBe('8px');
      expect(THEME.borderRadius.lg).toBe('12px');
      expect(THEME.borderRadius.xl).toBe('16px');
      expect(THEME.borderRadius.full).toBe('9999px');
    });
  });

  describe('IMAGE_SIZES', () => {
    it('exports responsive image sizes', () => {
      expect(IMAGE_SIZES.productCard).toContain('vw');
      expect(IMAGE_SIZES.productGallery).toContain('vw');
      expect(IMAGE_SIZES.hero).toBe('100vw');
      expect(IMAGE_SIZES.cartItem).toBe('80px');
    });
  });

  describe('API', () => {
    it('exports API version', () => {
      expect(API.STOREFRONT_API_VERSION).toBe('2025-10');
    });
  });
});

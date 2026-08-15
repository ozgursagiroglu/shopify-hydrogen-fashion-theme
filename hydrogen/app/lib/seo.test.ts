import {describe, it, expect} from 'vitest';
import {
  getShopName,
  buildPageTitle,
  buildPageTitleWithFallback,
} from './seo';

describe('seo', () => {
  describe('getShopName', () => {
    it('extracts shop name from root match', () => {
      const matches = [
        {
          id: 'root',
          data: {
            header: {
              shop: {
                name: 'My Shop',
              },
            },
          },
        },
      ];

      const shopName = getShopName(matches);
      expect(shopName).toBe('My Shop');
    });

    it('returns "Shop" when no root match', () => {
      const matches = [
        {id: 'products', data: {}},
        {id: 'collections', data: {}},
      ];

      const shopName = getShopName(matches);
      expect(shopName).toBe('Shop');
    });

    it('returns "Shop" when root match has no data', () => {
      const matches = [
        {id: 'root', data: undefined},
      ];

      const shopName = getShopName(matches as any);
      expect(shopName).toBe('Shop');
    });

    it('returns "Shop" when header is missing', () => {
      const matches = [
        {
          id: 'root',
          data: {},
        },
      ];

      const shopName = getShopName(matches);
      expect(shopName).toBe('Shop');
    });

    it('returns "Shop" when shop is missing', () => {
      const matches = [
        {
          id: 'root',
          data: {
            header: {},
          },
        },
      ];

      const shopName = getShopName(matches);
      expect(shopName).toBe('Shop');
    });

    it('returns "Shop" when name is missing', () => {
      const matches = [
        {
          id: 'root',
          data: {
            header: {
              shop: {},
            },
          },
        },
      ];

      const shopName = getShopName(matches);
      expect(shopName).toBe('Shop');
    });

    it('handles empty matches array', () => {
      const matches: any[] = [];
      const shopName = getShopName(matches);
      expect(shopName).toBe('Shop');
    });

    it('finds root match among multiple matches', () => {
      const matches = [
        {id: 'products', data: {title: 'Products'}},
        {
          id: 'root',
          data: {
            header: {
              shop: {
                name: 'Fashion Store',
              },
            },
          },
        },
        {id: 'collections', data: {title: 'Collections'}},
      ];

      const shopName = getShopName(matches);
      expect(shopName).toBe('Fashion Store');
    });

    it('uses first root match when multiple exist', () => {
      const matches = [
        {
          id: 'root',
          data: {
            header: {
              shop: {
                name: 'First Shop',
              },
            },
          },
        },
        {
          id: 'root',
          data: {
            header: {
              shop: {
                name: 'Second Shop',
              },
            },
          },
        },
      ];

      const shopName = getShopName(matches);
      expect(shopName).toBe('First Shop');
    });
  });

  describe('buildPageTitle', () => {
    it('builds title with shop name', () => {
      const matches = [
        {
          id: 'root',
          data: {
            header: {
              shop: {
                name: 'My Shop',
              },
            },
          },
        },
      ];

      const title = buildPageTitle('Products', matches);
      expect(title).toBe('Products | My Shop');
    });

    it('uses default shop name when not found', () => {
      const matches: any[] = [];
      const title = buildPageTitle('About Us', matches);
      expect(title).toBe('About Us | Shop');
    });

    it('handles empty page title', () => {
      const matches = [
        {
          id: 'root',
          data: {
            header: {
              shop: {
                name: 'My Shop',
              },
            },
          },
        },
      ];

      const title = buildPageTitle('', matches);
      expect(title).toBe(' | My Shop');
    });

    it('handles special characters in page title', () => {
      const matches = [
        {
          id: 'root',
          data: {
            header: {
              shop: {
                name: 'My Shop',
              },
            },
          },
        },
      ];

      const title = buildPageTitle('Men\'s Clothing & Accessories', matches);
      expect(title).toBe('Men\'s Clothing & Accessories | My Shop');
    });

    it('handles long page titles', () => {
      const matches = [
        {
          id: 'root',
          data: {
            header: {
              shop: {
                name: 'Fashion Boutique',
              },
            },
          },
        },
      ];

      const longTitle = 'Premium Luxury Designer Fashion Collection for Modern Lifestyle';
      const title = buildPageTitle(longTitle, matches);
      expect(title).toBe(`${longTitle} | Fashion Boutique`);
    });
  });

  describe('buildPageTitleWithFallback', () => {
    const matches = [
      {
        id: 'root',
        data: {
          header: {
            shop: {
              name: 'My Shop',
            },
          },
        },
      },
    ];

    it('uses page title when available', () => {
      const title = buildPageTitleWithFallback('Custom Title', 'Fallback', matches);
      expect(title).toBe('Custom Title | My Shop');
    });

    it('uses fallback when page title is null', () => {
      const title = buildPageTitleWithFallback(null, 'Fallback Title', matches);
      expect(title).toBe('Fallback Title | My Shop');
    });

    it('uses fallback when page title is undefined', () => {
      const title = buildPageTitleWithFallback(undefined, 'Default Page', matches);
      expect(title).toBe('Default Page | My Shop');
    });

    it('uses fallback when page title is empty string', () => {
      const title = buildPageTitleWithFallback('', 'Not Found', matches);
      expect(title).toBe('Not Found | My Shop');
    });

    it('works with default shop name', () => {
      const title = buildPageTitleWithFallback('Page', 'Fallback', []);
      expect(title).toBe('Page | Shop');
    });

    it('handles both null title and empty matches', () => {
      const title = buildPageTitleWithFallback(null, 'Error Page', []);
      expect(title).toBe('Error Page | Shop');
    });

    it('prefers actual title over fallback', () => {
      const title = buildPageTitleWithFallback('Actual', 'Fallback', matches);
      expect(title).not.toContain('Fallback');
      expect(title).toContain('Actual');
    });
  });

  describe('Integration', () => {
    it('builds consistent titles across utility functions', () => {
      const matches = [
        {
          id: 'root',
          data: {
            header: {
              shop: {
                name: 'Boutique',
              },
            },
          },
        },
      ];

      const title1 = buildPageTitle('Products', matches);
      const title2 = buildPageTitleWithFallback('Products', 'Fallback', matches);

      expect(title1).toBe(title2);
    });

    it('handles edge cases consistently', () => {
      const emptyMatches: any[] = [];

      const shopName = getShopName(emptyMatches);
      const title1 = buildPageTitle('Test', emptyMatches);
      const title2 = buildPageTitleWithFallback('Test', 'Fallback', emptyMatches);

      expect(title1).toContain(shopName);
      expect(title2).toContain(shopName);
      expect(title1).toBe(title2);
    });
  });
});

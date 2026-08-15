import {describe, it, expect, vi} from 'vitest';
import {
  validateEnvironmentVariables,
  validateMenus,
  validateMetaobjects,
  validateShopMetafields,
  groupWarningsByCategory,
  getSeverityBadge,
  getSeverityColor,
} from './setupValidation';
import type {Storefront} from '@shopify/hydrogen';

describe('setupValidation', () => {
  describe('validateEnvironmentVariables', () => {
    it('should return no warnings for valid env', () => {
      const env = {
        PUBLIC_STORE_DOMAIN: 'test.myshopify.com',
        PUBLIC_STOREFRONT_API_TOKEN: 'test-token',
        PUBLIC_STOREFRONT_API_VERSION: '2025-10',
        SESSION_SECRET: 'a'.repeat(32),
        PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: 'client-id',
        ADMIN_API_ACCESS_TOKEN: 'admin-token',
      } as unknown as Env;

      const warnings = validateEnvironmentVariables(env);
      expect(warnings).toHaveLength(0);
    });

    it('should warn about missing required variables', () => {
      const env = {} as Env;

      const warnings = validateEnvironmentVariables(env);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w) => w.title.includes('PUBLIC_STORE_DOMAIN'))).toBe(true);
    });

    it('should warn about weak session secret', () => {
      const env = {
        PUBLIC_STORE_DOMAIN: 'test.myshopify.com',
        PUBLIC_STOREFRONT_API_TOKEN: 'test-token',
        PUBLIC_STOREFRONT_API_VERSION: '2025-10',
        SESSION_SECRET: 'weak',
      } as unknown as Env;

      const warnings = validateEnvironmentVariables(env);
      expect(warnings.some((w) => w.title.includes('Weak SESSION_SECRET'))).toBe(true);
    });

    it('should warn about missing Customer Account API', () => {
      const env = {
        PUBLIC_STORE_DOMAIN: 'test.myshopify.com',
        PUBLIC_STOREFRONT_API_TOKEN: 'test-token',
        PUBLIC_STOREFRONT_API_VERSION: '2025-10',
        SESSION_SECRET: 'a'.repeat(32),
      } as unknown as Env;

      const warnings = validateEnvironmentVariables(env);
      expect(warnings.some((w) => w.title.includes('Customer Account API'))).toBe(true);
    });

    it('should warn about missing Admin API', () => {
      const env = {
        PUBLIC_STORE_DOMAIN: 'test.myshopify.com',
        PUBLIC_STOREFRONT_API_TOKEN: 'test-token',
        PUBLIC_STOREFRONT_API_VERSION: '2025-10',
        SESSION_SECRET: 'a'.repeat(32),
        PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: 'client-id',
      } as unknown as Env;

      const warnings = validateEnvironmentVariables(env);
      expect(warnings.some((w) => w.title.includes('Admin API'))).toBe(true);
    });
  });

  describe('validateMenus', () => {
    it('should return no warnings when menu exists with items', async () => {
      const mockStorefront = {
        query: vi.fn().mockResolvedValue({
          menu: {
            id: 'gid://shopify/Menu/1',
            items: [{id: 'gid://shopify/MenuItem/1'}],
          },
        }),
      } as unknown as Storefront;

      const warnings = await validateMenus(mockStorefront);
      expect(warnings).toHaveLength(0);
    });

    it('should warn when main menu is missing', async () => {
      const mockStorefront = {
        query: vi.fn().mockResolvedValue({menu: null}),
      } as unknown as Storefront;

      const warnings = await validateMenus(mockStorefront);
      expect(warnings.some((w) => w.title.includes('Header menu not found'))).toBe(true);
    });

    it('should warn when main menu is empty', async () => {
      const mockStorefront = {
        query: vi.fn().mockResolvedValue({
          menu: {
            id: 'gid://shopify/Menu/1',
            items: [],
          },
        }),
      } as unknown as Storefront;

      const warnings = await validateMenus(mockStorefront);
      expect(warnings.some((w) => w.title.includes('Header menu is empty'))).toBe(true);
    });

    it('should handle query errors gracefully', async () => {
      const mockStorefront = {
        query: vi.fn().mockRejectedValue(new Error('Query failed')),
      } as unknown as Storefront;

      const warnings = await validateMenus(mockStorefront);
      expect(warnings.some((w) => w.title.includes('Cannot validate header menu'))).toBe(
        true,
      );
    });
  });

  describe('validateMetaobjects', () => {
    it('should return no warnings when metaobjects exist', async () => {
      const mockStorefront = {
        query: vi.fn().mockResolvedValue({
          metaobjects: {
            nodes: [{id: 'gid://shopify/Metaobject/1'}],
          },
        }),
      } as unknown as Storefront;

      const warnings = await validateMetaobjects(mockStorefront);
      expect(warnings).toHaveLength(0);
    });

    it('should warn when metaobjects are missing', async () => {
      const mockStorefront = {
        query: vi.fn().mockResolvedValue({
          metaobjects: {nodes: []},
        }),
      } as unknown as Storefront;

      const warnings = await validateMetaobjects(mockStorefront);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should handle query errors gracefully', async () => {
      const mockStorefront = {
        query: vi.fn().mockRejectedValue(new Error('Query failed')),
      } as unknown as Storefront;

      const warnings = await validateMetaobjects(mockStorefront);
      expect(warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateShopMetafields', () => {
    it('should return no warnings when at least one social link exists', async () => {
      const mockStorefront = {
        query: vi.fn().mockResolvedValue({
          shop: {
            social_instagram: {value: 'https://instagram.com/test'},
            social_facebook: null,
            social_twitter: null,
            social_pinterest: null,
            social_tiktok: null,
            social_youtube: null,
          },
        }),
      } as unknown as Storefront;

      const warnings = await validateShopMetafields(mockStorefront);
      expect(warnings).toHaveLength(0);
    });

    it('should warn when no social links are configured', async () => {
      const mockStorefront = {
        query: vi.fn().mockResolvedValue({
          shop: {
            social_instagram: null,
            social_facebook: null,
            social_twitter: null,
            social_pinterest: null,
            social_tiktok: null,
            social_youtube: null,
          },
        }),
      } as unknown as Storefront;

      const warnings = await validateShopMetafields(mockStorefront);
      expect(warnings.some((w) => w.title.includes('Social links'))).toBe(true);
    });

    it('should handle query errors gracefully', async () => {
      const mockStorefront = {
        query: vi.fn().mockRejectedValue(new Error('Query failed')),
      } as unknown as Storefront;

      const warnings = await validateShopMetafields(mockStorefront);
      expect(warnings.some((w) => w.title.includes('Cannot validate'))).toBe(true);
    });
  });

  describe('groupWarningsByCategory', () => {
    it('should group warnings by category', () => {
      const warnings = [
        {
          category: 'env' as const,
          severity: 'critical' as const,
          title: 'Test 1',
          description: 'Desc 1',
          solution: 'Sol 1',
        },
        {
          category: 'env' as const,
          severity: 'high' as const,
          title: 'Test 2',
          description: 'Desc 2',
          solution: 'Sol 2',
        },
        {
          category: 'menu' as const,
          severity: 'medium' as const,
          title: 'Test 3',
          description: 'Desc 3',
          solution: 'Sol 3',
        },
      ];

      const grouped = groupWarningsByCategory(warnings);
      expect(grouped.env).toHaveLength(2);
      expect(grouped.menu).toHaveLength(1);
    });
  });

  describe('getSeverityColor', () => {
    it('should return correct colors for each severity', () => {
      expect(getSeverityColor('critical')).toBe('red');
      expect(getSeverityColor('high')).toBe('orange');
      expect(getSeverityColor('medium')).toBe('yellow');
      expect(getSeverityColor('low')).toBe('blue');
    });
  });

  describe('getSeverityBadge', () => {
    it('should return correct badge text for each severity', () => {
      expect(getSeverityBadge('critical')).toBe('🔴 Critical');
      expect(getSeverityBadge('high')).toBe('🟠 High');
      expect(getSeverityBadge('medium')).toBe('🟡 Medium');
      expect(getSeverityBadge('low')).toBe('🔵 Low');
    });
  });
});

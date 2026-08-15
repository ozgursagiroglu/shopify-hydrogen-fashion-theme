import {describe, it, expect, vi} from 'vitest';
import {renderHook} from '@testing-library/react';
import {getLocaleFromRequest, useLocalePrefix, getLocalePath} from './locale';

// Mock react-router
vi.mock('react-router', () => ({
  useLocation: vi.fn(() => ({pathname: '/products'})),
}));

describe('locale', () => {
  describe('getLocaleFromRequest', () => {
    it('parses locale from URL path', () => {
      const request = new Request('https://example.com/en-us/products');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('EN');
      expect(locale.country).toBe('US');
      expect(locale.pathPrefix).toBe('/EN-US');
    });

    it('handles different locales', () => {
      const request = new Request('https://example.com/fr-fr/collections');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('FR');
      expect(locale.country).toBe('FR');
      expect(locale.pathPrefix).toBe('/FR-FR');
    });

    it('handles mixed case locale codes', () => {
      const request = new Request('https://example.com/de-DE/products');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('DE');
      expect(locale.country).toBe('DE');
      expect(locale.pathPrefix).toBe('/DE-DE');
    });

    it('defaults to EN-US when no locale in path', () => {
      const request = new Request('https://example.com/products');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('EN');
      expect(locale.country).toBe('US');
      expect(locale.pathPrefix).toBe('');
    });

    it('defaults to EN-US for root path', () => {
      const request = new Request('https://example.com/');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('EN');
      expect(locale.country).toBe('US');
      expect(locale.pathPrefix).toBe('');
    });

    it('ignores invalid locale format', () => {
      const request = new Request('https://example.com/invalid/products');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('EN');
      expect(locale.country).toBe('US');
      expect(locale.pathPrefix).toBe('');
    });

    it('ignores locale-like strings that are too long', () => {
      const request = new Request('https://example.com/en-usa/products');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('EN');
      expect(locale.country).toBe('US');
      expect(locale.pathPrefix).toBe('');
    });

    it('ignores locale-like strings that are too short', () => {
      const request = new Request('https://example.com/e-u/products');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('EN');
      expect(locale.country).toBe('US');
      expect(locale.pathPrefix).toBe('');
    });

    it('handles paths with query parameters', () => {
      const request = new Request('https://example.com/es-es/products?sort=price');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('ES');
      expect(locale.country).toBe('ES');
      expect(locale.pathPrefix).toBe('/ES-ES');
    });

    it('handles paths with hash fragments', () => {
      const request = new Request('https://example.com/it-it/products#details');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('IT');
      expect(locale.country).toBe('IT');
      expect(locale.pathPrefix).toBe('/IT-IT');
    });

    it('preserves case in pathPrefix', () => {
      const request = new Request('https://example.com/ja-JP/products');
      const locale = getLocaleFromRequest(request);

      expect(locale.pathPrefix).toBe('/JA-JP');
    });

    it('handles multiple path segments after locale', () => {
      const request = new Request('https://example.com/en-gb/collections/summer/shirts');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('EN');
      expect(locale.country).toBe('GB');
      expect(locale.pathPrefix).toBe('/EN-GB');
    });

    it('is case insensitive for locale matching', () => {
      const requests = [
        new Request('https://example.com/en-us/products'),
        new Request('https://example.com/EN-US/products'),
        new Request('https://example.com/En-Us/products'),
      ];

      requests.forEach((request) => {
        const locale = getLocaleFromRequest(request);
        expect(locale.language).toBe('EN');
        expect(locale.country).toBe('US');
      });
    });

    it('handles React Router 7 Single Fetch .data suffix', () => {
      const request = new Request('https://example.com/ar-ae.data?_routes=routes%2F%28%24locale%29');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('AR');
      expect(locale.country).toBe('AE');
      expect(locale.pathPrefix).toBe('/AR-AE');
    });

    it('handles .data suffix on root locale path', () => {
      const request = new Request('https://example.com/fr-fr.data');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('FR');
      expect(locale.country).toBe('FR');
      expect(locale.pathPrefix).toBe('/FR-FR');
    });

    it('handles .data suffix with nested paths', () => {
      const request = new Request('https://example.com/en-gb/products/shirt.data');
      const locale = getLocaleFromRequest(request);

      expect(locale.language).toBe('EN');
      expect(locale.country).toBe('GB');
      expect(locale.pathPrefix).toBe('/EN-GB');
    });
  });

  describe('useLocalePrefix', () => {
    it('returns empty string for paths without locale', async () => {
      const {useLocation} = await import('react-router');
      vi.mocked(useLocation).mockReturnValue({
        pathname: '/products',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const {result} = renderHook(() => useLocalePrefix());
      expect(result.current).toBe('');
    });

    it('returns locale prefix from pathname', async () => {
      const {useLocation} = await import('react-router');
      vi.mocked(useLocation).mockReturnValue({
        pathname: '/fr-ca/products',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const {result} = renderHook(() => useLocalePrefix());
      expect(result.current).toBe('/fr-ca');
    });

    it('handles uppercase locale in pathname', async () => {
      const {useLocation} = await import('react-router');
      vi.mocked(useLocation).mockReturnValue({
        pathname: '/EN-GB/products',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const {result} = renderHook(() => useLocalePrefix());
      expect(result.current).toBe('/en-gb');
    });

    it('returns empty for root path', async () => {
      const {useLocation} = await import('react-router');
      vi.mocked(useLocation).mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const {result} = renderHook(() => useLocalePrefix());
      expect(result.current).toBe('');
    });

    it('returns empty for invalid locale format', async () => {
      const {useLocation} = await import('react-router');
      vi.mocked(useLocation).mockReturnValue({
        pathname: '/invalid/products',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      });

      const {result} = renderHook(() => useLocalePrefix());
      expect(result.current).toBe('');
    });

    it('memoizes result based on pathname', async () => {
      const {useLocation} = await import('react-router');
      const mockLocation = {
        pathname: '/fr-ca/products',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      };
      vi.mocked(useLocation).mockReturnValue(mockLocation);

      const {result, rerender} = renderHook(() => useLocalePrefix());
      const firstResult = result.current;

      rerender();
      expect(result.current).toBe(firstResult);
    });
  });

  describe('getLocalePath', () => {
    it('returns path as-is when no locale prefix', () => {
      const result = getLocalePath('/products', '');
      expect(result).toBe('/products');
    });

    it('prepends locale prefix to path', () => {
      const result = getLocalePath('/products', '/fr-ca');
      expect(result).toBe('/fr-ca/products');
    });

    it('returns only prefix for root path', () => {
      const result = getLocalePath('/', '/fr-ca');
      expect(result).toBe('/fr-ca');
    });

    it('returns path as-is if already has locale prefix', () => {
      const result = getLocalePath('/fr-ca/products', '/fr-ca');
      expect(result).toBe('/fr-ca/products');
    });

    it('handles relative paths without leading slash', () => {
      const result = getLocalePath('products', '/fr-ca');
      expect(result).toBe('/fr-ca/products');
    });

    it('handles case-insensitive prefix matching', () => {
      const result = getLocalePath('/FR-CA/products', '/fr-ca');
      expect(result).toBe('/FR-CA/products');
    });

    it('normalizes path with leading slash when no prefix', () => {
      const result = getLocalePath('products', '');
      expect(result).toBe('/products');
    });

    it('handles empty string path with prefix', () => {
      const result = getLocalePath('', '/fr-ca');
      expect(result).toBe('/fr-ca');
    });

    it('handles paths that start with prefix in middle', () => {
      const result = getLocalePath('/products/fr-ca-special', '/fr-ca');
      expect(result).toBe('/fr-ca/products/fr-ca-special');
    });

    it('extracts path from myshopify.com URLs', () => {
      // This tests that absolute myshopify.com URLs are converted to relative paths
      const result = getLocalePath(
        'https://example.myshopify.com/collections/new-arrivals',
        '/ar-ae',
      );
      expect(result).toBe('/ar-ae/collections/new-arrivals');
    });

    it('handles myshopify.com URLs with query params', () => {
      const result = getLocalePath(
        'https://example.myshopify.com/products/shirt?variant=123',
        '/fr-fr',
      );
      expect(result).toBe('/fr-fr/products/shirt?variant=123');
    });

    it('treats non-myshopify external URLs as external', () => {
      const result = getLocalePath('https://google.com/search', '/en-us');
      expect(result).toBe('https://google.com/search');
    });

    it('handles myshopify.com root path', () => {
      const result = getLocalePath('https://example.myshopify.com/', '/ar-ae');
      expect(result).toBe('/ar-ae');
    });
  });
});

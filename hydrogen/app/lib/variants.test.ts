import {describe, it, expect, vi} from 'vitest';
import {renderHook} from '@testing-library/react';
import {getVariantUrl, useVariantUrl} from './variants';

// Mock useLocation for useVariantUrl tests
let mockPathname = '/products/test-product';

vi.mock('react-router', () => ({
  useLocation: () => ({pathname: mockPathname}),
}));

describe('variants', () => {
  describe('getVariantUrl', () => {
    it('builds basic product URL', () => {
      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other-product',
        searchParams: new URLSearchParams(),
      });

      expect(url).toBe('/products/test-product');
    });

    it('adds selected options as query params', () => {
      const selectedOptions = [
        {name: 'Size', value: 'Medium'},
        {name: 'Color', value: 'Blue'},
      ];

      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other-product',
        searchParams: new URLSearchParams(),
        selectedOptions,
      });

      expect(url).toContain('Size=Medium');
      expect(url).toContain('Color=Blue');
    });

    it('preserves existing search params', () => {
      const searchParams = new URLSearchParams({
        sort: 'price',
        filter: 'available',
      });

      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other-product',
        searchParams,
        selectedOptions: [{name: 'Size', value: 'Large'}],
      });

      expect(url).toContain('sort=price');
      expect(url).toContain('filter=available');
      expect(url).toContain('Size=Large');
    });

    it('handles locale prefix in pathname', () => {
      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/en-us/products/other-product',
        searchParams: new URLSearchParams(),
      });

      expect(url).toBe('/en-us/products/test-product');
    });

    it('handles different locale formats', () => {
      const locales = [
        {pathname: '/fr-fr/products/test', expected: '/fr-fr/products/test-product'},
        {pathname: '/de-DE/products/test', expected: '/de-DE/products/test-product'},
        {pathname: '/es-ES/products/test', expected: '/es-ES/products/test-product'},
      ];

      locales.forEach(({pathname, expected}) => {
        const url = getVariantUrl({
          handle: 'test-product',
          pathname,
          searchParams: new URLSearchParams(),
        });

        expect(url).toBe(expected);
      });
    });

    it('returns URL without query string when no params', () => {
      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other-product',
        searchParams: new URLSearchParams(),
      });

      expect(url).not.toContain('?');
    });

    it('returns URL with query string when params exist', () => {
      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other-product',
        searchParams: new URLSearchParams(),
        selectedOptions: [{name: 'Size', value: 'Small'}],
      });

      expect(url).toContain('?');
    });

    it('handles options with special characters', () => {
      const selectedOptions = [
        {name: 'Size', value: 'Extra Large'},
        {name: 'Color', value: 'Navy Blue'},
      ];

      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other-product',
        searchParams: new URLSearchParams(),
        selectedOptions,
      });

      expect(url).toContain('Size=Extra+Large');
      expect(url).toContain('Color=Navy+Blue');
    });

    it('overwrites existing option values', () => {
      const searchParams = new URLSearchParams({
        Size: 'Small',
        Color: 'Red',
      });

      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other-product',
        searchParams,
        selectedOptions: [
          {name: 'Size', value: 'Large'},
        ],
      });

      expect(url).toContain('Size=Large');
      expect(url).not.toContain('Size=Small');
      expect(url).toContain('Color=Red');
    });

    it('handles empty selected options', () => {
      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other-product',
        searchParams: new URLSearchParams(),
        selectedOptions: [],
      });

      expect(url).toBe('/products/test-product');
    });

    it('handles undefined selected options', () => {
      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other-product',
        searchParams: new URLSearchParams(),
        selectedOptions: undefined,
      });

      expect(url).toBe('/products/test-product');
    });

    it('handles product handles with special characters', () => {
      const url = getVariantUrl({
        handle: 'product-with-dashes-and_underscores',
        pathname: '/products/other',
        searchParams: new URLSearchParams(),
      });

      expect(url).toBe('/products/product-with-dashes-and_underscores');
    });

    it('does not add locale prefix when pathname has none', () => {
      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other-product',
        searchParams: new URLSearchParams(),
      });

      expect(url).toBe('/products/test-product');
      expect(url).not.toMatch(/^\/[a-z]{2}-[a-z]{2}\//i);
    });

    it('handles complex pathnames', () => {
      const url = getVariantUrl({
        handle: 'new-product',
        pathname: '/en-gb/collections/summer/products/old-product',
        searchParams: new URLSearchParams(),
      });

      expect(url).toBe('/en-gb/products/new-product');
    });

    it('builds correct URL with all features', () => {
      const searchParams = new URLSearchParams({
        utm_source: 'email',
      });

      const url = getVariantUrl({
        handle: 'featured-product',
        pathname: '/fr-fr/products/other',
        searchParams,
        selectedOptions: [
          {name: 'Size', value: 'Medium'},
          {name: 'Color', value: 'Black'},
        ],
      });

      expect(url).toBe('/fr-fr/products/featured-product?utm_source=email&Size=Medium&Color=Black');
    });

    it('handles case-sensitive locale matching', () => {
      const pathsWithLocale = [
        '/en-US/products/test',
        '/EN-us/products/test',
        '/eN-Us/products/test',
      ];

      pathsWithLocale.forEach((pathname) => {
        const url = getVariantUrl({
          handle: 'product',
          pathname,
          searchParams: new URLSearchParams(),
        });

        expect(url).toMatch(/^\/[a-zA-Z]{2}-[a-zA-Z]{2}\/products\/product$/);
      });
    });

    it('handles pathnames with query strings', () => {
      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other-product?existing=param',
        searchParams: new URLSearchParams(),
      });

      expect(url).toBe('/products/test-product');
    });

    it('handles multiple options with same value', () => {
      const selectedOptions = [
        {name: 'Size', value: 'Medium'},
        {name: 'Length', value: 'Medium'},
      ];

      const url = getVariantUrl({
        handle: 'test-product',
        pathname: '/products/other',
        searchParams: new URLSearchParams(),
        selectedOptions,
      });

      expect(url).toContain('Size=Medium');
      expect(url).toContain('Length=Medium');
    });
  });

  describe('useVariantUrl', () => {
    it('returns URL for product handle', () => {
      mockPathname = '/products/other-product';

      const {result} = renderHook(() => useVariantUrl('test-product'));

      expect(result.current).toBe('/products/test-product');
    });

    it('includes selected options in URL', () => {
      mockPathname = '/products/other-product';

      const selectedOptions = [
        {name: 'Size', value: 'Large'},
        {name: 'Color', value: 'Black'},
      ];

      const {result} = renderHook(() => useVariantUrl('test-product', selectedOptions));

      expect(result.current).toContain('Size=Large');
      expect(result.current).toContain('Color=Black');
    });

    it('preserves locale prefix from pathname', () => {
      mockPathname = '/en-us/products/other-product';

      const {result} = renderHook(() => useVariantUrl('test-product'));

      expect(result.current).toBe('/en-us/products/test-product');
    });

    it('memoizes result based on dependencies', () => {
      mockPathname = '/products/other-product';

      const {result, rerender} = renderHook(
        ({handle, options}) => useVariantUrl(handle, options),
        {initialProps: {handle: 'test-product', options: undefined}}
      );

      const firstResult = result.current;

      // Rerender with same props - should return same memoized value
      rerender({handle: 'test-product', options: undefined});

      expect(result.current).toBe(firstResult);
    });

    it('updates when handle changes', () => {
      mockPathname = '/products/other-product';

      const {result, rerender} = renderHook(
        ({handle}) => useVariantUrl(handle),
        {initialProps: {handle: 'product-a'}}
      );

      expect(result.current).toBe('/products/product-a');

      rerender({handle: 'product-b'});

      expect(result.current).toBe('/products/product-b');
    });

    it('handles undefined selected options', () => {
      mockPathname = '/products/other-product';

      const {result} = renderHook(() => useVariantUrl('test-product', undefined));

      expect(result.current).toBe('/products/test-product');
      expect(result.current).not.toContain('?');
    });
  });
});

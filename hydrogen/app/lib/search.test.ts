import {describe, it, expect} from 'vitest';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
} from './search';

describe('search', () => {
  describe('getEmptyPredictiveSearchResult', () => {
    it('returns empty result structure', () => {
      const result = getEmptyPredictiveSearchResult();

      expect(result.total).toBe(0);
      expect(result.items).toBeDefined();
    });

    it('returns empty arrays for all item types', () => {
      const result = getEmptyPredictiveSearchResult();

      expect(result.items.articles).toEqual([]);
      expect(result.items.collections).toEqual([]);
      expect(result.items.products).toEqual([]);
      expect(result.items.pages).toEqual([]);
      expect(result.items.queries).toEqual([]);
    });

    it('returns new object on each call', () => {
      const result1 = getEmptyPredictiveSearchResult();
      const result2 = getEmptyPredictiveSearchResult();

      expect(result1).not.toBe(result2);
      expect(result1.items).not.toBe(result2.items);
    });
  });

  describe('urlWithTrackingParams', () => {
    it('builds URL with search term', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        term: 'test query',
      });

      expect(url).toContain('/products?');
      // URLSearchParams encodes spaces as + (application/x-www-form-urlencoded)
      expect(url).toContain('q=test+query');
    });

    it('includes tracking parameters', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        trackingParams: 'utm_source=shopify&utm_medium=search',
        term: 'test',
      });

      expect(url).toContain('utm_source=shopify');
      expect(url).toContain('utm_medium=search');
    });

    it('includes extra params', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        params: {sort: 'price', filter: 'available'},
        term: 'test',
      });

      expect(url).toContain('sort=price');
      expect(url).toContain('filter=available');
    });

    it('combines all parameter types', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        trackingParams: 'utm_source=shopify',
        params: {category: 'shirts'},
        term: 'blue',
      });

      expect(url).toContain('q=blue');
      expect(url).toContain('category=shirts');
      expect(url).toContain('utm_source=shopify');
    });

    it('encodes search term', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        term: 'test & special / chars?',
      });

      // URLSearchParams encodes spaces as + (application/x-www-form-urlencoded)
      expect(url).toContain('q=test+%26+special+%2F+chars%3F');
    });

    it('handles empty search term', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        term: '',
      });

      expect(url).toContain('q=');
    });

    it('handles null tracking params', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        trackingParams: null,
        term: 'test',
      });

      expect(url).toBe('/products?q=test');
    });

    it('handles undefined tracking params', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        trackingParams: undefined,
        term: 'test',
      });

      expect(url).toBe('/products?q=test');
    });

    it('handles missing extra params', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        term: 'test',
      });

      expect(url).toBe('/products?q=test');
    });

    it('preserves base URL with query string', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products?existing=param',
        term: 'test',
      });

      // Should replace with new query string
      expect(url).toContain('/products?');
      expect(url).toContain('q=test');
    });

    it('handles base URL with trailing slash', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products/',
        term: 'test',
      });

      expect(url).toContain('/products/?');
      expect(url).toContain('q=test');
    });

    it('handles base URL without leading slash', () => {
      const url = urlWithTrackingParams({
        baseUrl: 'products',
        term: 'test',
      });

      expect(url).toBe('products?q=test');
    });

    it('handles complex tracking parameters', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        trackingParams: 'utm_source=shopify&utm_medium=search&utm_campaign=spring2024&utm_content=blue_shirts',
        term: 'shirt',
      });

      expect(url).toContain('utm_source=shopify');
      expect(url).toContain('utm_medium=search');
      expect(url).toContain('utm_campaign=spring2024');
      expect(url).toContain('utm_content=blue_shirts');
    });

    it('handles special characters in extra params', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        params: {'filter[color]': 'blue', 'filter[size]': 'medium'},
        term: 'test',
      });

      expect(url).toContain('filter');
      expect(url).toContain('blue');
      expect(url).toContain('medium');
    });

    it('orders parameters consistently', () => {
      const url1 = urlWithTrackingParams({
        baseUrl: '/products',
        params: {a: '1', b: '2'},
        term: 'test',
      });

      const url2 = urlWithTrackingParams({
        baseUrl: '/products',
        params: {b: '2', a: '1'},
        term: 'test',
      });

      // Both URLs should work (order may vary but both should be valid)
      expect(url1).toContain('a=1');
      expect(url1).toContain('b=2');
      expect(url2).toContain('a=1');
      expect(url2).toContain('b=2');
    });

    it('handles numeric values in params', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        params: {page: '2', limit: '10'},
        term: 'test',
      });

      expect(url).toContain('page=2');
      expect(url).toContain('limit=10');
    });

    it('appends tracking params at end', () => {
      const url = urlWithTrackingParams({
        baseUrl: '/products',
        params: {sort: 'price'},
        trackingParams: 'utm_source=test',
        term: 'query',
      });

      const queryStart = url.indexOf('?');
      const trackingStart = url.indexOf('utm_source');

      expect(trackingStart).toBeGreaterThan(queryStart);
    });
  });
});

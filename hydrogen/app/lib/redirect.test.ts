import {describe, it, expect, vi} from 'vitest';
import {redirectIfHandleIsLocalized} from './redirect';

// Mock react-router redirect
const mockRedirect = vi.fn((url: string) => {
  throw new Error(`Redirect to ${url}`);
});

vi.mock('react-router', () => ({
  redirect: (url: string) => mockRedirect(url),

  useLocation: vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  })),
  useRouteLoaderData: vi.fn(() => ({
    locale: 'en',
  })),
}));

describe('redirect', () => {
  describe('redirectIfHandleIsLocalized', () => {
    it('throws redirect when handle differs from data handle', () => {
      const request = new Request('https://example.com/products/english-handle');
      const resource = {
        handle: 'english-handle',
        data: {handle: 'localized-handle'},
      };

      expect(() => {
        redirectIfHandleIsLocalized(request, resource);
      }).toThrow('Redirect to https://example.com/products/localized-handle');
    });

    it('does not redirect when handles match', () => {
      const request = new Request('https://example.com/products/same-handle');
      const resource = {
        handle: 'same-handle',
        data: {handle: 'same-handle'},
      };

      expect(() => {
        redirectIfHandleIsLocalized(request, resource);
      }).not.toThrow();
    });

    it('handles multiple resources', () => {
      const request = new Request('https://example.com/collections/summer/products/shirt');
      const collection = {
        handle: 'summer',
        data: {handle: 'summer'},
      };
      const product = {
        handle: 'shirt',
        data: {handle: 'localized-shirt'},
      };

      expect(() => {
        redirectIfHandleIsLocalized(request, collection, product);
      }).toThrow('Redirect to https://example.com/collections/summer/products/localized-shirt');
    });

    it('replaces all mismatched handles', () => {
      const request = new Request('https://example.com/collections/col1/products/prod1');
      const collection = {
        handle: 'col1',
        data: {handle: 'localized-col'},
      };
      const product = {
        handle: 'prod1',
        data: {handle: 'localized-prod'},
      };

      expect(() => {
        redirectIfHandleIsLocalized(request, collection, product);
      }).toThrow('Redirect to https://example.com/collections/localized-col/products/localized-prod');
    });

    it('preserves query parameters', () => {
      const request = new Request('https://example.com/products/handle?sort=price&color=red');
      const resource = {
        handle: 'handle',
        data: {handle: 'localized-handle'},
      };

      expect(() => {
        redirectIfHandleIsLocalized(request, resource);
      }).toThrow('Redirect to https://example.com/products/localized-handle?sort=price&color=red');
    });

    it('preserves hash fragments', () => {
      const request = new Request('https://example.com/products/handle#details');
      const resource = {
        handle: 'handle',
        data: {handle: 'localized-handle'},
      };

      expect(() => {
        redirectIfHandleIsLocalized(request, resource);
      }).toThrow('Redirect to https://example.com/products/localized-handle#details');
    });

    it('handles locale prefixes in path', () => {
      const request = new Request('https://example.com/en-us/products/handle');
      const resource = {
        handle: 'handle',
        data: {handle: 'localized-handle'},
      };

      expect(() => {
        redirectIfHandleIsLocalized(request, resource);
      }).toThrow('Redirect to https://example.com/en-us/products/localized-handle');
    });

    it('does not redirect when no resources provided', () => {
      const request = new Request('https://example.com/products/handle');

      expect(() => {
        redirectIfHandleIsLocalized(request);
      }).not.toThrow();
    });

    it('handles empty array of resources', () => {
      const request = new Request('https://example.com/products/handle');

      expect(() => {
        redirectIfHandleIsLocalized(request, ...[] as any);
      }).not.toThrow();
    });

    it('handles resources with additional data properties', () => {
      const request = new Request('https://example.com/products/handle');
      const resource = {
        handle: 'handle',
        data: {
          handle: 'localized-handle',
          title: 'Product Title',
          id: '123',
        },
      };

      expect(() => {
        redirectIfHandleIsLocalized(request, resource);
      }).toThrow('Redirect to https://example.com/products/localized-handle');
    });

    it('only redirects once even with multiple mismatches', () => {
      const request = new Request('https://example.com/a/b/c');
      const r1 = {handle: 'a', data: {handle: 'x'}};
      const r2 = {handle: 'b', data: {handle: 'y'}};
      const r3 = {handle: 'c', data: {handle: 'z'}};

      expect(() => {
        redirectIfHandleIsLocalized(request, r1, r2, r3);
      }).toThrow();

      // Should only throw once (redirect throws)
      expect(mockRedirect).toHaveBeenCalledTimes(1);
      mockRedirect.mockClear();
    });

    it('handles handles with special characters', () => {
      const request = new Request('https://example.com/products/handle-with-dashes');
      const resource = {
        handle: 'handle-with-dashes',
        data: {handle: 'localized-handle-with-dashes'},
      };

      expect(() => {
        redirectIfHandleIsLocalized(request, resource);
      }).toThrow('Redirect to https://example.com/products/localized-handle-with-dashes');
    });

    it('is case sensitive for handle matching', () => {
      const request = new Request('https://example.com/products/Handle');
      const resource = {
        handle: 'Handle',
        data: {handle: 'handle'},
      };

      expect(() => {
        redirectIfHandleIsLocalized(request, resource);
      }).toThrow('Redirect to https://example.com/products/handle');
    });
  });
});

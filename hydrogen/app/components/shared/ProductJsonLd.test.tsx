/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {ProductJsonLd} from './ProductJsonLd';
import {createFullProduct, createFullProductVariant, createMoney} from '@test/mocks';

// Create typed mock data using factories
const mockProduct = createFullProduct({
  id: 'gid://shopify/Product/1',
  title: 'Summer Dress',
  description: 'A beautiful summer dress perfect for any occasion',
  vendor: 'Fashion Brand',
  media: {
    nodes: [
      {
        __typename: 'MediaImage' as const,
        id: 'media-1',
        image: {
          id: 'image-1',
          url: 'https://example.com/image1.jpg',
          altText: 'Front view',
          width: 800,
          height: 1000,
        },
      },
      {
        __typename: 'MediaImage' as const,
        id: 'media-2',
        image: {
          id: 'image-2',
          url: 'https://example.com/image2.jpg',
          altText: 'Back view',
          width: 800,
          height: 1000,
        },
      },
    ],
  },
});

const mockVariant = createFullProductVariant({
  id: 'gid://shopify/ProductVariant/1',
  sku: 'SD-001',
  availableForSale: true,
  price: createMoney({amount: '89.99', currencyCode: 'USD'}),
  compareAtPrice: null,
});

const mockUrl = 'https://example.com/products/summer-dress';

describe('ProductJsonLd', () => {
  describe('Basic rendering', () => {
    it('renders script tag with JSON-LD', () => {
      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();
    });

    it('includes correct @context and @type', () => {
      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('Product');
    });
  });

  describe('Product information', () => {
    it('includes product name', () => {
      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.name).toBe('Summer Dress');
    });

    it('includes product description', () => {
      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.description).toBe('A beautiful summer dress perfect for any occasion');
    });

    it('includes product images', () => {
      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.image).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);
    });

    it('handles product without images', () => {
      const productWithoutImages = createFullProduct({
        ...mockProduct,
        media: {nodes: []},
      });

      const {container} = render(
        <ProductJsonLd
          product={productWithoutImages}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.image).toEqual([]);
    });
  });

  describe('Brand information', () => {
    it('includes brand when vendor is present', () => {
      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.brand).toEqual({
        '@type': 'Brand',
        name: 'Fashion Brand',
      });
    });

    it('excludes brand when vendor is not present', () => {
      const productWithoutVendor = {
        ...mockProduct,
        vendor: null,
      };

      const {container} = render(
        <ProductJsonLd
          product={productWithoutVendor}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.brand).toBeUndefined();
    });
  });

  describe('SKU', () => {
    it('includes SKU when present', () => {
      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.sku).toBe('SD-001');
    });

    it('excludes SKU when not present', () => {
      const variantWithoutSku = {
        ...mockVariant,
        sku: null,
      };

      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={variantWithoutSku}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.sku).toBeUndefined();
    });
  });

  describe('Offer information', () => {
    it('includes offer details', () => {
      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.offers['@type']).toBe('Offer');
      expect(jsonLd.offers.url).toBe(mockUrl);
      expect(jsonLd.offers.priceCurrency).toBe('USD');
      expect(jsonLd.offers.price).toBe('89.99');
    });

    it('shows InStock when available for sale', () => {
      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.offers.availability).toBe('https://schema.org/InStock');
    });

    it('shows OutOfStock when not available for sale', () => {
      const unavailableVariant = {
        ...mockVariant,
        availableForSale: false,
      };

      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={unavailableVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.offers.availability).toBe('https://schema.org/OutOfStock');
    });

    it('defaults to USD when currency not specified', () => {
      const variantWithoutCurrency = {
        ...mockVariant,
        price: {
          amount: '89.99',
          currencyCode: null,
        },
      };

      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={variantWithoutCurrency}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.offers.priceCurrency).toBe('USD');
    });

    it('defaults to 0 when price not specified', () => {
      const variantWithoutPrice = {
        ...mockVariant,
        price: null,
      };

      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={variantWithoutPrice}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.offers.price).toBe('0');
    });
  });

  describe('Compare at price', () => {
    it('includes priceValidUntil when compareAtPrice present', () => {
      const variantWithComparePrice = {
        ...mockVariant,
        compareAtPrice: {
          amount: '129.99',
          currencyCode: 'USD',
        },
      };

      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={variantWithComparePrice}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.offers.priceValidUntil).toBeDefined();
      // Should be 30 days from now in ISO format
      expect(jsonLd.offers.priceValidUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('excludes priceValidUntil when no compareAtPrice', () => {
      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.offers.priceValidUntil).toBeUndefined();
    });

    it('sets priceValidUntil to 30 days from now', () => {
      const variantWithComparePrice = {
        ...mockVariant,
        compareAtPrice: {
          amount: '129.99',
          currencyCode: 'USD',
        },
      };

      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={variantWithComparePrice}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      const validUntil = new Date(jsonLd.offers.priceValidUntil);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now);
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      // Check if dates are within 1 day (allowing for timezone and execution time differences)
      const daysDifference = Math.abs(
        (validUntil.getTime() - thirtyDaysFromNow.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(daysDifference).toBeLessThan(1);
    });
  });

  describe('JSON cleanup', () => {
    it('removes undefined values from final JSON', () => {
      const minimalProduct = {
        ...mockProduct,
        vendor: null,
      };

      const minimalVariant = {
        ...mockVariant,
        sku: null,
      };

      const {container} = render(
        <ProductJsonLd
          product={minimalProduct}
          selectedVariant={minimalVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.brand).toBeUndefined();
      expect(jsonLd.sku).toBeUndefined();
    });

    it('produces valid JSON', () => {
      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={mockVariant}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');

      expect(() => JSON.parse(script?.innerHTML || '{}')).not.toThrow();
    });
  });

  describe('Different currencies', () => {
    it('handles different currency codes', () => {
      const variantWithEUR = {
        ...mockVariant,
        price: {
          amount: '79.99',
          currencyCode: 'EUR',
        },
      };

      const {container} = render(
        <ProductJsonLd
          product={mockProduct}
          selectedVariant={variantWithEUR}
          url={mockUrl}
        />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.innerHTML || '{}');

      expect(jsonLd.offers.priceCurrency).toBe('EUR');
    });
  });
});

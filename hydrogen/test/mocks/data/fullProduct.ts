/**
 * Full Product Factory for test data generation
 *
 * Creates ProductFragment type data for PDP/product detail tests.
 * Uses generated types from storefrontapi.generated for type safety.
 */

import type {ProductFragment} from 'storefrontapi.generated';
import {createMoney, createProductImage} from './products';

// Extract nested types from ProductFragment
type ProductVariant = NonNullable<
  ProductFragment['selectedOrFirstAvailableVariant']
>;
type ProductOption = ProductFragment['options'][number];
type MediaNode = ProductFragment['media']['nodes'][number];

// Helper to create MediaImage node
function createMediaImageNode(
  overrides: {
    id?: string;
    url?: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } = {},
): Extract<MediaNode, {__typename: 'MediaImage'}> {
  const imageId = overrides.id || `image-${Math.random().toString(36).slice(2, 9)}`;
  return {
    __typename: 'MediaImage' as const,
    id: imageId,
    image: {
      id: imageId,
      url: overrides.url || `https://cdn.shopify.com/test/${imageId}.jpg`,
      altText: overrides.altText ?? 'Product image',
      width: overrides.width ?? 800,
      height: overrides.height ?? 1000,
    },
  };
}

// Create a full product variant
export function createFullProductVariant(
  overrides: Partial<ProductVariant> = {},
): ProductVariant {
  const id = overrides.id || `variant-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    availableForSale: true,
    sku: 'TEST-SKU-001',
    title: 'Default Title',
    price: createMoney(),
    compareAtPrice: null,
    selectedOptions: [
      {name: 'Size', value: 'M'},
      {name: 'Color', value: 'Black'},
    ],
    image: createProductImage(),
    product: {
      id: `product-${id}`,
      title: 'Test Product',
      handle: 'test-product',
    },
    ...overrides,
  } as ProductVariant;
}

// Create a product option
export function createProductOption(
  overrides: Partial<ProductOption> = {},
): ProductOption {
  return {
    name: overrides.name || 'Size',
    optionValues: overrides.optionValues || [
      {
        name: 'S',
        firstSelectableVariant: createFullProductVariant({title: 'S / Black'}),
        swatch: null,
      },
      {
        name: 'M',
        firstSelectableVariant: createFullProductVariant({title: 'M / Black'}),
        swatch: null,
      },
      {
        name: 'L',
        firstSelectableVariant: createFullProductVariant({title: 'L / Black'}),
        swatch: null,
      },
    ],
    ...overrides,
  } as ProductOption;
}

// Create a full ProductFragment
export function createFullProduct(
  overrides: Partial<ProductFragment> = {},
): ProductFragment {
  const id = overrides.id || `product-${Math.random().toString(36).slice(2, 9)}`;
  const handle = overrides.handle || `test-product-${id.slice(-6)}`;

  const defaultMedia = [
    createMediaImageNode({id: `media-1-${id}`}),
    createMediaImageNode({id: `media-2-${id}`}),
  ];

  const defaultVariant = createFullProductVariant({
    product: {id, title: 'Test Product', handle},
  });

  return {
    id,
    title: 'Test Product',
    handle,
    vendor: 'Test Vendor',
    description: 'A test product description for testing purposes.',
    descriptionHtml: '<p>A test product description for testing purposes.</p>',
    encodedVariantExistence: '',
    encodedVariantAvailability: '',
    featuredImage: createProductImage(),
    media: {
      nodes: overrides.media?.nodes ?? defaultMedia,
    },
    options: overrides.options ?? [
      createProductOption({name: 'Size'}),
      createProductOption({
        name: 'Color',
        optionValues: [
          {
            name: 'Black',
            firstSelectableVariant: createFullProductVariant({title: 'M / Black'}),
            swatch: null,
          },
          {
            name: 'White',
            firstSelectableVariant: createFullProductVariant({title: 'M / White'}),
            swatch: null,
          },
        ],
      }),
    ],
    selectedOrFirstAvailableVariant:
      overrides.selectedOrFirstAvailableVariant ?? defaultVariant,
    adjacentVariants: overrides.adjacentVariants ?? [],
    seo: overrides.seo ?? {title: 'Test Product | Store', description: 'SEO description'},
    ...overrides,
  } as ProductFragment;
}

// Specialized factories
export function createSaleFullProduct(discountPercent = 20): ProductFragment {
  const originalPrice = 100;
  const salePrice = originalPrice * (1 - discountPercent / 100);

  return createFullProduct({
    selectedOrFirstAvailableVariant: createFullProductVariant({
      price: createMoney({amount: salePrice.toFixed(2)}),
      compareAtPrice: createMoney({amount: originalPrice.toFixed(2)}),
    }),
  });
}

export function createSoldOutFullProduct(): ProductFragment {
  return createFullProduct({
    selectedOrFirstAvailableVariant: createFullProductVariant({
      availableForSale: false,
    }),
  });
}

// Export types
export type {ProductVariant, ProductOption, MediaNode};

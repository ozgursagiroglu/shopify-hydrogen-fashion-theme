/**
 * Product Factory for test data generation
 *
 * Uses generated types from storefrontapi.generated for type safety
 * and consistency with actual GraphQL responses.
 */

import type {
  ProductCardFragment,
  MoneyFragment,
} from 'storefrontapi.generated';

// Re-export generated types for convenience
type MoneyV2 = MoneyFragment;
type ProductImage = NonNullable<ProductCardFragment['featuredImage']>;
type MediaNode = ProductCardFragment['media']['nodes'][number];

// Helper type for creating MediaImage nodes
type MediaImageNode = Extract<MediaNode, {__typename: 'MediaImage'}>;

// Helper function to create MediaImage node from ProductImage
function createMediaImageNode(image: ProductImage, fallbackId: string): MediaImageNode {
  return {
    __typename: 'MediaImage' as const,
    id: (image.id ?? fallbackId) as string,
    image: image,
  };
}

// Extended product type for test factories (includes additional fields useful in tests)
interface Product extends ProductCardFragment {
  description?: string;
  descriptionHtml?: string;
  options?: Array<{name: string; values: string[]}>;
}

// Factory functions with defaults and overrides
export function createMoney(overrides: Partial<MoneyV2> = {}): MoneyV2 {
  return {
    amount: '99.00',
    currencyCode: 'USD',
    ...overrides,
  };
}

export function createProductImage(overrides: Partial<ProductImage> = {}): ProductImage {
  const id = overrides.id || `image-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    url: `https://cdn.shopify.com/test/${id}.jpg`,
    altText: 'Product image',
    width: 800,
    height: 1000,
    ...overrides,
  };
}

// ProductCardFragment only includes minimal variant info
type ProductVariant = ProductCardFragment['variants']['nodes'][number];

export function createProductVariant(
  overrides: Partial<ProductVariant> = {},
): ProductVariant {
  const id = overrides.id || `variant-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    availableForSale: true,
    ...overrides,
  };
}

export function createProduct(overrides: Partial<Product> = {}): Product {
  const id = overrides.id || `product-${Math.random().toString(36).slice(2, 9)}`;
  const handle = overrides.handle || `test-product-${id.slice(-6)}`;
  const featuredImage =
    overrides.featuredImage === undefined
      ? createProductImage()
      : overrides.featuredImage;

  return {
    id,
    handle,
    title: 'Test Product',
    vendor: 'Test Vendor',
    tags: [],
    availableForSale: true,
    featuredImage,
    priceRange: {
      minVariantPrice: createMoney(),
      maxVariantPrice: createMoney({amount: '149.00'}),
    },
    compareAtPriceRange: {
      minVariantPrice: createMoney({amount: '0.00'}),
    },
    variants: {
      nodes: [createProductVariant()],
    },
    media: {
      nodes: featuredImage
        ? [createMediaImageNode(featuredImage, `media-${id}`)]
        : [],
    },
    // Extended fields for testing
    description: 'A test product description.',
    descriptionHtml: '<p>A test product description.</p>',
    options: [
      {name: 'Size', values: ['S', 'M', 'L']},
      {name: 'Color', values: ['Black', 'White']},
    ],
    ...overrides,
  };
}

// Specialized product factories
export function createSaleProduct(discountPercent = 20): Product {
  const originalPrice = 100;
  const salePrice = originalPrice * (1 - discountPercent / 100);

  return createProduct({
    priceRange: {
      minVariantPrice: createMoney({amount: salePrice.toFixed(2)}),
      maxVariantPrice: createMoney({amount: salePrice.toFixed(2)}),
    },
    compareAtPriceRange: {
      minVariantPrice: createMoney({amount: originalPrice.toFixed(2)}),
    },
    tags: ['sale'],
  });
}

export function createNewProduct(): Product {
  return createProduct({
    tags: ['new', 'New'],
  });
}

export function createLimitedProduct(): Product {
  return createProduct({
    tags: ['limited', 'Limited Edition'],
  });
}

export function createSoldOutProduct(): Product {
  return createProduct({
    availableForSale: false,
    variants: {
      nodes: [createProductVariant({availableForSale: false})],
    },
  });
}

export function createProductWithMultipleImages(imageCount = 4): Product {
  const images = Array.from({length: imageCount}, (_, i) =>
    createProductImage({id: `image-${i}`, altText: `Product image ${i + 1}`}),
  );

  return createProduct({
    featuredImage: images[0],
    media: {
      nodes: images.map((img, i) => createMediaImageNode(img, `media-${i}`)),
    },
  });
}

// Collection product uses the same ProductCardFragment
export function createCollectionProduct(
  overrides: Partial<ProductCardFragment> = {},
): ProductCardFragment {
  const product = createProduct(overrides as Partial<Product>);
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    vendor: product.vendor,
    tags: product.tags,
    availableForSale: product.availableForSale,
    featuredImage: product.featuredImage,
    priceRange: product.priceRange,
    compareAtPriceRange: product.compareAtPriceRange,
    variants: product.variants,
    media: product.media,
    ...overrides,
  };
}

// Export types for external use
export type {MoneyV2, ProductImage, ProductVariant, Product, MediaNode};
// Re-export generated type for convenience
export type {ProductCardFragment};

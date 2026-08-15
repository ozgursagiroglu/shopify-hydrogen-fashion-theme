import {useMemo} from 'react';
import type {ProductFragment} from 'storefrontapi.generated';

interface ProductJsonLdProps {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  url: string;
}

export function ProductJsonLd({product, selectedVariant, url}: ProductJsonLdProps) {
  // Memoize the priceValidUntil date - Date.now() is intentionally used once
  /* eslint-disable react-hooks/purity -- Date.now() is intentional for initial price validity */
  const priceValidUntil = useMemo(() => {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
  }, []);
  /* eslint-enable react-hooks/purity */
  // Extract image URLs from media nodes (only MediaImage types have images)
  const imageUrls: string[] = [];
  product.media?.nodes?.forEach((node) => {
    if (node.__typename === 'MediaImage' && 'image' in node && node.image?.url) {
      imageUrls.push(node.image.url);
    }
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: imageUrls,
    brand: product.vendor
      ? {
          '@type': 'Brand',
          name: product.vendor,
        }
      : undefined,
    sku: selectedVariant?.sku || undefined,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: selectedVariant?.price?.currencyCode || 'USD',
      price: selectedVariant?.price?.amount || '0',
      availability: selectedVariant?.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      ...(selectedVariant?.compareAtPrice && {
        priceValidUntil,
      }),
    },
  };

  // Remove undefined values
  const cleanedJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(cleanedJsonLd)}}
    />
  );
}

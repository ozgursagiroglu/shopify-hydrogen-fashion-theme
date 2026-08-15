import {cn} from '~/lib/cn';
import {useRecentlyViewed} from '~/context/RecentlyViewedContext';
import {ProductGrid} from './ProductGrid';
import {SectionHeader} from '~/components/ui';

export interface RecentlyViewedProps {
  /** Current product handle to exclude from the list */
  excludeHandle?: string;
  /** Maximum number of items to display */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
}

/**
 * Maps a RecentlyViewed item to a ProductCard-compatible product structure
 */
function mapToProductCardFormat(item: {
  id: string;
  handle: string;
  title: string;
  vendor?: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  };
  image?: {
    url: string;
    altText?: string;
  };
}) {
  return {
    id: item.id,
    handle: item.handle,
    title: item.title,
    vendor: item.vendor,
    featuredImage: item.image
      ? {
          url: item.image.url,
          altText: item.image.altText || null,
          id: `${item.id}-image`,
          width: 800,
          height: 1067, // 3:4 aspect ratio
        }
      : null,
    priceRange: {
      minVariantPrice: item.price,
    },
    compareAtPriceRange: item.compareAtPrice
      ? {
          minVariantPrice: item.compareAtPrice,
        }
      : null,
  };
}

export function RecentlyViewed({
  excludeHandle,
  maxItems = 6,
  className,
  title = 'Recently Viewed',
  subtitle,
}: RecentlyViewedProps) {
  const {items} = useRecentlyViewed();

  // Filter out current product and limit items
  const displayItems = items
    .filter((item) => item.handle !== excludeHandle)
    .slice(0, maxItems);

  if (displayItems.length === 0) {
    return null;
  }

  // Map items to ProductCard-compatible format
  const products = displayItems.map(mapToProductCardFormat);

  return (
    <section className={cn('py-12 md:py-16', className)}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        className="mb-8 md:mb-12"
      />
      <ProductGrid
        products={products as any}
        columns={6}
        showVendor={true}
      />
    </section>
  );
}

import {Suspense} from 'react';
import {Await} from 'react-router';
import {ProductGrid} from './ProductGrid';
import {SectionHeader} from '~/components/ui';
import {ClientOnly} from '~/components/shared';
import {cn} from '~/lib/cn';
import type {ProductCardProps} from './ProductCard';
import {useTranslation} from 'react-i18next';

// Related product type - matches the RELATED_PRODUCTS_QUERY shape
type RelatedProduct = ProductCardProps['product'];

// Skeleton loader for related products
function RelatedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {Array.from({length: 4}, (_, i) => `skeleton-${i}`).map((key) => (
        <div key={key} className="animate-pulse">
          <div className="aspect-3/4 bg-surface-hover rounded-lg mb-3" />
          <div className="h-4 bg-surface-hover rounded w-3/4 mb-2" />
          <div className="h-4 bg-surface-hover rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export interface RelatedProductsProps {
  title?: string;
  subtitle?: string;
  products?: Promise<{products: {nodes: RelatedProduct[]}} | null>;
  currentProductId?: string;
  className?: string;
}

export function RelatedProducts({
  title,
  subtitle,
  products,
  currentProductId,
  className,
}: RelatedProductsProps) {
  const {t} = useTranslation();
  const displayTitle = title ?? t('product.relatedProducts.title');
  const displaySubtitle = subtitle ?? t('product.relatedProducts.subtitle');

  if (!products) return null;

  return (
    <section className={cn('py-12 md:py-16', className)}>
      <SectionHeader
        title={displayTitle}
        subtitle={displaySubtitle}
        className="mb-8 md:mb-12"
      />
      <ClientOnly fallback={<RelatedProductsSkeleton />}>
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <Await resolve={products}>
            {(response) => {
              if (!response?.products?.nodes?.length) return null;

              // Filter out the current product
              const filteredProducts = currentProductId
                ? response.products.nodes.filter(
                    (product) => product.id !== currentProductId,
                  )
                : response.products.nodes;

              if (filteredProducts.length === 0) return null;

              return (
                <ProductGrid
                  products={filteredProducts.slice(0, 4)}
                  columns={4}
                />
              );
            }}
          </Await>
        </Suspense>
      </ClientOnly>
    </section>
  );
}

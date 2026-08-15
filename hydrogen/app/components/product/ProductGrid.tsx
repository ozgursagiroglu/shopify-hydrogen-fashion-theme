import {cn} from '~/lib/cn';
import {ProductCard, type ProductCardProps} from './ProductCard';

export interface ProductGridProps {
  products: ProductCardProps['product'][];
  columns?: 2 | 3 | 4 | 6;
  loading?: 'eager' | 'lazy';
  className?: string;
  showVendor?: boolean;
}

const columnStyles = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
};

export function ProductGrid({
  products,
  columns = 4,
  loading = 'lazy',
  className,
  showVendor = true,
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12',
        columnStyles[columns],
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          loading={index < 4 ? 'eager' : loading}
          showVendor={showVendor}
        />
      ))}
    </div>
  );
}

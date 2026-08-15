/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ProductGrid} from './ProductGrid';
import type {ProductCardProps} from './ProductCard';

// Mock ProductCard
vi.mock('./ProductCard', () => ({
  ProductCard: ({product, loading, showVendor}: {product: any; loading?: string; showVendor?: boolean}) => (
    <div
      data-testid={`product-card-${product.id}`}
      data-loading={loading}
      data-show-vendor={showVendor}
    >
      {product.title}
    </div>
  ),
}));

describe('ProductGrid', () => {
  const createMockProduct = (id: string, title: string): ProductCardProps['product'] => ({
    id,
    title,
    handle: `product-${id}`,
    vendor: 'Test Vendor',
    featuredImage: {
      id: `image-${id}`,
      url: `https://example.com/image-${id}.jpg`,
      altText: title,
      width: 800,
      height: 1067,
    },
    priceRange: {
      minVariantPrice: {
        amount: '99.00',
        currencyCode: 'USD',
      },
    },
  });

  const mockProducts = [
    createMockProduct('1', 'Product 1'),
    createMockProduct('2', 'Product 2'),
    createMockProduct('3', 'Product 3'),
    createMockProduct('4', 'Product 4'),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all products', () => {
      render(<ProductGrid products={mockProducts} />);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Product 3')).toBeInTheDocument();
      expect(screen.getByText('Product 4')).toBeInTheDocument();
    });

    it('renders correct number of ProductCard components', () => {
      render(<ProductGrid products={mockProducts} />);

      expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-3')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-4')).toBeInTheDocument();
    });

    it('renders single product', () => {
      render(<ProductGrid products={[mockProducts[0]]} />);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('shows empty state when no products', () => {
      render(<ProductGrid products={[]} />);

      expect(screen.getByText('No products found')).toBeInTheDocument();
    });

    it('shows empty state when products is null', () => {
      render(<ProductGrid products={null as any} />);

      expect(screen.getByText('No products found')).toBeInTheDocument();
    });

    it('shows empty state when products is undefined', () => {
      render(<ProductGrid products={undefined as any} />);

      expect(screen.getByText('No products found')).toBeInTheDocument();
    });

    it('applies correct styling to empty state', () => {
      const {container} = render(<ProductGrid products={[]} />);

      const emptyState = container.querySelector('.text-center.py-12.text-text-muted');
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe('Column layouts', () => {
    it('renders 2 column layout', () => {
      const {container} = render(<ProductGrid products={mockProducts} columns={2} />);

      const grid = container.querySelector('.grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('renders 3 column layout', () => {
      const {container} = render(<ProductGrid products={mockProducts} columns={3} />);

      const grid = container.querySelector('.grid-cols-2.md\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('renders 4 column layout by default', () => {
      const {container} = render(<ProductGrid products={mockProducts} />);

      const grid = container.querySelector('.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4');
      expect(grid).toBeInTheDocument();
    });

    it('renders 6 column layout', () => {
      const {container} = render(<ProductGrid products={mockProducts} columns={6} />);

      const grid = container.querySelector('.grid-cols-2.sm\\:grid-cols-3.md\\:grid-cols-4.lg\\:grid-cols-6');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Loading behavior', () => {
    it('applies eager loading to first 4 products', () => {
      const manyProducts = Array.from({length: 8}, (_, i) =>
        createMockProduct(`${i + 1}`, `Product ${i + 1}`)
      );

      render(<ProductGrid products={manyProducts} />);

      // First 4 should have eager loading
      expect(screen.getByTestId('product-card-1')).toHaveAttribute('data-loading', 'eager');
      expect(screen.getByTestId('product-card-2')).toHaveAttribute('data-loading', 'eager');
      expect(screen.getByTestId('product-card-3')).toHaveAttribute('data-loading', 'eager');
      expect(screen.getByTestId('product-card-4')).toHaveAttribute('data-loading', 'eager');
    });

    it('applies lazy loading to products after index 4', () => {
      const manyProducts = Array.from({length: 8}, (_, i) =>
        createMockProduct(`${i + 1}`, `Product ${i + 1}`)
      );

      render(<ProductGrid products={manyProducts} />);

      // Products after index 4 should have lazy loading
      expect(screen.getByTestId('product-card-5')).toHaveAttribute('data-loading', 'lazy');
      expect(screen.getByTestId('product-card-6')).toHaveAttribute('data-loading', 'lazy');
    });

    it('respects custom loading prop', () => {
      render(<ProductGrid products={mockProducts} loading="eager" />);

      // First 4 still get eager, but default changes for rest
      expect(screen.getByTestId('product-card-1')).toHaveAttribute('data-loading', 'eager');
    });
  });

  describe('Vendor display', () => {
    it('shows vendor by default', () => {
      render(<ProductGrid products={mockProducts} />);

      expect(screen.getByTestId('product-card-1')).toHaveAttribute('data-show-vendor', 'true');
    });

    it('hides vendor when showVendor is false', () => {
      render(<ProductGrid products={mockProducts} showVendor={false} />);

      expect(screen.getByTestId('product-card-1')).toHaveAttribute('data-show-vendor', 'false');
    });

    it('passes showVendor to all products', () => {
      render(<ProductGrid products={mockProducts} showVendor={false} />);

      mockProducts.forEach((product) => {
        expect(screen.getByTestId(`product-card-${product.id}`))
          .toHaveAttribute('data-show-vendor', 'false');
      });
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const {container} = render(
        <ProductGrid products={mockProducts} className="custom-grid" />
      );

      const grid = container.querySelector('.custom-grid');
      expect(grid).toBeInTheDocument();
    });

    it('preserves default classes when custom className is applied', () => {
      const {container} = render(
        <ProductGrid products={mockProducts} className="custom-grid" />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Grid spacing', () => {
    it('applies correct gap classes', () => {
      const {container} = render(<ProductGrid products={mockProducts} />);

      const grid = container.querySelector('.gap-x-4.gap-y-8');
      expect(grid).toBeInTheDocument();
    });

    it('applies responsive gap classes', () => {
      const {container} = render(<ProductGrid products={mockProducts} />);

      const grid = container.querySelector('.md\\:gap-x-6.md\\:gap-y-12');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Product keys', () => {
    it('uses product id as key', () => {
      render(<ProductGrid products={mockProducts} />);

      mockProducts.forEach((product) => {
        expect(screen.getByTestId(`product-card-${product.id}`)).toBeInTheDocument();
      });
    });

    it('handles products with duplicate titles', () => {
      const duplicateProducts = [
        createMockProduct('1', 'Same Title'),
        createMockProduct('2', 'Same Title'),
      ];

      render(<ProductGrid products={duplicateProducts} />);

      expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-2')).toBeInTheDocument();
    });
  });

  describe('Large product lists', () => {
    it('renders many products efficiently', () => {
      const manyProducts = Array.from({length: 50}, (_, i) =>
        createMockProduct(`${i + 1}`, `Product ${i + 1}`)
      );

      render(<ProductGrid products={manyProducts} />);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 50')).toBeInTheDocument();
    });

    it('applies eager loading only to first 4 items in large list', () => {
      const manyProducts = Array.from({length: 20}, (_, i) =>
        createMockProduct(`${i + 1}`, `Product ${i + 1}`)
      );

      render(<ProductGrid products={manyProducts} />);

      expect(screen.getByTestId('product-card-1')).toHaveAttribute('data-loading', 'eager');
      expect(screen.getByTestId('product-card-4')).toHaveAttribute('data-loading', 'eager');
      expect(screen.getByTestId('product-card-5')).toHaveAttribute('data-loading', 'lazy');
      expect(screen.getByTestId('product-card-20')).toHaveAttribute('data-loading', 'lazy');
    });
  });

  describe('Edge cases', () => {
    it('handles products with missing featured images', () => {
      const productsWithoutImages = mockProducts.map(p => ({
        ...p,
        featuredImage: null,
      }));

      render(<ProductGrid products={productsWithoutImages} />);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    it('handles products with special characters in titles', () => {
      const specialProducts = [
        createMockProduct('1', 'Product & "Special" <Characters>'),
      ];

      render(<ProductGrid products={specialProducts} />);

      expect(screen.getByText('Product & "Special" <Characters>')).toBeInTheDocument();
    });

    it('handles single product in multi-column layout', () => {
      const {container} = render(
        <ProductGrid products={[mockProducts[0]]} columns={4} />
      );

      const grid = container.querySelector('.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4');
      expect(grid).toBeInTheDocument();
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('has mobile-friendly grid classes', () => {
      const {container} = render(<ProductGrid products={mockProducts} columns={4} />);

      // Should start with 2 columns on mobile
      const grid = container.querySelector('.grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('has tablet-friendly grid classes', () => {
      const {container} = render(<ProductGrid products={mockProducts} columns={4} />);

      // Should have 3 columns on tablet
      const grid = container.querySelector('.md\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('has desktop-friendly grid classes', () => {
      const {container} = render(<ProductGrid products={mockProducts} columns={4} />);

      // Should have 4 columns on desktop
      const grid = container.querySelector('.lg\\:grid-cols-4');
      expect(grid).toBeInTheDocument();
    });
  });
});

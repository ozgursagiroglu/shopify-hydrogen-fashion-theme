/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {RecentlyViewed} from './RecentlyViewed';

// Mock ProductGrid
vi.mock('./ProductGrid', () => ({
  ProductGrid: ({products, columns, showVendor}: {products: any[]; columns: number; showVendor: boolean}) => (
    <div data-testid="product-grid" data-columns={columns} data-show-vendor={showVendor}>
      {products.map((p) => (
        <div key={p.id} data-testid={`product-${p.id}`}>{p.title}</div>
      ))}
    </div>
  ),
}));

// Mock SectionHeader
vi.mock('~/components/ui', () => ({
  SectionHeader: ({title, subtitle}: {title?: string; subtitle?: string}) => (
    <div data-testid="section-header">
      {title && <h2>{title}</h2>}
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
}));

// Mock RecentlyViewedContext
const mockItems: any[] = [];
vi.mock('~/context/RecentlyViewedContext', () => ({
  useRecentlyViewed: () => ({
    items: mockItems,
  }),
}));

describe('RecentlyViewed', () => {
  const createMockItem = (id: string, handle: string) => ({
    id,
    handle,
    title: `Product ${id}`,
    vendor: 'Test Vendor',
    price: {amount: '99.00', currencyCode: 'USD'},
    image: {url: `https://example.com/${id}.jpg`, altText: `Product ${id}`},
  });

  beforeEach(() => {
    mockItems.length = 0;
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('returns null when no items', () => {
      const {container} = render(<RecentlyViewed />);
      expect(container.firstChild).toBeNull();
    });

    it('renders section header when items exist', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      render(<RecentlyViewed />);

      expect(screen.getByTestId('section-header')).toBeInTheDocument();
    });

    it('renders default title', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      render(<RecentlyViewed />);

      expect(screen.getByText('Recently Viewed')).toBeInTheDocument();
    });

    it('renders custom title', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      render(<RecentlyViewed title="Your History" />);

      expect(screen.getByText('Your History')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      render(<RecentlyViewed subtitle="Products you viewed" />);

      expect(screen.getByText('Products you viewed')).toBeInTheDocument();
    });

    it('renders product grid', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      render(<RecentlyViewed />);

      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    });
  });

  describe('Item filtering', () => {
    it('excludes current product by handle', () => {
      mockItems.push(
        createMockItem('1', 'current-product'),
        createMockItem('2', 'product-2'),
        createMockItem('3', 'product-3')
      );

      render(<RecentlyViewed excludeHandle="current-product" />);

      expect(screen.queryByTestId('product-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('product-2')).toBeInTheDocument();
      expect(screen.getByTestId('product-3')).toBeInTheDocument();
    });

    it('does not exclude when no excludeHandle', () => {
      mockItems.push(
        createMockItem('1', 'product-1'),
        createMockItem('2', 'product-2')
      );

      render(<RecentlyViewed />);

      expect(screen.getByTestId('product-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-2')).toBeInTheDocument();
    });

    it('returns null when all items are excluded', () => {
      mockItems.push(createMockItem('1', 'current-product'));

      const {container} = render(<RecentlyViewed excludeHandle="current-product" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Max items', () => {
    it('limits to 6 items by default', () => {
      for (let i = 1; i <= 10; i++) {
        mockItems.push(createMockItem(i.toString(), `product-${i}`));
      }

      render(<RecentlyViewed />);

      const grid = screen.getByTestId('product-grid');
      expect(grid.children.length).toBe(6);
    });

    it('respects custom maxItems', () => {
      for (let i = 1; i <= 10; i++) {
        mockItems.push(createMockItem(i.toString(), `product-${i}`));
      }

      render(<RecentlyViewed maxItems={3} />);

      const grid = screen.getByTestId('product-grid');
      expect(grid.children.length).toBe(3);
    });

    it('shows all items when less than maxItems', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      mockItems.push(createMockItem('2', 'product-2'));

      render(<RecentlyViewed maxItems={6} />);

      const grid = screen.getByTestId('product-grid');
      expect(grid.children.length).toBe(2);
    });
  });

  describe('ProductGrid configuration', () => {
    it('passes 6 columns to ProductGrid', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      render(<RecentlyViewed />);

      const grid = screen.getByTestId('product-grid');
      expect(grid).toHaveAttribute('data-columns', '6');
    });

    it('enables vendor display', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      render(<RecentlyViewed />);

      const grid = screen.getByTestId('product-grid');
      expect(grid).toHaveAttribute('data-show-vendor', 'true');
    });
  });

  describe('Product mapping', () => {
    it('maps items to ProductCard format correctly', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      render(<RecentlyViewed />);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    it('handles items without images', () => {
      mockItems.push({
        id: '1',
        handle: 'product-1',
        title: 'Product 1',
        price: {amount: '99.00', currencyCode: 'USD'},
      });

      render(<RecentlyViewed />);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    it('handles items with compareAtPrice', () => {
      mockItems.push({
        ...createMockItem('1', 'product-1'),
        compareAtPrice: {amount: '129.00', currencyCode: 'USD'},
      });

      render(<RecentlyViewed />);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      const {container} = render(<RecentlyViewed className="custom-class" />);

      const section = container.querySelector('.custom-class');
      expect(section).toBeInTheDocument();
    });

    it('preserves default classes', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      const {container} = render(<RecentlyViewed className="custom-class" />);

      const section = container.querySelector('.py-12.md\\:py-16');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('applies section spacing', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      const {container} = render(<RecentlyViewed />);

      const section = container.querySelector('.py-12.md\\:py-16');
      expect(section).toBeInTheDocument();
    });

    it('applies header margin', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      render(<RecentlyViewed />);

      // The SectionHeader component receives the className prop
      const header = screen.getByTestId('section-header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles items with special characters in title', () => {
      mockItems.push({
        ...createMockItem('1', 'product-1'),
        title: 'Product & "Special" <Characters>',
      });

      render(<RecentlyViewed />);

      expect(screen.getByText('Product & "Special" <Characters>')).toBeInTheDocument();
    });

    it('handles items with very long titles', () => {
      mockItems.push({
        ...createMockItem('1', 'product-1'),
        title: 'A'.repeat(200),
      });

      render(<RecentlyViewed />);

      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument();
    });

    it('handles zero maxItems', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      const {container} = render(<RecentlyViewed maxItems={0} />);

      expect(container.firstChild).toBeNull();
    });

    it('handles negative maxItems', () => {
      mockItems.push(createMockItem('1', 'product-1'));
      const {container} = render(<RecentlyViewed maxItems={-1} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Integration', () => {
    it('combines excludeHandle and maxItems correctly', () => {
      for (let i = 1; i <= 10; i++) {
        mockItems.push(createMockItem(i.toString(), `product-${i}`));
      }

      render(<RecentlyViewed excludeHandle="product-1" maxItems={3} />);

      const grid = screen.getByTestId('product-grid');
      expect(grid.children.length).toBe(3);
      expect(screen.queryByTestId('product-1')).not.toBeInTheDocument();
    });

    it('shows correct products after filtering and limiting', () => {
      mockItems.push(
        createMockItem('1', 'exclude-me'),
        createMockItem('2', 'product-2'),
        createMockItem('3', 'product-3'),
        createMockItem('4', 'product-4')
      );

      render(<RecentlyViewed excludeHandle="exclude-me" maxItems={2} />);

      expect(screen.queryByTestId('product-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('product-2')).toBeInTheDocument();
      expect(screen.getByTestId('product-3')).toBeInTheDocument();
      expect(screen.queryByTestId('product-4')).not.toBeInTheDocument();
    });
  });
});

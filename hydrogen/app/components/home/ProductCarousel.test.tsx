/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ProductCarousel} from './ProductCarousel';

// Mock ProductCard
vi.mock('~/components/product', () => ({
  ProductCard: ({product, loading}: {product: {id: string; title: string}; loading?: string}) => (
    <div data-testid="product-card" data-product-id={product.id} data-loading={loading}>
      {product.title}
    </div>
  ),
}));

// Mock SectionHeader
vi.mock('~/components/ui', () => ({
  SectionHeader: ({title, subtitle, action}: {title: string; subtitle?: string; action?: {label: string; href: string}}) => (
    <div data-testid="section-header">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      {action && <a href={action.href}>{action.label}</a>}
    </div>
  ),
  IconButton: ({label, variant, size, onClick, children}: {label: string; variant?: string; size?: string; onClick?: () => void; children: React.ReactNode}) => (
    <button
      aria-label={label}
      data-variant={variant}
      data-size={size}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  ChevronLeftIcon: ({className}: {className?: string}) => (
    <svg data-testid="chevron-left" className={className} />
  ),
  ChevronRightIcon: ({className}: {className?: string}) => (
    <svg data-testid="chevron-right" className={className} />
  ),
}));

// Mock cn utility
vi.mock('~/lib/cn', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

const mockProducts = [
  {id: '1', title: 'Product 1', handle: 'product-1'},
  {id: '2', title: 'Product 2', handle: 'product-2'},
  {id: '3', title: 'Product 3', handle: 'product-3'},
  {id: '4', title: 'Product 4', handle: 'product-4'},
  {id: '5', title: 'Product 5', handle: 'product-5'},
];

describe('ProductCarousel', () => {
  describe('Rendering', () => {
    it('renders section with title', () => {
      render(<ProductCarousel title="New Arrivals" products={mockProducts} />);

      expect(screen.getByText('New Arrivals')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(
        <ProductCarousel
          title="New Arrivals"
          subtitle="Fresh from the runway"
          products={mockProducts}
        />
      );

      expect(screen.getByText('Fresh from the runway')).toBeInTheDocument();
    });

    it('renders all products', () => {
      render(<ProductCarousel title="Products" products={mockProducts} />);

      const productCards = screen.getAllByTestId('product-card');
      expect(productCards).toHaveLength(5);
    });

    it('renders product titles', () => {
      render(<ProductCarousel title="Products" products={mockProducts} />);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Product 5')).toBeInTheDocument();
    });

    it('returns null when no products', () => {
      const {container} = render(
        <ProductCarousel title="Products" products={[]} />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('returns null when products is null', () => {
      const {container} = render(
        <ProductCarousel title="Products" products={null as any} />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('applies custom className', () => {
      const {container} = render(
        <ProductCarousel
          title="Products"
          products={mockProducts}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('View All link', () => {
    it('renders view all link when provided', () => {
      render(
        <ProductCarousel
          title="Products"
          products={mockProducts}
          viewAllHref="/collections/all"
        />
      );

      const link = screen.getByText('View All');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/collections/all');
    });

    it('does not render view all link when not provided', () => {
      render(<ProductCarousel title="Products" products={mockProducts} />);

      expect(screen.queryByText('View All')).not.toBeInTheDocument();
    });
  });

  describe('Navigation arrows', () => {
    it('renders navigation arrows on desktop', () => {
      render(<ProductCarousel title="Products" products={mockProducts} />);

      expect(screen.getByLabelText('Scroll left')).toBeInTheDocument();
      expect(screen.getByLabelText('Scroll right')).toBeInTheDocument();
    });

    it('navigation arrows have correct icons', () => {
      render(<ProductCarousel title="Products" products={mockProducts} />);

      expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
    });

    it('calls scroll function when left arrow clicked', async () => {
      const user = userEvent.setup();
      const {container} = render(
        <ProductCarousel title="Products" products={mockProducts} />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto') as HTMLElement;
      const scrollByMock = vi.fn();
      scrollContainer.scrollBy = scrollByMock;

      await user.click(screen.getByLabelText('Scroll left'));

      expect(scrollByMock).toHaveBeenCalled();
    });

    it('calls scroll function when right arrow clicked', async () => {
      const user = userEvent.setup();
      const {container} = render(
        <ProductCarousel title="Products" products={mockProducts} />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto') as HTMLElement;
      const scrollByMock = vi.fn();
      scrollContainer.scrollBy = scrollByMock;

      await user.click(screen.getByLabelText('Scroll right'));

      expect(scrollByMock).toHaveBeenCalled();
    });
  });

  describe('Loading priorities', () => {
    it('sets eager loading for first 4 products', () => {
      render(<ProductCarousel title="Products" products={mockProducts} />);

      const productCards = screen.getAllByTestId('product-card');
      expect(productCards[0]).toHaveAttribute('data-loading', 'eager');
      expect(productCards[1]).toHaveAttribute('data-loading', 'eager');
      expect(productCards[2]).toHaveAttribute('data-loading', 'eager');
      expect(productCards[3]).toHaveAttribute('data-loading', 'eager');
    });

    it('sets lazy loading for products after 4th', () => {
      render(<ProductCarousel title="Products" products={mockProducts} />);

      const productCards = screen.getAllByTestId('product-card');
      expect(productCards[4]).toHaveAttribute('data-loading', 'lazy');
    });
  });

  describe('Mobile scroll indicators', () => {
    it('renders scroll indicators on mobile', () => {
      const {container} = render(
        <ProductCarousel title="Products" products={mockProducts} />
      );

      const indicators = container.querySelectorAll('.rounded-full.bg-border');
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('limits indicators to 5', () => {
      const manyProducts = Array.from({length: 10}, (_, i) => ({
        id: `${i}`,
        title: `Product ${i}`,
        handle: `product-${i}`,
      }));

      const {container} = render(
        <ProductCarousel title="Products" products={manyProducts} />
      );

      const indicators = container.querySelectorAll('.rounded-full.bg-border');
      expect(indicators.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Carousel behavior', () => {
    it('has horizontal scroll container', () => {
      const {container} = render(
        <ProductCarousel title="Products" products={mockProducts} />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('has snap scrolling enabled', () => {
      const {container} = render(
        <ProductCarousel title="Products" products={mockProducts} />
      );

      const scrollContainer = container.querySelector('.snap-x');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('hides scrollbar', () => {
      const {container} = render(
        <ProductCarousel title="Products" products={mockProducts} />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto') as HTMLElement;
      expect(scrollContainer.style.scrollbarWidth).toBe('none');
      expect(scrollContainer.style.msOverflowStyle).toBe('none');
    });
  });

  describe('Section header', () => {
    it('renders section header with title', () => {
      render(<ProductCarousel title="Products" products={mockProducts} />);

      expect(screen.getByTestId('section-header')).toBeInTheDocument();
    });

    it('passes view all action to section header', () => {
      render(
        <ProductCarousel
          title="Products"
          products={mockProducts}
          viewAllHref="/all"
        />
      );

      const link = screen.getByText('View All');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Icon button styling', () => {
    it('uses outline variant for navigation buttons', () => {
      render(<ProductCarousel title="Products" products={mockProducts} />);

      const leftButton = screen.getByLabelText('Scroll left');
      const rightButton = screen.getByLabelText('Scroll right');

      expect(leftButton).toHaveAttribute('data-variant', 'outline');
      expect(rightButton).toHaveAttribute('data-variant', 'outline');
    });

    it('uses medium size for navigation buttons', () => {
      render(<ProductCarousel title="Products" products={mockProducts} />);

      const leftButton = screen.getByLabelText('Scroll left');
      const rightButton = screen.getByLabelText('Scroll right');

      expect(leftButton).toHaveAttribute('data-size', 'md');
      expect(rightButton).toHaveAttribute('data-size', 'md');
    });
  });
});

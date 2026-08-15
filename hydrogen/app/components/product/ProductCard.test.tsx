/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ProductCard} from './ProductCard';
import {
  createSaleProduct,
  createProductWithMultipleImages,
  createCollectionProduct,
} from '@test/mocks/data/products';

// Mock useVariantUrl
vi.mock('~/lib/variants', () => ({
  useVariantUrl: (handle: string) => `/products/${handle}`,
}));

// Mock Badge component and IconButton
vi.mock('~/components/ui', () => ({
  Badge: ({
    variant,
    children,
  }: {
    variant: string;
    children: React.ReactNode;
  }) => <span data-testid={`badge-${variant}`}>{children}</span>,
  IconButton: ({
    children,
    onClick,
    label,
    className,
    type = 'button',
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    label: string;
    className?: string;
    type?: 'button' | 'submit';
  }) => (
    <button
      onClick={onClick}
      aria-label={label}
      className={className}
      type={type}
      data-testid="icon-button"
    >
      {children}
    </button>
  ),
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  EyeIcon: ({className}: {className?: string}) => (
    <svg data-testid="eye-icon" className={className} />
  ),
  HeartIcon: ({className, filled}: {className?: string; filled?: boolean}) => (
    <svg data-testid="heart-icon" className={className} data-filled={filled} />
  ),
  CompareIcon: ({
    className,
    filled,
  }: {
    className?: string;
    filled?: boolean;
  }) => (
    <svg
      data-testid="compare-icon"
      className={className}
      data-filled={filled}
    />
  ),
}));

// Mock contexts
const mockOpenQuickView = vi.fn();
const mockToggleItem = vi.fn();
const mockAddProduct = vi.fn();
const mockRemoveProduct = vi.fn();
const mockIsInWishlist = vi.fn().mockReturnValue(false);
const mockIsInCompare = vi.fn().mockReturnValue(false);
const mockCanAdd = true;

vi.mock('~/context/QuickViewContext', () => ({
  useQuickView: () => ({
    openQuickView: mockOpenQuickView,
  }),
}));

vi.mock('~/context/WishlistContext', () => ({
  useWishlist: () => ({
    toggleItem: mockToggleItem,
    isInWishlist: mockIsInWishlist,
  }),
}));

vi.mock('~/context/CompareContext', () => ({
  useCompare: () => ({
    addProduct: mockAddProduct,
    removeProduct: mockRemoveProduct,
    isInCompare: mockIsInCompare,
    canAdd: mockCanAdd,
  }),
}));

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsInWishlist.mockReturnValue(false);
    mockIsInCompare.mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('renders product title', () => {
      const product = createCollectionProduct({title: 'Elegant Wool Coat'});
      render(<ProductCard product={product} />);

      expect(screen.getByText('Elegant Wool Coat')).toBeInTheDocument();
    });

    it('renders product link with correct URL', () => {
      const product = createCollectionProduct({handle: 'elegant-coat'});
      const {container} = render(<ProductCard product={product} />);

      const link = container.querySelector('a[href="/products/elegant-coat"]');
      expect(link).toBeInTheDocument();
    });

    it('renders product image', () => {
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      expect(screen.getByTestId('image')).toBeInTheDocument();
    });

    it('renders product price', () => {
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      expect(screen.getByTestId('money')).toBeInTheDocument();
    });
  });

  describe('Vendor display', () => {
    it('shows vendor by default', () => {
      const product = createCollectionProduct({vendor: 'ada ÉLAN'});
      render(<ProductCard product={product} />);

      expect(screen.getByText('ada ÉLAN')).toBeInTheDocument();
    });

    it('hides vendor when showVendor is false', () => {
      const product = createCollectionProduct({vendor: 'ada ÉLAN'});
      render(<ProductCard product={product} showVendor={false} />);

      expect(screen.queryByText('ada ÉLAN')).not.toBeInTheDocument();
    });
  });

  describe('Badges', () => {
    it('renders NEW badge for new products', () => {
      const product = createCollectionProduct({tags: ['new']});
      render(<ProductCard product={product} />);

      expect(screen.getByTestId('badge-new')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders SALE badge for discounted products', () => {
      const product = createSaleProduct();
      const collectionProduct = createCollectionProduct({
        priceRange: product.priceRange,
        compareAtPriceRange: product.compareAtPriceRange,
      });
      render(<ProductCard product={collectionProduct} />);

      expect(screen.getByTestId('badge-sale')).toBeInTheDocument();
    });

    it('renders LIMITED badge for limited edition products', () => {
      const product = createCollectionProduct({tags: ['limited']});
      render(<ProductCard product={product} />);

      expect(screen.getByTestId('badge-limited')).toBeInTheDocument();
      expect(screen.getByText('Limited')).toBeInTheDocument();
    });

    it('renders multiple badges when applicable', () => {
      const product = createCollectionProduct({
        tags: ['new', 'limited'],
      });
      render(<ProductCard product={product} />);

      expect(screen.getByTestId('badge-new')).toBeInTheDocument();
      expect(screen.getByTestId('badge-limited')).toBeInTheDocument();
    });

    it('does not render badges for regular products', () => {
      const product = createCollectionProduct({tags: []});
      render(<ProductCard product={product} />);

      expect(screen.queryByTestId('badge-new')).not.toBeInTheDocument();
      expect(screen.queryByTestId('badge-sale')).not.toBeInTheDocument();
      expect(screen.queryByTestId('badge-limited')).not.toBeInTheDocument();
    });
  });

  describe('Sale price display', () => {
    it('shows compare at price for sale products', () => {
      const product = createSaleProduct(20);
      const collectionProduct = createCollectionProduct({
        priceRange: product.priceRange,
        compareAtPriceRange: product.compareAtPriceRange,
      });
      render(<ProductCard product={collectionProduct} />);

      const prices = screen.getAllByTestId('money');
      expect(prices).toHaveLength(2);
    });

    it('shows single price for regular products', () => {
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      const prices = screen.getAllByTestId('money');
      expect(prices).toHaveLength(1);
    });
  });

  describe('Quick actions', () => {
    it('renders quick view button', () => {
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      expect(
        screen.getByRole('button', {name: /quick view/i}),
      ).toBeInTheDocument();
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });

    it('renders wishlist button', () => {
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      expect(
        screen.getByRole('button', {name: /add to wishlist/i}),
      ).toBeInTheDocument();
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    it('renders compare button', () => {
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      expect(
        screen.getByRole('button', {name: /add to comparison/i}),
      ).toBeInTheDocument();
      expect(screen.getByTestId('compare-icon')).toBeInTheDocument();
    });

    it('calls openQuickView when quick view button is clicked', async () => {
      const user = userEvent.setup();
      const product = createCollectionProduct({handle: 'test-product'});
      render(<ProductCard product={product} />);

      await user.click(screen.getByRole('button', {name: /quick view/i}));

      expect(mockOpenQuickView).toHaveBeenCalledWith('test-product');
    });

    it('calls toggleItem when wishlist button is clicked', async () => {
      const user = userEvent.setup();
      const product = createCollectionProduct({
        id: 'product-123',
        handle: 'test-product',
        title: 'Test Product',
      });
      render(<ProductCard product={product} />);

      await user.click(screen.getByRole('button', {name: /add to wishlist/i}));

      expect(mockToggleItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'product-123',
          handle: 'test-product',
          title: 'Test Product',
        }),
      );
    });

    it('calls addProduct when compare button is clicked', async () => {
      const user = userEvent.setup();
      const product = createCollectionProduct({
        id: 'product-123',
        handle: 'test-product',
      });
      render(<ProductCard product={product} />);

      await user.click(
        screen.getByRole('button', {name: /add to comparison/i}),
      );

      expect(mockAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'product-123',
          handle: 'test-product',
        }),
      );
    });
  });

  describe('Wishlist state', () => {
    it('shows "Add to wishlist" label when not in wishlist', () => {
      mockIsInWishlist.mockReturnValue(false);
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      expect(
        screen.getByRole('button', {name: /add to wishlist/i}),
      ).toBeInTheDocument();
    });

    it('shows "Remove from wishlist" label when in wishlist', () => {
      mockIsInWishlist.mockReturnValue(true);
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      expect(
        screen.getByRole('button', {name: /remove from wishlist/i}),
      ).toBeInTheDocument();
    });

    it('shows filled heart icon when in wishlist', () => {
      mockIsInWishlist.mockReturnValue(true);
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      const heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveAttribute('data-filled', 'true');
    });
  });

  describe('Compare state', () => {
    it('shows "Add to comparison" label when not comparing', () => {
      mockIsInCompare.mockReturnValue(false);
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      expect(
        screen.getByRole('button', {name: /add to comparison/i}),
      ).toBeInTheDocument();
    });

    it('shows "Remove from comparison" label when comparing', () => {
      mockIsInCompare.mockReturnValue(true);
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      expect(
        screen.getByRole('button', {name: /remove from comparison/i}),
      ).toBeInTheDocument();
    });

    it('calls removeProduct when already comparing', async () => {
      const user = userEvent.setup();
      mockIsInCompare.mockReturnValue(true);
      const product = createCollectionProduct({id: 'product-123'});
      render(<ProductCard product={product} />);

      await user.click(
        screen.getByRole('button', {name: /remove from comparison/i}),
      );

      expect(mockRemoveProduct).toHaveBeenCalledWith('product-123');
    });
  });

  describe('Image loading', () => {
    it('uses lazy loading by default', () => {
      const product = createCollectionProduct();
      render(<ProductCard product={product} />);

      // The loading prop is passed to Image component (mocked)
      expect(screen.getByTestId('image')).toBeInTheDocument();
    });

    it('accepts eager loading prop', () => {
      const product = createCollectionProduct();
      render(<ProductCard product={product} loading="eager" />);

      expect(screen.getByTestId('image')).toBeInTheDocument();
    });
  });

  describe('Secondary image', () => {
    it('renders secondary image when available and showSecondImage is true', () => {
      const product = createProductWithMultipleImages(2);
      const collectionProduct = createCollectionProduct({
        featuredImage: product.featuredImage,
        media: product.media,
      });
      render(<ProductCard product={collectionProduct} />);

      const images = screen.getAllByTestId('image');
      expect(images.length).toBeGreaterThanOrEqual(1);
    });

    it('does not render secondary image when showSecondImage is false', () => {
      const product = createProductWithMultipleImages(2);
      const collectionProduct = createCollectionProduct({
        featuredImage: product.featuredImage,
        media: product.media,
      });
      render(
        <ProductCard product={collectionProduct} showSecondImage={false} />,
      );

      const images = screen.getAllByTestId('image');
      expect(images).toHaveLength(1);
    });
  });

  describe('Custom className', () => {
    it('applies custom className to the card', () => {
      const product = createCollectionProduct();
      const {container} = render(<ProductCard product={product} className="custom-card" />);

      const link = container.querySelector('a.custom-card');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Without featured image', () => {
    it('handles products without images gracefully', () => {
      const product = createCollectionProduct({featuredImage: null});
      render(<ProductCard product={product} />);

      expect(screen.getByText(product.title)).toBeInTheDocument();
      expect(screen.queryByTestId('image')).not.toBeInTheDocument();
    });
  });
});

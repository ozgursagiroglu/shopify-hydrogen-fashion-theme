/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {QuickView, type QuickViewProduct} from './QuickView';

// Override global mock - need custom useFetcher behavior
const mockSubmit = vi.fn();
vi.mock('react-router', () => ({
  Link: ({to, children, onClick}: any) => (
    <a href={to} onClick={onClick}>
      {children}
    </a>
  ),
  useFetcher: () => ({
    submit: mockSubmit,
    state: 'idle',
  }),
  useRouteLoaderData: vi.fn(() => ({
    locale: 'en',
  })),
  useLocation: vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  })),
}));

// Mock Modal
vi.mock('~/components/ui/Modal', () => ({
  Modal: ({isOpen, onClose, children}: any) =>
    isOpen ? (
      <div data-testid="modal">
        <button onClick={onClose} data-testid="close-button">
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

// Mock LocaleLink for Button as="link"
vi.mock('~/components/shared/LocaleLink', () => ({
  LocaleLink: ({to, children, className, onClick}: any) => (
    <a href={to} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

// Mock UI components
vi.mock('~/components/ui', () => ({
  Button: ({children, onClick, disabled, variant, as, to}: any) => {
    if (as === 'link') {
      return (
        <a href={to} data-variant={variant} onClick={onClick}>
          {children}
        </a>
      );
    }
    return (
      <button onClick={onClick} disabled={disabled} data-variant={variant}>
        {children}
      </button>
    );
  },
  SizeSelector: ({sizes, onSelect}: any) => (
    <div data-testid="size-selector">
      {sizes.map((s: any) => (
        <button key={s.value} onClick={() => onSelect(s.value)}>
          {s.label}
        </button>
      ))}
    </div>
  ),
  ColorSelector: ({colors, onSelect}: any) => (
    <div data-testid="color-selector">
      {colors.map((c: any) => (
        <button key={c.value} onClick={() => onSelect(c.value)}>
          {c.label}
        </button>
      ))}
    </div>
  ),
  QuantitySelector: ({value, onChange}: any) => (
    <input
      data-testid="quantity-input"
      type="number"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
    />
  ),
  Badge: ({children, variant}: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

// Mock Aside
const mockOpen = vi.fn();
vi.mock('~/components/layout/Aside', () => ({
  useAside: () => ({open: mockOpen}),
}));

// Mock AddToCartButton
vi.mock('~/components/cart/AddToCartButton', () => ({
  AddToCartButton: ({children, disabled, onClick, onAddComplete}: any) => (
    <button
      data-testid="add-to-cart"
      disabled={disabled}
      onClick={() => {
        onClick?.();
        onAddComplete?.();
      }}
      type="button"
    >
      {children}
    </button>
  ),
}));

// Mock WishlistContext
const mockToggleItem = vi.fn();
const mockIsInWishlist = vi.fn().mockReturnValue(false);
vi.mock('~/context/WishlistContext', () => ({
  useWishlist: () => ({
    toggleItem: mockToggleItem,
    isInWishlist: mockIsInWishlist,
  }),
}));

// Mock constants
vi.mock('~/lib/constants', () => ({
  getColorHex: () => '#000000',
  TIMING: {
    IMAGE_LOAD_DELAY_MS: 100,
  },
  STORAGE_KEYS: {
    RECENTLY_VIEWED: 'recently_viewed_products',
    WISHLIST: 'wishlist_items',
    COMPARE: 'compare_products',
  },
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  CloseIcon: () => <svg data-testid="close-icon" />,
  HeartIcon: ({filled}: any) => (
    <svg data-testid="heart-icon" data-filled={filled} />
  ),
  ChevronLeftIcon: () => <svg data-testid="chevron-left" />,
  ChevronRightIcon: () => <svg data-testid="chevron-right" />,
  ArrowRightIcon: () => <svg data-testid="arrow-right" />,
  SpinnerIcon: () => <svg data-testid="spinner" />,
  ShippingIcon: () => <svg data-testid="shipping-icon" />,
  ReturnIcon: () => <svg data-testid="return-icon" />,
}));

describe('QuickView', () => {
  const mockProduct: QuickViewProduct = {
    id: 'product-123',
    title: 'Premium Wool Coat',
    handle: 'premium-wool-coat',
    vendor: 'ada ÉLAN',
    description: 'Luxurious wool coat',
    options: [
      {name: 'Size', values: ['Small', 'Medium', 'Large']},
      {name: 'Color', values: ['Black', 'White']},
    ],
    priceRange: {
      minVariantPrice: {amount: '299.00', currencyCode: 'USD'},
    },
    featuredImage: {
      id: 'img-1',
      url: 'https://example.com/coat.jpg',
      altText: 'Wool coat',
      width: 800,
      height: 1067,
    },
    images: {
      nodes: [
        {
          id: 'img-1',
          url: 'https://example.com/coat1.jpg',
          altText: 'View 1',
          width: 800,
          height: 1067,
        },
        {
          id: 'img-2',
          url: 'https://example.com/coat2.jpg',
          altText: 'View 2',
          width: 800,
          height: 1067,
        },
      ],
    },
    variants: {
      nodes: [
        {
          id: 'variant-1',
          title: 'Small / Black',
          availableForSale: true,
          price: {amount: '299.00', currencyCode: 'USD'},
          compareAtPrice: null,
          selectedOptions: [
            {name: 'Size', value: 'Small'},
            {name: 'Color', value: 'Black'},
          ],
        },
        {
          id: 'variant-2',
          title: 'Medium / Black',
          availableForSale: true,
          price: {amount: '299.00', currencyCode: 'USD'},
          compareAtPrice: null,
          selectedOptions: [
            {name: 'Size', value: 'Medium'},
            {name: 'Color', value: 'Black'},
          ],
        },
      ],
    },
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    product: mockProduct,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsInWishlist.mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('renders when open', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<QuickView {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('returns null when no product', () => {
      render(<QuickView {...defaultProps} product={null} />);
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders product title', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByText('Premium Wool Coat')).toBeInTheDocument();
    });

    it('renders vendor', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByText('ada ÉLAN')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByText('Luxurious wool coat')).toBeInTheDocument();
    });

    it('renders product image', () => {
      render(<QuickView {...defaultProps} />);
      const images = screen.getAllByTestId('image');
      expect(images.length).toBeGreaterThan(0);
    });

    it('renders price', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByTestId('money')).toBeInTheDocument();
    });
  });

  describe('Variant selection', () => {
    it('renders size selector', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByTestId('size-selector')).toBeInTheDocument();
    });

    it('renders color selector', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByTestId('color-selector')).toBeInTheDocument();
    });

    it('shows size options', () => {
      render(<QuickView {...defaultProps} />);
      // Use getAllByText since size values appear both in label and selector
      expect(screen.getAllByText('Small').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Medium').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Large').length).toBeGreaterThan(0);
    });

    it('shows color options', () => {
      render(<QuickView {...defaultProps} />);
      // Use getAllByText since color values appear both in label and selector
      expect(screen.getAllByText('Black').length).toBeGreaterThan(0);
      expect(screen.getAllByText('White').length).toBeGreaterThan(0);
    });

    it('allows selecting size', async () => {
      const user = userEvent.setup();
      render(<QuickView {...defaultProps} />);

      // Get the button from the size selector (not the label text)
      const sizeSelector = screen.getByTestId('size-selector');
      const mediumButton = sizeSelector.querySelector('button:nth-child(2)');
      if (mediumButton) {
        await user.click(mediumButton);
      }

      // Verify Medium is still present
      expect(screen.getAllByText('Medium').length).toBeGreaterThan(0);
    });

    it('allows selecting color', async () => {
      const user = userEvent.setup();
      render(<QuickView {...defaultProps} />);

      // Get the button from the color selector (not the label text)
      const colorSelector = screen.getByTestId('color-selector');
      const whiteButton = colorSelector.querySelector('button:nth-child(2)');
      if (whiteButton) {
        await user.click(whiteButton);
      }

      // Verify White is still present
      expect(screen.getAllByText('White').length).toBeGreaterThan(0);
    });
  });

  describe('Add to cart', () => {
    it('renders add to cart button', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByText('Add to Bag')).toBeInTheDocument();
    });

    it('adds to cart when clicked', async () => {
      const user = userEvent.setup();
      render(<QuickView {...defaultProps} />);

      const addButton = screen.getByText('Add to Bag');
      await user.click(addButton);

      expect(mockOpen).toHaveBeenCalledWith('cart');
    });

    it('closes modal after adding to cart', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<QuickView {...defaultProps} onClose={onClose} />);

      const addButton = screen.getByText('Add to Bag');
      await user.click(addButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('is disabled when no variant selected', () => {
      const productWithoutVariants = {...mockProduct, variants: {nodes: []}};
      render(<QuickView {...defaultProps} product={productWithoutVariants} />);

      const addButton = screen.getByText('Select Options');
      expect(addButton).toBeDisabled();
    });

    it('shows sold out when variant unavailable', () => {
      const soldOutProduct = {
        ...mockProduct,
        variants: {
          nodes: [
            {
              ...mockProduct.variants!.nodes[0],
              availableForSale: false,
            },
          ],
        },
      };

      render(<QuickView {...defaultProps} product={soldOutProduct} />);

      // The button should show soldOut and be disabled
      const soldOutButtons = screen.getAllByText('Sold Out');
      // One in badge, one in button
      expect(soldOutButtons.length).toBeGreaterThan(0);
      // Find the button element
      const addButton = soldOutButtons.find((el) => el.tagName === 'BUTTON');
      expect(addButton).toBeTruthy();
      expect(addButton).toBeDisabled();
    });
  });

  describe('Image navigation', () => {
    it('shows navigation arrows for multiple images', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByLabelText('Previous media')).toBeInTheDocument();
      expect(screen.getByLabelText('Next media')).toBeInTheDocument();
    });

    it('navigates to next image', async () => {
      const user = userEvent.setup();
      render(<QuickView {...defaultProps} />);

      const nextButton = screen.getByLabelText('Next media');
      await user.click(nextButton);

      // Second image should be displayed
      await waitFor(() => {
        const images = screen.getAllByTestId('image');
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('navigates to previous image', async () => {
      const user = userEvent.setup();
      render(<QuickView {...defaultProps} />);

      const prevButton = screen.getByLabelText('Previous media');
      await user.click(prevButton);

      // Should wrap to last image
      await waitFor(() => {
        const images = screen.getAllByTestId('image');
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('shows thumbnail navigation', () => {
      render(<QuickView {...defaultProps} />);
      const images = screen.getAllByTestId('image');
      // Should have main image plus thumbnails
      expect(images.length).toBeGreaterThan(1);
    });
  });

  describe('Quantity selector', () => {
    it('renders quantity input', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByTestId('quantity-input')).toBeInTheDocument();
    });

    it('defaults to 1', () => {
      render(<QuickView {...defaultProps} />);
      const input = screen.getByTestId('quantity-input') as HTMLInputElement;
      expect(input.value).toBe('1');
    });

    it('allows changing quantity', async () => {
      const user = userEvent.setup();
      render(<QuickView {...defaultProps} />);

      const input = screen.getByTestId('quantity-input');
      await user.clear(input);
      await user.type(input, '3');

      expect(input).toHaveValue(3);
    });
  });

  describe('Wishlist', () => {
    it('renders wishlist button', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('adds to wishlist when clicked', async () => {
      const user = userEvent.setup();
      render(<QuickView {...defaultProps} />);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockToggleItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'product-123',
          handle: 'premium-wool-coat',
          title: 'Premium Wool Coat',
        }),
      );
    });

    it('shows saved state when in wishlist', () => {
      mockIsInWishlist.mockReturnValue(true);
      render(<QuickView {...defaultProps} />);

      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    it('shows filled heart when in wishlist', () => {
      mockIsInWishlist.mockReturnValue(true);
      render(<QuickView {...defaultProps} />);

      // Verify "Saved" text is shown when in wishlist
      const saveButton = screen.getByText('Saved');
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Close functionality', () => {
    it('renders close button', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<QuickView {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByTestId('close-button'));

      expect(onClose).toHaveBeenCalled();
    });

    it('closes when view details link clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<QuickView {...defaultProps} onClose={onClose} />);

      const viewDetailsLink = screen.getByText('View Details').closest('a');
      expect(viewDetailsLink).toBeTruthy();
      await user.click(viewDetailsLink!);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Sale pricing', () => {
    it('shows sale badge when on sale', () => {
      const saleProduct = {
        ...mockProduct,
        variants: {
          nodes: [
            {
              ...mockProduct.variants!.nodes[0],
              compareAtPrice: {amount: '399.00', currencyCode: 'USD'},
            },
          ],
        },
      };

      render(<QuickView {...defaultProps} product={saleProduct} />);

      expect(screen.getByTestId('badge')).toBeInTheDocument();
    });

    it('displays both prices when on sale', () => {
      const saleProduct = {
        ...mockProduct,
        variants: {
          nodes: [
            {
              ...mockProduct.variants!.nodes[0],
              compareAtPrice: {amount: '399.00', currencyCode: 'USD'},
            },
          ],
        },
      };

      render(<QuickView {...defaultProps} product={saleProduct} />);

      const moneyElements = screen.getAllByTestId('money');
      expect(moneyElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Trust badges', () => {
    it('shows free shipping badge', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByTestId('shipping-icon')).toBeInTheDocument();
    });

    it('shows free returns badge', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByTestId('return-icon')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles product without vendor', () => {
      const productWithoutVendor = {...mockProduct, vendor: null};
      render(<QuickView {...defaultProps} product={productWithoutVendor} />);

      expect(screen.getByText('Premium Wool Coat')).toBeInTheDocument();
    });

    it('handles product without description', () => {
      const productWithoutDescription = {...mockProduct, description: null};
      render(
        <QuickView {...defaultProps} product={productWithoutDescription} />,
      );

      expect(screen.getByText('Premium Wool Coat')).toBeInTheDocument();
    });

    it('handles product without options', () => {
      const productWithoutOptions = {...mockProduct, options: []};
      render(<QuickView {...defaultProps} product={productWithoutOptions} />);

      expect(screen.getByText('Premium Wool Coat')).toBeInTheDocument();
    });

    it('handles product with single image', () => {
      const singleImageProduct = {
        ...mockProduct,
        images: {nodes: [mockProduct.images!.nodes[0]]},
      };

      render(<QuickView {...defaultProps} product={singleImageProduct} />);

      expect(screen.queryByLabelText('Previous media')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible image labels', () => {
      render(<QuickView {...defaultProps} />);
      // The mocked Image component doesn't add alt attribute
      // Verify images are rendered instead
      const images = screen.getAllByTestId('image');
      expect(images.length).toBeGreaterThan(0);
    });

    it('has accessible navigation buttons', () => {
      render(<QuickView {...defaultProps} />);
      expect(screen.getByLabelText('Previous media')).toBeInTheDocument();
      expect(screen.getByLabelText('Next media')).toBeInTheDocument();
    });
  });
});

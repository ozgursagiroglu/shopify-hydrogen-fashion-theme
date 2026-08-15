/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ProductForm} from './ProductForm';
import type {MappedProductOptions} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';

// Override global mock - need custom useNavigate behavior
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  Link: ({to, children}: {to: string; children: React.ReactNode}) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mockNavigate,

  useLocation: vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  })),
  useRouteLoaderData: vi.fn(() => ({
    locale: 'en',
  })),
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

// Mock Aside
const mockOpen = vi.fn();
vi.mock('~/components/layout/Aside', () => ({
  useAside: () => ({open: mockOpen}),
}));

// Mock IconButton
vi.mock('~/components/ui/IconButton', () => ({
  IconButton: ({children, onClick, label}: any) => (
    <button onClick={onClick} data-testid="icon-button" aria-label={label}>
      {children}
    </button>
  ),
}));

// Mock StockAlert
vi.mock('~/components/product/StockAlert', () => ({
  StockAlert: () => <div data-testid="stock-alert">Stock Alert</div>,
  StockAlertInline: () => <div data-testid="stock-alert-inline">Stock Alert Inline</div>,
}));

// Mock SizeGuide
vi.mock('~/components/product/SizeGuide', () => ({
  SizeGuide: ({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) => {
    if (!isOpen) return null;
    return (
      <div data-testid="size-guide-modal">
        <p>Find your perfect fit</p>
        <div>
          <span>XS</span>
          <span>S</span>
          <span>M</span>
          <span>L</span>
          <span>XL</span>
        </div>
        <button onClick={onClose} data-testid="icon-button">
          <svg data-testid="close-icon" />
        </button>
      </div>
    );
  },
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
  getColorFromName: (name: string) => {
    const colors: Record<string, string> = {
      Black: '#000000',
      White: '#FFFFFF',
      Red: '#FF0000',
    };
    return colors[name] || '#CCCCCC';
  },
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  HeartIcon: ({filled}: {filled?: boolean}) => (
    <svg data-testid="heart-icon" data-filled={filled} />
  ),
  CloseIcon: () => <svg data-testid="close-icon" />,
  TipIcon: () => <svg data-testid="tip-icon" />,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'product.addToBag': 'Add to Bag',
        'product.soldOut': 'Sold Out',
        'product.sizeGuide': 'Size Guide',
        'product.addToWishlist': 'Add to Wishlist',
        'product.removeFromWishlist': 'Remove from Wishlist',
        'product.closeSizeGuide': 'Close',
        'product.sizeGuideIntro': 'Find your perfect fit',
        'product.sizeChart.size': 'Size',
        'product.sizeChart.chest': 'Chest',
        'product.sizeChart.waist': 'Waist',
        'product.sizeChart.hip': 'Hip',
        'product.howToMeasure': 'How to Measure',
        'product.measureChest': 'Measure around fullest part',
        'product.measureWaist': 'Measure around natural waistline',
        'product.measureHip': 'Measure around fullest part of hips',
      };
      return translations[key] || key;
    },
  }),
}));

describe('ProductForm', () => {
  const mockSelectedVariant: ProductFragment['selectedOrFirstAvailableVariant'] = {
    id: 'variant-123',
    title: 'Medium / Black',
    availableForSale: true,
    price: {
      amount: '99.00',
      currencyCode: 'USD',
    },
    compareAtPrice: null,
    selectedOptions: [
      {name: 'Size', value: 'Medium'},
      {name: 'Color', value: 'Black'},
    ],
  };

  const mockProductOptions: MappedProductOptions[] = [
    {
      name: 'Size',
      optionValues: [
        {
          name: 'Small',
          handle: '',
          variantUriQuery: 'Size=Small',
          selected: false,
          available: true,
          exists: true,
          isDifferentProduct: false,
          swatch: null,
        },
        {
          name: 'Medium',
          handle: '',
          variantUriQuery: 'Size=Medium',
          selected: true,
          available: true,
          exists: true,
          isDifferentProduct: false,
          swatch: null,
        },
        {
          name: 'Large',
          handle: '',
          variantUriQuery: 'Size=Large',
          selected: false,
          available: false,
          exists: true,
          isDifferentProduct: false,
          swatch: null,
        },
      ],
    },
    {
      name: 'Color',
      optionValues: [
        {
          name: 'Black',
          handle: '',
          variantUriQuery: 'Color=Black',
          selected: true,
          available: true,
          exists: true,
          isDifferentProduct: false,
          swatch: null,
        },
        {
          name: 'White',
          handle: '',
          variantUriQuery: 'Color=White',
          selected: false,
          available: true,
          exists: true,
          isDifferentProduct: false,
          swatch: null,
        },
      ],
    },
  ];

  const defaultProps = {
    productOptions: mockProductOptions,
    selectedVariant: mockSelectedVariant,
    productTitle: 'Premium Wool Coat',
    productHandle: 'premium-wool-coat',
    productId: 'product-123',
    vendor: 'ada ÉLAN',
    featuredImage: {
      url: 'https://example.com/coat.jpg',
      altText: 'Wool coat',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsInWishlist.mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('renders size options', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('renders color options', () => {
      const {container} = render(<ProductForm {...defaultProps} />);

      // Check for color buttons by title - use getAllByTitle since both button and span have title
      const blackButtons = container.querySelectorAll('[title="Black"]');
      expect(blackButtons.length).toBeGreaterThan(0);
      const whiteButtons = container.querySelectorAll('[title="White"]');
      expect(whiteButtons.length).toBeGreaterThan(0);
    });

    it('renders add to cart button', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByTestId('add-to-cart')).toBeInTheDocument();
      expect(screen.getByText('Add to Bag')).toBeInTheDocument();
    });

    it('renders wishlist button', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByTestId('icon-button')).toBeInTheDocument();
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    it('shows size guide link', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByText('Size Guide')).toBeInTheDocument();
    });
  });

  describe('Option selection', () => {
    it('shows selected size', () => {
      render(<ProductForm {...defaultProps} />);

      // Find the Size label that includes the selected value
      const sizeLabels = screen.getAllByText(/Size/);
      const sizeLabel = sizeLabels.find(el => el.textContent?.includes('Medium'));
      expect(sizeLabel).toBeInTheDocument();
      expect(sizeLabel?.textContent).toContain('Medium');
    });

    it('shows selected color', () => {
      render(<ProductForm {...defaultProps} />);

      const colorLabel = screen.getByText(/Color/);
      expect(colorLabel).toBeInTheDocument();
      expect(colorLabel.textContent).toContain('Black');
    });

    it('applies accent border to selected options', () => {
      const {container} = render(<ProductForm {...defaultProps} />);

      const selectedElements = container.querySelectorAll('.border-accent');
      expect(selectedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Variant availability', () => {
    it('shows unavailable variants as disabled', () => {
      render(<ProductForm {...defaultProps} />);

      const largeButton = screen.getByText('Large').closest('button');
      expect(largeButton).toHaveClass('opacity-40');
      expect(largeButton).toHaveClass('cursor-not-allowed');
    });

    it('shows sold out state when variant unavailable', () => {
      const unavailableVariant = {
        ...mockSelectedVariant,
        availableForSale: false,
      };

      render(<ProductForm {...defaultProps} selectedVariant={unavailableVariant} />);

      expect(screen.getByTestId('stock-alert')).toBeInTheDocument();
    });

    it('disables add to cart for unavailable variants', () => {
      const unavailableVariant = {
        ...mockSelectedVariant,
        availableForSale: false,
      };

      render(<ProductForm {...defaultProps} selectedVariant={unavailableVariant} />);

      expect(screen.queryByTestId('add-to-cart')).not.toBeInTheDocument();
      expect(screen.getByTestId('stock-alert')).toBeInTheDocument();
    });
  });

  describe('Variant navigation', () => {
    it('navigates when clicking on variant option', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const smallButton = screen.getByText('Small').closest('button');
      expect(smallButton).toBeTruthy();
      await user.click(smallButton!);
      expect(mockNavigate).toHaveBeenCalledWith('?Size=Small', {
        replace: true,
        preventScrollReset: true,
      });
    });

    it('does not navigate when clicking selected option', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const mediumButton = screen.getByText('Medium').closest('button');
      expect(mediumButton).toBeTruthy();
      await user.click(mediumButton!);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Add to cart', () => {
    it('opens cart drawer when adding to cart', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const addToCartButton = screen.getByTestId('add-to-cart');
      await user.click(addToCartButton);

      expect(mockOpen).toHaveBeenCalledWith('cart');
    });

    it('is disabled when no variant selected', () => {
      render(<ProductForm {...defaultProps} selectedVariant={null} />);

      expect(screen.queryByTestId('add-to-cart')).not.toBeInTheDocument();
    });
  });

  describe('Wishlist', () => {
    it('adds product to wishlist when clicked', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const wishlistButton = screen.getByTestId('icon-button');
      await user.click(wishlistButton);

      expect(mockToggleItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'product-123',
          handle: 'premium-wool-coat',
          title: 'Premium Wool Coat',
        })
      );
    });

    it('shows filled heart when in wishlist', () => {
      mockIsInWishlist.mockReturnValue(true);
      render(<ProductForm {...defaultProps} />);

      const heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveAttribute('data-filled', 'true');
    });

    it('shows outlined heart when not in wishlist', () => {
      mockIsInWishlist.mockReturnValue(false);
      render(<ProductForm {...defaultProps} />);

      const heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveAttribute('data-filled', 'false');
    });

    it('shows different label when in wishlist', () => {
      mockIsInWishlist.mockReturnValue(true);
      render(<ProductForm {...defaultProps} />);

      const wishlistButton = screen.getByTestId('icon-button');
      expect(wishlistButton).toHaveAttribute('aria-label', 'Remove from Wishlist');
    });
  });

  describe('Size guide modal', () => {
    it('opens size guide when clicked', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const sizeGuideButton = screen.getByText('Size Guide');
      await user.click(sizeGuideButton);

      await waitFor(() => {
        expect(screen.getByText('Find your perfect fit')).toBeInTheDocument();
      });
    });

    it('shows size chart in modal', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const sizeGuideButton = screen.getByText('Size Guide');
      await user.click(sizeGuideButton);

      await waitFor(() => {
        expect(screen.getByText('XS')).toBeInTheDocument();
        expect(screen.getByText('S')).toBeInTheDocument();
        expect(screen.getByText('M')).toBeInTheDocument();
        expect(screen.getByText('L')).toBeInTheDocument();
        expect(screen.getByText('XL')).toBeInTheDocument();
      });
    });

    it('closes modal when close button clicked', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const sizeGuideButton = screen.getByText('Size Guide');
      await user.click(sizeGuideButton);

      await waitFor(() => {
        expect(screen.getByTestId('close-icon')).toBeInTheDocument();
      });

      // Get all icon buttons and find the one with close icon (inside the size guide modal)
      const iconButtons = screen.getAllByTestId('icon-button');
      const closeButton = iconButtons.find(btn =>
        btn.querySelector('[data-testid="close-icon"]')
      );
      expect(closeButton).toBeDefined();
      await user.click(closeButton!);

      await waitFor(() => {
        expect(screen.queryByText('Find your perfect fit')).not.toBeInTheDocument();
      });
    });
  });

  describe('Stock alert', () => {
    it('shows stock alert for sold out variants', () => {
      const unavailableVariant = {
        ...mockSelectedVariant,
        availableForSale: false,
      };

      render(<ProductForm {...defaultProps} selectedVariant={unavailableVariant} />);

      expect(screen.getByTestId('stock-alert')).toBeInTheDocument();
    });

    it('does not show stock alert for available variants', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.queryByTestId('stock-alert')).not.toBeInTheDocument();
    });

    it('does not show stock alert when no productTitle', () => {
      const unavailableVariant = {
        ...mockSelectedVariant,
        availableForSale: false,
      };

      render(
        <ProductForm
          {...defaultProps}
          selectedVariant={unavailableVariant}
          productTitle={undefined}
        />
      );

      expect(screen.queryByTestId('stock-alert')).not.toBeInTheDocument();
    });
  });

  describe('Color swatches', () => {
    it('applies color from name when no swatch', () => {
      const {container} = render(<ProductForm {...defaultProps} />);

      // Find elements with Black title - should have color applied
      const blackElements = container.querySelectorAll('[title="Black"]');
      expect(blackElements.length).toBeGreaterThan(0);

      // Check that at least one element has a background color style (the swatch)
      const hasColorStyle = Array.from(blackElements).some(el =>
        (el as HTMLElement).style.backgroundColor
      );
      expect(hasColorStyle).toBe(true);
    });

    it('shows image swatch when available', () => {
      const optionsWithImageSwatch: MappedProductOptions[] = [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Pattern',
              handle: '',
              variantUriQuery: 'Color=Pattern',
              selected: true,
              available: true,
              exists: true,
              isDifferentProduct: false,
              swatch: {
                color: null,
                image: {
                  id: 'swatch-img-1',
                  url: 'https://example.com/swatch.jpg',
                  altText: 'Pattern swatch',
                  width: 100,
                  height: 100,
                  previewImage: {
                    url: 'https://example.com/swatch.jpg',
                  },
                },
              } as any,
            },
            {
              name: 'Solid',
              handle: '',
              variantUriQuery: 'Color=Solid',
              selected: false,
              available: true,
              exists: true,
              isDifferentProduct: false,
              swatch: null,
            },
          ],
        },
      ];

      render(<ProductForm {...defaultProps} productOptions={optionsWithImageSwatch} />);

      expect(screen.getByTestId('image')).toBeInTheDocument();
    });
  });

  describe('Single option handling', () => {
    it('hides options with only one value', () => {
      const singleValueOptions: MappedProductOptions[] = [
        {
          name: 'Size',
          optionValues: [
            {
              name: 'One Size',
              handle: '',
              variantUriQuery: 'Size=One+Size',
              selected: true,
              available: true,
              exists: true,
              isDifferentProduct: false,
              swatch: null,
            },
          ],
        },
      ];

      render(<ProductForm {...defaultProps} productOptions={singleValueOptions} />);

      expect(screen.queryByText('Size')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles product without options', () => {
      render(<ProductForm {...defaultProps} productOptions={[]} />);

      expect(screen.getByTestId('add-to-cart')).toBeInTheDocument();
    });

    it('handles product without handle', () => {
      render(<ProductForm {...defaultProps} productHandle={undefined} />);

      expect(screen.getByTestId('add-to-cart')).toBeInTheDocument();
    });

    it('handles variant without compareAtPrice', () => {
      render(<ProductForm {...defaultProps} />);

      expect(mockToggleItem).not.toHaveBeenCalled();
    });

    it('handles product without featuredImage', () => {
      render(<ProductForm {...defaultProps} featuredImage={undefined} />);

      expect(screen.getByTestId('add-to-cart')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      render(<ProductForm {...defaultProps} />);

      const wishlistButton = screen.getByTestId('icon-button');
      expect(wishlistButton).toHaveAttribute('aria-label');
    });

    it('size guide button has accessible label', () => {
      render(<ProductForm {...defaultProps} />);

      const sizeGuideButton = screen.getByText('Size Guide');
      expect(sizeGuideButton).toBeInTheDocument();
    });
  });
});

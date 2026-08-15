/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {CompareDrawer, CompareButton, ComparePageContent} from './CompareDrawer';
import type {CompareProduct} from '~/context/CompareContext';

// Override Image and Money mocks with custom testids
vi.mock('@shopify/hydrogen', () => ({
  Image: ({data, alt}: any) => <img src={data.url} alt={alt} data-testid="image" />,
  Money: ({data}: any) => <span data-testid="money">${data.amount}</span>,
}));

// Mock CompareContext
const mockRemoveProduct = vi.fn();
const mockAddProduct = vi.fn();
const mockClearAll = vi.fn();
const mockIsInCompare = vi.fn().mockReturnValue(false);
const mockProducts: CompareProduct[] = [];
const mockCanAdd = true;

vi.mock('~/context/CompareContext', () => ({
  useCompare: () => ({
    products: mockProducts,
    removeProduct: mockRemoveProduct,
    addProduct: mockAddProduct,
    clearAll: mockClearAll,
    isInCompare: mockIsInCompare,
    canAdd: mockCanAdd,
  }),
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  CloseIcon: ({strokeWidth}: any) => <svg data-testid="close-icon" data-stroke-width={strokeWidth} />,
  CompareIcon: ({filled}: any) => <svg data-testid="compare-icon" data-filled={filled} />,
  ImageIcon: () => <svg data-testid="image-icon" />,
}));

describe('CompareDrawer', () => {
  const createMockProduct = (id: string): CompareProduct => ({
    id,
    handle: `product-${id}`,
    title: `Product ${id}`,
    vendor: 'Test Vendor',
    description: `Description for product ${id}`,
    featuredImage: {
      url: `https://example.com/image-${id}.jpg`,
      altText: `Product ${id}`,
    },
    priceRange: {
      minVariantPrice: {
        amount: '99.00',
        currencyCode: 'USD',
      },
    },
    options: [
      {name: 'Size', values: ['S', 'M', 'L']},
      {name: 'Color', values: ['Black', 'White']},
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockProducts.length = 0;
    mockIsInCompare.mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('does not render when less than 2 products', () => {
      mockProducts.push(createMockProduct('1'));
      const {container} = render(<CompareDrawer />);
      expect(container.firstChild).toBeNull();
    });

    it('renders when 2 or more products', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<CompareDrawer />);

      // CompareDrawer shows thumbnails, not titles - check for images instead
      const images = screen.getAllByTestId('image');
      expect(images.length).toBe(2);
    });

    it('renders compare now link', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<CompareDrawer />);

      const compareLink = screen.getByText('Compare Now').closest('a');
      expect(compareLink).toHaveAttribute('href', '/compare');
    });

    it('renders clear button', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<CompareDrawer />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('shows product count', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<CompareDrawer />);

      expect(screen.getByText('2 items')).toBeInTheDocument();
    });
  });

  describe('Product thumbnails', () => {
    it('renders product images', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<CompareDrawer />);

      const images = screen.getAllByTestId('image');
      expect(images.length).toBe(2);
    });

    it('renders remove buttons on hover', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<CompareDrawer />);

      const removeButtons = screen.getAllByLabelText(/Remove .* from comparison/);
      expect(removeButtons.length).toBe(2);
    });

    it('removes product when remove button clicked', async () => {
      const user = userEvent.setup();
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<CompareDrawer />);

      const removeButton = screen.getByLabelText('Remove Product 1 from comparison');
      await user.click(removeButton);

      expect(mockRemoveProduct).toHaveBeenCalledWith('1');
    });

    it('shows placeholder icon when no image', () => {
      const productWithoutImage = {...createMockProduct('1'), featuredImage: null};
      mockProducts.push(productWithoutImage, createMockProduct('2'));
      render(<CompareDrawer />);

      expect(screen.getByTestId('image-icon')).toBeInTheDocument();
    });
  });

  describe('Empty slots', () => {
    it('shows empty slots for remaining capacity', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      const {container} = render(<CompareDrawer />);

      const emptySlots = container.querySelectorAll('.border-dashed');
      expect(emptySlots.length).toBe(2); // 4 max - 2 products = 2 empty
    });

    it('shows plus icon in empty slots', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<CompareDrawer />);

      const plusSigns = screen.getAllByText('+');
      expect(plusSigns.length).toBe(2);
    });
  });

  describe('Clear functionality', () => {
    it('clears all products when clear clicked', async () => {
      const user = userEvent.setup();
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<CompareDrawer />);

      const clearButton = screen.getByText('Clear');
      await user.click(clearButton);

      expect(mockClearAll).toHaveBeenCalled();
    });
  });

  describe('Layout', () => {
    it('applies fixed position', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      const {container} = render(<CompareDrawer />);

      const drawer = container.querySelector('.fixed.bottom-0');
      expect(drawer).toBeInTheDocument();
    });

    it('has shadow and border', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      const {container} = render(<CompareDrawer />);

      const drawer = container.querySelector('.border-t.shadow-lg');
      expect(drawer).toBeInTheDocument();
    });
  });
});

describe('CompareButton', () => {
  const mockProduct: CompareProduct = {
    id: 'product-123',
    handle: 'test-product',
    title: 'Test Product',
    priceRange: {
      minVariantPrice: {amount: '99.00', currencyCode: 'USD'},
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsInCompare.mockReturnValue(false);
  });

  describe('Icon variant', () => {
    it('renders icon button by default', () => {
      render(<CompareButton product={mockProduct} />);

      expect(screen.getByTestId('compare-icon')).toBeInTheDocument();
    });

    it('adds product when clicked', async () => {
      const user = userEvent.setup();
      render(<CompareButton product={mockProduct} />);

      const button = screen.getByLabelText('Add to comparison');
      await user.click(button);

      expect(mockAddProduct).toHaveBeenCalledWith(mockProduct);
    });

    it('removes product when already comparing', async () => {
      const user = userEvent.setup();
      mockIsInCompare.mockReturnValue(true);
      render(<CompareButton product={mockProduct} />);

      const button = screen.getByLabelText('Remove from comparison');
      await user.click(button);

      expect(mockRemoveProduct).toHaveBeenCalledWith('product-123');
    });

    it('shows filled icon when comparing', () => {
      mockIsInCompare.mockReturnValue(true);
      render(<CompareButton product={mockProduct} />);

      const icon = screen.getByTestId('compare-icon');
      expect(icon).toHaveAttribute('data-filled', 'true');
    });
  });

  describe('Text variant', () => {
    it('renders text button', () => {
      render(<CompareButton product={mockProduct} variant="text" />);

      expect(screen.getByText('Compare')).toBeInTheDocument();
    });

    it('shows "In Compare" when comparing', () => {
      mockIsInCompare.mockReturnValue(true);
      render(<CompareButton product={mockProduct} variant="text" />);

      expect(screen.getByText('In Compare')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(
        <CompareButton product={mockProduct} variant="text" className="custom-class" />
      );

      const button = container.querySelector('.custom-class');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Interaction prevention', () => {
    it('prevents event propagation', async () => {
      const user = userEvent.setup();
      const parentClick = vi.fn();

      render(
         
        <div onClick={parentClick}>
          <CompareButton product={mockProduct} />
        </div>
      );

      const button = screen.getByLabelText('Add to comparison');
      await user.click(button);

      // Parent click should not fire due to stopPropagation
      expect(parentClick).not.toHaveBeenCalled();
    });
  });
});

describe('ComparePageContent', () => {
  const createMockProduct = (id: string): CompareProduct => ({
    id,
    handle: `product-${id}`,
    title: `Product ${id}`,
    vendor: `Vendor ${id}`,
    description: `Description for product ${id}`,
    featuredImage: {
      url: `https://example.com/image-${id}.jpg`,
      altText: `Product ${id}`,
    },
    priceRange: {
      minVariantPrice: {amount: `${100 + parseInt(id) * 10}.00`, currencyCode: 'USD'},
    },
    compareAtPriceRange: null,
    options: [
      {name: 'Size', values: ['S', 'M', 'L']},
      {name: 'Color', values: ['Black', 'White']},
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockProducts.length = 0;
  });

  describe('Empty state', () => {
    it('shows empty state when no products', () => {
      render(<ComparePageContent />);

      expect(screen.getByText('No Products to Compare')).toBeInTheDocument();
    });

    it('shows empty state icon', () => {
      render(<ComparePageContent />);

      expect(screen.getByTestId('compare-icon')).toBeInTheDocument();
    });

    it('shows browse products link', () => {
      render(<ComparePageContent />);

      const link = screen.getByText('Browse Products').closest('a');
      expect(link).toHaveAttribute('href', '/collections/all');
    });
  });

  describe('Comparison table', () => {
    it('renders header with product count', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<ComparePageContent />);

      expect(screen.getByText('Compare Products')).toBeInTheDocument();
      expect(screen.getByText('Comparing 2 products')).toBeInTheDocument();
    });

    it('renders product cards', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<ComparePageContent />);

      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });

    it('renders price row', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<ComparePageContent />);

      expect(screen.getByText('Price')).toBeInTheDocument();
      const moneyElements = screen.getAllByTestId('money');
      expect(moneyElements.length).toBeGreaterThan(0);
    });

    it('renders brand row', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<ComparePageContent />);

      expect(screen.getByText('Brand')).toBeInTheDocument();
      expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      expect(screen.getByText('Vendor 2')).toBeInTheDocument();
    });

    it('renders option rows', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<ComparePageContent />);

      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('Color')).toBeInTheDocument();
    });

    it('shows option values', () => {
      mockProducts.push(createMockProduct('1'));
      render(<ComparePageContent />);

      expect(screen.getByText('S, M, L')).toBeInTheDocument();
      expect(screen.getByText('Black, White')).toBeInTheDocument();
    });

    it('renders description row', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<ComparePageContent />);

      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText(/Description for product 1/)).toBeInTheDocument();
    });

    it('shows dash for missing data', () => {
      const productWithoutVendor = {...createMockProduct('1'), vendor: null};
      mockProducts.push(productWithoutVendor);
      render(<ComparePageContent />);

      const cells = screen.getAllByText('-');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('Product removal', () => {
    it('renders remove buttons', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<ComparePageContent />);

      const removeButtons = screen.getAllByLabelText(/Remove Product/);
      expect(removeButtons.length).toBe(2);
    });

    it('removes product when clicked', async () => {
      const user = userEvent.setup();
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<ComparePageContent />);

      const removeButton = screen.getByLabelText('Remove Product 1');
      await user.click(removeButton);

      expect(mockRemoveProduct).toHaveBeenCalledWith('1');
    });
  });

  describe('Clear all', () => {
    it('renders clear all button', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<ComparePageContent />);

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('clears all products when clicked', async () => {
      const user = userEvent.setup();
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      render(<ComparePageContent />);

      const clearButton = screen.getByText('Clear All');
      await user.click(clearButton);

      expect(mockClearAll).toHaveBeenCalled();
    });
  });

  describe('Product links', () => {
    it('links to product pages', () => {
      mockProducts.push(createMockProduct('1'));
      render(<ComparePageContent />);

      const link = screen.getByText('Product 1').closest('a');
      expect(link).toHaveAttribute('href', '/products/product-1');
    });
  });

  describe('Sale pricing', () => {
    it('shows compare at price when available', () => {
      const productWithSale = {
        ...createMockProduct('1'),
        compareAtPriceRange: {
          minVariantPrice: {amount: '199.00', currencyCode: 'USD'},
        },
      };
      mockProducts.push(productWithSale);
      render(<ComparePageContent />);

      const moneyElements = screen.getAllByTestId('money');
      expect(moneyElements.length).toBe(2);
    });
  });

  describe('Edge cases', () => {
    it('handles products without images', () => {
      const productWithoutImage = {...createMockProduct('1'), featuredImage: null};
      mockProducts.push(productWithoutImage);
      render(<ComparePageContent />);

      expect(screen.getByTestId('image-icon')).toBeInTheDocument();
    });

    it('handles products without descriptions', () => {
      const productWithoutDescription = {...createMockProduct('1'), description: null};
      mockProducts.push(productWithoutDescription);
      render(<ComparePageContent />);

      expect(screen.getByText('No description available')).toBeInTheDocument();
    });

    it('handles products without options', () => {
      const productWithoutOptions = {...createMockProduct('1'), options: []};
      mockProducts.push(productWithoutOptions);
      render(<ComparePageContent />);

      // Should still render other attributes
      expect(screen.getByText('Price')).toBeInTheDocument();
    });
  });

  describe('Table structure', () => {
    it('has proper table structure', () => {
      mockProducts.push(createMockProduct('1'), createMockProduct('2'));
      const {container} = render(<ComparePageContent />);

      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('has attribute column', () => {
      mockProducts.push(createMockProduct('1'));
      render(<ComparePageContent />);

      expect(screen.getByText('Attribute')).toBeInTheDocument();
    });
  });
});

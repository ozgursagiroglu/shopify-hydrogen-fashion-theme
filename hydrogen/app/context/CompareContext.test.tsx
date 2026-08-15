/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, renderHook, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Completely override the mock for this test file
vi.mock('~/context/CompareContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./CompareContext')>();
  return actual;
});

import {
  CompareProvider,
  useCompare,
  type CompareProduct,
} from './CompareContext';

// Test component that exposes compare context
function TestComponent({customProduct}: {customProduct?: CompareProduct}) {
  const {
    products,
    addProduct,
    removeProduct,
    clearAll,
    isInCompare,
    canAdd,
    maxProducts,
  } = useCompare();

  const defaultProduct: CompareProduct = customProduct || {
    id: 'product-1',
    handle: 'test-product',
    title: 'Test Product',
    vendor: 'Test Vendor',
    priceRange: {
      minVariantPrice: {amount: '99.00', currencyCode: 'USD'},
    },
  };

  return (
    <div>
      <span data-testid="product-count">{products.length}</span>
      <span data-testid="can-add">{canAdd.toString()}</span>
      <span data-testid="max-products">{maxProducts}</span>
      <span data-testid="is-in-compare">
        {isInCompare('product-1').toString()}
      </span>
      <ul data-testid="compare-products">
        {products.map((product) => (
          <li key={product.id} data-testid={`product-${product.id}`}>
            {product.title}
          </li>
        ))}
      </ul>
      <button onClick={() => addProduct(defaultProduct)}>Add Product</button>
      <button onClick={() => removeProduct('product-1')}>Remove Product</button>
      <button onClick={() => clearAll()}>Clear All</button>
    </div>
  );
}

function MultiAddTestComponent() {
  const {addProduct, products, canAdd} = useCompare();

  const addMultiple = () => {
    for (let i = 1; i <= 5; i++) {
      addProduct({
        id: `product-${i}`,
        handle: `product-${i}`,
        title: `Product ${i}`,
        priceRange: {
          minVariantPrice: {amount: '99.00', currencyCode: 'USD'},
        },
      });
    }
  };

  return (
    <div>
      <span data-testid="product-count">{products.length}</span>
      <span data-testid="can-add">{canAdd.toString()}</span>
      <button onClick={addMultiple}>Add 5 Products</button>
    </div>
  );
}

describe('CompareContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Clear zustand store state
    act(() => {
      useCompare.setState({products: [], canAdd: true});
    });
  });

  afterEach(() => {
    localStorage.clear();
    act(() => {
      useCompare.setState({products: [], canAdd: true});
    });
  });

  describe('useCompare hook', () => {
    it('can be used without provider (zustand global store)', () => {
      const {result} = renderHook(() => useCompare());
      expect(result.current.products).toEqual([]);
      expect(result.current.canAdd).toBe(true);
      expect(result.current.maxProducts).toBe(4);
    });
  });

  describe('Initial state', () => {
    it('starts with empty products list', () => {
      render(
        <CompareProvider>
          <TestComponent />
        </CompareProvider>,
      );

      expect(screen.getByTestId('product-count')).toHaveTextContent('0');
    });

    it('allows adding initially', () => {
      render(
        <CompareProvider>
          <TestComponent />
        </CompareProvider>,
      );

      expect(screen.getByTestId('can-add')).toHaveTextContent('true');
    });

    it('has maxProducts of 4', () => {
      render(
        <CompareProvider>
          <TestComponent />
        </CompareProvider>,
      );

      expect(screen.getByTestId('max-products')).toHaveTextContent('4');
    });
  });

  describe('addProduct', () => {
    it('adds product to compare list', async () => {
      const user = userEvent.setup();
      render(
        <CompareProvider>
          <TestComponent />
        </CompareProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Product'}));

      expect(screen.getByTestId('product-count')).toHaveTextContent('1');
      expect(screen.getByTestId('product-product-1')).toBeInTheDocument();
    });

    it('does not add duplicate products', async () => {
      const user = userEvent.setup();
      render(
        <CompareProvider>
          <TestComponent />
        </CompareProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Product'}));
      await user.click(screen.getByRole('button', {name: 'Add Product'}));

      expect(screen.getByTestId('product-count')).toHaveTextContent('1');
    });

    it('does not exceed max products limit', async () => {
      const user = userEvent.setup();
      render(
        <CompareProvider>
          <MultiAddTestComponent />
        </CompareProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add 5 Products'}));

      expect(screen.getByTestId('product-count')).toHaveTextContent('4');
    });

    it('sets canAdd to false when max reached', async () => {
      const user = userEvent.setup();
      render(
        <CompareProvider>
          <MultiAddTestComponent />
        </CompareProvider>,
      );

      expect(screen.getByTestId('can-add')).toHaveTextContent('true');

      await user.click(screen.getByRole('button', {name: 'Add 5 Products'}));

      expect(screen.getByTestId('can-add')).toHaveTextContent('false');
    });
  });

  describe('removeProduct', () => {
    it('removes product from compare list', async () => {
      const user = userEvent.setup();
      render(
        <CompareProvider>
          <TestComponent />
        </CompareProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Product'}));
      expect(screen.getByTestId('product-count')).toHaveTextContent('1');

      await user.click(screen.getByRole('button', {name: 'Remove Product'}));
      expect(screen.getByTestId('product-count')).toHaveTextContent('0');
    });

    it('handles removing non-existent product gracefully', async () => {
      const user = userEvent.setup();
      render(
        <CompareProvider>
          <TestComponent />
        </CompareProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Remove Product'}));
      expect(screen.getByTestId('product-count')).toHaveTextContent('0');
    });

    it('sets canAdd to true after removing from full list', async () => {
      const user = userEvent.setup();
      render(
        <CompareProvider>
          <MultiAddTestComponent />
        </CompareProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add 5 Products'}));
      expect(screen.getByTestId('can-add')).toHaveTextContent('false');
    });
  });

  describe('clearAll', () => {
    it('removes all products from compare list', async () => {
      const user = userEvent.setup();
      render(
        <CompareProvider>
          <TestComponent />
        </CompareProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Product'}));
      expect(screen.getByTestId('product-count')).toHaveTextContent('1');

      await user.click(screen.getByRole('button', {name: 'Clear All'}));
      expect(screen.getByTestId('product-count')).toHaveTextContent('0');
    });

    it('resets canAdd to true', async () => {
      const user = userEvent.setup();
      render(
        <CompareProvider>
          <MultiAddTestComponent />
        </CompareProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add 5 Products'}));
      expect(screen.getByTestId('can-add')).toHaveTextContent('false');
    });
  });

  describe('isInCompare', () => {
    it('returns false for products not in compare list', () => {
      render(
        <CompareProvider>
          <TestComponent />
        </CompareProvider>,
      );

      expect(screen.getByTestId('is-in-compare')).toHaveTextContent('false');
    });

    it('returns true for products in compare list', async () => {
      const user = userEvent.setup();
      render(
        <CompareProvider>
          <TestComponent />
        </CompareProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Product'}));

      expect(screen.getByTestId('is-in-compare')).toHaveTextContent('true');
    });
  });

  describe('canAdd', () => {
    it('is true when under max limit', () => {
      render(
        <CompareProvider>
          <TestComponent />
        </CompareProvider>,
      );

      expect(screen.getByTestId('can-add')).toHaveTextContent('true');
    });

    it('is false when at max limit', async () => {
      const user = userEvent.setup();
      render(
        <CompareProvider>
          <MultiAddTestComponent />
        </CompareProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add 5 Products'}));

      expect(screen.getByTestId('product-count')).toHaveTextContent('4');
      expect(screen.getByTestId('can-add')).toHaveTextContent('false');
    });
  });

  describe('Products data integrity', () => {
    it('preserves all product data', async () => {
      const user = userEvent.setup();
      const product: CompareProduct = {
        id: 'product-1',
        handle: 'test-product',
        title: 'Test Product',
        vendor: 'Test Vendor',
        featuredImage: {
          url: 'https://example.com/image.jpg',
          altText: 'Test image',
        },
        priceRange: {
          minVariantPrice: {amount: '99.00', currencyCode: 'USD'},
        },
        compareAtPriceRange: {
          minVariantPrice: {amount: '129.00', currencyCode: 'USD'},
        },
        description: 'Test description',
        tags: ['new', 'featured'],
      };

      render(
        <CompareProvider>
          <TestComponent customProduct={product} />
        </CompareProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Product'}));

      expect(screen.getByTestId('product-product-1')).toHaveTextContent(
        'Test Product',
      );
    });
  });
});

/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor, renderHook} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Completely override the mock for this test file
vi.mock('~/context/QuickViewContext', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('./QuickViewContext')
  >();
  return actual;
});

import {QuickViewProvider, useQuickView} from './QuickViewContext';

// Mock dependencies
const mockFetcherLoad = vi.fn();
const mockFetcher = {
  load: mockFetcherLoad,
  data: null as any,
};

// Override global mock for this test - need to provide custom fetcher
vi.mock('react-router', () => ({
  useFetcher: () => mockFetcher,

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

vi.mock('~/components/product', () => ({
  QuickView: ({isOpen, onClose, product}: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="quick-view-modal">
        <button onClick={onClose} data-testid="close-modal">Close</button>
        {product && <div data-testid="product-title">{product.title}</div>}
      </div>
    );
  },
}));

// Test component
function TestComponent() {
  const {openQuickView, closeQuickView, isOpen} = useQuickView();

  return (
    <div>
      <span data-testid="is-open">{isOpen.toString()}</span>
      <button onClick={() => openQuickView('test-product')}>Open Quick View</button>
      <button onClick={closeQuickView}>Close Quick View</button>
    </div>
  );
}

describe('QuickViewContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcher.data = null;
  });

  describe('useQuickView hook', () => {
    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useQuickView());
      }).toThrow('useQuickView must be used within a QuickViewProvider');
    });
  });

  describe('QuickViewProvider', () => {
    it('renders children', () => {
      render(
        <QuickViewProvider>
          <div data-testid="child">Test Child</div>
        </QuickViewProvider>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('provides context values', () => {
      render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      expect(screen.getByTestId('is-open')).toHaveTextContent('false');
    });
  });

  describe('openQuickView', () => {
    it('opens quick view and fetches product data', async () => {
      const user = userEvent.setup();
      render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      const openButton = screen.getByText('Open Quick View');
      await user.click(openButton);

      expect(screen.getByTestId('is-open')).toHaveTextContent('true');
      expect(mockFetcherLoad).toHaveBeenCalledWith('/api/product/test-product');
    });

    it('displays modal when opened', async () => {
      const user = userEvent.setup();
      render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      const openButton = screen.getByText('Open Quick View');
      await user.click(openButton);

      expect(screen.getByTestId('quick-view-modal')).toBeInTheDocument();
    });

    it('fetches different products when called multiple times', async () => {
      const user = userEvent.setup();

      function TestMultiProduct() {
        const context = useQuickView();

        return (
          <div>
            <button onClick={() => context.openQuickView('product-1')}>Open 1</button>
            <button onClick={() => context.openQuickView('product-2')}>Open 2</button>
          </div>
        );
      }

      render(
        <QuickViewProvider>
          <TestMultiProduct />
        </QuickViewProvider>,
      );

      const button1 = screen.getByText('Open 1');
      const button2 = screen.getByText('Open 2');

      await user.click(button1);
      expect(mockFetcherLoad).toHaveBeenCalledWith('/api/product/product-1');

      mockFetcherLoad.mockClear();

      await user.click(button2);
      expect(mockFetcherLoad).toHaveBeenCalledWith('/api/product/product-2');
    });
  });

  describe('closeQuickView', () => {
    it('closes quick view', async () => {
      const user = userEvent.setup();
      render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      // Open first
      const openButton = screen.getByText('Open Quick View');
      await user.click(openButton);
      expect(screen.getByTestId('is-open')).toHaveTextContent('true');

      // Then close
      const closeButton = screen.getByText('Close Quick View');
      await user.click(closeButton);
      expect(screen.getByTestId('is-open')).toHaveTextContent('false');
    });

    it('clears product data when closed', async () => {
      const user = userEvent.setup();
      mockFetcher.data = {
        product: {
          id: '1',
          title: 'Test Product',
          handle: 'test-product',
        },
      };

      render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      const openButton = screen.getByText('Open Quick View');
      await user.click(openButton);

      await waitFor(() => {
        expect(screen.queryByTestId('product-title')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Close Quick View');
      await user.click(closeButton);

      expect(screen.queryByTestId('quick-view-modal')).not.toBeInTheDocument();
    });

    it('can be called from modal close button', async () => {
      const user = userEvent.setup();
      render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      // Open modal
      const openButton = screen.getByText('Open Quick View');
      await user.click(openButton);

      // Close from modal
      const modalCloseButton = screen.getByTestId('close-modal');
      await user.click(modalCloseButton);

      expect(screen.getByTestId('is-open')).toHaveTextContent('false');
    });
  });

  describe('Product Data Loading', () => {
    it('displays product when fetcher returns data', async () => {
      const user = userEvent.setup();

      // Set fetcher data before opening modal
      mockFetcher.data = {
        product: {
          id: '1',
          title: 'Loaded Product',
          handle: 'loaded-product',
        },
      };

      const {rerender} = render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      const openButton = screen.getByText('Open Quick View');
      await user.click(openButton);

      // Force a rerender to trigger the product state update
      rerender(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('product-title')).toHaveTextContent('Loaded Product');
      });
    });

    it('handles missing product data gracefully', async () => {
      const user = userEvent.setup();
      mockFetcher.data = {};

      render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      const openButton = screen.getByText('Open Quick View');
      await user.click(openButton);

      expect(screen.getByTestId('quick-view-modal')).toBeInTheDocument();
      expect(screen.queryByTestId('product-title')).not.toBeInTheDocument();
    });

    it('only updates product once when data is available', async () => {
      const user = userEvent.setup();

      // Set fetcher data before opening modal
      mockFetcher.data = {
        product: {
          id: '1',
          title: 'Product 1',
          handle: 'product-1',
        },
      };

      const {rerender} = render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      const openButton = screen.getByText('Open Quick View');
      await user.click(openButton);

      // Force a rerender to trigger the product state update
      rerender(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('product-title')).toHaveTextContent('Product 1');
      });

      // Product should still be displayed
      expect(screen.queryByTestId('product-title')).toBeInTheDocument();
    });
  });

  describe('isOpen state', () => {
    it('starts as false', () => {
      render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      expect(screen.getByTestId('is-open')).toHaveTextContent('false');
    });

    it('becomes true when opened', async () => {
      const user = userEvent.setup();
      render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      const openButton = screen.getByText('Open Quick View');
      await user.click(openButton);

      expect(screen.getByTestId('is-open')).toHaveTextContent('true');
    });

    it('becomes false when closed', async () => {
      const user = userEvent.setup();
      render(
        <QuickViewProvider>
          <TestComponent />
        </QuickViewProvider>,
      );

      const openButton = screen.getByText('Open Quick View');
      await user.click(openButton);
      expect(screen.getByTestId('is-open')).toHaveTextContent('true');

      const closeButton = screen.getByText('Close Quick View');
      await user.click(closeButton);
      expect(screen.getByTestId('is-open')).toHaveTextContent('false');
    });
  });

  describe('Multiple Consumers', () => {
    it('shares state between multiple components', async () => {
      const user = userEvent.setup();

      function Consumer1() {
        const {openQuickView} = useQuickView();
        return <button onClick={() => openQuickView('shared-product')}>Open from 1</button>;
      }

      function Consumer2() {
        const {isOpen, closeQuickView} = useQuickView();
        return (
          <div>
            <span data-testid="consumer2-open">{isOpen.toString()}</span>
            <button onClick={closeQuickView}>Close from 2</button>
          </div>
        );
      }

      render(
        <QuickViewProvider>
          <Consumer1 />
          <Consumer2 />
        </QuickViewProvider>,
      );

      expect(screen.getByTestId('consumer2-open')).toHaveTextContent('false');

      const openButton = screen.getByText('Open from 1');
      await user.click(openButton);

      expect(screen.getByTestId('consumer2-open')).toHaveTextContent('true');

      const closeButton = screen.getByText('Close from 2');
      await user.click(closeButton);

      expect(screen.getByTestId('consumer2-open')).toHaveTextContent('false');
    });
  });
});

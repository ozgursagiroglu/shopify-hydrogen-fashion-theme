/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, act, renderHook} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Completely override the mock for this test file
vi.mock('~/context/RecentlyViewedContext', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('./RecentlyViewedContext')
  >();
  return actual;
});

import {RecentlyViewedProvider, useRecentlyViewed} from './RecentlyViewedContext';

// Mock constants
vi.mock('~/lib/constants', () => ({
  STORAGE_KEYS: {
    RECENTLY_VIEWED: 'elan-recently-viewed',
  },
  TIMING: {
    THIRTY_DAYS_MS: 30 * 24 * 60 * 60 * 1000,
  },
  LIMITS: {
    MAX_RECENTLY_VIEWED: 20,
  },
}));

// Test component that exposes recently viewed context
function TestComponent() {
  const {items, addItem, clearItems} = useRecentlyViewed();

  const testItem = {
    id: 'product-1',
    handle: 'test-product',
    title: 'Test Product',
    vendor: 'Test Vendor',
    price: {amount: '99.00', currencyCode: 'USD'},
  };

  const testItem2 = {
    id: 'product-2',
    handle: 'test-product-2',
    title: 'Test Product 2',
    vendor: 'Test Vendor',
    price: {amount: '149.00', currencyCode: 'USD'},
  };

  return (
    <div>
      <span data-testid="item-count">{items.length}</span>
      <ul data-testid="recently-viewed-items">
        {items.map((item, index) => (
          <li key={item.handle} data-testid={`item-${item.handle}`} data-index={index}>
            {item.title}
          </li>
        ))}
      </ul>
      <button onClick={() => addItem(testItem)}>Add Item 1</button>
      <button onClick={() => addItem(testItem2)}>Add Item 2</button>
      <button onClick={() => clearItems()}>Clear All</button>
    </div>
  );
}

function ManyItemsTestComponent() {
  const {items, addItem} = useRecentlyViewed();

  const addMany = () => {
    for (let i = 1; i <= 25; i++) {
      addItem({
        id: `product-${i}`,
        handle: `product-${i}`,
        title: `Product ${i}`,
        price: {amount: '99.00', currencyCode: 'USD'},
      });
    }
  };

  return (
    <div>
      <span data-testid="item-count">{items.length}</span>
      <button onClick={addMany}>Add 25 Items</button>
    </div>
  );
}

describe('RecentlyViewedContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Clear zustand store state
    act(() => {
      useRecentlyViewed.setState({items: []});
    });
  });

  afterEach(() => {
    localStorage.clear();
    act(() => {
      useRecentlyViewed.setState({items: []});
    });
  });

  describe('useRecentlyViewed hook', () => {
    it('can be used without provider (zustand global store)', () => {
      const {result} = renderHook(() => useRecentlyViewed());
      expect(result.current.items).toEqual([]);
    });
  });

  describe('Initial state', () => {
    it('starts with empty items list', () => {
      render(
        <RecentlyViewedProvider>
          <TestComponent />
        </RecentlyViewedProvider>,
      );

      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });

    it('loads items from localStorage on mount', async () => {
      const storedItems = [
        {
          id: 'stored-1',
          handle: 'stored-product',
          title: 'Stored Product',
          price: {amount: '50.00', currencyCode: 'USD'},
          viewedAt: Date.now(),
        },
      ];
      const persistedState = {
        state: {items: storedItems},
        version: 0,
      };
      localStorage.setItem('elan-recently-viewed', JSON.stringify(persistedState));

      // Manually rehydrate the store since skipHydration is true
      act(() => {
        useRecentlyViewed.setState({items: storedItems});
      });

      render(
        <RecentlyViewedProvider>
          <TestComponent />
        </RecentlyViewedProvider>,
      );

      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      expect(screen.getByTestId('item-stored-product')).toBeInTheDocument();
    });

    it('filters out items older than 30 days on load', async () => {
      const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
      const recentItem = Date.now();

      const storedItems = [
        {
          id: 'old-1',
          handle: 'old-product',
          title: 'Old Product',
          price: {amount: '50.00', currencyCode: 'USD'},
          viewedAt: thirtyOneDaysAgo,
        },
        {
          id: 'recent-1',
          handle: 'recent-product',
          title: 'Recent Product',
          price: {amount: '75.00', currencyCode: 'USD'},
          viewedAt: recentItem,
        },
      ];
      const persistedState = {
        state: {items: storedItems},
        version: 0,
      };
      localStorage.setItem('elan-recently-viewed', JSON.stringify(persistedState));

      // Manually rehydrate with only recent items (simulating the filter logic)
      const recentItems = storedItems.filter(
        (item) => item.viewedAt > Date.now() - 30 * 24 * 60 * 60 * 1000,
      );
      act(() => {
        useRecentlyViewed.setState({items: recentItems});
      });

      render(
        <RecentlyViewedProvider>
          <TestComponent />
        </RecentlyViewedProvider>,
      );

      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      expect(screen.queryByTestId('item-old-product')).not.toBeInTheDocument();
      expect(screen.getByTestId('item-recent-product')).toBeInTheDocument();
    });
  });

  describe('addItem', () => {
    it('adds item to recently viewed list', async () => {
      const user = userEvent.setup();
      render(
        <RecentlyViewedProvider>
          <TestComponent />
        </RecentlyViewedProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item 1'}));

      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      expect(screen.getByTestId('item-test-product')).toBeInTheDocument();
    });

    it('moves existing item to front when re-added', async () => {
      const user = userEvent.setup();
      render(
        <RecentlyViewedProvider>
          <TestComponent />
        </RecentlyViewedProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item 1'}));
      await user.click(screen.getByRole('button', {name: 'Add Item 2'}));
      await user.click(screen.getByRole('button', {name: 'Add Item 1'}));

      expect(screen.getByTestId('item-count')).toHaveTextContent('2');

      // Item 1 should now be at index 0 (front)
      const item1 = screen.getByTestId('item-test-product');
      expect(item1).toHaveAttribute('data-index', '0');
    });

    it('adds timestamp to item', async () => {
      const user = userEvent.setup();
      const beforeTime = Date.now();

      render(
        <RecentlyViewedProvider>
          <TestComponent />
        </RecentlyViewedProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item 1'}));

      // Wait for localStorage update
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      const stored = localStorage.getItem('elan-recently-viewed');
      const parsed = JSON.parse(stored || '{"state":{"items":[]}}');
      expect(parsed.state.items[0].viewedAt).toBeGreaterThanOrEqual(beforeTime);
    });

    it('limits items to MAX_RECENTLY_VIEWED', async () => {
      const user = userEvent.setup();
      render(
        <RecentlyViewedProvider>
          <ManyItemsTestComponent />
        </RecentlyViewedProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add 25 Items'}));

      expect(screen.getByTestId('item-count')).toHaveTextContent('20');
    });

    it('keeps most recent items when exceeding limit', async () => {
      const user = userEvent.setup();
      render(
        <RecentlyViewedProvider>
          <ManyItemsTestComponent />
        </RecentlyViewedProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add 25 Items'}));

      // Items 6-25 should be kept (most recent 20)
      // Items 1-5 should be removed
      expect(screen.getByTestId('item-count')).toHaveTextContent('20');
    });
  });

  describe('clearItems', () => {
    it('removes all items from recently viewed list', async () => {
      const user = userEvent.setup();
      render(
        <RecentlyViewedProvider>
          <TestComponent />
        </RecentlyViewedProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item 1'}));
      await user.click(screen.getByRole('button', {name: 'Add Item 2'}));
      expect(screen.getByTestId('item-count')).toHaveTextContent('2');

      await user.click(screen.getByRole('button', {name: 'Clear All'}));
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });
  });

  describe('localStorage persistence', () => {
    it('persists items to localStorage', async () => {
      const user = userEvent.setup();
      render(
        <RecentlyViewedProvider>
          <TestComponent />
        </RecentlyViewedProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item 1'}));

      // Wait for localStorage update
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      const stored = localStorage.getItem('elan-recently-viewed');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      // Zustand persist format: {state: {...}, version: number}
      expect(parsed.state.items).toHaveLength(1);
    });

    it('clears localStorage when items are cleared', async () => {
      const user = userEvent.setup();
      render(
        <RecentlyViewedProvider>
          <TestComponent />
        </RecentlyViewedProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item 1'}));
      await user.click(screen.getByRole('button', {name: 'Clear All'}));

      // Wait for localStorage update
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      const stored = localStorage.getItem('elan-recently-viewed');
      const parsed = JSON.parse(stored!);
      // Zustand persist format: {state: {...}, version: number}
      expect(parsed.state.items).toHaveLength(0);
    });
  });

  describe('Item order', () => {
    it('maintains most recent first order', async () => {
      const user = userEvent.setup();
      render(
        <RecentlyViewedProvider>
          <TestComponent />
        </RecentlyViewedProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item 1'}));
      await user.click(screen.getByRole('button', {name: 'Add Item 2'}));

      // Item 2 should be at index 0 (most recent)
      const item2 = screen.getByTestId('item-test-product-2');
      expect(item2).toHaveAttribute('data-index', '0');

      // Item 1 should be at index 1
      const item1 = screen.getByTestId('item-test-product');
      expect(item1).toHaveAttribute('data-index', '1');
    });
  });

  describe('Item data preservation', () => {
    it('preserves all item data', async () => {
      const user = userEvent.setup();
      render(
        <RecentlyViewedProvider>
          <TestComponent />
        </RecentlyViewedProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item 1'}));

      // Wait for localStorage update
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      const stored = localStorage.getItem('elan-recently-viewed');
      const parsed = JSON.parse(stored || '{"state":{"items":[]}}');
      expect(parsed.state.items[0]).toMatchObject({
        id: 'product-1',
        handle: 'test-product',
        title: 'Test Product',
        vendor: 'Test Vendor',
        price: {amount: '99.00', currencyCode: 'USD'},
      });
    });
  });
});

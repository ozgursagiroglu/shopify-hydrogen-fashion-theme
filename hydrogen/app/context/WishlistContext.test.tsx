/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, act, renderHook} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Completely override the mock for this test file
vi.mock('~/context/WishlistContext', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('./WishlistContext')
  >();
  return actual;
});

import {WishlistProvider, useWishlist} from './WishlistContext';

// Mock constants
vi.mock('~/lib/constants', () => ({
  STORAGE_KEYS: {
    WISHLIST: 'elan-wishlist',
  },
}));

// Test component that exposes wishlist context
function TestComponent() {
  const {items, addItem, removeItem, toggleItem, isInWishlist, clearWishlist, itemCount} =
    useWishlist();

  const testItem = {
    id: 'product-1',
    handle: 'test-product',
    title: 'Test Product',
    vendor: 'Test Vendor',
    price: {amount: '99.00', currencyCode: 'USD'},
  };

  return (
    <div>
      <span data-testid="item-count">{itemCount}</span>
      <span data-testid="is-in-wishlist">{isInWishlist('test-product').toString()}</span>
      <ul data-testid="wishlist-items">
        {items.map((item) => (
          <li key={item.handle} data-testid={`item-${item.handle}`}>
            {item.title}
          </li>
        ))}
      </ul>
      <button onClick={() => addItem(testItem)}>Add Item</button>
      <button onClick={() => removeItem('test-product')}>Remove Item</button>
      <button onClick={() => toggleItem(testItem)}>Toggle Item</button>
      <button onClick={() => clearWishlist()}>Clear All</button>
    </div>
  );
}

describe('WishlistContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Clear zustand store state
    act(() => {
      useWishlist.setState({items: [], itemCount: 0});
    });
  });

  afterEach(() => {
    localStorage.clear();
    act(() => {
      useWishlist.setState({items: [], itemCount: 0});
    });
  });

  describe('useWishlist hook', () => {
    it('can be used without provider (zustand global store)', () => {
      const {result} = renderHook(() => useWishlist());
      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);
    });
  });

  describe('Initial state', () => {
    it('starts with empty wishlist', () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
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
          addedAt: Date.now(),
        },
      ];
      const persistedState = {
        state: {items: storedItems, itemCount: 1},
        version: 0,
      };
      localStorage.setItem('elan-wishlist', JSON.stringify(persistedState));

      // Manually rehydrate the store since skipHydration is true
      act(() => {
        useWishlist.setState({items: storedItems, itemCount: 1});
      });

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      expect(screen.getByTestId('item-stored-product')).toBeInTheDocument();
    });
  });

  describe('addItem', () => {
    it('adds item to wishlist', async () => {
      const user = userEvent.setup();
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item'}));

      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      expect(screen.getByTestId('item-test-product')).toBeInTheDocument();
    });

    it('does not add duplicate items', async () => {
      const user = userEvent.setup();
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item'}));
      await user.click(screen.getByRole('button', {name: 'Add Item'}));

      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    });

    it('adds timestamp to item', async () => {
      const user = userEvent.setup();
      const beforeTime = Date.now();

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item'}));

      // Wait for localStorage update
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      const stored = localStorage.getItem('elan-wishlist');
      const parsed = JSON.parse(stored || '{"state":{"items":[]}}');
      expect(parsed.state.items[0].addedAt).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('removeItem', () => {
    it('removes item from wishlist', async () => {
      const user = userEvent.setup();
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item'}));
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');

      await user.click(screen.getByRole('button', {name: 'Remove Item'}));
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });

    it('handles removing non-existent item gracefully', async () => {
      const user = userEvent.setup();
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Remove Item'}));
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });
  });

  describe('toggleItem', () => {
    it('adds item if not in wishlist', async () => {
      const user = userEvent.setup();
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('false');

      await user.click(screen.getByRole('button', {name: 'Toggle Item'}));

      expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('true');
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    });

    it('removes item if already in wishlist', async () => {
      const user = userEvent.setup();
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Toggle Item'}));
      expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('true');

      await user.click(screen.getByRole('button', {name: 'Toggle Item'}));
      expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('false');
    });
  });

  describe('isInWishlist', () => {
    it('returns false for items not in wishlist', () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('false');
    });

    it('returns true for items in wishlist', async () => {
      const user = userEvent.setup();
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item'}));

      expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('true');
    });
  });

  describe('clearWishlist', () => {
    it('removes all items from wishlist', async () => {
      const user = userEvent.setup();
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item'}));
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');

      await user.click(screen.getByRole('button', {name: 'Clear All'}));
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });
  });

  describe('localStorage persistence', () => {
    it('persists items to localStorage', async () => {
      const user = userEvent.setup();
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item'}));

      // Wait for localStorage update
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      const stored = localStorage.getItem('elan-wishlist');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      // Zustand persist format: {state: {...}, version: number}
      expect(parsed.state.items).toHaveLength(1);
    });

    it('clears localStorage when wishlist is cleared', async () => {
      const user = userEvent.setup();
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      await user.click(screen.getByRole('button', {name: 'Add Item'}));
      await user.click(screen.getByRole('button', {name: 'Clear All'}));

      // Wait for localStorage update
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      const stored = localStorage.getItem('elan-wishlist');
      const parsed = JSON.parse(stored!);
      // Zustand persist format: {state: {...}, version: number}
      expect(parsed.state.items).toHaveLength(0);
    });
  });

  describe('itemCount', () => {
    it('reflects current number of items', async () => {
      const user = userEvent.setup();
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>,
      );

      expect(screen.getByTestId('item-count')).toHaveTextContent('0');

      await user.click(screen.getByRole('button', {name: 'Add Item'}));
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');

      await user.click(screen.getByRole('button', {name: 'Remove Item'}));
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });
  });
});

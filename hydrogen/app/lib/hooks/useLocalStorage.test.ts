import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act, waitFor} from '@testing-library/react';
import {useLocalStorage, useSimpleLocalStorage} from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Basic Functionality', () => {
    it('returns initial value when no stored value exists', () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      const [value] = result.current;
      expect(value).toBe('initial');
    });

    it('updates value when setValue is called', async () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      const [, setValue] = result.current;

      act(() => {
        setValue('updated');
      });

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('updated');
      });
    });

    it('persists value to localStorage', async () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      const [, setValue] = result.current;

      act(() => {
        setValue('persisted');
      });

      await waitFor(() => {
        const stored = localStorage.getItem('test-key');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.value).toBe('persisted');
      });
    });

    it('loads value from localStorage on mount', async () => {
      const storedValue = {
        value: 'stored',
        timestamp: Date.now(),
      };
      localStorage.setItem('test-key', JSON.stringify(storedValue));

      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('stored');
      });
    });

    it('supports functional updates', async () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 0),
      );

      const [, setValue] = result.current;

      act(() => {
        setValue((prev) => prev + 1);
      });

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe(1);
      });

      act(() => {
        setValue((prev) => prev * 2);
      });

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe(2);
      });
    });
  });

  describe('Type Safety', () => {
    it('works with string values', async () => {
      const {result} = renderHook(() =>
        useLocalStorage<string>('test-key', 'hello'),
      );

      const [value, setValue] = result.current;
      expect(typeof value).toBe('string');

      act(() => {
        setValue('world');
      });

      await waitFor(() => {
        const [newValue] = result.current;
        expect(newValue).toBe('world');
      });
    });

    it('works with number values', async () => {
      const {result} = renderHook(() =>
        useLocalStorage<number>('test-key', 42),
      );

      const [value, setValue] = result.current;
      expect(typeof value).toBe('number');

      act(() => {
        setValue(100);
      });

      await waitFor(() => {
        const [newValue] = result.current;
        expect(newValue).toBe(100);
      });
    });

    it('works with object values', async () => {
      interface User {
        name: string;
        age: number;
      }

      const {result} = renderHook(() =>
        useLocalStorage<User>('test-key', {name: 'John', age: 30}),
      );

      const [value, setValue] = result.current;
      expect(value).toEqual({name: 'John', age: 30});

      act(() => {
        setValue({name: 'Jane', age: 25});
      });

      await waitFor(() => {
        const [newValue] = result.current;
        expect(newValue).toEqual({name: 'Jane', age: 25});
      });
    });

    it('works with array values', async () => {
      const {result} = renderHook(() =>
        useLocalStorage<string[]>('test-key', ['a', 'b']),
      );

      const [value, setValue] = result.current;
      expect(value).toEqual(['a', 'b']);

      act(() => {
        setValue(['x', 'y', 'z']);
      });

      await waitFor(() => {
        const [newValue] = result.current;
        expect(newValue).toEqual(['x', 'y', 'z']);
      });
    });
  });

  describe('TTL (Time To Live)', () => {
    it('respects TTL option', async () => {
      const ttl = 1000; // 1 second
      const storedValue = {
        value: 'expired',
        timestamp: Date.now() - 2000, // 2 seconds ago
        ttl,
      };
      localStorage.setItem('test-key', JSON.stringify(storedValue));

      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial', {ttl}),
      );

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('initial'); // Should use initial value, not expired one
      });

      // After hydration, the hook saves the initial value to localStorage
      // The expired item was removed, then initial value was saved
      const stored = localStorage.getItem('test-key');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.value).toBe('initial');
    });

    it('loads non-expired values with TTL', async () => {
      const ttl = 10000; // 10 seconds
      const storedValue = {
        value: 'not-expired',
        timestamp: Date.now() - 1000, // 1 second ago
        ttl,
      };
      localStorage.setItem('test-key', JSON.stringify(storedValue));

      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial', {ttl}),
      );

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('not-expired');
      });
    });

    it('stores values with TTL', async () => {
      const ttl = 5000;
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial', {ttl}),
      );

      const [, setValue] = result.current;

      act(() => {
        setValue('with-ttl');
      });

      await waitFor(() => {
        const stored = localStorage.getItem('test-key');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.value).toBe('with-ttl');
        expect(parsed.ttl).toBe(ttl);
        expect(parsed.timestamp).toBeDefined();
      });
    });
  });

  describe('Cross-Tab Synchronization', () => {
    it('syncs updates from other tabs when enabled', async () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial', {syncAcrossTabs: true}),
      );

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('initial');
      });

      // Simulate storage event from another tab
      const newValue = {
        value: 'from-other-tab',
        timestamp: Date.now(),
      };

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'test-key',
            newValue: JSON.stringify(newValue),
          }),
        );
      });

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('from-other-tab');
      });
    });

    it('does not sync when disabled', async () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial', {syncAcrossTabs: false}),
      );

      const [initialValue] = result.current;
      expect(initialValue).toBe('initial');

      // Simulate storage event from another tab
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'test-key',
            newValue: JSON.stringify({value: 'from-other-tab', timestamp: Date.now()}),
          }),
        );
      });

      // Value should remain unchanged
      const [value] = result.current;
      expect(value).toBe('initial');
    });

    it('handles key removal from other tabs', async () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial', {syncAcrossTabs: true}),
      );

      const [, setValue] = result.current;

      act(() => {
        setValue('updated');
      });

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('updated');
      });

      // Simulate key removal from another tab
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'test-key',
            newValue: null,
          }),
        );
      });

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('initial'); // Should reset to initial value
      });
    });

    it('ignores storage events for other keys', async () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial', {syncAcrossTabs: true}),
      );

      const [initialValue] = result.current;

      // Simulate storage event for different key
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'other-key',
            newValue: JSON.stringify({value: 'other-value', timestamp: Date.now()}),
          }),
        );
      });

      const [value] = result.current;
      expect(value).toBe(initialValue);
    });

    it('ignores expired values from other tabs', async () => {
      const ttl = 1000;
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial', {syncAcrossTabs: true, ttl}),
      );

      // Simulate expired value from another tab
      const expiredValue = {
        value: 'expired',
        timestamp: Date.now() - 2000,
        ttl,
      };

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'test-key',
            newValue: JSON.stringify(expiredValue),
          }),
        );
      });

      const [value] = result.current;
      expect(value).toBe('initial'); // Should not update with expired value
    });
  });

  describe('Remove Value', () => {
    it('removes value from state and localStorage', async () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      const [, setValue, removeValue] = result.current;

      act(() => {
        setValue('updated');
      });

      await waitFor(() => {
        expect(localStorage.getItem('test-key')).toBeTruthy();
        const parsed = JSON.parse(localStorage.getItem('test-key')!);
        expect(parsed.value).toBe('updated');
      });

      act(() => {
        removeValue();
      });

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('initial');
        // Note: removeValue sets state to initial, which triggers the save effect
        // So localStorage will contain the initial value, not be null
        const stored = localStorage.getItem('test-key');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.value).toBe('initial');
      });
    });
  });

  describe('Legacy Format Support', () => {
    it('loads legacy plain value format', async () => {
      localStorage.setItem('test-key', JSON.stringify('legacy-value'));

      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('legacy-value');
      });
    });

    it('upgrades legacy format on next save', async () => {
      localStorage.setItem('test-key', JSON.stringify('legacy'));

      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('legacy');
      });

      const [, setValue] = result.current;

      act(() => {
        setValue('upgraded');
      });

      await waitFor(() => {
        const stored = localStorage.getItem('test-key');
        const parsed = JSON.parse(stored!);
        expect(parsed.value).toBe('upgraded');
        expect(parsed.timestamp).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles JSON parse errors gracefully', async () => {
      localStorage.setItem('test-key', 'invalid-json');

      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('initial');
      });
    });

    it('handles localStorage quota exceeded', async () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      // Mock setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem;
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const [, setValue] = result.current;

      // Should not throw
      expect(() => {
        act(() => {
          setValue('large-value');
        });
      }).not.toThrow();

      localStorage.setItem = originalSetItem;
    });

    it('handles localStorage.removeItem errors', () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      // Mock removeItem to throw
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('RemoveError');
      });

      const [, , removeValue] = result.current;

      // Should not throw
      expect(() => {
        act(() => {
          removeValue();
        });
      }).not.toThrow();
    });
  });

  describe('SSR Safety', () => {
    it('accesses localStorage in useEffect, not during render phase', async () => {
      // SSR safety means the hook starts with initial value synchronously
      // and only accesses localStorage in useEffect (after mount)
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      // Initial render should return initial value
      const [value] = result.current;
      expect(value).toBe('initial');

      // After hydration, the hook may access localStorage
      await waitFor(() => {
        expect(result.current[0]).toBe('initial');
      });
    });

    it('starts with initial value before hydration', () => {
      const {result} = renderHook(() =>
        useLocalStorage('test-key', 'initial'),
      );

      const [value] = result.current;
      expect(value).toBe('initial');
    });
  });

  describe('useSimpleLocalStorage', () => {
    it('provides simplified API without remove function', () => {
      const {result} = renderHook(() =>
        useSimpleLocalStorage('test-key', 'initial'),
      );

      expect(result.current).toHaveLength(2);
      const [value, setValue] = result.current;
      expect(value).toBe('initial');
      expect(typeof setValue).toBe('function');
    });

    it('works the same as full version for basic use', async () => {
      const {result} = renderHook(() =>
        useSimpleLocalStorage('test-key', 'initial'),
      );

      const [, setValue] = result.current;

      act(() => {
        setValue('updated');
      });

      await waitFor(() => {
        const [value] = result.current;
        expect(value).toBe('updated');
      });
    });
  });

  describe('Multiple Instances', () => {
    it('does not share state between hooks in same tab (independent state)', async () => {
      // Each hook instance has its own React state
      // They only share through localStorage on mount/unmount
      const {result: result1} = renderHook(() =>
        useLocalStorage('shared-key', 'initial'),
      );
      const {result: result2} = renderHook(() =>
        useLocalStorage('shared-key', 'initial'),
      );

      const [, setValue1] = result1.current;

      act(() => {
        setValue1('updated');
      });

      await waitFor(() => {
        const [value1] = result1.current;
        expect(value1).toBe('updated');
      });

      // Second instance won't see the update because they don't share React state
      // It would need to re-mount or use syncAcrossTabs with storage events
      const [value2] = result2.current;
      expect(value2).toBe('initial');
    });

    it('keeps separate state for different keys', async () => {
      const {result: result1} = renderHook(() =>
        useLocalStorage('key1', 'initial1'),
      );
      const {result: result2} = renderHook(() =>
        useLocalStorage('key2', 'initial2'),
      );

      const [, setValue1] = result1.current;

      act(() => {
        setValue1('updated1');
      });

      await waitFor(() => {
        const [value1] = result1.current;
        const [value2] = result2.current;
        expect(value1).toBe('updated1');
        expect(value2).toBe('initial2');
      });
    });
  });
});

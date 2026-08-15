/**
 * useLocalStorage Hook
 * A type-safe hook for reading and writing to localStorage with SSR support
 *
 * Usage:
 * const [value, setValue, removeValue] = useLocalStorage<User>('user-key', defaultUser);
 *
 * Features:
 * - SSR-safe (no hydration mismatch)
 * - Type-safe with generics
 * - Expiration support
 * - Cross-tab synchronization
 */

import {useState, useCallback, useEffect} from 'react';

export interface UseLocalStorageOptions {
  /** Time-to-live in milliseconds. After this time, the value will be treated as expired. */
  ttl?: number;
  /** Whether to sync across tabs using the storage event */
  syncAcrossTabs?: boolean;
}

interface StoredValue<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

function isStoredValue<T>(data: unknown): data is StoredValue<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'value' in data &&
    'timestamp' in data
  );
}

function isExpired<T>(stored: StoredValue<T>): boolean {
  if (!stored.ttl) return false;
  return Date.now() - stored.timestamp > stored.ttl;
}

/**
 * Hook for managing localStorage with SSR support and type safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {},
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  const {ttl, syncAcrossTabs = false} = options;

  // State to track if we're hydrated
  const [isHydrated, setIsHydrated] = useState(false);

  // State to hold our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from localStorage on mount (client-side only)
   
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item) as unknown;

        // Handle versioned storage format
        if (isStoredValue<T>(parsed)) {
          if (!isExpired(parsed)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate initialization from localStorage on mount
            setStoredValue(parsed.value);
          } else {
            // Remove expired item
            window.localStorage.removeItem(key);
          }
        } else {
          // Handle legacy format (plain value)
           
          setStoredValue(parsed as T);
        }
      }
    } catch {
      // Silent fail - use initial value
    }

    setIsHydrated(true);
  }, [key]);

  // Save to localStorage on change
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;

    try {
      const valueToStore: StoredValue<T> = {
        value: storedValue,
        timestamp: Date.now(),
        ...(ttl && {ttl}),
      };
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      // Silent fail - localStorage may be full or unavailable
    }
  }, [key, storedValue, isHydrated, ttl]);

  // Listen for storage events from other tabs
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;

      try {
        if (e.newValue) {
          const parsed = JSON.parse(e.newValue) as unknown;
          if (isStoredValue<T>(parsed) && !isExpired(parsed)) {
            setStoredValue(parsed.value);
          }
        } else {
          // Key was removed
          setStoredValue(initialValue);
        }
      } catch {
        // Silent fail
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, syncAcrossTabs, initialValue]);

  // Setter function
  const setValue = useCallback(
    (value: T | ((prevValue: T) => T)) => {
      setStoredValue((prev) =>
        typeof value === 'function' ? (value as (prevValue: T) => T)(prev) : value,
      );
    },
    [],
  );

  // Remove function
  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Silent fail
      }
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Simple version without expiration or sync features
 * For basic use cases where you just need to persist a value
 */
export function useSimpleLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prevValue: T) => T)) => void] {
  const [value, setValue] = useLocalStorage<T>(key, initialValue);
  return [value, setValue];
}

export default useLocalStorage;

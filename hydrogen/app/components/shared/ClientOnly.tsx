import {useState, useEffect, type ReactNode} from 'react';

export interface ClientOnlyProps {
  children: ReactNode;
  /** Optional fallback to show during SSR */
  fallback?: ReactNode;
}

/**
 * ClientOnly component - Only renders children on the client side
 *
 * Useful for:
 * - Components with hydration issues
 * - Browser-only features (localStorage, etc.)
 * - Suspense boundaries that update during hydration
 *
 * @example
 * <ClientOnly fallback={<Skeleton />}>
 *   <ComponentWithHydrationIssue />
 * </ClientOnly>
 */
export function ClientOnly({children, fallback = null}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- standard client-only pattern, setState on mount is intentional */
  useEffect(() => {
    setHasMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

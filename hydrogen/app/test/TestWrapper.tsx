import type {ReactNode} from 'react';

/**
 * Test wrapper component for providing context to components under test
 */
export function TestWrapper({children}: {children: ReactNode}) {
  return <>{children}</>;
}

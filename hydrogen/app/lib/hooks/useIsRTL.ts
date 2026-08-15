import {useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';

/**
 * useIsRTL - Check if current locale is RTL (Right-to-Left)
 *
 * Returns true if the current locale is Arabic (ar), false otherwise.
 *
 * @example
 * ```tsx
 * const isRTL = useIsRTL();
 * <div className={isRTL ? 'text-right' : 'text-left'}>
 * ```
 */
export function useIsRTL(): boolean {
  const rootData = useRouteLoaderData<RootLoader>('root');
  return rootData?.locale === 'ar';
}

/**
 * SEO utilities for page titles and meta tags
 * Ensures consistent branding across all pages using Shopify shop settings
 */

type RouteMatch = {id: string; data: unknown} | undefined;

/**
 * Get shop name from route matches (root loader data)
 * Falls back to 'Shop' if not available
 */
export function getShopName(matches: RouteMatch[]): string {
  const rootMatch = matches.find((match) => match?.id === 'root');
  if (rootMatch?.data) {
    const rootData = rootMatch.data as {header?: {shop?: {name?: string}}};
    return rootData.header?.shop?.name || 'Shop';
  }
  return 'Shop';
}

/**
 * Build page title with shop name suffix
 * @param pageTitle - The page-specific title
 * @param matches - Route matches from meta function
 * @returns Formatted title like "Page Title | Shop Name"
 */
export function buildPageTitle(
  pageTitle: string,
  matches: RouteMatch[],
): string {
  const shopName = getShopName(matches);
  return `${pageTitle} | ${shopName}`;
}

/**
 * Build page title for when data might be null (error states)
 * @param pageTitle - The page-specific title or null
 * @param fallback - Fallback title if pageTitle is null
 * @param matches - Route matches from meta function
 * @returns Formatted title
 */
export function buildPageTitleWithFallback(
  pageTitle: string | null | undefined,
  fallback: string,
  matches: RouteMatch[],
): string {
  const title = pageTitle || fallback;
  return buildPageTitle(title, matches);
}

import type {I18nBase} from '@shopify/hydrogen';
import {useLocation} from 'react-router';
import {useMemo} from 'react';
import {API} from './constants';

export interface I18nLocale extends I18nBase {
  pathPrefix: string;
}

/**
 * Parse locale from request URL for Hydrogen context
 * Supports format like /en-us/products, /fr-fr/collections, etc.
 * Also handles React Router 7 Single Fetch .data suffix (e.g., /ar-ae.data)
 */
export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  // Remove .data suffix for React Router 7 Single Fetch data requests
  const pathname = url.pathname.replace(/\.data$/, '');
  const firstPathPart = pathname.split('/')[1]?.toUpperCase() ?? '';

  type I18nFromUrl = [I18nLocale['language'], I18nLocale['country']];

  let pathPrefix = '';
  let [language, country]: I18nFromUrl = [
    API.DEFAULT_LANGUAGE,
    API.DEFAULT_COUNTRY,
  ];

  if (/^[A-Z]{2}-[A-Z]{2}$/i.test(firstPathPart)) {
    pathPrefix = '/' + firstPathPart;
    [language, country] = firstPathPart.split('-') as I18nFromUrl;
  }

  return {language, country, pathPrefix};
}

/**
 * Hook to get the current locale prefix from URL
 * Returns empty string for default locale, or '/xx-xx' for other locales
 */
export function useLocalePrefix(): string {
  const {pathname} = useLocation();

  return useMemo(() => {
    const firstPathPart = pathname.split('/')[1] ?? '';

    if (/^[a-z]{2}-[a-z]{2}$/i.test(firstPathPart)) {
      return '/' + firstPathPart.toLowerCase();
    }

    return '';
  }, [pathname]);
}

/**
 * Extract pathname from a same-origin URL
 * Returns null if URL is truly external (different origin)
 * Handles myshopify.com URLs from Shopify metaobjects/menus
 */
function extractPathFromSameOriginUrl(url: string): string | null {
  // Not an absolute URL, treat as path
  if (!/^https?:\/\//i.test(url) && !url.startsWith('//')) {
    return null;
  }

  try {
    const storeDomain = import.meta.env.PUBLIC_STORE_DOMAIN;
    const urlObj = new URL(url);
    const urlHostname = urlObj.hostname.toLowerCase();

    // Check if it's a myshopify.com URL (Shopify admin always uses this)
    const isMyShopifyUrl = urlHostname.endsWith('.myshopify.com');

    // If we have PUBLIC_STORE_DOMAIN configured
    if (storeDomain) {
      const normalizedStoreDomain = storeDomain.toLowerCase().trim();

      // Direct match with configured domain
      if (
        urlHostname === normalizedStoreDomain ||
        urlObj.host.toLowerCase() === normalizedStoreDomain
      ) {
        return urlObj.pathname + urlObj.search + urlObj.hash;
      }

      // If configured domain is myshopify.com, extract shop name and compare
      if (normalizedStoreDomain.endsWith('.myshopify.com') && isMyShopifyUrl) {
        const configuredShopName = normalizedStoreDomain.replace(
          '.myshopify.com',
          '',
        );
        const urlShopName = urlHostname.replace('.myshopify.com', '');
        if (configuredShopName === urlShopName) {
          return urlObj.pathname + urlObj.search + urlObj.hash;
        }
      }
    }

    // Fallback: treat all myshopify.com URLs as same-origin
    // This handles cases where PUBLIC_STORE_DOMAIN is not set or mismatched
    if (isMyShopifyUrl) {
      return urlObj.pathname + urlObj.search + urlObj.hash;
    }

    // Different origin - truly external
    return null;
  } catch {
    // Invalid URL, treat as external
    return null;
  }
}

/**
 * Check if a URL is external (different origin)
 * Same-origin URLs with full domain are NOT considered external
 */
export function isExternalUrl(url: string): boolean {
  // Not an absolute URL at all
  if (!/^https?:\/\//i.test(url) && !url.startsWith('//')) {
    return false;
  }

  // Try to extract path from same-origin URL
  const extractedPath = extractPathFromSameOriginUrl(url);

  // If we got a path, it's same-origin (not external)
  // If null, it's truly external
  return extractedPath === null;
}

/**
 * Prepend locale prefix to a path
 * Handles both absolute paths (/products) and relative paths (products)
 * Same-origin URLs (https://mysite.com/page) are converted to paths
 * External URLs (https://othersite.com) are returned as-is
 */
export function getLocalePath(path: string, localePrefix: string): string {
  // Check if this is a same-origin URL that needs path extraction
  const extractedPath = extractPathFromSameOriginUrl(path);
  if (extractedPath !== null) {
    // Same-origin URL - use extracted path
    path = extractedPath;
  } else if (isExternalUrl(path)) {
    // Truly external URL - return as-is
    return path;
  }

  // If path already has locale prefix, return as-is
  if (
    localePrefix &&
    path.toLowerCase().startsWith(localePrefix.toLowerCase())
  ) {
    return path;
  }

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Combine prefix and path, avoiding double slashes
  if (!localePrefix) {
    return normalizedPath;
  }

  // Handle root path specially to avoid trailing slash
  if (normalizedPath === '/') {
    return localePrefix;
  }

  return `${localePrefix}${normalizedPath}`;
}

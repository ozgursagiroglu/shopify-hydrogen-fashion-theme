/**
 * =============================================================================
 * SETUP VALIDATION UTILITIES
 * =============================================================================
 *
 * This module provides utilities to validate the starter kit setup and identify
 * missing or incomplete configurations. Useful for developers and merchants
 * to ensure all required setup steps are completed.
 *
 * ## What It Checks:
 * - Environment variables are properly configured
 * - Required menus exist in Shopify
 * - Metaobject definitions are created
 * - Shop metafields (social links, newsletter) are configured
 *
 * ## Usage:
 * Import and use in development routes or admin tools
 */

import type {Storefront} from '@shopify/hydrogen';
import {MENU_HANDLES} from './constants';

export interface SetupValidationResult {
  isValid: boolean;
  warnings: SetupWarning[];
  errors: SetupError[];
  recommendations: SetupRecommendation[];
}

export interface SetupWarning {
  category: 'env' | 'menu' | 'metaobject' | 'metafield';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  solution: string;
}

export interface SetupError {
  category: 'env' | 'menu' | 'metaobject' | 'metafield';
  title: string;
  description: string;
  impact: string;
}

export interface SetupRecommendation {
  title: string;
  description: string;
  link?: string;
}

/**
 * Validates environment variables
 */
export function validateEnvironmentVariables(env: Env): SetupWarning[] {
  const warnings: SetupWarning[] = [];

  // Required variables
  const required = [
    'PUBLIC_STORE_DOMAIN',
    'PUBLIC_STOREFRONT_API_TOKEN',
    'PUBLIC_STOREFRONT_API_VERSION',
    'SESSION_SECRET',
  ];

  for (const key of required) {
    if (!env[key as keyof Env]) {
      warnings.push({
        category: 'env',
        severity: 'critical',
        title: `Missing ${key}`,
        description: `Environment variable ${key} is not set.`,
        solution: 'Add this variable to your .env file. See SETUP.md for details.',
      });
    }
  }

  // Check session secret strength
  if (env.SESSION_SECRET && env.SESSION_SECRET.length < 32) {
    warnings.push({
      category: 'env',
      severity: 'high',
      title: 'Weak SESSION_SECRET',
      description: 'SESSION_SECRET should be at least 32 characters long for security.',
      solution: 'Generate a stronger secret: openssl rand -base64 32',
    });
  }

  // Check Customer Account API
  if (!env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID) {
    warnings.push({
      category: 'env',
      severity: 'high',
      title: 'Customer Account API not configured',
      description: 'Login functionality requires Customer Account API setup.',
      solution: 'Configure Customer Account API in Shopify Admin > Settings > Customer accounts',
    });
  }

  // Check Admin API
  if (!env.ADMIN_API_ACCESS_TOKEN) {
    warnings.push({
      category: 'env',
      severity: 'medium',
      title: 'Admin API not configured',
      description: 'Contact form and reviews require Admin API access.',
      solution: 'Create a custom app with Admin API access. See SETUP.md.',
    });
  }

  return warnings;
}

/**
 * Validates required menus exist
 */
export async function validateMenus(
  storefront: Storefront,
): Promise<SetupWarning[]> {
  const warnings: SetupWarning[] = [];

  // Check header menu
  try {
    const {menu: headerMenu} = await storefront.query(
      `#graphql
        query MenuValidation($handle: String!) {
          menu(handle: $handle) {
            id
            items {
              id
            }
          }
        }
      `,
      {
        variables: {handle: MENU_HANDLES.header},
      },
    );

    if (!headerMenu) {
      warnings.push({
        category: 'menu',
        severity: 'high',
        title: 'Header menu not found',
        description: `Menu with handle "${MENU_HANDLES.header}" does not exist.`,
        solution: 'Create header-menu in Shopify Admin > Navigation',
      });
    } else if (!headerMenu.items || headerMenu.items.length === 0) {
      warnings.push({
        category: 'menu',
        severity: 'medium',
        title: 'Header menu is empty',
        description: 'Header menu exists but has no items.',
        solution: 'Add navigation links to header-menu in Shopify Admin',
      });
    }
  } catch {
    warnings.push({
      category: 'menu',
      severity: 'high',
      title: 'Cannot validate header menu',
      description: 'Failed to fetch header menu from Storefront API.',
      solution: 'Check Storefront API credentials and permissions.',
    });
  }

  // Check footer menus (less critical)
  const footerMenus = [
    {handle: MENU_HANDLES.footerShop, name: 'Footer Shop'},
    {handle: MENU_HANDLES.footerHelp, name: 'Footer Help'},
    {handle: MENU_HANDLES.footerAbout, name: 'Footer About'},
    {handle: MENU_HANDLES.footerLegal, name: 'Footer Legal'},
  ];

  for (const footerMenu of footerMenus) {
    try {
      const {menu} = await storefront.query(
        `#graphql
          query MenuValidation($handle: String!) {
            menu(handle: $handle) {
              id
              items {
                id
              }
            }
          }
        `,
        {
          variables: {handle: footerMenu.handle},
        },
      );

      if (!menu) {
        warnings.push({
          category: 'menu',
          severity: 'low',
          title: `${footerMenu.name} menu not found`,
          description: `Menu with handle "${footerMenu.handle}" does not exist.`,
          solution: 'Create footer menus in Shopify Admin > Navigation for better footer links',
        });
      }
    } catch {
      // Footer menus are less critical, so skip errors
    }
  }

  return warnings;
}

/**
 * Validates metaobject definitions exist and have Storefront access enabled
 *
 * Note: Storefront API can only query metaobjects if:
 * 1. The metaobject definition exists
 * 2. "Storefront access" is enabled for that definition
 *
 * If the query returns null, it could mean either the definition doesn't exist
 * OR Storefront access is not enabled.
 */
export async function validateMetaobjects(
  storefront: Storefront,
): Promise<SetupWarning[]> {
  const warnings: SetupWarning[] = [];

  // These metaobjects are optional - the starter kit works without them
  // but certain features won't work properly
  //
  // Types are based on seed definitions in scripts/seed/definitions/*.json
  const optionalMetaobjects = [
    // Homepage sections
    {
      type: 'homepage_hero',
      name: 'Homepage Hero',
      severity: 'medium' as const,
      feature: 'Homepage hero section',
      hasEntries: true,
    },
    {
      type: 'feature_banner',
      name: 'Feature Banner',
      severity: 'low' as const,
      feature: 'Homepage feature banner',
      hasEntries: true,
    },
    // FAQ (correct type is 'faq', not 'faq_item')
    {
      type: 'faq',
      name: 'FAQ',
      severity: 'low' as const,
      feature: 'FAQ page',
      hasEntries: true,
    },
    // Reviews - empty initially is OK
    {
      type: 'customer_review',
      name: 'Customer Review',
      severity: 'low' as const,
      feature: 'Product reviews',
      hasEntries: false,
    },
    // Contact submissions - always empty initially
    {
      type: 'contact_submission',
      name: 'Contact Submission',
      severity: 'low' as const,
      feature: 'Contact form submissions storage',
      hasEntries: false,
    },
  ];

  for (const metaobject of optionalMetaobjects) {
    try {
      const {metaobjects} = await storefront.query(
        `#graphql
          query MetaobjectValidation($type: String!, $first: Int!) {
            metaobjects(type: $type, first: $first) {
              nodes {
                id
              }
            }
          }
        `,
        {
          variables: {type: metaobject.type, first: 1},
        },
      );

      // Check if metaobjects is null - this usually means no Storefront access
      if (!metaobjects) {
        warnings.push({
          category: 'metaobject',
          severity: metaobject.severity,
          title: `Cannot access ${metaobject.name}`,
          description: `The "${metaobject.type}" metaobject returned null. This usually means Storefront access is disabled.`,
          solution: `Enable "Storefront access" for "${metaobject.type}" in Shopify Admin > Settings > Custom data > Metaobjects.`,
        });
        continue;
      }

      // Query succeeded - definition exists and has Storefront access
      if (metaobjects.nodes.length === 0 && metaobject.hasEntries) {
        // Definition exists but no entries - only warn if entries are expected
        warnings.push({
          category: 'metaobject',
          severity: metaobject.severity,
          title: `No ${metaobject.name} entries`,
          description: `${metaobject.name} definition exists but has no entries. ${metaobject.feature} will show empty.`,
          solution: 'Run "yarn seed" to create sample content, or add entries manually in Shopify Admin > Content.',
        });
      }
      // If metaobjects.nodes.length > 0 or hasEntries is false, everything is fine
    } catch (error) {
      // Query failed - could be missing definition or no Storefront access
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Debug: Log the actual error in development
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
        console.error(`[Metaobject Validation] Error querying ${metaobject.type}:`, errorMessage);
      }

      // Check if it's a "type not found" error
      if (errorMessage.includes('not found') || errorMessage.includes('invalid') || errorMessage.includes('Unknown type')) {
        warnings.push({
          category: 'metaobject',
          severity: metaobject.severity,
          title: `${metaobject.name} definition not found`,
          description: `The "${metaobject.type}" metaobject definition doesn't exist. ${metaobject.feature} won't work.`,
          solution: 'Run "yarn seed" to create the metaobject definition.',
        });
      } else {
        // Could be a Storefront access issue or network error
        warnings.push({
          category: 'metaobject',
          severity: metaobject.severity,
          title: `Cannot access ${metaobject.name}`,
          description: `Failed to query ${metaobject.type}. This might be a Storefront access issue.`,
          solution: `Check that "${metaobject.type}" definition has "Storefront access" enabled in Shopify Admin > Settings > Custom data > Metaobjects.`,
        });
      }
    }
  }

  return warnings;
}

/**
 * Validates shop metafields (social links)
 *
 * Social links are stored as individual shop metafields:
 * - social.instagram, social.facebook, social.twitter,
 * - social.pinterest, social.tiktok, social.youtube
 */
export async function validateShopMetafields(
  storefront: Storefront,
): Promise<SetupWarning[]> {
  const warnings: SetupWarning[] = [];

  try {
    const {shop} = await storefront.query(
      `#graphql
        query ShopMetafieldsValidation {
          shop {
            social_instagram: metafield(namespace: "social", key: "instagram") { value }
            social_facebook: metafield(namespace: "social", key: "facebook") { value }
            social_twitter: metafield(namespace: "social", key: "twitter") { value }
            social_pinterest: metafield(namespace: "social", key: "pinterest") { value }
            social_tiktok: metafield(namespace: "social", key: "tiktok") { value }
            social_youtube: metafield(namespace: "social", key: "youtube") { value }
          }
        }
      `,
    );

    // Check if any social links are configured
    const hasSocialLinks =
      shop.social_instagram?.value ||
      shop.social_facebook?.value ||
      shop.social_twitter?.value ||
      shop.social_pinterest?.value ||
      shop.social_tiktok?.value ||
      shop.social_youtube?.value;

    if (!hasSocialLinks) {
      warnings.push({
        category: 'metafield',
        severity: 'low',
        title: 'Social links not configured',
        description: 'No social media links are set in shop metafields.',
        solution: 'Configure social links in Shopify Admin > Settings > Custom data > Shops (social namespace)',
      });
    }
  } catch {
    // Metafields are optional, so just log a low-priority warning
    warnings.push({
      category: 'metafield',
      severity: 'low',
      title: 'Cannot validate shop metafields',
      description: 'Failed to check shop metafields.',
      solution: 'This is optional. Metafields enhance the starter kit but are not required.',
    });
  }

  return warnings;
}

/**
 * Main validation function - runs all checks
 */
export async function validateSetup(
  env: Env,
  storefront: Storefront,
): Promise<SetupValidationResult> {
  const warnings: SetupWarning[] = [];

  // Run all validations
  warnings.push(...validateEnvironmentVariables(env));
  warnings.push(...(await validateMenus(storefront)));
  warnings.push(...(await validateMetaobjects(storefront)));
  warnings.push(...(await validateShopMetafields(storefront)));

  // Separate critical errors
  const errors: SetupError[] = warnings
    .filter((w) => w.severity === 'critical')
    .map((w) => ({
      category: w.category,
      title: w.title,
      description: w.description,
      impact: 'Theme may not function correctly without this configuration.',
    }));

  // Generate recommendations
  const recommendations: SetupRecommendation[] = [];

  if (warnings.some((w) => w.category === 'menu')) {
    recommendations.push({
      title: 'Configure Menus',
      description: 'Set up navigation menus for better user experience.',
      link: '/setup-check#menus',
    });
  }

  if (warnings.some((w) => w.category === 'metaobject')) {
    recommendations.push({
      title: 'Seed Sample Content',
      description: 'Run the seed script to create sample FAQs, reviews, and more.',
      link: '/setup-check#metaobjects',
    });
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    recommendations,
  };
}

/**
 * Groups warnings by category for display
 */
export function groupWarningsByCategory(warnings: SetupWarning[]) {
  return warnings.reduce(
    (acc, warning) => {
      if (!acc[warning.category]) {
        acc[warning.category] = [];
      }
      acc[warning.category].push(warning);
      return acc;
    },
    {} as Record<string, SetupWarning[]>,
  );
}

/**
 * Gets severity color for UI display
 */
export function getSeverityColor(severity: SetupWarning['severity']): string {
  const colors = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'blue',
  };
  return colors[severity];
}

/**
 * Gets severity badge text
 */
export function getSeverityBadge(severity: SetupWarning['severity']): string {
  const badges = {
    critical: '🔴 Critical',
    high: '🟠 High',
    medium: '🟡 Medium',
    low: '🔵 Low',
  };
  return badges[severity];
}

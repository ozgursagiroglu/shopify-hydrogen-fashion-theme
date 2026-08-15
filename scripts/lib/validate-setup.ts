#!/usr/bin/env node

/**
 * =============================================================================
 * SETUP VALIDATION CLI
 * =============================================================================
 *
 * Terminal-based setup validation script that checks starter kit configuration
 * and reports any missing or incorrect settings.
 *
 * Usage:
 *   yarn validate   # Validates the Hydrogen storefront configuration
 *
 * Exit Codes:
 *   0 - All checks passed or only low/medium warnings
 *   1 - Critical errors found
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get platform from command line args
const platform = process.argv[2] || 'hydrogen';

// Load .env from platform directory
const envPath = path.join(__dirname, '..', '..', platform, '.env');
if (!fs.existsSync(envPath)) {
  console.error(`❌ .env file not found at ${platform}/.env`);
  console.error('   Run "yarn setup" to create environment variables.');
  process.exit(1);
}

dotenv.config({ path: envPath });

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Severity colors
  red: '\x1b[31m',
  orange: '\x1b[33m',
  yellow: '\x1b[93m',
  blue: '\x1b[34m',

  // Status colors
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

type SetupWarning = {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  solution: string;
};

type SetupValidationResult = {
  isValid: boolean;
  warnings: SetupWarning[];
  errors: { category: string; title: string; description: string; impact: string }[];
  recommendations: { title: string; description: string; link?: string }[];
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(text: string) {
  console.log('\n' + colorize('═'.repeat(80), 'cyan'));
  console.log(colorize(text.toUpperCase(), 'bright'));
  console.log(colorize('═'.repeat(80), 'cyan') + '\n');
}

function printSection(text: string) {
  console.log('\n' + colorize(text, 'bright'));
  console.log(colorize('─'.repeat(text.length), 'gray'));
}

function getSeverityIcon(severity: SetupWarning['severity']): string {
  const icons = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵',
  };
  return icons[severity];
}

function getSeverityColor(
  severity: SetupWarning['severity'],
): keyof typeof colors {
  const severityColors = {
    critical: 'red' as const,
    high: 'orange' as const,
    medium: 'yellow' as const,
    low: 'blue' as const,
  };
  return severityColors[severity];
}

function printWarning(warning: SetupWarning) {
  const icon = getSeverityIcon(warning.severity);
  const color = getSeverityColor(warning.severity);

  console.log(`\n${icon} ${colorize(warning.title, color)}`);
  console.log(colorize(`   ${warning.description}`, 'dim'));
  console.log(colorize(`   Solution: ${warning.solution}`, 'gray'));
}

function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    env: 'Environment Variables',
    menu: 'Shopify Menus',
    metaobject: 'Metaobject Definitions',
    metafield: 'Shop Metafields',
  };
  return titles[category] || category;
}

function groupWarningsByCategory(warnings: SetupWarning[]): Record<string, SetupWarning[]> {
  return warnings.reduce((acc, warning) => {
    // Skip critical warnings (they're shown separately)
    if (warning.severity === 'critical') return acc;

    if (!acc[warning.category]) {
      acc[warning.category] = [];
    }
    acc[warning.category].push(warning);
    return acc;
  }, {} as Record<string, SetupWarning[]>);
}

/**
 * Validate environment variables
 */
function validateEnvironmentVariables(): SetupWarning[] {
  const warnings: SetupWarning[] = [];

  const requiredVars = [
    'PUBLIC_STORE_DOMAIN',
    'PUBLIC_STOREFRONT_API_TOKEN',
    'ADMIN_API_ACCESS_TOKEN',
  ];

  const recommendedVars = [
    'PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID',
    'SHOP_ID',
    'SESSION_SECRET',
  ];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      warnings.push({
        category: 'env',
        severity: 'critical',
        title: `Missing ${varName}`,
        description: `Required environment variable ${varName} is not set.`,
        solution: `Add ${varName} to ${platform}/.env file.`,
      });
    }
  }

  // Check recommended variables
  for (const varName of recommendedVars) {
    if (!process.env[varName]) {
      warnings.push({
        category: 'env',
        severity: 'high',
        title: `Missing ${varName}`,
        description: `Recommended environment variable ${varName} is not set.`,
        solution: `Add ${varName} to ${platform}/.env file for full functionality.`,
      });
    }
  }

  return warnings;
}

/**
 * Simple Storefront API client for Node.js scripts
 * Uses direct fetch instead of @shopify/hydrogen client
 */
async function storefrontQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const storeDomain = process.env.PUBLIC_STORE_DOMAIN;
  const apiToken = process.env.PUBLIC_STOREFRONT_API_TOKEN;
  const apiVersion = process.env.PUBLIC_STOREFRONT_API_VERSION || '2025-10';

  if (!storeDomain || !apiToken) {
    throw new Error('Missing PUBLIC_STORE_DOMAIN or PUBLIC_STOREFRONT_API_TOKEN');
  }

  const url = `https://${storeDomain}/api/${apiVersion}/graphql.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': apiToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Storefront API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors.map((e: { message: string }) => e.message).join(', '));
  }

  return result.data;
}

/**
 * Validate menus using direct API call
 */
async function validateMenus(): Promise<SetupWarning[]> {
  const warnings: SetupWarning[] = [];
  const MENU_HANDLES = { header: 'main-menu' };

  try {
    const data = await storefrontQuery<{ menu: { id: string; items: { id: string }[] } | null }>(
      `query MenuValidation($handle: String!) {
        menu(handle: $handle) {
          id
          items { id }
        }
      }`,
      { handle: MENU_HANDLES.header },
    );

    if (!data.menu) {
      warnings.push({
        category: 'menu',
        severity: 'high',
        title: 'Header menu not found',
        description: `Menu with handle "${MENU_HANDLES.header}" does not exist.`,
        solution: 'Run "yarn seed:entries" to create menus automatically, or create manually in Shopify Admin > Navigation',
      });
    } else if (!data.menu.items || data.menu.items.length === 0) {
      warnings.push({
        category: 'menu',
        severity: 'medium',
        title: 'Header menu is empty',
        description: 'Header menu exists but has no items.',
        solution: 'Run "yarn seed:entries" to populate menu, or add navigation links manually in Shopify Admin',
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

  return warnings;
}

/**
 * Validate metaobjects using direct API call
 */
async function validateMetaobjects(): Promise<SetupWarning[]> {
  const warnings: SetupWarning[] = [];

  const metaobjectsToCheck = [
    { type: 'homepage_hero', name: 'Homepage Hero', severity: 'medium' as const, feature: 'Homepage hero', hasEntries: true },
    { type: 'feature_banner', name: 'Feature Banner', severity: 'low' as const, feature: 'Feature banner', hasEntries: true },
    { type: 'faq', name: 'FAQ', severity: 'low' as const, feature: 'FAQ page', hasEntries: true },
    { type: 'customer_review', name: 'Customer Review', severity: 'low' as const, feature: 'Product reviews', hasEntries: false },
    { type: 'contact_submission', name: 'Contact Submission', severity: 'low' as const, feature: 'Contact form', hasEntries: false },
  ];

  for (const metaobject of metaobjectsToCheck) {
    try {
      const data = await storefrontQuery<{ metaobjects: { nodes: { id: string }[] } | null }>(
        `query MetaobjectValidation($type: String!, $first: Int!) {
          metaobjects(type: $type, first: $first) {
            nodes { id }
          }
        }`,
        { type: metaobject.type, first: 1 },
      );

      if (!data.metaobjects) {
        // Query returned null - no Storefront access
        warnings.push({
          category: 'metaobject',
          severity: metaobject.severity,
          title: `Cannot access ${metaobject.name}`,
          description: `"${metaobject.type}" returned null. Storefront access may be disabled.`,
          solution: `Enable "Storefront access" for "${metaobject.type}" in Shopify Admin > Settings > Custom data > Metaobjects.`,
        });
      } else if (data.metaobjects.nodes.length === 0 && metaobject.hasEntries) {
        // Definition exists but no entries
        warnings.push({
          category: 'metaobject',
          severity: metaobject.severity,
          title: `No ${metaobject.name} entries`,
          description: `${metaobject.name} definition exists but has no entries. ${metaobject.feature} will show empty.`,
          solution: `Run "yarn seed" to create sample content, or add entries manually.`,
        });
      }
      // Success: definition exists and (has entries OR entries not required)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (process.env.DEBUG) {
        console.error(`[Debug] Error querying ${metaobject.type}:`, errorMessage);
      }

      if (errorMessage.includes('Unknown type') || errorMessage.includes('not found')) {
        warnings.push({
          category: 'metaobject',
          severity: metaobject.severity,
          title: `${metaobject.name} definition not found`,
          description: `The "${metaobject.type}" metaobject definition doesn't exist.`,
          solution: `Run "yarn seed" to create the metaobject definition.`,
        });
      } else {
        warnings.push({
          category: 'metaobject',
          severity: metaobject.severity,
          title: `Cannot validate ${metaobject.name}`,
          description: `Error: ${errorMessage}`,
          solution: 'Check your Storefront API credentials and try again.',
        });
      }
    }
  }

  return warnings;
}

/**
 * Validate shop metafields using direct API call
 *
 * Social links are stored as individual shop metafields:
 * - social.instagram, social.facebook, social.twitter,
 * - social.pinterest, social.tiktok, social.youtube
 */
async function validateShopMetafields(): Promise<SetupWarning[]> {
  const warnings: SetupWarning[] = [];

  try {
    const data = await storefrontQuery<{
      shop: {
        social_instagram: { value: string } | null;
        social_facebook: { value: string } | null;
        social_twitter: { value: string } | null;
        social_pinterest: { value: string } | null;
        social_tiktok: { value: string } | null;
        social_youtube: { value: string } | null;
      };
    }>(
      `query ShopMetafieldsValidation {
        shop {
          social_instagram: metafield(namespace: "social", key: "instagram") { value }
          social_facebook: metafield(namespace: "social", key: "facebook") { value }
          social_twitter: metafield(namespace: "social", key: "twitter") { value }
          social_pinterest: metafield(namespace: "social", key: "pinterest") { value }
          social_tiktok: metafield(namespace: "social", key: "tiktok") { value }
          social_youtube: metafield(namespace: "social", key: "youtube") { value }
        }
      }`,
    );

    // Check if any social links are configured
    const hasSocialLinks =
      data.shop.social_instagram?.value ||
      data.shop.social_facebook?.value ||
      data.shop.social_twitter?.value ||
      data.shop.social_pinterest?.value ||
      data.shop.social_tiktok?.value ||
      data.shop.social_youtube?.value;

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

async function main() {
  printHeader(`ada ÉLAN Starter Kit - Setup Validation (${platform})`);

  console.log(colorize(`Checking your ${platform} configuration...`, 'cyan'));
  console.log(colorize('This may take a few seconds.\n', 'dim'));

  // Collect all warnings
  const warnings: SetupWarning[] = [];

  // 1. Validate environment variables (doesn't need API)
  warnings.push(...validateEnvironmentVariables());

  // 2. Validate Storefront API access
  const hasStorefrontAccess = process.env.PUBLIC_STORE_DOMAIN && process.env.PUBLIC_STOREFRONT_API_TOKEN;

  if (hasStorefrontAccess) {
    // 3. Validate menus
    warnings.push(...(await validateMenus()));

    // 4. Validate metaobjects
    warnings.push(...(await validateMetaobjects()));

    // 5. Validate shop metafields
    warnings.push(...(await validateShopMetafields()));
  }

  // Build result
  const errors = warnings.filter((w) => w.severity === 'critical');
  const recommendations: { title: string; description: string; link?: string }[] = [];

  if (warnings.some((w) => w.category === 'menu')) {
    recommendations.push({
      title: 'Configure Menus',
      description: 'Run "yarn seed:entries" to create navigation menus automatically.',
      link: '/setup-check#menus',
    });
  }

  if (warnings.some((w) => w.category === 'metaobject')) {
    recommendations.push({
      title: 'Seed Sample Content',
      description: `Run "yarn seed" to create sample FAQs, reviews, and more.`,
      link: '/setup-check#metaobjects',
    });
  }

  const result: SetupValidationResult = {
    isValid: errors.length === 0,
    warnings,
    errors: errors.map((e) => ({
      category: e.category,
      title: e.title,
      description: e.description,
      impact: 'Starter kit may not function correctly.',
    })),
    recommendations,
  };

  // Print results
  if (result.isValid && result.warnings.length === 0) {
    console.log(colorize('✅ All checks passed!', 'green'));
    console.log(colorize(`   Your ${platform} starter kit is properly configured.`, 'dim'));
    console.log('');
    process.exit(0);
  }

  // Print errors (critical warnings)
  if (result.errors.length > 0) {
    printSection('❌ Critical Errors');
    console.log(
      colorize('These must be fixed for the starter kit to function:', 'red'),
    );
    result.errors.forEach((error) => {
      const warning = result.warnings.find(
        (w) => w.severity === 'critical' && w.title === error.title,
      );
      if (warning) printWarning(warning);
    });
  }

  // Group and print warnings by category
  const grouped = groupWarningsByCategory(result.warnings);
  const categories = Object.keys(grouped);

  if (categories.length > 0) {
    printSection('⚠️  Configuration Warnings');

    for (const category of categories) {
      const warnings = grouped[category];
      const categoryTitle = getCategoryTitle(category);

      console.log(
        `\n${colorize(categoryTitle, 'bright')} (${warnings.length})`,
      );

      warnings.forEach((warning) => {
        printWarning(warning);
      });
    }
  }

  // Print recommendations
  if (result.recommendations.length > 0) {
    printSection('💡 Recommendations');
    result.recommendations.forEach((rec) => {
      console.log(`\n• ${colorize(rec.title, 'cyan')}`);
      console.log(colorize(`  ${rec.description}`, 'dim'));
      if (rec.link) {
        console.log(colorize(`  See: ${rec.link}`, 'gray'));
      }
    });
  }

  // Print summary
  printSection('Summary');

  const criticalCount = result.warnings.filter(
    (w) => w.severity === 'critical',
  ).length;
  const highCount = result.warnings.filter((w) => w.severity === 'high').length;
  const mediumCount = result.warnings.filter(
    (w) => w.severity === 'medium',
  ).length;
  const lowCount = result.warnings.filter((w) => w.severity === 'low').length;

  console.log('');
  if (criticalCount > 0) console.log(`🔴 ${criticalCount} critical issue(s)`);
  if (highCount > 0) console.log(`🟠 ${highCount} high priority issue(s)`);
  if (mediumCount > 0)
    console.log(`🟡 ${mediumCount} medium priority issue(s)`);
  if (lowCount > 0) console.log(`🔵 ${lowCount} low priority issue(s)`);

  console.log('');
  if (result.errors.length > 0) {
    console.log(
      colorize(
        '❌ Setup validation failed. Please fix critical errors.',
        'red',
      ),
    );
    console.log(
      colorize('   See docs/SETUP.md for detailed instructions.', 'dim'),
    );
    process.exit(1);
  } else {
    console.log(colorize('✅ No critical errors found.', 'green'));
    if (result.warnings.length > 0) {
      console.log(colorize('   Some optional features may be limited.', 'dim'));
    }
    process.exit(0);
  }
}

// Run the script
main().catch((error) => {
  console.error(colorize('Unexpected error:', 'red'));
  console.error(error);
  process.exit(1);
});

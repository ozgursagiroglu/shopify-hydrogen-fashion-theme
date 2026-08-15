#!/usr/bin/env node

/**
 * ada ÉLAN Interactive Setup Script
 * Guides users through the complete Shopify store setup
 */

import readline from 'readline';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Helper functions
const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.magenta}▶ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}═══ ${msg} ═══${colors.reset}\n`),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function pressEnterToContinue() {
  return question(`\n${colors.dim}Press Enter to continue...${colors.reset}`);
}

// Utility functions
function checkNodeVersion() {
  try {
    const version = process.version;
    const major = parseInt(version.split('.')[0].substring(1));
    if (major < 20) {
      log.error(`Node.js version ${major} detected. Version 20.19.0 or higher is required.`);
      process.exit(1);
    }
    log.success(`Node.js ${version} detected`);
    return true;
  } catch (error) {
    log.error('Could not determine Node.js version');
    return false;
  }
}

function checkShopifyCLI() {
  try {
    execSync('shopify version', { stdio: 'pipe' });
    log.success('Shopify CLI is installed');
    return true;
  } catch (error) {
    log.warning('Shopify CLI not found. You can install it later if needed.');
    return false;
  }
}

function fileExists(filepath) {
  return fs.existsSync(filepath);
}

async function displayWelcome() {
  console.clear();
  console.log(`
${colors.bright}${colors.magenta}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║            ada ÉLAN - Interactive Setup Wizard               ║
║                                                               ║
║        Premium Fashion E-Commerce Starter Kit Setup          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}

${colors.cyan}Welcome! This wizard will guide you through setting up your
Shopify Hydrogen storefront in just a few minutes.${colors.reset}

${colors.dim}What we'll do:${colors.reset}
  1️⃣  Choose your Shopify channel (Hydrogen or Headless)
  2️⃣  Configure your Shopify store connection
  3️⃣  Set up environment variables
  4️⃣  Create metaobject definitions
  5️⃣  (Optional) Populate demo content & menus
  6️⃣  (Optional) Create demo products
  7️⃣  Validate your setup
  8️⃣  Get you ready to develop!

${colors.yellow}Requirements:${colors.reset}
  • A Shopify store (can be development store)
  • Admin access to create custom apps
  • Node.js 20.19.0 or higher
`);

  await pressEnterToContinue();
}

async function checkPrerequisites() {
  log.title('Checking Prerequisites');

  log.step('Checking Node.js version...');
  checkNodeVersion();

  log.step('Checking for Shopify CLI...');
  const hasShopifyCLI = checkShopifyCLI();

  log.step('Checking project structure...');
  const hydrogenPath = path.join(__dirname, '..', 'hydrogen');
  if (!fileExists(hydrogenPath)) {
    log.error('hydrogen/ directory not found. Please run this script from the project root.');
    process.exit(1);
  }
  log.success('Project structure looks good');

  return { hasShopifyCLI };
}

async function selectStorefrontType() {
  log.title('Step 1: Storefront Type Selection');

  console.log(`${colors.bright}Choose your deployment strategy:${colors.reset}

${colors.green}1) Hydrogen Channel${colors.reset} ${colors.dim}(Recommended)${colors.reset}
   ${colors.dim}→ Best for: Deploying to Shopify Oxygen
   → Integrated CLI, automatic deployments, built-in analytics${colors.reset}

${colors.blue}2) Headless Channel${colors.reset}
   ${colors.dim}→ Best for: Deploying to Vercel, Netlify, or other platforms
   → Platform-agnostic, manual token management${colors.reset}
`);

  let choice = '';
  while (!['1', '2'].includes(choice)) {
    choice = await question(`${colors.cyan}Select option (1 or 2): ${colors.reset}`);
  }

  const type = choice === '1' ? 'hydrogen' : 'headless';

  console.log(`\n${colors.green}✓ Selected: ${type === 'hydrogen' ? 'Hydrogen' : 'Headless'} Channel${colors.reset}`);

  return type;
}

async function selectPlatforms() {
  log.title('Step 2: Platform');

  // This repository ships the Hydrogen web storefront only, so there is nothing to choose.
  const platforms = ['hydrogen'];

  console.log(`${colors.green}✓ Hydrogen${colors.reset} ${colors.dim}(web storefront)${colors.reset}\n`);

  return platforms;
}

async function displayShopifySetupInstructions(storefrontType) {
  log.title('Step 3: Shopify Admin Setup');

  console.log(`${colors.bright}You'll need to create apps in your Shopify Admin:${colors.reset}

${colors.yellow}Required Apps:${colors.reset}

1️⃣  ${colors.bright}${storefrontType === 'hydrogen' ? 'Hydrogen' : 'Headless'} Sales Channel${colors.reset} → Provides Storefront API access
2️⃣  ${colors.bright}Custom Admin App${colors.reset} → Provides Admin API access

${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
`);

  await pressEnterToContinue();

  // Storefront API Setup
  console.log(`${colors.bright}${colors.blue}Step 1: Setting up ${storefrontType === 'hydrogen' ? 'Hydrogen' : 'Headless'} Channel${colors.reset}

${colors.cyan}1.${colors.reset} Go to your Shopify Admin: ${colors.dim}https://your-store.myshopify.com/admin${colors.reset}
${colors.cyan}2.${colors.reset} Navigate to: ${colors.bright}Settings > Apps and sales channels${colors.reset}
${colors.cyan}3.${colors.reset} Click ${colors.bright}Shopify App Store${colors.reset}
${colors.cyan}4.${colors.reset} Search for "${colors.bright}${storefrontType === 'hydrogen' ? 'Hydrogen' : 'Headless'}${colors.reset}" and install
${colors.cyan}5.${colors.reset} Create a new storefront called "${colors.bright}ada ÉLAN Storefront${colors.reset}"

${colors.bright}${colors.green}Inside the ${storefrontType === 'hydrogen' ? 'Hydrogen' : 'Headless'} app, you'll see "Manage API access":${colors.reset}

${colors.cyan}📦 Storefront API${colors.reset}
   ${colors.dim}→ Access store data such as products, collections, and metafields${colors.reset}
   ${colors.bright}Copy the Storefront API access token${colors.reset}

${colors.cyan}👤 Customer Account API${colors.reset}
   ${colors.dim}→ Access customer details, orders, and markets${colors.reset}
   ${colors.bright}Copy the Client ID and Shop ID${colors.reset}

${colors.yellow}💡 Tip:${colors.reset} ${colors.dim}Keep this page open, you'll need these values for environment setup${colors.reset}
`);

  await pressEnterToContinue();

  // Admin API Setup
  console.log(`${colors.bright}${colors.blue}Step 2: Setting up Admin API App${colors.reset}

${colors.dim}This is separate from the ${storefrontType === 'hydrogen' ? 'Hydrogen' : 'Headless'} channel and required for seeding metaobjects.${colors.reset}

${colors.cyan}1.${colors.reset} Go to: ${colors.bright}Settings > Apps and sales channels > Develop apps${colors.reset}
${colors.cyan}2.${colors.reset} Click ${colors.bright}Create an app${colors.reset} and name it "${colors.bright}ada ÉLAN Admin Access${colors.reset}"
${colors.cyan}3.${colors.reset} Click ${colors.bright}Configure Admin API${colors.reset} (not Storefront API)
${colors.cyan}4.${colors.reset} Enable ${colors.bright}all${colors.reset} these Admin API scopes:

   ${colors.bright}Metaobjects & Metafields:${colors.reset}
   • read_metaobject_definitions, write_metaobject_definitions
   • read_metaobjects, write_metaobjects
   • read_metafields, write_metafields

   ${colors.bright}Customers:${colors.reset}
   • read_customers, write_customers

   ${colors.bright}Content:${colors.reset}
   • read_content, write_content (blogs & articles)
   • read_online_store_pages, write_online_store_pages
   • read_legal_policies, write_legal_policies ${colors.dim}(optional)${colors.reset}

   ${colors.bright}Products & Inventory:${colors.reset}
   • read_products, write_products
   • read_inventory, write_inventory
   • read_locations

   ${colors.bright}Files & Navigation:${colors.reset}
   • read_files, write_files
   • read_online_store_navigation, write_online_store_navigation
   • read_publications, write_publications

${colors.cyan}5.${colors.reset} Click ${colors.bright}Save${colors.reset}, then ${colors.bright}Install app${colors.reset}
${colors.cyan}6.${colors.reset} Copy the ${colors.bright}Admin API access token${colors.reset} ${colors.dim}(shown only once!)${colors.reset}
`);

  await pressEnterToContinue();
}

async function setupEnvironmentVariables(storefrontType, hasShopifyCLI, platforms) {
  log.title('Step 4: Environment Variables');

  console.log(`${colors.bright}Choose how to configure your environment:${colors.reset}

${colors.green}1) Use Shopify CLI${colors.reset} ${colors.dim}(Recommended for Hydrogen)${colors.reset}
   ${colors.dim}→ Automatically pulls configuration from your Hydrogen channel
   → Requires: Shopify CLI installed and project linked
   → Only works for Hydrogen platform${colors.reset}

${colors.blue}2) Manual Configuration${colors.reset}
   ${colors.dim}→ Enter credentials manually
   → Works with both Hydrogen and Headless channels${colors.reset}
`);

  let choice = '';
  const hasHydrogen = platforms.includes('hydrogen');

  if (!hasShopifyCLI || storefrontType !== 'hydrogen') {
    log.warning('Auto-selecting manual configuration...');
    choice = '2';
  } else {
    while (!['1', '2'].includes(choice)) {
      choice = await question(`${colors.cyan}Select option (1 or 2): ${colors.reset}`);
    }
  }

  if (choice === '1' && hasHydrogen) {
    log.step('Using Shopify CLI for Hydrogen...');

    try {
      const hydrogenDir = path.join(__dirname, '..', 'hydrogen');
      const envPath = path.join(hydrogenDir, '.env');

      log.info('Linking your project to Shopify...');
      console.log(`${colors.dim}Run this command in hydrogen directory: ${colors.bright}cd hydrogen && shopify hydrogen link${colors.reset}`);
      await pressEnterToContinue();

      log.info('Pulling environment variables...');
      console.log(`${colors.dim}Run this command: ${colors.bright}shopify hydrogen env pull${colors.reset}`);
      await pressEnterToContinue();

      if (fileExists(envPath)) {
        log.success('Hydrogen environment file created!');

        // Still need to add Admin API token manually
        log.warning('You still need to add Admin API token manually to hydrogen/.env');
        const adminToken = await question(`${colors.cyan}Admin API Token${colors.reset}: `);

        let envContent = fs.readFileSync(envPath, 'utf8');
        if (!envContent.includes('ADMIN_API_ACCESS_TOKEN=')) {
          envContent += `\n# Admin API (for seeding and admin operations)\nADMIN_API_ACCESS_TOKEN=${adminToken}\n`;
          fs.writeFileSync(envPath, envContent);
          log.success('Admin API token added to hydrogen/.env');
        }
      } else {
        log.warning('Could not verify .env file. Continuing with manual setup...');
        await manualEnvSetup('hydrogen');
      }
    } catch (error) {
      log.error(`CLI setup failed: ${error.message}`);
      log.info('Falling back to manual setup...');
      await manualEnvSetup('hydrogen');
    }
  } else {
    // Manual setup for selected platforms
    for (const platform of platforms) {
      await manualEnvSetup(platform);
    }
  }
}

async function manualEnvSetup(platform) {
  log.step(`Manual environment configuration for ${platform}...`);

  const platformDir = path.join(__dirname, '..', platform);
  const envPath = path.join(platformDir, '.env');
  const envExamplePath = path.join(platformDir, '.env.example');

  if (!fileExists(envExamplePath)) {
    log.error(`.env.example not found in ${platform}/`);
    return;
  }

  console.log(`\n${colors.bright}Enter your credentials for ${platform}:${colors.reset}\n`);

  const storeDomain = await question(`${colors.cyan}Store Domain${colors.reset} ${colors.dim}(e.g., mystore.myshopify.com)${colors.reset}: `);
  const shopId = await question(`${colors.cyan}Shop ID${colors.reset} ${colors.dim}(from Customer Account settings)${colors.reset}: `);
  const storefrontToken = await question(`${colors.cyan}Storefront API Token${colors.reset}: `);
  const adminToken = await question(`${colors.cyan}Admin API Token${colors.reset}: `);
  const clientId = await question(`${colors.cyan}Customer Account Client ID${colors.reset}: `);

  // Generate session secret
  const sessionSecret = crypto.randomBytes(32).toString('hex');

  // Read .env.example
  let envContent = fs.readFileSync(envExamplePath, 'utf8');

  // Replace values
  envContent = envContent
    .replace(/PUBLIC_STORE_DOMAIN=.*/g, `PUBLIC_STORE_DOMAIN=${storeDomain}`)
    .replace(/SHOP_ID=.*/g, `SHOP_ID=${shopId}`)
    .replace(/PUBLIC_STOREFRONT_API_TOKEN=.*/g, `PUBLIC_STOREFRONT_API_TOKEN=${storefrontToken}`)
    .replace(/ADMIN_API_ACCESS_TOKEN=.*/g, `ADMIN_API_ACCESS_TOKEN=${adminToken}`)
    .replace(/PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=.*/g, `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=${clientId}`)
    .replace(/PUBLIC_CUSTOMER_ACCOUNT_API_URL=.*/g, `PUBLIC_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/authentication/${shopId}/oauth/authorize`)
    .replace(/SESSION_SECRET=.*/g, `SESSION_SECRET=${sessionSecret}`);

  // Write .env file
  fs.writeFileSync(envPath, envContent);
  log.success(`Environment file created: ${platform}/.env`);
}

async function seedMetaobjects() {
  log.title('Step 5: Metaobject Definitions');

  console.log(`${colors.bright}Metaobjects are used for dynamic content:${colors.reset}

${colors.dim}Will create definitions for:${colors.reset}
  • Homepage Hero
  • Feature Banners
  • Customer Reviews
  • Contact Submissions
  • Stock Alerts
  • About Page Content
  • Brand Values
  • Store Locations
  ${colors.dim}...and more${colors.reset}

${colors.yellow}Note:${colors.reset} ${colors.dim}This only creates the metaobject schemas (empty definitions)${colors.reset}
`);

  const answer = await question(`${colors.cyan}Create metaobject definitions? (Y/n): ${colors.reset}`);

  if (answer.toLowerCase() !== 'n') {
    log.step('Creating metaobject definitions...');

    try {
      execSync('yarn seed:definitions', { stdio: 'inherit', cwd: __dirname });
      log.success('Metaobject definitions created!');
    } catch (error) {
      log.error('Seed script failed. You can run it manually later with: cd scripts && yarn seed:definitions');
    }
  } else {
    log.info('Skipped. You can run later with: cd scripts && yarn seed:definitions');
  }
}

async function seedDemoContent() {
  log.title('Step 6: Demo Content');

  console.log(`${colors.bright}Would you like to populate demo content?${colors.reset}

${colors.dim}This will create:${colors.reset}
  • Sample homepage content (hero, banners, testimonials)
  • Blog articles
  • Store locations
  • FAQ items
  • Instagram feed posts
  • Navigation menus (main-menu, footer menus)
  ${colors.dim}...and more${colors.reset}

${colors.yellow}Note:${colors.reset} ${colors.dim}This requires Admin API scopes for content creation${colors.reset}
`);

  const answer = await question(`${colors.cyan}Populate demo content? (y/N): ${colors.reset}`);

  if (answer.toLowerCase() === 'y') {
    log.step('Running demo content seed...');
    try {
      execSync('yarn seed:entries', { stdio: 'inherit', cwd: __dirname });
      log.success('Demo content created!');
    } catch (error) {
      log.error('Demo content seeding failed. You can run manually: cd scripts && yarn seed:entries');
    }
  } else {
    log.info('Skipped demo content');
  }
}

async function seedDemoProducts() {
  log.title('Step 7: Demo Products');

  console.log(`${colors.bright}Would you like to create demo products?${colors.reset}

${colors.yellow}⚠ Warning:${colors.reset} ${colors.dim}This will create actual products in your store${colors.reset}
${colors.dim}Recommended: Only use this on development/test stores${colors.reset}
`);

  const answer = await question(`${colors.cyan}Create demo products? (y/N): ${colors.reset}`);

  if (answer.toLowerCase() === 'y') {
    log.step('Creating demo products and collections...');
    try {
      execSync('yarn seed:products', { stdio: 'inherit', cwd: __dirname });
      log.success('Demo products created!');
    } catch (error) {
      log.error('Product seeding failed. You can run manually: cd scripts && yarn seed:products');
    }
  } else {
    log.info('Skipped demo products');
  }
}


async function validateSetup(platforms) {
  log.title('Step 8: Setup Validation');

  console.log(`${colors.bright}Running setup validation...${colors.reset}\n`);

  let hasErrors = false;

  for (const platform of platforms) {
    log.step(`Validating ${platform}...`);
    try {
      execSync(`yarn validate`, { stdio: 'inherit', cwd: __dirname });
      log.success(`${platform} validation passed!`);
    } catch (error) {
      hasErrors = true;
      log.warning(`${platform} validation found some issues. Review the output above.`);
    }
  }

  if (!hasErrors) {
    log.success('All validations passed!');
  } else {
    log.info('You can run validation anytime with: cd scripts && yarn validate');
  }
}

async function displayNextSteps() {
  log.title('Setup Complete! 🎉');

  console.log(`${colors.bright}${colors.green}Your ada ÉLAN storefront is ready!${colors.reset}

${colors.bright}Next Steps:${colors.reset}

${colors.cyan}1. Start Development Server:${colors.reset}
   ${colors.dim}cd hydrogen${colors.reset}
   ${colors.dim}yarn dev${colors.reset}
   ${colors.dim}→ Visit http://localhost:3000${colors.reset}

${colors.cyan}2. Customize Your Store:${colors.reset}
   • Update colors and fonts (see ${colors.dim}docs/CUSTOMIZATION.md${colors.reset})
   • Add your products to Shopify Admin
   • Configure shipping and payment settings

${colors.cyan}3. Publish Products:${colors.reset}
   • Go to Shopify Admin > Products
   • Ensure products are published to the Storefront API channel

${colors.cyan}4. Create Content:${colors.reset}
   • Add homepage content via Metaobjects
   • Create collections for your product categories
   • Set up navigation menus

${colors.cyan}5. Deploy:${colors.reset}
   • See ${colors.dim}docs/DEPLOYMENT.md${colors.reset} for deployment guides
   • Supports Oxygen, Vercel, Netlify, and more

${colors.bright}Documentation:${colors.reset}
  📖 Setup Guide:        docs/SETUP.md
  🎨 Customization:      docs/CUSTOMIZATION.md
  🏗️  Architecture:       docs/ARCHITECTURE.md
  🚀 Deployment:         docs/DEPLOYMENT.md
  🐛 Troubleshooting:    docs/TROUBLESHOOTING.md

${colors.bright}${colors.magenta}Happy building with ada ÉLAN! 🛍️${colors.reset}
`);
}

// Main execution
async function main() {
  try {
    await displayWelcome();

    const { hasShopifyCLI } = await checkPrerequisites();

    const storefrontType = await selectStorefrontType();

    const platforms = await selectPlatforms();

    await displayShopifySetupInstructions(storefrontType);

    await setupEnvironmentVariables(storefrontType, hasShopifyCLI, platforms);

    await seedMetaobjects();

    await seedDemoContent();

    await seedDemoProducts();

    await validateSetup(platforms);

    await displayNextSteps();

  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}Setup cancelled by user${colors.reset}`);
  rl.close();
  process.exit(0);
});

main();

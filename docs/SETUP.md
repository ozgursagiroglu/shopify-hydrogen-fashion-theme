# ada ÉLAN Starter Kit - Complete Setup Guide

This comprehensive guide will walk you through setting up the ada ÉLAN premium fashion e-commerce starter kit for your Shopify store.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Shopify Admin Configuration](#shopify-admin-configuration)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Metaobject Definitions](#metaobject-definitions)
5. [Menu Configuration](#menu-configuration)
6. [Newsletter Integration](#newsletter-integration)
7. [Running Locally](#running-locally)
8. [Demo Content Setup](#demo-content-setup)
9. [Setup Validation](#setup-validation)
10. [Next Steps](#next-steps)

---

## Prerequisites

### Required Software

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **Package Manager**: npm 9.x+, yarn, or pnpm
- **Git**: For version control

### Shopify Requirements

- An active Shopify store
- Admin access to create custom apps
- Basic understanding of Shopify Admin

---

## Shopify Admin Configuration

### Overview: Required Apps

The starter kit requires **two separate apps** in your Shopify store:

| App | Type | Purpose | Provides |
|-----|------|---------|----------|
| **Hydrogen** or **Headless** | Sales Channel | Storefront access | `PUBLIC_STOREFRONT_API_TOKEN` |
| **Admin Access App** | Custom App | Server-side operations | `ADMIN_API_ACCESS_TOKEN` |

```
┌─────────────────────────────────────────────────────────────────┐
│                        Shopify Store                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐      ┌─────────────────────────────┐  │
│  │  Hydrogen Channel   │      │  Custom App (Admin Access)  │  │
│  │  or Headless Channel│      │                             │  │
│  ├─────────────────────┤      ├─────────────────────────────┤  │
│  │ Storefront API      │      │ Admin API                   │  │
│  │ • Products          │      │ • Seed script (metaobjects) │  │
│  │ • Collections       │      │ • Contact form submissions  │  │
│  │ • Cart/Checkout     │      │ • Customer reviews          │  │
│  │ • Customer auth     │      │ • Stock alerts              │  │
│  └─────────────────────┘      └─────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Storefront API: Hydrogen vs Headless

Shopify provides two dedicated sales channels for headless storefronts. Choose the one that fits your deployment strategy:

| Channel | Best For | Key Features |
|---------|----------|--------------|
| **Hydrogen** | Deploying to Shopify Oxygen | Integrated CLI, automatic deployments, built-in analytics |
| **Headless** | Deploying to Vercel, Netlify, etc. | Platform-agnostic, manual token management |

---

### Option A: Hydrogen Channel (Recommended for Oxygen)

Use this option if you plan to deploy to **Shopify Oxygen**.

#### Step A1: Install Hydrogen Sales Channel

1. Navigate to your Shopify Admin: `https://your-store.myshopify.com/admin`
2. Go to **Settings > Apps and sales channels**
3. Click **Shopify App Store**
4. Search for **"Hydrogen"**
5. Click **Add channel** to install

#### Step A2: Create Hydrogen Storefront

1. Go to **Sales channels > Hydrogen**
2. Click **Create storefront**
3. Name it `ada ÉLAN Storefront`
4. Select **Connect existing project** (since you already have the code)
5. Follow the prompts to connect your repository

#### Step A3: Get API Tokens

1. In the Hydrogen channel, go to your storefront settings
2. Click **Storefront API**
3. Copy the **Public access token** - this is your `PUBLIC_STOREFRONT_API_TOKEN`
4. Note the **Storefront API URL** for reference

#### Step A4: Link with Shopify CLI (Optional)

For the best development experience:

```bash
# In your project directory
cd hydrogen
npx shopify hydrogen link
```

This connects your local project to the Hydrogen channel for seamless deployments.

---

### Option B: Headless Channel (For Vercel, Netlify, etc.)

Use this option if you plan to deploy to **Vercel**, **Netlify**, or other platforms.

#### Step B1: Install Headless Sales Channel

1. Navigate to your Shopify Admin: `https://your-store.myshopify.com/admin`
2. Go to **Settings > Apps and sales channels**
3. Click **Shopify App Store**
4. Search for **"Headless"**
5. Click **Add channel** to install

#### Step B2: Create Headless Storefront

1. Go to **Sales channels > Headless**
2. Click **Add storefront**
3. Name it `ada ÉLAN Storefront`
4. Click **Create**

#### Step B3: Get Storefront API Token

1. In the Headless channel, click on your storefront
2. Go to **Storefront API access tokens**
3. Click **Manage** or view the existing token
4. Copy the **Storefront API access token**
5. Save this securely - you'll need it for `.env`

---

### Admin API Setup (Required for Both Options)

The starter kit requires Admin API access for server-side operations that the Storefront API cannot perform.

#### Why a Separate App?

The Hydrogen/Headless channels only provide **Storefront API** access. For features like contact forms, reviews, and the seed script, you need **Admin API** access via a custom app.

#### Create Admin API Token

1. Go to **Settings > Apps and sales channels > Develop apps**
2. Click **Allow custom app development** (if first time)
3. Click **Create an app** and name it `ada ÉLAN Admin Access`
4. Go to **Configuration**
5. Click **Configure** under **Admin API integration**
6. Enable the scopes listed below based on your needs
7. Click **Save**
8. Click **Install app**
9. In **API credentials** tab, click **Reveal token once**
10. Copy and save the Admin API access token
    - ⚠️ This token is shown only once!

#### Admin API Scopes

**Required - Core Features:**

| Scope | Purpose |
|-------|---------|
| `read_metaobjects` | Read homepage content, reviews, FAQs |
| `write_metaobjects` | Create contact submissions, reviews, stock alerts |
| `read_customers` | Newsletter subscription check |
| `write_customers` | Newsletter subscription, customer creation |

**Required - Seed Script (Demo Content):**

| Scope | Purpose |
|-------|---------|
| `read_metaobject_definitions` | Check existing metaobject types |
| `write_metaobject_definitions` | Create metaobject schemas |
| `read_metafields` | Read shop metafields |
| `write_metafields` | Set shop social links, settings |
| `read_content` | Check existing blogs |
| `write_content` | Create blogs and articles |
| `read_files` | Check uploaded media |
| `write_files` | Upload demo images |
| `read_products` | Check existing products |
| `write_products` | Create demo products |
| `read_inventory` | Check inventory levels |
| `write_inventory` | Set demo inventory |
| `read_locations` | Get store locations for inventory |
| `read_publications` | Check sales channels |
| `write_publications` | Publish products to channels |
| `read_online_store_navigation` | Check existing menus |
| `write_online_store_navigation` | Create navigation menus |

**Optional - Additional Features:**

| Scope | Purpose |
|-------|---------|
| `read_online_store_pages` | Check existing pages |
| `write_online_store_pages` | Create About, Contact pages |
| `read_legal_policies` | Check existing policies |
| `write_legal_policies` | Create Privacy, Terms, Refund policies |

> **Tip:** If you only need core features (no seed script), enable just the first 4 scopes. For full demo content setup, enable all scopes.

> **Important:** After adding or changing scopes, you must **reinstall the app** to get a new access token with the updated permissions.

---

### Storefront API Scopes (Reference)

The Hydrogen and Headless channels automatically configure Storefront API access. For reference, the starter kit uses these Storefront API capabilities:

| Capability | Used For |
|------------|----------|
| Product listings | Browse products, collections |
| Product inventory | Stock status display |
| Collection listings | Category pages |
| Checkouts | Cart and checkout flow |
| Content (metaobjects) | Homepage content, FAQs |
| Selling plans | Subscription products |
| Pickup locations | Store pickup options |

These are pre-configured when you create a storefront in the Hydrogen or Headless channel.

---

### Customer Account API Setup (For Login)

1. Go to **Settings > Customer accounts**
2. Select **New customer accounts**
3. Under **Hydrogen custom storefronts**, click **Add storefront**
4. Enter storefront name: `ada ÉLAN Storefront`
5. Click **Add**
6. Copy the **Client ID** and save it
7. Note your **Shop ID** from the authorization URL

### Get Your Shop ID

1. Go to **Settings > General**
2. Scroll to **Store details**
3. Your Shop ID is in the URL or visible in the settings
4. Alternatively, it's visible in the Customer Account API authorization URL

---

## Environment Variables Setup

### Option A: Interactive Setup Wizard (Recommended)

The easiest way to configure your environment is using the setup wizard:

```bash
cd scripts
yarn install
yarn setup
```

The wizard will:
- Guide you through Shopify API configuration
- Create `.env` file in the `hydrogen/` directory
- Optionally create metaobject definitions and demo content
- Run setup validation

After the wizard completes, proceed to [Running Locally](#running-locally).

### Option B: Manual Setup

If you prefer manual configuration:

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd ada-themes-fashion
```

#### 2. Create Environment File

```bash
cd hydrogen
cp .env.example .env
```

#### 3. Fill in Environment Variables

Open `.env` and fill in your values:

```env
# ========================================
# REQUIRED VARIABLES
# ========================================

PUBLIC_STORE_DOMAIN=your-store.myshopify.com
SHOP_ID=94579097967
PUBLIC_STOREFRONT_API_TOKEN=your-storefront-access-token-here
PUBLIC_STOREFRONT_API_VERSION=2025-10
SESSION_SECRET=generate-random-32-character-string

# ========================================
# CUSTOMER ACCOUNT API (Required for Login)
# ========================================

PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your-client-id-here
PUBLIC_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/authentication/94579097967/oauth/authorize

# ========================================
# ADMIN API (Required for Contact, Reviews, Stock Alerts)
# ========================================

ADMIN_API_ACCESS_TOKEN=your-admin-api-token-here
ADMIN_API_VERSION=2025-10
```

### Generate Session Secret

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))
```

---

## Metaobject Definitions

The starter kit uses Shopify Metaobjects for dynamic content. You have two options:

### Option 1: Automated Setup (Recommended)

Run the seed script to automatically create all required metaobject definitions and sample content:

```bash
# From the scripts/ directory
cd scripts
yarn install  # if not already done
yarn seed
```

> **Note**: Seed commands run from the `scripts/` folder, not `hydrogen/`. The scripts read credentials from `hydrogen/.env`.

This will create:
- All metaobject definitions
- Sample homepage content (hero, feature banner, testimonials, etc.)
- Demo FAQ items and customer reviews
- Sample brand values and store locations

### Option 2: Manual Setup

If you prefer to set up metaobjects manually, refer to [SHOPIFY_METAOBJECTS.md](./SHOPIFY_METAOBJECTS.md) for detailed instructions on creating each metaobject type.

### Required Metaobject Types

The starter kit requires these metaobject definitions:

1. **Homepage Hero** - Main hero banner
2. **Feature Banner** - Brand story section
3. **Customer Review** - Product reviews system
4. **Contact Submission** - Contact form entries
5. **Stock Alert** - Back-in-stock notifications
6. **About Page** - About us content
7. **Brand Value** - Company values/mission
8. **Store Location** - Physical store locations

### Optional Metaobject Types

These enhance your store but are not required:

- **Press Feature** - "As Featured In" section
- **Lookbook Item** - Editorial lookbook grid
- **Lookbook Collection** - Seasonal lookbook collections
- **Split Hero** - Men/Women split panels
- **Testimonial** - Customer testimonials
- **Instagram Post** - Social feed

---

## Menu Configuration

### Required Menus

Create these menus in **Navigation > Menus**:

#### 1. Main Menu (Handle: `main-menu`)

Example structure:
- Home
- Shop (link to /collections/all)
- New Arrivals (link to collection)
- Sale (link to collection)
- About (link to /about)
- Contact (link to /contact)

#### 2. Footer Menus

Create separate menus for each footer column:

**Footer - Shop (Handle: `footer-shop`)**
- All Products
- New Arrivals
- Best Sellers
- Sale

**Footer - Help (Handle: `footer-help`)**
- Contact Us
- Shipping Information
- Returns & Exchanges
- Size Guide
- FAQ

**Footer - About (Handle: `footer-about`)**
- Our Story
- Stores
- Careers
- Sustainability

**Footer - Legal (Handle: `footer-legal`)**
- Privacy Policy
- Terms of Service
- Cookie Policy

You can customize these menus - the starter kit will use whatever you configure. If no menus are found, fallback links will be displayed.

---

## Newsletter Integration

The ada ÉLAN starter kit includes a built-in newsletter subscription feature that integrates seamlessly with Shopify's Customer API.

### How It Works

1. User enters their email address in the newsletter form
2. Form submits to `/api/newsletter` endpoint
3. API creates a new customer in Shopify with `acceptsMarketing: true`
4. User sees a success message with welcome benefits

```
[User] → [Newsletter Form] → [/api/newsletter] → [Shopify Customer API]
```

### Newsletter Form Locations

The newsletter component appears in:
- **Homepage footer section** - `hydrogen/app/components/home/Newsletter.tsx`
- **Footer** - Optional subscription prompt
- **Custom pages** - Can be added anywhere

### API Endpoint

**File:** `hydrogen/app/routes/api.newsletter.tsx`

**Request:**
```
POST /api/newsletter
Content-Type: application/x-www-form-urlencoded

email=user@example.com
```

**Success Response:**
```json
{
  "success": true,
  "message": "subscribed"
}
```

**Already Subscribed:**
```json
{
  "success": true,
  "message": "already_subscribed"
}
```

### Viewing Newsletter Subscribers

#### In Shopify Admin

1. Go to **Shopify Admin** → **Customers**
2. Click **Filter** button
3. Select **Email subscription status** → **Subscribed**

#### Creating a Customer Segment

For targeted marketing campaigns:

1. Go to **Customers** → **Segments**
2. Click **Create segment**
3. Add filter:
   ```
   email_subscription_status = 'SUBSCRIBED'
   ```
4. Save as "Newsletter Subscribers"

### Third-Party Email Marketing Integration

For professional email marketing tools:

#### Klaviyo (Recommended)

1. Install Klaviyo from Shopify App Store
2. Klaviyo automatically syncs Shopify customers
3. Customers with `acceptsMarketing: true` are added to lists
4. Set up automated welcome series, abandoned cart, etc.

#### Mailchimp

1. Install Mailchimp from Shopify App Store
2. Enable audience sync
3. Marketing consent customers sync automatically

#### Omnisend

1. Install Omnisend from Shopify App Store
2. Use e-commerce automations
3. Set up welcome series, product recommendations

### Customization

**Newsletter Component:** `hydrogen/app/components/home/Newsletter.tsx`

Customizable elements:
- Background image
- Title and description text (i18n)
- Form colors and styling
- Success message design

**Translations:** `hydrogen/app/locales/[lang].json`

```json
{
  "newsletter": {
    "title": "Join the ada ÉLAN Circle",
    "description": "Be the first to discover new arrivals...",
    "placeholder": "Enter your email",
    "subscribe": "Subscribe",
    "successTitle": "Welcome to ada ÉLAN",
    "benefits": {
      "welcomeDiscount": "10% Welcome Discount",
      "earlyAccess": "Early Access to Sales",
      "newArrivals": "New Arrival Alerts"
    }
  }
}
```

### GDPR Compliance

The newsletter integration is GDPR compliant:

- **Explicit consent**: User actively submits the form
- **Marketing permission**: Recorded as `acceptsMarketing` in Shopify
- **Easy unsubscribe**: All Shopify emails include unsubscribe link
- **Data portability**: Export customer data via Shopify GDPR tools

### Troubleshooting Newsletter

**Form not working:**
1. Check browser console for errors
2. Inspect `/api/newsletter` request in Network tab
3. Verify Storefront API token is valid

**Subscribers not appearing:**
1. Refresh Customers page
2. Clear and reapply filters
3. Check customer's `acceptsMarketing` field value

---

## Running Locally

### Hydrogen (Web) Development

```bash
cd hydrogen
yarn install
yarn dev
```

The web storefront will be available at: `http://localhost:3000`

**Other commands:**
```bash
yarn build       # Build for production
yarn preview     # Preview production build
yarn typecheck   # TypeScript type checking
npm test            # Run unit tests
yarn test:e2e    # Run E2E tests
```


---

## Demo Content Setup

The ada ÉLAN starter kit includes a powerful seed script to populate your store with beautiful demo content, making it easy to showcase the starter kit's capabilities to clients or test features during development.

### What Gets Created

The seed script creates:

#### Content & Pages
- **Homepage Hero** - Stunning hero banner with CTAs
- **Feature Banner** - Brand storytelling section
- **Press Features** - "As Featured In" logos (4 entries)
- **Testimonials** - Customer reviews (3 entries)
- **Instagram Posts** - Social proof grid (6 entries)
- **About Page** - Complete about us content with mission & story
- **Brand Values** - Core values (4 entries: Quality, Timeless, Sustainable, Care)
- **Store Locations** - Sample physical stores (Paris, London, New York)

#### Lookbooks
- **Lookbook Items** - Editorial grid items (3 entries)
- **Lookbook Collections** - Seasonal collections (SS25, AW24)
- **Split Hero** - Men/Women category panels

#### Blog Content
- **Blogs** - Fashion journal with categories
- **Articles** - 5+ sample blog posts on fashion topics

#### Shop Content
- **Collections** - Demo product collections with curated items
- **Products** - Sample fashion products (if configured)
- **Metafields** - SEO and featured content

#### Shop Policies
- **Privacy Policy** - GDPR-compliant privacy policy
- **Terms of Service** - Standard e-commerce terms
- **Refund Policy** - Customer-friendly refund policy
- **Shipping Policy** - Shipping terms and conditions

### Running the Seed Script

**Prerequisites:**
- Shopify store set up
- Admin API access token configured in `hydrogen/.env`
- `ADMIN_API_ACCESS_TOKEN` and `ADMIN_API_VERSION` set

**Run the script:**

```bash
# From the scripts/ directory
cd scripts
yarn install  # if not already done

# For Hydrogen (Web)
yarn seed           # Create metaobject definitions + demo content
yarn seed:products           # Create demo products (optional)


# Or run all at once
yarn seed:all       # Definitions + content + products for web
```

> **Note**: All seed commands are run from the `scripts/` folder. The scripts read credentials from the respective platform's `.env` file. See `scripts/README.md` for all available commands.

**Expected output:**

```
═══════════════════════════════════════════════
ada ÉLAN STARTER KIT - DEMO CONTENT SEEDER
═══════════════════════════════════════════════

✅ Creating metaobject definitions...
✅ Created: Homepage Hero
✅ Created: Feature Banner
✅ Created: Press Feature
... (continues for all metaobjects)

✅ Creating homepage content...
✅ Created hero banner: "New Season Collection"
✅ Created feature banner: "Crafted with Care"

✅ Creating blog structure...
✅ Created blog: "ada ÉLAN Journal"
✅ Created article: "The Art of Timeless Style"
... (continues for all articles)

✅ Creating shop policies...
✅ Created Privacy Policy
✅ Created Terms of Service

═══════════════════════════════════════════════
✅ DEMO CONTENT SETUP COMPLETE
═══════════════════════════════════════════════

Next steps:
1. Visit your Shopify Admin > Content > Metaobjects to review
2. Publish products to Storefront API channel
3. Run: yarn dev
4. View your store at: http://localhost:3000
```

### Customizing Demo Content

The seed data is defined in `scripts/data/` directory:

- **`definitions/`** - Metaobject schema definitions (JSON)
- **`entries/`** - Demo content entries (JSON)

You can customize:

- **Text content**: Edit titles, descriptions, copy in entry JSON files
- **Images**: Replace placeholder image URLs with your own
- **Quantities**: Add or remove entries
- **Structure**: Modify data shapes to fit your needs

### Resetting Demo Content

To start fresh:

1. Go to **Shopify Admin** → **Content** → **Metaobjects**
2. Delete all entries (or specific metaobject types)
3. Re-run `yarn seed`

**Warning:** This will delete all metaobject entries. Make sure to backup any content you want to keep.

### Demo vs Production Content

**For development/demo:**
- Use the seed script to quickly populate content
- Great for testing, client presentations, screenshots

**For production:**
- Replace demo images with your actual product photography
- Update copy to reflect your brand voice
- Remove or replace placeholder content
- Add real customer testimonials and reviews

---

## Setup Validation

The starter kit includes a built-in CLI validation tool that checks if everything is configured correctly.

### Run the Validation Script

```bash
# From the scripts/ directory
cd scripts
yarn install  # if not already done

# Validate Hydrogen (Web) setup
yarn validate
```

### What it Checks

- ✅ Environment variables are set correctly
- ✅ Required menus exist (header-menu, footer menus)
- ✅ Metaobject definitions are created
- ✅ Shop metafields are configured (social links, newsletter)

### Understanding Results

- **🔴 Critical**: Must be fixed for starter kit to function
- **🟠 High**: Important features won't work without this
- **🟡 Medium**: Some features may be limited
- **🔵 Low**: Optional enhancements

The validation script provides:
- Clear error descriptions
- Step-by-step solutions
- Configuration recommendations
- Exit codes for CI/CD integration

### Example Output

```
═════════════════════════════════════════════════════════════════════════════════
ada ÉLAN STARTER KIT - SETUP VALIDATION
═════════════════════════════════════════════════════════════════════════════════

Checking your starter kit configuration...

❌ Critical Errors
These must be fixed for the starter kit to function:

🔴 Missing PUBLIC_STOREFRONT_API_TOKEN
   Environment variable PUBLIC_STOREFRONT_API_TOKEN is not set.
   Solution: Add this variable to your .env file. See SETUP.md for details.

⚠️  Configuration Warnings

Environment Variables (2)

🟠 Customer Account API not configured
   Login functionality requires Customer Account API setup.
   Solution: Configure Customer Account API in Shopify Admin > Settings > Customer accounts

🟡 FAQ metaobjects not found
   No FAQ Item entries found. This feature may not work.
   Solution: Run "yarn seed" to create metaobject definitions and sample content.

Summary

🔴 1 critical issue(s)
🟠 1 high priority issue(s)
🟡 1 medium priority issue(s)

❌ Setup validation failed. Please fix critical errors.
   See docs/SETUP.md for detailed instructions.
```

### Exit Codes

- `0` - All checks passed or only low/medium warnings
- `1` - Critical errors found (starter kit won't function properly)

### CI/CD Integration

You can use this script in your deployment pipeline:

```bash
# In your CI/CD workflow (from scripts/ directory)
cd scripts && yarn validate || exit 1
```

---

## Next Steps

### Essential Setup

1. **Publish Products**: Ensure products are published to the Storefront API channel
   - Go to **Products** in Shopify Admin
   - For each product, check "Storefront API" in Sales channels
2. **Configure Collections**: Create collections for your product categories
3. **Set Up Shipping**: Configure shipping zones and rates
4. **Payment Settings**: Enable payment providers
5. **Test Checkout**: Complete a test purchase

### Starter Kit Customization

1. **Colors & Fonts**: See [CUSTOMIZATION.md](./CUSTOMIZATION.md)
2. **Metaobjects**: Manage homepage content via [SHOPIFY_METAOBJECTS.md](./SHOPIFY_METAOBJECTS.md)
3. **Menus**: Configure navigation in Shopify Admin
4. **Shop Metafields**: Set up social media links and newsletter settings

### Content Creation

1. **Replace demo images** with your actual product photography
2. **Update about page** with your brand story
3. **Add real customer testimonials** (optional)
4. **Create lookbook collections** for seasonal campaigns (optional)
5. **Write blog articles** for SEO and content marketing (optional)

### SEO & Marketing

1. **Configure meta titles and descriptions** for key pages
2. **Set up Google Analytics** via Shopify Admin
3. **Enable Google Merchant Center** for Shopping ads
4. **Configure social media links** in shop metafields
5. **Set up newsletter integration** with Klaviyo or Mailchimp

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on deploying to:
- Shopify Oxygen (recommended)
- Vercel
- Netlify
- Other platforms

### Getting Help

- **Starter Kit Issues**: Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Customization Guide**: See [CUSTOMIZATION.md](./CUSTOMIZATION.md)
- **Hydrogen Docs**: https://shopify.dev/docs/storefronts/headless/hydrogen
- **Storefront API**: https://shopify.dev/docs/api/storefront
- **Admin API**: https://shopify.dev/docs/api/admin

---

## Setup Checklist

Use this checklist to track your setup progress:

### Shopify Configuration

#### Storefront API (Choose One)

**Option A: Hydrogen Channel**
- [ ] Installed Hydrogen sales channel from App Store
- [ ] Created storefront in Hydrogen channel
- [ ] Copied Storefront API access token
- [ ] (Optional) Linked project with `shopify hydrogen link`

**Option B: Headless Channel**
- [ ] Installed Headless sales channel from App Store
- [ ] Created storefront in Headless channel
- [ ] Copied Storefront API access token

#### Admin API (Required)
- [ ] Enabled custom app development in Settings
- [ ] Created custom app named "ada ÉLAN Admin Access"
- [ ] Configured core scopes (read/write metaobjects, customers)
- [ ] (If using seed) Added seed script scopes (content, files, products, etc.)
- [ ] Installed the app and copied Admin API token

#### Customer Accounts
- [ ] Enabled "New customer accounts" in Settings
- [ ] Added storefront to Hydrogen custom storefronts
- [ ] Copied Client ID
- [ ] Got Shop ID

### Local Development
- [ ] Cloned repository
- [ ] Ran setup wizard (`cd scripts && yarn install && yarn setup`)
- [ ] Or manually created `.env` file with all required variables
- [ ] Generated secure SESSION_SECRET
- [ ] Ran seed script to create metaobjects (`yarn seed`)
- [ ] Installed dependencies (`cd hydrogen && yarn install`)
- [ ] Tested locally with `yarn dev`
- [ ] Ran setup validation (`yarn validate`)

### Content & Navigation
- [ ] Created main-menu in Navigation
- [ ] Created footer menus (shop, help, about, legal)
- [ ] Published products to Storefront API
- [ ] Created product collections
- [ ] Added homepage content (hero, feature banner, etc.)

### Features & Integration
- [ ] Tested newsletter subscription
- [ ] Verified contact form submissions
- [ ] Tested product reviews (if using)
- [ ] Verified stock alert system (if using)
- [ ] Tested login and account features

### Final Steps
- [ ] Replaced demo content with real content
- [ ] Updated about page and brand values
- [ ] Configured shipping and payment
- [ ] Completed test purchase
- [ ] Verified all features work across devices

---

**Congratulations!** Your ada ÉLAN starter kit is now set up. Start customizing and building your premium fashion e-commerce experience!

For detailed customization options, see [CUSTOMIZATION.md](./CUSTOMIZATION.md).

---

*ada ÉLAN Starter Kit Setup Guide - v1.0*
*Last updated: December 2024*

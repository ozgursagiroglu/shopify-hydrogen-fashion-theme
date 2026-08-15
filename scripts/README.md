# ada ÉLAN Scripts

Setup and seed scripts for the ada ÉLAN starter kit. This includes an interactive setup wizard and automated seeding tools for creating demo content.

## Quick Start

### Interactive Setup (Recommended)

The easiest way to get started:

```bash
cd scripts
yarn install
yarn setup
```

This will guide you through:
- Shopify app creation
- Environment configuration (creates .env in hydrogen directory)
- Metaobject definitions
- Demo content (optional)
- Demo products (optional)
- Setup validation

### Manual Setup

If you prefer to run individual commands:

```bash
cd scripts
yarn install
# Setup will create hydrogen/.env for you
# Or manually create it from hydrogen/.env.example
yarn seed        # Create metaobject definitions
yarn seed:entries         # Create demo content
yarn seed:products        # Create demo products
```


## Available Commands

| Command | Description |
|---------|-------------|
| `yarn setup` | Interactive setup wizard |
| `yarn seed` | Create metaobject definitions (uses hydrogen/.env) |
| `yarn seed:definitions` | Create metaobject definitions only |
| `yarn seed:entries` | Create demo content entries only |
| `yarn seed:products` | Create demo products and collections |
| `yarn seed:all` | Run all seed commands |
| `yarn seed` | Create metaobject definitions for Hydrogen |
| `yarn seed:all` | Run all seed commands for Hydrogen |
| `yarn validate` | Validate Hydrogen setup |
| `yarn validate` | Validate Hydrogen setup |

## Features

### Interactive Setup Wizard (`yarn setup`)

- Step-by-step Shopify configuration
- Automatic environment setup
- API token management
- Optional demo content
- Setup validation

### Seed Scripts

- Creates all metaobject definitions automatically
- Creates demo collections with images
- Creates 14 demo products with variants
- Uploads images from Unsplash to your Shopify Files
- Assigns products to collections automatically
- Idempotent - safe to run multiple times
- Skips existing content

## Directory Structure

```
scripts/
├── package.json          # Script commands and dependencies
├── setup.js              # Interactive setup wizard
├── lib/                  # Seed scripts
│   ├── seed.ts          # Metaobject seeding
│   └── seed-products.ts # Product seeding
├── data/                 # Demo data
│   ├── definitions/     # Metaobject schemas
│   └── entries/         # Demo content JSON
└── README.md            # This file

Note: .env files are created in platform directories:
└── hydrogen/.env        # Web storefront credentials
```

## What Gets Created

### Metaobjects
- Homepage Hero, Feature Banners
- Press Features, Lookbook Items
- Split Hero, Testimonials
- Instagram Posts, FAQ Items
- Customer Reviews, Store Locations
- Brand Values, Contact Info

### Collections (11)
Women, Men, Dresses, Tops, Outerwear, Accessories, New Arrivals, All Products, Autumn, Workwear, Casual

### Products (14)
6 Women's items, 4 Men's items, 4 Accessories - all with variants, images, and detailed descriptions

### Native Shopify Content
- Blog & Articles (6 posts)
- Custom Pages (7 pages: About, Contact, Stores, FAQ, etc.)
- Shop Policies (Shipping, Returns, Privacy, Terms)
- Navigation Menus

## Prerequisites

You'll need two apps in your Shopify Admin:

**A) Hydrogen/Headless Channel** (for Storefront API):
- Provides Storefront API access token
- Provides Customer Account API (Client ID, Shop ID)

**B) Custom Admin App** (for Admin API):
- Provides Admin API access token for seeding and admin operations
- **Note:** Admin API tokens are also used in storefronts (newsletter, customer operations)

The interactive setup wizard will guide you through creating these and will create `.env` file in the hydrogen/ directory.

## Troubleshooting

### "Missing environment variables"
Make sure you've created `.env` file in the hydrogen/ directory with valid credentials.

### ".env file not found"
The seed scripts look for .env files in `hydrogen/.env` for the web storefront.

Run `yarn setup` to create this automatically, or copy from `hydrogen/.env.example`.

### "Access denied"
Your Admin API token needs all required scopes. See the setup wizard for the complete list.

### "Rate limit exceeded"
The script includes delays between API calls. If you still hit limits, wait a few minutes and retry.

### Products not showing in collections
This is normal - Shopify can take a few minutes to index products. Refresh after a few minutes.

## After Setup

1. **Verify in Shopify Admin:**
   - Products → All products (14 products)
   - Products → Collections (11 collections)
   - Content → Metaobjects (multiple types)

2. **Enable Storefront API access:**
   - Settings → Custom data → Metaobject definitions
   - Enable "Storefront access" for each type

3. **Test your platform:**

   ```bash
   cd ../hydrogen
   yarn install
   yarn dev
   ```
   Visit `http://localhost:3000`


## Documentation

- [CONTENT_MAP.md](./CONTENT_MAP.md) - Complete content structure reference
- [Setup Guide](../docs/SETUP.md) - Full setup documentation
- [Customization Guide](../docs/CUSTOMIZATION.md) - Theme customization

---

*For detailed setup instructions and troubleshooting, run `yarn setup` for the interactive wizard.*

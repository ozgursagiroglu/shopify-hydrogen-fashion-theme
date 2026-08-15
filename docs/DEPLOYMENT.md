# ada ÉLAN Starter Kit - Deployment Guide

This guide covers deploying your ada ÉLAN starter kit to production on various platforms.

## Table of Contents

1. [Shopify Oxygen (Recommended)](#shopify-oxygen-recommended)
2. [Vercel](#vercel)
3. [Netlify](#netlify)
4. [Other Platforms](#other-platforms)
5. [Pre-Deployment Checklist](#pre-deployment-checklist)
6. [Post-Deployment Tasks](#post-deployment-tasks)

---

## Shopify Oxygen (Recommended)

Oxygen is Shopify's official hosting platform for Hydrogen storefronts, offering the best integration and performance.

### Prerequisites

- Shopify store with **Hydrogen** or **Headless** sales channel installed (for Storefront API)
- Custom App for Admin API access (see [SETUP.md](./SETUP.md#admin-api-setup-required-for-both-options))
- GitHub/GitLab repository with your starter kit code
- Environment variables ready

> **Note**: The starter kit requires two separate apps in Shopify: a sales channel (Hydrogen/Headless) for Storefront API and a Custom App for Admin API. See [SETUP.md](./SETUP.md) for complete configuration.

### Step 1: Install Hydrogen Sales Channel

1. Go to **Shopify Admin > Apps**
2. Search for **Hydrogen** and install
3. Follow the setup wizard

### Step 2: Connect Repository

1. In Hydrogen sales channel, click **Create storefront**
2. Choose **Connect to Git**
3. Authorize GitHub/GitLab access
4. Select your repository
5. Choose the branch for production (usually `main`)

### Step 3: Configure Build Settings

```yaml
# Oxygen will automatically detect these from package.json
# Build command: yarn build
# Output directory: dist
```

### Step 4: Set Environment Variables

In Hydrogen sales channel settings:

```env
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
SHOP_ID=your-shop-id
PUBLIC_STOREFRONT_API_TOKEN=your-token
PUBLIC_STOREFRONT_API_VERSION=2025-10
SESSION_SECRET=your-production-secret
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your-client-id
PUBLIC_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/authentication/your-shop-id/oauth/authorize
ADMIN_API_ACCESS_TOKEN=your-admin-token
ADMIN_API_VERSION=2025-10
```

⚠️ **Important**: Use different SESSION_SECRET for production!

### Step 5: Deploy

```bash
# Push to main branch
git add .
git commit -m "Deploy to production"
git push origin main

# Oxygen will automatically build and deploy
```

### Custom Domains

1. In Hydrogen settings, click **Add custom domain**
2. Enter your domain (e.g., `shop.yourbrand.com`)
3. Add DNS records as instructed:
   ```
   Type: CNAME
   Name: shop
   Value: shops.myshopify.com
   ```
4. Wait for SSL certificate (5-10 minutes)

### Preview Deployments

- Pull requests automatically create preview deployments
- Preview URL: `https://pr-[number].oxygen.shopifypreview.com`
- Test changes before merging to production

---

## Vercel

Vercel offers excellent performance and DX for React applications.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click **Import Project**
3. Import from GitHub/GitLab
4. Select your repository

### Step 3: Configure Project

```bash
# Framework: Other
# Build Command: yarn build
# Output Directory: dist
# Install Command: yarn install
```

### Step 4: Environment Variables

Add all environment variables in **Project Settings > Environment Variables**:

```
PUBLIC_STORE_DOMAIN
SHOP_ID
PUBLIC_STOREFRONT_API_TOKEN
PUBLIC_STOREFRONT_API_VERSION
SESSION_SECRET
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID
PUBLIC_CUSTOMER_ACCOUNT_API_URL
ADMIN_API_ACCESS_TOKEN
ADMIN_API_VERSION
```

Make sure to select **Production**, **Preview**, and **Development** for each variable.

### Step 5: Deploy

```bash
# Initial deployment
vercel

# Production deployment
vercel --prod
```

### Custom Domain

1. Go to **Project Settings > Domains**
2. Add your domain
3. Configure DNS as instructed

---

## Netlify

Netlify is another popular platform with great features.

### Step 1: Connect Repository

1. Go to [netlify.com](https://netlify.com)
2. Click **Add new site > Import an existing project**
3. Connect to GitHub/GitLab
4. Select your repository

### Step 2: Build Settings

```yaml
# Build command
yarn build

# Publish directory
dist

# Environment variables (add in Site settings)
```

### Step 3: netlify.toml Configuration

Create `netlify.toml` in your project root:

```toml
[build]
  command = "yarn build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Step 4: Environment Variables

Add in **Site settings > Environment variables**:

```
PUBLIC_STORE_DOMAIN
SHOP_ID
PUBLIC_STOREFRONT_API_TOKEN
PUBLIC_STOREFRONT_API_VERSION
SESSION_SECRET
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID
PUBLIC_CUSTOMER_ACCOUNT_API_URL
ADMIN_API_ACCESS_TOKEN
ADMIN_API_VERSION
```

### Step 5: Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Production deploy
netlify deploy --prod
```

---

## Other Platforms

### Cloudflare Pages

```bash
# Build command
yarn build

# Output directory
dist

# Add environment variables in dashboard
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### DigitalOcean App Platform

1. Create new app from GitHub
2. Set build command: `yarn build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All TypeScript errors resolved (`yarn typecheck`)
- [ ] Tests passing (`npm test`)
- [ ] Build succeeds (`yarn build`)
- [ ] Production preview works (`yarn preview`)

### Environment Variables

- [ ] All required variables set
- [ ] Production SESSION_SECRET generated (unique!)
- [ ] API tokens have correct permissions
- [ ] No development/test values in production

### Shopify Configuration

- [ ] Products published to Storefront API
- [ ] Collections created and configured
- [ ] Menus configured (main-menu, footer)
- [ ] Metaobjects seeded or created
- [ ] Policies added (privacy, terms, refund)
- [ ] Shipping zones configured
- [ ] Payment providers enabled

### SEO & Performance

- [ ] Meta tags on all pages
- [ ] Sitemap accessible (`/sitemap.xml`)
- [ ] Robots.txt configured
- [ ] Images optimized
- [ ] Analytics configured (if needed)

### Security

- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Privacy banner enabled
- [ ] Customer Account API configured
- [ ] API rate limits understood

---

## Post-Deployment Tasks

### 1. Test Core Functionality

- [ ] Browse products and collections
- [ ] Add items to cart
- [ ] Complete checkout process
- [ ] Test customer login/register
- [ ] Submit contact form
- [ ] Test search functionality
- [ ] Test wishlist and compare
- [ ] Test reviews functionality

### 2. Test Different Devices

- [ ] Mobile (iPhone, Android)
- [ ] Tablet (iPad)
- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Accessibility (screen reader)

### 3. Test Internationalization

If using multiple languages:
- [ ] Test Arabic (RTL layout)
- [ ] Test French translations
- [ ] Test language switcher

### 4. Monitor Performance

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=https://your-site.com

# Check Core Web Vitals
# Use Google PageSpeed Insights
```

### 5. Set Up Monitoring (Optional)

Consider adding:
- Error tracking (Sentry, LogRocket)
- Analytics (Google Analytics, Plausible)
- Uptime monitoring (UptimeRobot)

---

## Rollback Procedures

### Oxygen

```bash
# Roll back to previous deployment in Hydrogen dashboard
# Or revert git commit and push
```

### Vercel

```bash
# Roll back to specific deployment
vercel rollback [deployment-url]
```

### Netlify

```bash
# Use Netlify dashboard > Deploys > [Select previous] > Publish
```

---

## Continuous Deployment

### Automatic Deployments

All platforms support automatic deployment on git push:

```bash
# Development workflow
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature

# Create pull request -> Preview deployment created
# Merge to main -> Production deployment triggered
```

### Deployment Branches

Best practice:
- `main` → Production
- `staging` → Staging environment
- `feature/*` → Preview deployments

---

## Troubleshooting Deployments

### Build Fails

```bash
# Check build locally first
yarn build

# Common issues:
# - TypeScript errors
# - Missing environment variables
# - Package installation failures
```

### Runtime Errors

```bash
# Check environment variables are set
# Check API tokens have correct permissions
# Check CORS settings
# Review server logs
```

### Performance Issues

```bash
# Enable production mode
NODE_ENV=production yarn build

# Check bundle size
yarn build --analyze
```

---

## Getting Help

- **Oxygen**: https://shopify.dev/docs/storefronts/headless/hydrogen/deployment
- **Vercel**: https://vercel.com/docs
- **Netlify**: https://docs.netlify.com
- **Hydrogen Discord**: https://discord.gg/shopifydevs

---

**Congratulations!** Your ada ÉLAN starter kit is now live in production!

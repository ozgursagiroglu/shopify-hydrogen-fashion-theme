# ada ÉLAN Starter Kit - Troubleshooting Guide

Common issues and solutions for the ada ÉLAN starter kit.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Build & Development Issues](#build--development-issues)
3. [Shopify API Issues](#shopify-api-issues)
4. [Customer Authentication Issues](#customer-authentication-issues)
5. [Product & Collection Issues](#product--collection-issues)
6. [Cart & Checkout Issues](#cart--checkout-issues)
7. [Contact Form & Reviews Issues](#contact-form--reviews-issues)
8. [Styling & Layout Issues](#styling--layout-issues)
9. [Performance Issues](#performance-issues)
10. [Deployment Issues](#deployment-issues)

---

## Installation Issues

### Problem: `yarn install` fails

**Symptoms**:
```
error An unexpected error occurred: "... ENOENT"
warning Incorrect peer dependency ...
```

**Solutions**:
```bash
# Option 1: Clear the cache and retry
rm -rf node_modules
yarn cache clean
yarn install

# Option 2: Reinstall strictly from the lockfile
yarn install --frozen-lockfile

# Option 3: Check your Node.js version (20.19+ required)
node -v
```

Peer dependency mismatches are warnings in Yarn 1, not errors — you can usually ignore them. If a
warning turns into a real runtime failure, open an issue with the full output.

### Problem: Wrong Node.js version

**Symptoms**:
```
error ada-elan-storefront@1.0.0: The engine "node" is incompatible with this module.
```

**Solution**:
```bash
# Check current version
node -v

# The repository pins a version in .nvmrc
nvm install
nvm use

# Or install explicitly
nvm install 20.19.0
nvm use 20.19.0
```

---

## Build & Development Issues

### Problem: TypeScript compilation errors

**Symptoms**:
```
error TS2322: Type 'X' is not assignable to type 'Y'
```

**Solutions**:
```bash
# Run type checking
yarn typecheck

# Common fixes:
# 1. Regenerate Shopify types
yarn codegen

# 2. Check for missing imports
# 3. Verify environment variables are set
```

### Problem: Development server won't start

**Symptoms**:
```
Error: Missing environment variables
```

**Solution**:
```bash
# 1. Verify .env file exists
ls -la .env

# 2. Copy from example if missing
cp .env.example .env

# 3. Fill in all required variables
# 4. Restart dev server
yarn dev
```

### Problem: Hot reload not working

**Solutions**:
```bash
# 1. Restart dev server
# Press Ctrl+C, then:
yarn dev

# 2. Clear browser cache
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# 3. Check file watcher limits (Linux/Mac)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Shopify API Issues

### Problem: "Storefront API token is invalid"

**Symptoms**:
```
Error: Invalid Storefront API credentials
```

**Solutions**:
1. **Verify token in .env**:
   ```env
   PUBLIC_STOREFRONT_API_TOKEN=your-actual-token-here
   ```

2. **Check token permissions** in Shopify Admin:
   - Settings > Apps > Develop apps > [Your App] > API credentials
   - Ensure all required scopes are enabled

3. **Token hasn't been revoked**:
   - If you regenerated the token, update .env

4. **Restart dev server** after changing .env

### Problem: GraphQL query returns no data

**Symptoms**:
- Products/collections not showing
- Empty search results

**Solutions**:
1. **Publish content to Storefront API**:
   - In Shopify Admin, edit product/collection
   - Scroll to "Sales channels and apps"
   - Enable "Online Store" or "Headless" channel

2. **Check API version compatibility**:
   ```env
   # Make sure version matches
   PUBLIC_STOREFRONT_API_VERSION=2025-10
   ```

3. **Verify query with GraphiQL**:
   - Go to Shopify Admin > Apps > [Your App] > GraphiQL
   - Test your query directly

### Problem: API rate limits exceeded

**Symptoms**:
```
Error: Throttled
```

**Solutions**:
```typescript
// Implement query batching
// Use Shopify's built-in caching
// Add delays between requests in development
```

---

## Customer Authentication Issues

### Problem: Customer login redirects to 404

**Symptoms**:
- Click "Login" → redirects to 404 or error page

**Solutions**:
1. **Verify Customer Account API setup**:
   ```env
   PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your-client-id
   PUBLIC_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/authentication/SHOP_ID/oauth/authorize
   ```

2. **Enable new customer accounts**:
   - Shopify Admin > Settings > Customer accounts
   - Select "New customer accounts"
   - Add Hydrogen storefront with your domain

3. **Check authorization URL format**:
   ```
   Correct: https://shopify.com/authentication/94579097967/oauth/authorize
   Wrong: https://shopify.com/your-shop-id
   ```

### Problem: "Access denied" after login

**Solutions**:
- Check customer account status in Shopify Admin
- Verify customer email is confirmed
- Check if customer account is locked
- Ensure storefront domain is authorized

---

## Product & Collection Issues

### Problem: Products not displaying

**Solutions**:
1. **Check product publication**:
   - Edit product in Shopify Admin
   - Verify "Online Store" channel is enabled
   - Check product status is "Active"

2. **Verify GraphQL query**:
   ```bash
   # Check browser console for errors
   # Look for failed GraphQL requests
   ```

3. **Check filters**:
   - Ensure no filters are hiding products
   - Clear collection filters in UI

### Problem: Product images not loading

**Symptoms**:
- Broken image icons
- 404 errors for images

**Solutions**:
1. **Check Shopify CDN**:
   - Verify images exist in Shopify Admin
   - Check image URLs in network tab

2. **Check CSP headers**:
   - Ensure `cdn.shopify.com` is allowed in CSP
   - Check `hydrogen/app/entry.server.tsx`

3. **Verify image transforms**:
   ```tsx
   // Use Shopify's image transforms
   <Image
     data={product.featuredImage}
     sizes="(min-width: 1024px) 50vw, 100vw"
   />
   ```

### Problem: Search returns no results

**Solutions**:
1. **Check Predictive Search API**:
   - Verify products are published
   - Check search query syntax
   - Test with simple queries first

2. **Clear search index**:
   - Sometimes Shopify's index needs time to update
   - Wait a few minutes after publishing products

---

## Cart & Checkout Issues

### Problem: Cart not updating

**Symptoms**:
- Items not adding to cart
- Quantity changes not saving

**Solutions**:
1. **Check browser console** for errors

2. **Verify Storefront API scopes**:
   - Need `unauthenticated_write_checkouts`
   - Need `unauthenticated_read_checkouts`

3. **Clear cart data**:
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

### Problem: Checkout button not working

**Solutions**:
1. **Verify checkout domain**:
   ```env
   PUBLIC_CHECKOUT_DOMAIN=your-store.myshopify.com
   ```

2. **Check payment providers**:
   - Ensure at least one payment provider is enabled
   - Test with Shopify Payments test mode

3. **Verify cart has items**:
   - Check cart state in React DevTools

---

## Contact Form & Reviews Issues

### Problem: Contact form not submitting

**Symptoms**:
- Form submits but no confirmation
- Errors in console

**Solutions**:
1. **Verify Admin API credentials**:
   ```env
   ADMIN_API_ACCESS_TOKEN=your-admin-token-here
   ADMIN_API_VERSION=2025-10
   ```

2. **Check metaobject definitions**:
   ```bash
   # Run seed script to create definitions
   yarn seed
   ```

3. **Verify API scopes**:
   - Need `write_metaobjects` permission
   - Check in Shopify Admin > Apps > [Your App]

4. **Check network tab**:
   - Look for failed API requests
   - Check error messages

### Problem: Reviews not showing

**Solutions**:
1. **Seed sample reviews**:
   ```bash
   yarn seed
   ```

2. **Create reviews manually**:
   - Shopify Admin > Content > Metaobjects
   - Type: Customer Review
   - Add reviews with product handles

3. **Check GraphQL query**:
   - Ensure product handle matches exactly
   - Review status should be "published"

---

## Styling & Layout Issues

### Problem: Styles not applying

**Solutions**:
1. **Rebuild Tailwind**:
   ```bash
   # Stop dev server (Ctrl+C)
   rm -rf dist
   yarn dev
   ```

2. **Check Tailwind config**:
   - Verify `tailwind.css` is imported
   - Check `@theme` syntax is correct

3. **Clear browser cache**:
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Problem: Mobile layout broken

**Solutions**:
1. **Test responsive design**:
   ```bash
   # Use browser DevTools
   # Toggle device toolbar
   # Test at different breakpoints
   ```

2. **Check Tailwind breakpoints**:
   ```tsx
   // Correct
   className="px-4 md:px-6 lg:px-12"
   
   // Wrong (desktop-first)
   className="px-12 lg:px-6 md:px-4"
   ```

### Problem: RTL layout issues (Arabic)

**Solutions**:
1. **Check direction attribute**:
   ```html
   <html dir="rtl" lang="ar">
   ```

2. **Use logical properties**:
   ```tsx
   // Use start/end instead of left/right
   className="ms-4"  // margin-start
   className="pe-6"  // padding-end
   ```

---

## Performance Issues

### Problem: Slow page load

**Solutions**:
1. **Check bundle size**:
   ```bash
   yarn build
   # Review dist/ folder sizes
   ```

2. **Optimize images**:
   - Use Shopify's image CDN transforms
   - Specify proper sizes attribute

3. **Enable compression**:
   - Check hosting platform has gzip/brotli enabled
   - Verify in Network tab

### Problem: Slow GraphQL queries

**Solutions**:
1. **Reduce query depth**:
   - Don't request unnecessary fields
   - Use fragments for reusable queries

2. **Implement pagination**:
   - Use first/last parameters
   - Implement "Load more" instead of fetching all

3. **Cache responses**:
   - Hydrogen provides built-in caching
   - Use stale-while-revalidate strategy

---

## Deployment Issues

### Problem: Build fails in production

**Symptoms**:
```
Error: Build failed
```

**Solutions**:
1. **Test build locally**:
   ```bash
   yarn build
   yarn preview
   ```

2. **Check environment variables**:
   - Ensure all required variables are set in hosting platform
   - No missing or misspelled variable names

3. **Verify Node.js version**:
   - Production should use Node 20.19+
   - Check platform settings

### Problem: Environment variables not working

**Solutions**:
1. **Check variable names**:
   - Must start with `PUBLIC_` for client-side access
   - Server-only variables don't need prefix

2. **Restart deployment**:
   - Environment changes require rebuild
   - Trigger new deployment

3. **Check platform-specific syntax**:
   ```bash
   # Vercel/Netlify: KEY=value
   # No quotes needed
   ```

### Problem: 404 errors after deployment

**Solutions**:
1. **Check routing configuration**:
   - Ensure SPA routing is configured
   - All paths should serve index.html

2. **For Netlify, add `netlify.toml`**:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **For Vercel, use `vercel.json`**:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## Getting More Help

### Debug Mode

Enable verbose logging:
```bash
# Set in .env
DEBUG=true

# Or run with debug flag
DEBUG=* yarn dev
```

### Check Logs

```bash
# Development logs
# Check terminal output

# Production logs
# Check hosting platform dashboard
# - Oxygen: Hydrogen dashboard
# - Vercel: Deployments > [Select] > Logs
# - Netlify: Deploys > [Select] > Deploy log
```

### Community Resources

- **Shopify Community**: https://community.shopify.com
- **Hydrogen Discussions**: https://github.com/Shopify/hydrogen/discussions
- **Discord**: https://discord.gg/shopifydevs
- **Stack Overflow**: Tag `shopify-hydrogen`

### Report a Bug

If you found a starter kit bug:
1. Check if it's already reported in GitHub issues
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment info (Node version, OS, browser)

---

**Still stuck?** Double-check [SETUP.md](./SETUP.md) and [DEPLOYMENT.md](./DEPLOYMENT.md) for correct configuration. Most issues are due to missing environment variables or Shopify API configuration.

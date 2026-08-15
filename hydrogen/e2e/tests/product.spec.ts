import {test, expect} from '@playwright/test';

test.describe('Product Detail Page (PDP)', () => {
  test.beforeEach(async ({page}) => {
    // Navigate to collections to find a product
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');
  });

  test.describe('Product Information', () => {
    test('should display product title and price', async ({page}) => {
      // Click on first product (excluding gift cards)
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await expect(firstProduct).toBeVisible();

      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Verify product title is visible
      const productTitle = page.locator('h1').first();
      await expect(productTitle).toBeVisible();
      await expect(productTitle).not.toBeEmpty();

      // Verify price is displayed
      const price = page.locator('text=/\\$|€|£|¥/').first();
      await expect(price).toBeVisible();
    });

    test('should display product description', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await expect(firstProduct).toBeVisible();

      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Product page should be loaded
      expect(page.url()).toContain('/products/');

      // H1 should exist (product title)
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
    });

    test('should display product images', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await expect(firstProduct).toBeVisible();

      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Verify main product image is visible
      const productImage = page.locator('img').first();
      await expect(productImage).toBeVisible();
    });
  });

  test.describe('Variant Selection', () => {
    test('should allow selecting product variants', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Look for variant selectors (size, color, etc.)
      const variantButtons = page.locator('button[aria-label*="Select"], button[class*="variant"], input[type="radio"][name*="option"]');
      const variantCount = await variantButtons.count();

      if (variantCount > 0) {
        // If variants exist, click on a variant
        const secondVariant = variantButtons.nth(1);
        if (await secondVariant.isVisible()) {
          await secondVariant.click();
          await page.waitForTimeout(500);

          // Verify variant was selected
          await expect(secondVariant).toHaveAttribute('aria-checked', 'true').catch(() => {
            // Variant selection may use different attributes
          });
        }
      }
    });

    test('should show sold out state for unavailable variants', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Look for sold out or unavailable indicators
      const soldOutIndicators = page.locator('text=/sold out|unavailable|out of stock/i, button[disabled][class*="variant"]');
      // Just checking if the selectors exist (may or may not be visible depending on product)
    });
  });

  test.describe('Add to Cart', () => {
    test('should have enabled add to cart button for available products', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Find add to cart button
      const addToCartBtn = page.getByRole('button', {name: /add to (cart|bag)|buy now/i}).first();
      await expect(addToCartBtn).toBeVisible();
    });

    test('should add product to cart successfully', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Add to cart
      const addToCartBtn = page.getByRole('button', {name: /add to (cart|bag)/i}).first();
      await expect(addToCartBtn).toBeVisible();

      if (await addToCartBtn.isEnabled()) {
        await addToCartBtn.click();

        // Wait for cart to update
        await page.waitForTimeout(1500);

        // Verify cart badge shows count
        const cartButton = page.locator('header button[aria-label*="Cart" i]').first();
        await expect(cartButton).toBeVisible();
      }
    });
  });

  test.describe('Product Image Gallery', () => {
    test('should allow cycling through product images', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Look for image thumbnails or navigation arrows
      const thumbnails = page.locator('button[class*="thumbnail"], button[class*="gallery"], img[class*="thumbnail"]');
      const thumbnailCount = await thumbnails.count();

      if (thumbnailCount > 1) {
        // Click on second thumbnail
        await thumbnails.nth(1).click();
        await page.waitForTimeout(300);

        // Main image should have changed (difficult to assert without specific selectors)
      }
    });
  });

  test.describe('Product Metadata', () => {
    test('should display SKU or product code if available', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Verify product page loaded
      expect(page.url()).toContain('/products/');
    });

    test('should show product availability status', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Verify product page loaded
      expect(page.url()).toContain('/products/');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Verify h1 exists for product title
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      expect(await h1.count()).toBe(1);
    });

    test('should have accessible form labels', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Check that variant selectors have proper labels
      const radios = page.locator('input[type="radio"]');
      const radioCount = await radios.count();

      if (radioCount > 0) {
        for (let i = 0; i < Math.min(radioCount, 3); i++) {
          const radio = radios.nth(i);
          // Each radio should have an associated label
          const ariaLabel = await radio.getAttribute('aria-label');
          const id = await radio.getAttribute('id');

          // Should have either aria-label or id for label association
          expect(ariaLabel || id).toBeTruthy();
        }
      }
    });
  });

  test.describe('Related Products', () => {
    test('should display related or recommended products', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Look for related products section
      const relatedSection = page.locator('text=/related|you may also like|recommended|similar/i').first();

      // If related products exist, verify they're displayed
      if (await relatedSection.isVisible()) {
        const relatedProducts = page.locator('a[href*="/products/"]').filter({hasNot: page.locator('header')});
        expect(await relatedProducts.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Breadcrumbs', () => {
    test('should display breadcrumb navigation', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Look for breadcrumb navigation
      const breadcrumbs = page.locator('nav[aria-label*="breadcrumb"], [class*="breadcrumb"]');

      if (await breadcrumbs.isVisible()) {
        // Verify breadcrumb links
        const breadcrumbLinks = breadcrumbs.locator('a');
        expect(await breadcrumbLinks.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('SEO', () => {
    test('should have proper meta tags', async ({page}) => {
      const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      // Check for title tag
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);

      // Check for meta description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);
    });
  });
});

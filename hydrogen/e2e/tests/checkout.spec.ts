import {test, expect} from '@playwright/test';

/**
 * Checkout Flow Tests
 *
 * NOTE: This Hydrogen storefront uses Shopify's hosted checkout,
 * which means the actual checkout process happens on Shopify's domain.
 *
 * IMPORTANT: The checkout button only appears if Shopify provides a checkoutUrl.
 * In development environments, this may not be available depending on store configuration.
 * Therefore, tests gracefully handle cases where checkout is not configured.
 *
 * All cart functionality tests (add/remove items, quantities, totals, etc.)
 * are in cart.spec.ts to avoid duplication.
 */

test.describe('Checkout Flow', () => {
  // Helper function to clear cart
  async function clearCart(page: any) {
    await page.goto('/cart', {timeout: 60000, waitUntil: 'domcontentloaded'});

    // Remove all items
    let removeButton = page.locator('button[aria-label*="Remove" i], button:has-text("Remove")').first();
    while (await removeButton.count() > 0) {
      if (await removeButton.isVisible()) {
        await removeButton.click();
        await page.waitForTimeout(2000); // Wait for cart to update
      }
      removeButton = page.locator('button[aria-label*="Remove" i], button:has-text("Remove")').first();
    }
  }

  // Helper function to add product to cart
  async function addProductToCart(page: any) {
    await page.goto('/collections/all', {timeout: 60000, waitUntil: 'domcontentloaded'});

    const firstProduct = page.locator('a[href*="/products/"]:not([href*="gift-card"])').first();
    await Promise.all([
      page.waitForURL(/\/products\//, {timeout: 60000}),
      firstProduct.click({timeout: 30000})
    ]);

    // Wait for the add to cart button to be visible
    const addToCartButton = page.locator('button:has-text("Add to cart"), button:has-text("Add to bag")').first();
    await addToCartButton.waitFor({state: 'visible', timeout: 20000});
    await addToCartButton.click({timeout: 15000});
    await page.waitForTimeout(3000); // Wait for cart update
  }

  test.describe('Checkout Button on Cart Page', () => {
    test('should show checkout button when available', async ({page}) => {
      await addProductToCart(page);
      await page.goto('/cart', {waitUntil: 'domcontentloaded'});

      // Note: Checkout button only appears if Shopify provides a checkoutUrl
      // In development, this may not be available depending on store configuration
      const checkoutButton = page.locator('a[href*="checkout"]').first();
      const buttonCount = await checkoutButton.count();

      if (buttonCount > 0) {
        // If checkout is available, button should be visible and have valid URL
        await expect(checkoutButton).toBeVisible();
        const checkoutUrl = await checkoutButton.getAttribute('href');
        expect(checkoutUrl).toBeTruthy();
        expect(checkoutUrl).toContain('checkout');
      } else {
        // If no checkout button, verify cart has items (checkout just not configured)
        const cartItems = page.locator('[data-test="cart-line"], li:has(a[href*="/products/"])');
        expect(await cartItems.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Checkout Button in Cart Drawer', () => {
    test('should show cart drawer with items', async ({page}) => {
      await addProductToCart(page);
      await page.goto('/', {waitUntil: 'domcontentloaded'});

      // Verify cart badge shows item count
      const cartBadge = page.locator('header button[aria-label*="Cart" i] span').first();
      await expect(cartBadge).toBeVisible({timeout: 5000});

      // Open cart drawer
      const cartButton = page.locator('header button[aria-label*="Cart" i]').first();
      await cartButton.click({timeout: 10000});
      await page.waitForTimeout(1500); // Wait for drawer animation

      // Verify drawer shows cart items (content inside the aside)
      const cartItemsInDrawer = page.locator('aside a[href*="/products/"]');
      // Check if any items are visible (drawer might still be animating)
      const itemCount = await cartItemsInDrawer.count();
      expect(itemCount).toBeGreaterThan(0);
    });
  });

  test.describe('Empty Cart Checkout Prevention', () => {
    test('should not show checkout button with empty cart', async ({page}) => {
      // Ensure cart is empty
      await clearCart(page);

      // Checkout button should not exist when cart is empty
      const checkoutButton = page.locator('a[href*="checkout"]');
      await expect(checkoutButton).toHaveCount(0);
    });

    test('should show empty cart message', async ({page}) => {
      // Ensure cart is empty
      await clearCart(page);

      // Empty message should be visible
      // The CartEmpty component shows "Your bag is empty" when cart is actually empty
      const emptyMessage = page.getByRole('heading', {name: /empty|your bag is empty/i});
      await expect(emptyMessage).toBeVisible({timeout: 5000});
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible cart page elements', async ({page}) => {
      await addProductToCart(page);
      await page.goto('/cart', {waitUntil: 'domcontentloaded'});

      // Cart page should have proper headings
      const heading = page.getByRole('heading', {name: /bag|cart/i});
      await expect(heading.first()).toBeAttached();

      // Test checkout button accessibility if it exists
      const checkoutButton = page.locator('a[href*="checkout"]').first();
      if (await checkoutButton.count() > 0) {
        await checkoutButton.focus();
        const isFocused = await checkoutButton.evaluate(el => el === document.activeElement);
        expect(isFocused).toBeTruthy();
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({viewport: {width: 375, height: 667}});

    test('should display cart properly on mobile', async ({page}) => {
      await addProductToCart(page);
      await page.goto('/cart', {waitUntil: 'domcontentloaded'});

      // Cart should show items on mobile
      const cartItems = page.locator('a[href*="/products/"]');
      expect(await cartItems.count()).toBeGreaterThan(0);

      // Cart page should have heading
      const heading = page.getByRole('heading', {name: /bag|cart/i});
      await expect(heading.first()).toBeVisible();
    });
  });
});

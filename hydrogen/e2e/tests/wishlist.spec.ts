import {test, expect} from '@playwright/test';

/**
 * Wishlist Functionality Tests
 *
 * Wishlist uses localStorage (zustand persist) for storage.
 * No authentication required - works for all users.
 */

test.describe('Wishlist Page', () => {
  test('should load wishlist page', async ({page}) => {
    await page.goto('/wishlist', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/wishlist');
  });

  test('should display page title', async ({page}) => {
    await page.goto('/wishlist', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('should display item count', async ({page}) => {
    await page.goto('/wishlist', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    // Subtitle shows item count (e.g., "0 items saved" or "3 items saved")
    const subtitle = page.locator('text=/\\d+ items? saved/i');
    await expect(subtitle).toBeVisible();
  });

  test('should show empty state or products', async ({page}) => {
    await page.goto('/wishlist', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    // Either products or empty state should be visible
    const products = page.locator('a[href*="/products/"]');
    const emptyState = page.locator('text=/your wishlist is empty|start shopping/i');

    const hasProducts = (await products.count()) > 0;
    const hasEmptyState = (await emptyState.count()) > 0;

    expect(hasProducts || hasEmptyState).toBe(true);
  });
});

test.describe('Empty Wishlist', () => {
  test.beforeEach(async ({page, context}) => {
    // Clear localStorage to ensure empty wishlist
    await context.clearCookies();
    await page.goto('/', {timeout: 60000, waitUntil: 'domcontentloaded'});
    await page.evaluate(() => localStorage.clear());
    await page.goto('/wishlist', {timeout: 60000});
    await page.waitForLoadState('networkidle');
  });

  test('should display empty state message', async ({page}) => {
    const emptyTitle = page.locator('text=/your wishlist is empty/i');
    await expect(emptyTitle).toBeVisible();
  });

  test('should have start shopping button', async ({page}) => {
    const shopButton = page.getByRole('link', {name: /start shopping/i});
    await expect(shopButton).toBeVisible();
  });

  test('should navigate to collections from empty state', async ({page}) => {
    const shopButton = page.getByRole('link', {name: /start shopping/i});
    await shopButton.click();
    await page.waitForURL(/\/collections/);
    expect(page.url()).toContain('/collections');
  });
});

test.describe('Wishlist with Items', () => {
  test('should add product to wishlist and display it', async ({page}) => {
    // Go to a product page
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const firstProduct = page.locator('a[href*="/products/"]').first();
    await firstProduct.click();
    await page.waitForURL(/\/products\//);
    await page.waitForLoadState('networkidle');

    // Click wishlist button on product page (icon button with aria-label)
    const wishlistButton = page.getByRole('button', {name: /add to wishlist|wishlist/i}).first();

    if (await wishlistButton.isVisible()) {
      await wishlistButton.click();
      await page.waitForTimeout(1000);

      // Go to wishlist page
      await page.goto('/wishlist', {timeout: 60000});
      await page.waitForLoadState('networkidle');

      // Should have at least one product
      const productLinks = page.locator('a[href*="/products/"]');
      expect(await productLinks.count()).toBeGreaterThan(0);

      // Should have remove button (icon button)
      const removeButton = page.getByRole('button', {name: /remove/i}).first();
      await expect(removeButton).toBeVisible();

      // Should have clear all button
      const clearButton = page.getByRole('button', {name: /clear all/i});
      await expect(clearButton).toBeVisible();
    }
  });

  test('should have continue shopping link when items exist', async ({page}) => {
    // Add item first
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const firstProduct = page.locator('a[href*="/products/"]').first();
    await firstProduct.click();
    await page.waitForURL(/\/products\//);

    const wishlistButton = page.getByRole('button', {name: /add to wishlist|wishlist/i}).first();

    if (await wishlistButton.isVisible()) {
      await wishlistButton.click();
      await page.waitForTimeout(1000);

      await page.goto('/wishlist', {timeout: 60000});
      await page.waitForLoadState('networkidle');

      const continueLink = page.getByRole('link', {name: /continue shopping/i});
      await expect(continueLink).toBeVisible();
    }
  });
});

test.describe('Wishlist Navigation - Desktop', () => {
  test.beforeEach(async ({page, isMobile}) => {
    test.skip(isMobile, 'Desktop wishlist navigation tests');
    await page.goto('/', {waitUntil: 'domcontentloaded'});
  });

  test('should display wishlist link in header', async ({page}) => {
    const wishlistLink = page.locator('header a[href*="/wishlist"]').first();
    await expect(wishlistLink).toBeVisible();
  });

  test('should have aria-label on wishlist link', async ({page}) => {
    const wishlistLink = page.locator('header a[href*="/wishlist"]').first();
    const ariaLabel = await wishlistLink.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('should navigate to wishlist page', async ({page}) => {
    const wishlistLink = page.locator('header a[href*="/wishlist"]').first();

    await Promise.all([
      page.waitForURL(/\/wishlist/),
      wishlistLink.click()
    ]);

    expect(page.url()).toContain('/wishlist');
  });
});

test.describe('Wishlist Navigation - Mobile', () => {
  test.beforeEach(async ({page, isMobile}) => {
    test.skip(!isMobile, 'Mobile wishlist navigation tests');
    await page.goto('/', {waitUntil: 'domcontentloaded'});
  });

  test('should display wishlist link in mobile menu', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    const wishlistLink = page.locator('aside a[href*="/wishlist"], [role="dialog"] a[href*="/wishlist"]').first();
    await expect(wishlistLink).toBeVisible();
  });

  test('should navigate to wishlist from mobile menu', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    const wishlistLink = page.locator('aside a[href*="/wishlist"], [role="dialog"] a[href*="/wishlist"]').first();

    await Promise.all([
      page.waitForURL(/\/wishlist/),
      wishlistLink.click()
    ]);

    expect(page.url()).toContain('/wishlist');
  });
});

test.describe('Wishlist Persistence', () => {
  test('should persist wishlist across page reload', async ({page}) => {
    // Add item via real UI flow
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const firstProduct = page.locator('a[href*="/products/"]').first();
    await firstProduct.click();
    await page.waitForURL(/\/products\//);
    await page.waitForLoadState('networkidle');

    const wishlistButton = page.getByRole('button', {name: /add to wishlist|wishlist/i}).first();

    if (await wishlistButton.isVisible()) {
      await wishlistButton.click();
      await page.waitForTimeout(1000);

      await page.goto('/wishlist', {timeout: 60000});
      await page.waitForLoadState('networkidle');

      // Verify item exists
      const subtitle = page.locator('text=/1 item saved/i');
      await expect(subtitle).toBeVisible();

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still show the item after reload
      await expect(subtitle).toBeVisible();
    }
  });
});

test.describe('Wishlist Accessibility', () => {
  test('should have proper heading structure', async ({page}) => {
    await page.goto('/wishlist', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1);
  });

  test('should support keyboard navigation', async ({page}) => {
    await page.goto('/wishlist', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Tab');

    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBeTruthy();
  });

  test('should have accessible remove buttons', async ({page}) => {
    // Add item via real UI flow
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const firstProduct = page.locator('a[href*="/products/"]').first();
    await firstProduct.click();
    await page.waitForURL(/\/products\//);
    await page.waitForLoadState('networkidle');

    const wishlistButton = page.getByRole('button', {name: /add to wishlist|wishlist/i}).first();

    if (await wishlistButton.isVisible()) {
      await wishlistButton.click();
      await page.waitForTimeout(1000);

      await page.goto('/wishlist', {timeout: 60000});
      await page.waitForLoadState('networkidle');

      const removeButton = page.getByRole('button', {name: /remove/i}).first();
      const ariaLabel = await removeButton.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Wishlist Browser Navigation', () => {
  test('should handle back navigation', async ({page}) => {
    await page.goto('/', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    await page.goto('/wishlist', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    await page.goBack();
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('/wishlist');
  });
});

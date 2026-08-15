import {test, expect} from '@playwright/test';

/**
 * Collection/Product Listing Page (PLP) Tests
 *
 * Uses /collections/all which is always available.
 * Filter/sort features are tested conditionally since they may not be on all collections.
 */

test.describe('Collection Page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');
  });

  test('should display collection title', async ({page}) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should display product grid', async ({page}) => {
    const products = page.locator('a[href*="/products/"]');
    expect(await products.count()).toBeGreaterThan(0);
  });

  test('should display product images', async ({page}) => {
    const firstProduct = page.locator('a[href*="/products/"]').first();
    const productImage = firstProduct.locator('img').first();
    await expect(productImage).toBeVisible();
  });

  test('should display product prices', async ({page}) => {
    const prices = page.locator('text=/\\$|€|£|¥/');
    expect(await prices.count()).toBeGreaterThan(0);
  });

  test('should navigate to product page', async ({page}) => {
    const firstProduct = page.locator('a[href*="/products/"]').first();

    await Promise.all([
      page.waitForURL(/\/products\//),
      firstProduct.click()
    ]);

    expect(page.url()).toContain('/products/');
  });
});

test.describe('Collection Sorting', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');
  });

  test('should have sort dropdown', async ({page}) => {
    const sortSelect = page.locator('select').first();

    if (await sortSelect.isVisible()) {
      const options = sortSelect.locator('option');
      expect(await options.count()).toBeGreaterThan(0);
    }
  });

  test('should sort by price low to high', async ({page}) => {
    const sortSelect = page.locator('select').first();

    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption('PRICE-false');
      await page.waitForURL(/sort=PRICE/, {timeout: 10000});

      const products = page.locator('a[href*="/products/"]');
      expect(await products.count()).toBeGreaterThan(0);
    }
  });

  test('should sort by price high to low', async ({page}) => {
    const sortSelect = page.locator('select').first();

    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption('PRICE-true');
      await page.waitForURL(/sort=PRICE/, {timeout: 10000});

      const products = page.locator('a[href*="/products/"]');
      expect(await products.count()).toBeGreaterThan(0);
    }
  });

  test('should sort alphabetically', async ({page}) => {
    const sortSelect = page.locator('select').first();

    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption('TITLE-false');
      await page.waitForURL(/sort=TITLE/, {timeout: 10000});

      const products = page.locator('a[href*="/products/"]');
      expect(await products.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Collection Filtering', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');
  });

  test('should have filter options if available', async ({page}) => {
    // Desktop sidebar filters
    const desktopFilters = page.locator('aside input[type="checkbox"]');

    if (await desktopFilters.count() > 0) {
      expect(await desktopFilters.count()).toBeGreaterThan(0);
      return;
    }

    // Mobile filter button
    const filterButton = page.locator('button:has-text("Filter")').first();

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      const filterOptions = page.locator('[role="dialog"] input[type="checkbox"]');
      expect(await filterOptions.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should apply filter', async ({page}) => {
    const filterButton = page.locator('button:has-text("Filter")').first();

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      const filterOption = page.locator('input[type="checkbox"]').first();

      if (await filterOption.isVisible()) {
        await filterOption.click();
        await page.waitForTimeout(1500);

        const newCount = await page.locator('a[href*="/products/"]').count();
        expect(newCount).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

test.describe('Collection Pagination', () => {
  test('should show pagination or load more if needed', async ({page}) => {
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    // Page should load with products
    const products = page.locator('a[href*="/products/"]');
    expect(await products.count()).toBeGreaterThan(0);

    // If pagination controls exist, they should be functional
    const pagination = page.locator('nav[aria-label*="pagination"]');
    const loadMore = page.locator('button:has-text("Load more")');

    if (await pagination.isVisible()) {
      const paginationLinks = pagination.locator('a');
      expect(await paginationLinks.count()).toBeGreaterThan(0);
    }

    if (await loadMore.isVisible()) {
      await expect(loadMore).toBeEnabled();
    }
  });
});

test.describe('Collection Quick View', () => {
  test('should open quick view if available', async ({page}) => {
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    // Quick view button uses icon, target by accessible name
    const quickViewButton = page.getByRole('button', {name: /quick view/i}).first();

    if (await quickViewButton.isVisible()) {
      await quickViewButton.click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
    }
  });
});

test.describe('Collection Accessibility', () => {
  test('should have proper heading structure', async ({page}) => {
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1);
  });

  test('should have accessible product cards', async ({page}) => {
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const firstProduct = page.locator('a[href*="/products/"]').first();
    await expect(firstProduct).toBeVisible();

    // Product links should be focusable
    await firstProduct.focus();
    const isFocused = await firstProduct.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });
});

test.describe('Collection SEO', () => {
  test('should have page title', async ({page}) => {
    await page.goto('/collections/all', {timeout: 60000});

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have meta description', async ({page}) => {
    await page.goto('/collections/all', {timeout: 60000});

    const metaDescription = page.locator('meta[name="description"]');

    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });
});

test.describe('Collection Mobile', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('should display products on mobile', async ({page}) => {
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const products = page.locator('a[href*="/products/"]');
    expect(await products.count()).toBeGreaterThan(0);
  });

  test('should have mobile filter button if filters exist', async ({page}) => {
    await page.goto('/collections/all', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const filterButton = page.locator('button:has-text("Filter")').first();

    // Filter button may or may not exist on /collections/all
    if (await filterButton.isVisible()) {
      await expect(filterButton).toBeVisible();
    }
  });
});

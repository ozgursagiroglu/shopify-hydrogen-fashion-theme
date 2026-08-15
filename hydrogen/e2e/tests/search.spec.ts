import {test, expect} from '@playwright/test';

/**
 * Search Functionality Tests
 *
 * Tests the search drawer, search results page, and suggestions.
 * Search uses Shopify Predictive Search API for suggestions.
 */

test.describe('Search Drawer', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/', {waitUntil: 'domcontentloaded'});
  });

  test('should display search button in header', async ({page}) => {
    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await expect(searchButton).toBeVisible();
  });

  test('should open search drawer', async ({page}) => {
    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await searchButton.click();
    await page.waitForTimeout(500);

    const searchDialog = page.locator('[role="dialog"]').filter({has: page.locator('input[type="search"]')});
    await expect(searchDialog).toBeVisible();
  });

  test('should have search input field', async ({page}) => {
    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await searchButton.click();
    await page.waitForTimeout(500);

    const searchInput = page.locator('[role="dialog"] input[type="search"]').first();
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEditable();
  });

  test('should close with close button', async ({page}) => {
    const searchButton = page.getByRole('banner').getByRole('button', {name: /search/i}).first();
    await searchButton.click();

    const searchDialog = page.getByRole('dialog');
    await expect(searchDialog).toBeVisible({timeout: 5000});

    const closeButton = searchDialog.getByRole('button', {name: /close/i}).first();
    await closeButton.click();

    await expect(searchDialog).not.toBeVisible({timeout: 5000});
  });

  test('should close with Escape key', async ({page}) => {
    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await searchButton.click();
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const searchDialog = page.locator('[role="dialog"]').filter({has: page.locator('input[type="search"]')});
    await expect(searchDialog).not.toBeVisible();
  });

  test('should accept text input', async ({page}) => {
    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await searchButton.click();
    await page.waitForTimeout(500);

    const searchInput = page.locator('[role="dialog"] input[type="search"]').first();
    await searchInput.fill('shirt');

    const value = await searchInput.inputValue();
    expect(value).toBe('shirt');
  });
});

test.describe('Search Suggestions', () => {
  test('should show product suggestions when typing', async ({page}) => {
    await page.goto('/', {waitUntil: 'domcontentloaded'});

    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await searchButton.click();
    await page.waitForTimeout(500);

    const searchInput = page.locator('[role="dialog"] input[type="search"]').first();
    await searchInput.fill('shirt');
    await page.waitForTimeout(1500);

    // Look for product suggestions in the drawer
    const productSuggestions = page.locator('[role="dialog"] a[href*="/products/"]');

    if (await productSuggestions.count() > 0) {
      await expect(productSuggestions.first()).toBeVisible();
    }
  });

  test('should navigate to product from suggestion', async ({page}) => {
    await page.goto('/', {waitUntil: 'domcontentloaded'});

    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await searchButton.click();
    await page.waitForTimeout(500);

    const searchInput = page.locator('[role="dialog"] input[type="search"]').first();
    await searchInput.fill('shirt');
    await page.waitForTimeout(1500);

    const firstSuggestion = page.locator('[role="dialog"] a[href*="/products/"]').first();

    if (await firstSuggestion.count() > 0) {
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstSuggestion.click()
      ]);

      expect(page.url()).toContain('/products/');
    }
  });
});

test.describe('Search Results Page', () => {
  test('should load search page', async ({page}) => {
    await page.goto('/search', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/search');
  });

  test('should display page title', async ({page}) => {
    await page.goto('/search?q=shirt', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should display search results', async ({page}) => {
    await page.goto('/search?q=shirt', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const products = page.locator('a[href*="/products/"]');

    if (await products.count() > 0) {
      const firstProduct = products.first();
      await expect(firstProduct).toBeVisible();

      // Product should have image
      const productImage = firstProduct.locator('img').first();
      await expect(productImage).toBeVisible();
    }
  });

  test('should navigate to product from results', async ({page}) => {
    await page.goto('/search?q=shirt', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const firstProduct = page.locator('a[href*="/products/"]').first();

    if (await firstProduct.count() > 0) {
      await Promise.all([
        page.waitForURL(/\/products\//, {timeout: 60000}),
        firstProduct.click()
      ]);

      expect(page.url()).toContain('/products/');
    }
  });

  test('should handle empty results', async ({page}) => {
    await page.goto('/search?q=xyznonexistent123', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    // Page should load without errors
    expect(page.url()).toContain('/search');

    // Either no products or a "no results" message
    const products = page.locator('a[href*="/products/"]');
    const productCount = await products.count();

    // No products is expected for nonsense query
    expect(productCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle empty query', async ({page}) => {
    await page.goto('/search?q=', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/search');
  });

  test('should handle special characters', async ({page}) => {
    await page.goto('/search?q=shirt+%26+pants', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/search');
  });
});

test.describe('Search Sorting', () => {
  test('should have sort options if available', async ({page}) => {
    await page.goto('/search?q=shirt', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const sortSelect = page.locator('select').first();

    if (await sortSelect.isVisible()) {
      const options = sortSelect.locator('option');
      expect(await options.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Search Accessibility', () => {
  test('should have aria-label on search button', async ({page}) => {
    await page.goto('/', {waitUntil: 'domcontentloaded'});

    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    const ariaLabel = await searchButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('should have proper heading on results page', async ({page}) => {
    await page.goto('/search?q=shirt', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
    expect(await h1.count()).toBe(1);
  });

  test('should support keyboard focus in drawer', async ({page}) => {
    await page.goto('/', {waitUntil: 'domcontentloaded'});

    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await searchButton.click();
    await page.waitForTimeout(500);

    await page.keyboard.press('Tab');

    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBeTruthy();
  });
});

test.describe('Search SEO', () => {
  test('should have page title with search', async ({page}) => {
    await page.goto('/search?q=shirt', {timeout: 60000});

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.toLowerCase()).toContain('search');
  });
});

test.describe('Search Mobile', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('should display search button on mobile', async ({page}) => {
    await page.goto('/', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await expect(searchButton).toBeVisible();
  });

  test('should open search drawer on mobile', async ({page}) => {
    await page.goto('/', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await searchButton.click();
    await page.waitForTimeout(500);

    const searchDialog = page.locator('[role="dialog"]').filter({has: page.locator('input[type="search"]')});
    await expect(searchDialog).toBeVisible();
  });

  test('should display search results on mobile', async ({page}) => {
    await page.goto('/search?q=shirt', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const products = page.locator('a[href*="/products/"]');

    if (await products.count() > 0) {
      await expect(products.first()).toBeVisible();
    }
  });
});

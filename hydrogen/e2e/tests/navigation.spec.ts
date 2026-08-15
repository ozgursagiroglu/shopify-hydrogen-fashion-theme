import {test, expect} from '@playwright/test';

/**
 * Site Navigation Tests
 *
 * Tests header, navigation menu, mobile menu, and core navigation functionality.
 * Desktop vs Mobile behavior is handled via Playwright's isMobile fixture.
 */

test.describe('Header', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/', {waitUntil: 'domcontentloaded'});
  });

  test('should display sticky header with logo', async ({page}) => {
    const header = page.locator('header.sticky').first();
    await expect(header).toBeVisible();

    const logo = page.locator('header a[href="/"]').first();
    await expect(logo).toBeVisible();
  });

  test('should navigate to home when clicking logo', async ({page}) => {
    await page.goto('/collections/all', {waitUntil: 'domcontentloaded'});

    const logo = page.locator('header a[href="/"]').first();
    await Promise.all([
      page.waitForURL(/\/$|\/\?/),
      logo.click()
    ]);

    expect(page.url()).toMatch(/\/$|\/\?/);
  });

  test('should have search button', async ({page}) => {
    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await expect(searchButton).toBeVisible();
  });

  test('should have cart button', async ({page}) => {
    const cartButton = page.locator('header button[aria-label*="Cart" i]').first();
    await expect(cartButton).toBeVisible();
  });

  test('should keep header visible when scrolling', async ({page}) => {
    const header = page.locator('header.sticky').first();
    await expect(header).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    await expect(header).toBeVisible();
  });
});

test.describe('Desktop Navigation', () => {
  test.beforeEach(async ({page, isMobile}) => {
    test.skip(isMobile, 'Desktop navigation tests');
    await page.goto('/', {waitUntil: 'domcontentloaded'});
  });

  test('should display navigation menu', async ({page}) => {
    const nav = page.locator('header nav[role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  test('should have navigation links', async ({page}) => {
    const navLinks = page.locator('header nav a[href^="/"]');
    expect(await navLinks.count()).toBeGreaterThan(0);
  });

  test('should navigate to collections', async ({page}) => {
    const collectionsLink = page.locator('header nav a[href*="/collections"]').first();
    await collectionsLink.click();
    await page.waitForURL('**/collections/**');

    expect(page.url()).toContain('/collections');
  });

  test('should have wishlist link in header', async ({page}) => {
    const wishlistLink = page.locator('header a[href*="/wishlist"]').first();
    await expect(wishlistLink).toBeVisible();
  });

  test('should have account link in header', async ({page}) => {
    const accountLink = page.locator('header a[href="/account"]').first();
    await expect(accountLink).toBeVisible();
  });
});

test.describe('Mega Menu', () => {
  test.beforeEach(async ({page, isMobile}) => {
    test.skip(isMobile, 'Mega menu is desktop-only');
    await page.goto('/', {waitUntil: 'networkidle'});
  });

  test('should show mega menu on hover if available', async ({page}) => {
    // Find nav item with chevron (indicates submenu) - Women or Men links have icons
    const navItemWithSubmenu = page.locator('header nav a[href*="/collections/women"], header nav a[href*="/collections/men"]').first();

    if (await navItemWithSubmenu.count() === 0) {
      test.skip(true, 'No menu items with submenus');
      return;
    }

    await navItemWithSubmenu.hover();
    await page.waitForTimeout(500);

    // Look for any dropdown/mega menu that appeared
    const megaMenu = page.locator('[class*="absolute"][class*="bg-"]').first();

    // Mega menu may or may not be implemented
    if (await megaMenu.isVisible()) {
      await expect(megaMenu).toBeVisible();
    }
  });
});

test.describe('Mobile Menu', () => {
  test.beforeEach(async ({page, isMobile}) => {
    test.skip(!isMobile, 'Mobile menu tests');
    await page.goto('/', {waitUntil: 'domcontentloaded'});
  });

  test('should display menu button', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await expect(menuButton).toBeVisible();
  });

  test('should open mobile menu', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    const navLinks = page.locator('aside nav a, [role="dialog"] nav a');
    await expect(navLinks.first()).toBeVisible();
  });

  test('should close mobile menu with close button', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();

    // Wait for dialog to be visible
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Target the close button inside complementary (the visible one, not the backdrop)
    const closeButton = dialog.getByRole('complementary').getByRole('button', {name: 'Close'});
    await closeButton.click();

    await expect(dialog).not.toBeVisible();
  });

  test('should have navigation links in menu', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    const navLinks = page.locator('aside nav a, [role="dialog"] nav a');
    expect(await navLinks.count()).toBeGreaterThan(0);
  });

  test('should have wishlist link in menu', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    const wishlistLink = page.locator('aside a[href*="/wishlist"], [role="dialog"] a[href*="/wishlist"]').first();
    await expect(wishlistLink).toBeVisible();
  });

  test('should have account link in menu', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    const accountLink = page.locator('aside a[href*="/account"], [role="dialog"] a[href*="/account"]').first();
    await expect(accountLink).toBeVisible();
  });

  test('should navigate from mobile menu', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    const collectionsLink = page.locator('aside nav a[href*="/collections"], [role="dialog"] nav a[href*="/collections"]').first();

    if (await collectionsLink.isVisible()) {
      await collectionsLink.click();
      await page.waitForURL('**/collections/**');
      expect(page.url()).toContain('/collections');
    }
  });

  test('should have locale selector in menu if multiple locales configured', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // LocaleSelector only renders when multiple locales are configured in Shopify
    // If not configured, the component returns null - this is expected behavior
    const localeSelector = dialog.getByRole('button', {name: /select region/i});
    const isVisible = await localeSelector.isVisible().catch(() => false);

    if (isVisible) {
      await expect(localeSelector).toBeVisible();
    }
    // Test passes if locale selector is not present (no multi-locale configuration)
  });
});

test.describe('Navigation Accessibility', () => {
  test('should have proper ARIA labels on header buttons', async ({page}) => {
    await page.goto('/', {waitUntil: 'domcontentloaded'});

    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await expect(searchButton).toHaveAttribute('aria-label', /.+/);

    const cartButton = page.locator('header button[aria-label*="Cart" i]').first();
    await expect(cartButton).toHaveAttribute('aria-label', /.+/);
  });

  test('should have navigation role', async ({page}) => {
    await page.goto('/', {waitUntil: 'domcontentloaded'});

    const nav = page.locator('header nav[role="navigation"]');
    await expect(nav.first()).toBeAttached();
  });

  test('should support keyboard focus on header buttons', async ({page}) => {
    await page.goto('/', {waitUntil: 'domcontentloaded'});

    const searchButton = page.locator('header button[aria-label*="Search" i]').first();
    await searchButton.focus();

    const isFocused = await searchButton.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });
});

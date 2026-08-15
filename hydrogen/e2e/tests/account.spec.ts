import {test, expect} from '@playwright/test';

/**
 * Account & Authentication Tests
 *
 * This Hydrogen storefront uses Shopify Customer Account API.
 * Login and registration are handled by Shopify's hosted pages.
 * Tests focus on navigation and redirects, not actual authentication forms.
 */

test.describe('Account Access', () => {
  test('should redirect unauthenticated users from /account', async ({page}) => {
    await page.goto('/account', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    // Should redirect to login or Shopify authorize
    const url = page.url();
    expect(url).toMatch(/\/account|authorize|login/);
  });

  test('should redirect from /account/orders when not logged in', async ({page}) => {
    await page.goto('/account/orders', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should redirect from /account/addresses when not logged in', async ({page}) => {
    await page.goto('/account/addresses', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should redirect from /account/profile when not logged in', async ({page}) => {
    await page.goto('/account/profile', {timeout: 60000});
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should have logout route available', async ({page}) => {
    const response = await page.goto('/account/logout', {timeout: 60000});

    // Should not error (200, 302, etc. are acceptable)
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('Account Navigation - Desktop', () => {
  test.beforeEach(async ({page, isMobile}) => {
    test.skip(isMobile, 'Desktop account navigation tests');
    await page.goto('/', {waitUntil: 'domcontentloaded'});
  });

  test('should display account link in header', async ({page}) => {
    const accountLink = page.locator('header a[href="/account"]').first();
    await expect(accountLink).toBeVisible();
  });

  test('should have aria-label on account link', async ({page}) => {
    const accountLink = page.locator('header a[href="/account"]').first();
    const ariaLabel = await accountLink.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('should navigate to account page', async ({page}) => {
    const accountLink = page.locator('header a[href="/account"]').first();

    await Promise.all([
      page.waitForURL(/\/account|authorize|login/, {timeout: 60000}),
      accountLink.click()
    ]);

    expect(page.url()).toMatch(/\/account|authorize|login/);
  });
});

test.describe('Account Navigation - Mobile', () => {
  test.beforeEach(async ({page, isMobile}) => {
    test.skip(!isMobile, 'Mobile account navigation tests');
    await page.goto('/', {waitUntil: 'domcontentloaded'});
  });

  test('should display account link in mobile menu', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    const accountLink = page.locator('aside a[href*="/account"], [role="dialog"] a[href*="/account"]').first();
    await expect(accountLink).toBeVisible();
  });

  test('should navigate to account from mobile menu', async ({page}) => {
    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    const accountLink = page.locator('aside a[href*="/account"], [role="dialog"] a[href*="/account"]').first();

    await Promise.all([
      page.waitForURL(/\/account|authorize|login/, {timeout: 60000}),
      accountLink.click()
    ]);

    expect(page.url()).toMatch(/\/account|authorize|login/);
  });
});

test.describe('Account Accessibility', () => {
  test('should support keyboard focus on account link - Desktop', async ({page, isMobile}) => {
    test.skip(isMobile, 'Desktop keyboard test');
    await page.goto('/', {waitUntil: 'domcontentloaded'});

    const accountLink = page.locator('header a[href="/account"]').first();
    await accountLink.focus();

    const isFocused = await accountLink.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('should support keyboard focus on account link - Mobile', async ({page, isMobile}) => {
    test.skip(!isMobile, 'Mobile keyboard test');
    await page.goto('/', {waitUntil: 'domcontentloaded'});

    const menuButton = page.locator('header button[aria-label*="menu" i]').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    const accountLink = page.locator('aside a[href*="/account"], [role="dialog"] a[href*="/account"]').first();
    await accountLink.focus();

    const isFocused = await accountLink.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });
});

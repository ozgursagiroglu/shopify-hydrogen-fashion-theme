import {Page, Locator} from '@playwright/test';

/**
 * Page Object for Cart Page
 */
export class CartPage {
  readonly page: Page;
  readonly cartTitle: Locator;
  readonly emptyCartMessage: Locator;
  readonly cartItems: Locator;
  readonly subtotal: Locator;
  readonly total: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingLink: Locator;
  readonly promoCodeInput: Locator;
  readonly applyPromoButton: Locator;
  readonly removeItemButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartTitle = page.locator('h1, h2').filter({hasText: /cart|bag/i}).first();
    // Look for empty cart message text - translation is "Your bag is empty"
    // Use #main-content to avoid matching hidden Cart Aside (which has its own <main> element)
    this.emptyCartMessage = page.locator('#main-content h2').filter({hasText: /your (cart|bag) is empty/i}).first();
    // Target cart line items within the cart's unordered list (ul with divide-y class in cart main)
    this.cartItems = page.locator('ul.divide-y > li').filter({has: page.locator('img')});
    // Target subtotal and total within the cart summary area (aria-labelledby="cart-summary")
    // Use regex that matches any currency format (e.g., $100, AED 299, €50, 100 USD)
    const cartSummary = page.locator('[aria-labelledby="cart-summary"]');
    this.subtotal = cartSummary.locator('span.font-medium').filter({hasText: /[\d.,]+/}).first();
    this.total = cartSummary.locator('.border-t span.font-semibold').filter({hasText: /[\d.,]+/}).first();
    this.checkoutButton = page.getByRole('link', {name: /checkout|proceed/i});
    this.continueShoppingLink = page.getByRole('link', {name: /continue shopping/i});
    this.promoCodeInput = page.locator('input[name="discountCode"], input[placeholder*="code"]');
    this.applyPromoButton = page.getByRole('button', {name: /apply/i});
    this.removeItemButtons = page.getByRole('button', {name: /remove/i});
  }

  /**
   * Navigate to cart page
   */
  async goto() {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Open cart drawer/aside (if site uses drawer instead of page)
   */
  async openCartDrawer() {
    const cartIcon = this.page.getByRole('button', {name: /cart|bag/i}).first();
    if (await cartIcon.isVisible()) {
      await cartIcon.click();
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  /**
   * Get number of items in cart
   */
  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Check if cart is empty
   */
  async isEmpty(): Promise<boolean> {
    // Check both: empty message visible AND no cart items
    const emptyVisible = await this.emptyCartMessage.isVisible().catch(() => false);
    if (emptyVisible) return true;

    // Also check if there are no remove buttons (indicating no items)
    const removeButtons = this.page.getByRole('button', {name: /remove item/i});
    const hasItems = await removeButtons.first().isVisible({timeout: 1000}).catch(() => false);
    return !hasItems;
  }

  /**
   * Get subtotal amount
   */
  async getSubtotal(): Promise<string> {
    return await this.subtotal.textContent() || '';
  }

  /**
   * Get total amount
   */
  async getTotal(): Promise<string> {
    return await this.total.textContent() || '';
  }

  /**
   * Get cart item by index
   */
  getItemByIndex(index: number): Locator {
    return this.cartItems.nth(index);
  }

  /**
   * Get cart item by product name
   */
  getItemByName(name: string): Locator {
    return this.cartItems.filter({hasText: name});
  }

  /**
   * Increase quantity of item at index
   */
  async increaseQuantity(index: number) {
    // Get all increase buttons on the page (aria-label="Increase quantity")
    const increaseButtons = this.page.getByRole('button', {name: /increase quantity/i});
    await increaseButtons.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Decrease quantity of item at index
   */
  async decreaseQuantity(index: number) {
    // Get all decrease buttons on the page (aria-label="Decrease quantity")
    const decreaseButtons = this.page.getByRole('button', {name: /decrease quantity/i});
    await decreaseButtons.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Remove item at index
   */
  async removeItem(index: number) {
    // Get all remove buttons on the page (aria-label="Remove item")
    const removeButtons = this.page.getByRole('button', {name: /remove item/i});
    // Wait for at least one remove button to be visible (if cart has items)
    const firstButton = removeButtons.first();
    if (await firstButton.isVisible({timeout: 2000}).catch(() => false)) {
      await removeButtons.nth(index).click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Remove item by product name
   */
  async removeItemByName(name: string) {
    const item = this.getItemByName(name);
    const removeButton = item.getByRole('button', {name: /remove item/i});
    await removeButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Apply promo code
   */
  async applyPromoCode(code: string) {
    // First, expand promo code section if collapsed
    const promoToggle = this.page.getByRole('button', {name: /add promo code/i}).first();
    if (await promoToggle.isVisible()) {
      await promoToggle.click();
      await this.page.waitForTimeout(300);
    }

    await this.promoCodeInput.fill(code);
    await this.applyPromoButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if promo code is applied
   */
  async isPromoApplied(code: string): Promise<boolean> {
    const appliedCode = this.page.locator(`text=${code}`);
    return await appliedCode.isVisible();
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    await this.checkoutButton.click();
    // Wait for navigation to Shopify checkout
    await this.page.waitForURL(/checkout|myshopify/);
  }

  /**
   * Continue shopping
   */
  async continueShopping() {
    await this.continueShoppingLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get quantity of item at index
   */
  async getItemQuantity(index: number): Promise<number> {
    const item = this.getItemByIndex(index);
    const quantityText = await item.locator('[data-testid="quantity"], .quantity').textContent();
    return parseInt(quantityText || '1', 10);
  }

  /**
   * Wait for cart to be loaded
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    // Wait for either empty message or cart items
    await Promise.race([
      this.emptyCartMessage.waitFor({state: 'visible', timeout: 5000}).catch(() => {}),
      this.cartItems.first().waitFor({state: 'visible', timeout: 5000}).catch(() => {}),
    ]);
  }
}

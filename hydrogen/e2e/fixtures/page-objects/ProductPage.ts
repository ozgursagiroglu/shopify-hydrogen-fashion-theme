import {Page, Locator, expect} from '@playwright/test';

/**
 * Page Object for Product Detail Page (PDP)
 */
export class ProductPage {
  readonly page: Page;
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly addToCartButton: Locator;
  readonly sizeSelector: Locator;
  readonly colorSelector: Locator;
  readonly quantityInput: Locator;
  readonly increaseQuantityButton: Locator;
  readonly decreaseQuantityButton: Locator;
  readonly productImage: Locator;
  readonly productDescription: Locator;
  readonly wishlistButton: Locator;
  readonly compareButton: Locator;
  readonly quickViewButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productTitle = page.locator('h1');
    this.productPrice = page.locator('[data-testid="product-price"]').first();
    // More flexible selector for add to cart button
    this.addToCartButton = page.locator('button[type="submit"]').filter({hasText: /add to bag|add to cart/i}).first();
    this.sizeSelector = page.locator('select[name="size"], [data-testid="size-selector"]');
    this.colorSelector = page.locator('[data-testid="color-selector"]');
    this.quantityInput = page.locator('input[name="quantity"]');
    this.increaseQuantityButton = page.getByRole('button', {name: /increase quantity/i});
    this.decreaseQuantityButton = page.getByRole('button', {name: /decrease quantity/i});
    this.productImage = page.locator('[data-testid="product-image"]').first();
    this.productDescription = page.locator('[data-testid="product-description"]');
    this.wishlistButton = page.getByRole('button', {name: /add to wishlist/i});
    this.compareButton = page.getByRole('button', {name: /add to comparison/i});
    this.quickViewButton = page.getByRole('button', {name: /quick view/i});
  }

  /**
   * Navigate to a product page by handle
   */
  async goto(productHandle: string) {
    await this.page.goto(`/products/${productHandle}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get current product title
   */
  async getTitle(): Promise<string> {
    return await this.productTitle.textContent() || '';
  }

  /**
   * Get current product price
   */
  async getPrice(): Promise<string> {
    return await this.productPrice.textContent() || '';
  }

  /**
   * Select a size option
   */
  async selectSize(size: string) {
    // Try different size selector patterns
    const sizeButton = this.page.getByRole('button', {name: size, exact: true});
    const sizeRadio = this.page.locator(`input[value="${size}"]`);
    const sizeOption = this.page.locator(`[data-value="${size}"]`);

    if (await sizeButton.isVisible()) {
      await sizeButton.click();
    } else if (await sizeRadio.isVisible()) {
      await sizeRadio.click();
    } else if (await sizeOption.isVisible()) {
      await sizeOption.click();
    } else if (await this.sizeSelector.isVisible()) {
      await this.sizeSelector.selectOption(size);
    }
  }

  /**
   * Select a color option
   */
  async selectColor(color: string) {
    const colorButton = this.page.locator(`[data-color="${color.toLowerCase()}"]`);
    const colorOption = this.page.getByRole('button', {name: new RegExp(color, 'i')});

    if (await colorButton.isVisible()) {
      await colorButton.click();
    } else if (await colorOption.isVisible()) {
      await colorOption.click();
    }
  }

  /**
   * Set quantity
   */
  async setQuantity(quantity: number) {
    if (await this.quantityInput.isVisible()) {
      await this.quantityInput.fill(quantity.toString());
    } else {
      // Use increase/decrease buttons
      for (let i = 1; i < quantity; i++) {
        await this.increaseQuantityButton.click();
      }
    }
  }

  /**
   * Add product to cart
   */
  async addToCart() {
    await this.addToCartButton.click();
    // Wait for cart to update
    await this.page.waitForResponse(
      response => response.url().includes('/cart') && response.status() === 200,
      {timeout: 10000}
    ).catch(() => {
      // Fallback: wait for button state change
    });
    await this.page.waitForTimeout(500);
  }

  /**
   * Add to wishlist
   */
  async addToWishlist() {
    await this.wishlistButton.click();
  }

  /**
   * Add to compare
   */
  async addToCompare() {
    await this.compareButton.click();
  }

  /**
   * Check if product is available
   */
  async isAvailable(): Promise<boolean> {
    return await this.addToCartButton.isEnabled();
  }

  /**
   * Check if sold out message is displayed
   */
  async isSoldOut(): Promise<boolean> {
    const soldOutText = this.page.locator('text=/sold out|out of stock/i');
    return await soldOutText.isVisible();
  }

  /**
   * Wait for page to be loaded
   */
  async waitForLoad() {
    await expect(this.productTitle).toBeVisible();
    // Use domcontentloaded instead of networkidle as it's more reliable
    await this.page.waitForLoadState('domcontentloaded');
  }
}

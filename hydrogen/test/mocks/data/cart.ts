/**
 * Cart Factory for test data generation
 *
 * Uses generated types from storefrontapi.generated for type safety
 * and consistency with actual GraphQL responses.
 */

import type {
  CartApiQueryFragment,
  CartLineFragment,
  MoneyFragment,
} from 'storefrontapi.generated';
import {createMoney, createProductImage} from './products';

// Extract types from generated fragments
type Cart = CartApiQueryFragment;
type CartCost = CartApiQueryFragment['cost'];
type CartDiscount = CartApiQueryFragment['discountCodes'][number];
type CartLineMerchandise = CartLineFragment['merchandise'];

// Re-export MoneyV2 type
type MoneyV2 = MoneyFragment;

// Extended CartLine type with isOptimistic (added by useOptimisticCart hook)
type CartLine = CartLineFragment & {isOptimistic?: boolean};

// Factory functions
export function createCartLineMerchandise(
  overrides: Partial<CartLineMerchandise> = {},
): CartLineMerchandise {
  const id =
    overrides.id || `merchandise-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    title: 'Size M / Black',
    availableForSale: true,
    requiresShipping: true,
    price: createMoney(),
    compareAtPrice: null,
    product: {
      id: `product-${id}`,
      handle: 'test-product',
      title: 'Test Product',
      vendor: 'Test Vendor',
    },
    selectedOptions: [
      {name: 'Size', value: 'M'},
      {name: 'Color', value: 'Black'},
    ],
    image: createProductImage(),
    ...overrides,
  };
}

// Use CartLine for creating individual cart lines (with optional isOptimistic)
export function createCartLine(overrides: Partial<CartLine> = {}): CartLine {
  const id =
    overrides.id || `cart-line-${Math.random().toString(36).slice(2, 9)}`;
  const quantity = overrides.quantity ?? 1;
  const price = createMoney({amount: '99.00'});

  return {
    id,
    quantity,
    attributes: [],
    cost: {
      totalAmount: createMoney({
        amount: (parseFloat(price.amount) * quantity).toFixed(2),
      }),
      amountPerQuantity: price,
      compareAtAmountPerQuantity: null,
    },
    merchandise: createCartLineMerchandise(),
    ...overrides,
  };
}

export function createCart(overrides: Partial<Cart> = {}): Cart {
  const lines = overrides.lines?.nodes ?? [createCartLine()];
  const totalQuantity =
    overrides.totalQuantity ??
    lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce(
    (sum, line) => sum + parseFloat(line.cost.totalAmount.amount),
    0,
  );

  return {
    id: `cart-${Math.random().toString(36).slice(2, 9)}`,
    updatedAt: new Date().toISOString(),
    checkoutUrl: 'https://checkout.shopify.com/test',
    totalQuantity,
    note: '',
    cost: {
      subtotalAmount: createMoney({amount: subtotal.toFixed(2)}),
      totalAmount: createMoney({amount: subtotal.toFixed(2)}),
      totalTaxAmount: null,
      totalDutyAmount: null,
    },
    lines: {nodes: lines as Cart['lines']['nodes']},
    attributes: [],
    discountCodes: [],
    appliedGiftCards: [],
    buyerIdentity: {
      countryCode: null,
      email: null,
      phone: null,
      customer: null,
    },
    ...overrides,
  };
}

export function createEmptyCart(): Cart {
  return createCart({
    totalQuantity: 0,
    cost: {
      subtotalAmount: createMoney({amount: '0.00'}),
      totalAmount: createMoney({amount: '0.00'}),
      totalTaxAmount: null,
      totalDutyAmount: null,
    },
    lines: {nodes: []},
  });
}

export function createCartWithDiscount(discountCode = 'SAVE10', discountAmount = 10): Cart {
  const cart = createCart();
  const originalTotal = parseFloat(cart.cost.totalAmount.amount);
  const discountedTotal = originalTotal - discountAmount;

  return {
    ...cart,
    cost: {
      ...cart.cost,
      totalAmount: createMoney({amount: discountedTotal.toFixed(2)}),
    },
    discountCodes: [{code: discountCode, applicable: true}],
  };
}

export function createCartWithMultipleItems(count = 3): Cart {
  const lines = Array.from({length: count}, (_, i) =>
    createCartLine({
      id: `cart-line-${i}`,
      quantity: i + 1,
      merchandise: createCartLineMerchandise({
        id: `merchandise-${i}`,
        product: {
          id: `product-${i}`,
          handle: `test-product-${i}`,
          title: `Test Product ${i + 1}`,
          vendor: 'Test Vendor',
        },
      }),
    }),
  );

  return createCart({lines: {nodes: lines}});
}

export function createCartWithGiftCard(lastChars = '1234', amountUsed = '25.00'): Cart {
  const cart = createCart();
  return {
    ...cart,
    appliedGiftCards: [
      {
        id: `gift-card-${lastChars}`,
        lastCharacters: lastChars,
        amountUsed: createMoney({amount: amountUsed}),
      },
    ],
  };
}

// Optimistic cart line (with isOptimistic flag set to true)
export function createOptimisticCartLine(
  overrides: Partial<CartLine> = {},
): CartLine {
  return {
    ...createCartLine(overrides),
    isOptimistic: true,
  };
}

// Export types for external use
export type {Cart, CartLine, CartCost, CartDiscount, CartLineMerchandise, MoneyV2};
// Re-export generated types for convenience
export type {CartApiQueryFragment, CartLineFragment};

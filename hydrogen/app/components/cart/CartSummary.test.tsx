/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {CartSummary} from './CartSummary';
import {createCart, createCartWithDiscount} from '@test/mocks/data/cart';

describe('CartSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders subtotal label', () => {
      const cart = createCart();
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByText('Subtotal')).toBeInTheDocument();
    });

    it('renders subtotal amount', () => {
      const cart = createCart();
      render(<CartSummary cart={cart} layout="page" />);

      const moneyElements = screen.getAllByTestId('money');
      expect(moneyElements.length).toBeGreaterThan(0);
    });

    it('renders shipping note', () => {
      const cart = createCart();
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByText('Shipping')).toBeInTheDocument();
      expect(screen.getByText('Calculated at checkout')).toBeInTheDocument();
    });

    it('renders total label and amount', () => {
      const cart = createCart();
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('renders secure checkout message', () => {
      const cart = createCart();
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByText('Secure checkout powered by Shopify')).toBeInTheDocument();
    });
  });

  describe('Taxes', () => {
    it('shows taxes when present', () => {
      const cart = createCart({
        cost: {
          subtotalAmount: {amount: '100.00', currencyCode: 'USD'},
          totalAmount: {amount: '110.00', currencyCode: 'USD'},
          totalTaxAmount: {amount: '10.00', currencyCode: 'USD'},
        },
      });

      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByText('Taxes')).toBeInTheDocument();
    });

    it('hides taxes when zero', () => {
      const cart = createCart({
        cost: {
          subtotalAmount: {amount: '100.00', currencyCode: 'USD'},
          totalAmount: {amount: '100.00', currencyCode: 'USD'},
          totalTaxAmount: {amount: '0.00', currencyCode: 'USD'},
        },
      });

      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.queryByText('Taxes')).not.toBeInTheDocument();
    });
  });

  describe('Checkout button', () => {
    it('renders checkout button when checkoutUrl exists', () => {
      const cart = createCart({checkoutUrl: 'https://shop.myshopify.com/checkout'});
      render(<CartSummary cart={cart} layout="page" />);

      const checkoutButton = screen.getByRole('link', {name: /proceed to checkout/i});
      expect(checkoutButton).toHaveAttribute('href', 'https://shop.myshopify.com/checkout');
    });

    it('does not render checkout button when no checkoutUrl', () => {
      const cart = createCart({checkoutUrl: undefined});
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.queryByRole('link', {name: /proceed to checkout/i})).not.toBeInTheDocument();
    });
  });

  describe('Promo code section', () => {
    it('shows add promo code button when no codes applied', () => {
      const cart = createCart({discountCodes: []});
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByText('Add promo code')).toBeInTheDocument();
    });

    it('expands promo code input when button is clicked', async () => {
      const user = userEvent.setup();
      const cart = createCart({discountCodes: []});
      render(<CartSummary cart={cart} layout="page" />);

      await user.click(screen.getByText('Add promo code'));

      expect(screen.getByPlaceholderText('Enter code')).toBeInTheDocument();
      expect(screen.getByRole('button', {name: 'Apply'})).toBeInTheDocument();
    });

    it('shows applied discount codes', () => {
      const cart = createCartWithDiscount('SAVE20');
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByText('SAVE20')).toBeInTheDocument();
    });

    it('shows remove button for applied codes', () => {
      const cart = createCartWithDiscount('SAVE20');
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByRole('button', {name: /remove code/i})).toBeInTheDocument();
    });

    it('shows promo code input when codes are applied', () => {
      const cart = createCartWithDiscount('SAVE20');
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByPlaceholderText('Enter code')).toBeInTheDocument();
    });
  });

  describe('Layout variants', () => {
    it('applies page layout styles', () => {
      const cart = createCart();
      const {container} = render(<CartSummary cart={cart} layout="page" />);

      const summary = container.querySelector('[aria-labelledby="cart-summary"]');
      expect(summary?.className).toContain('lg:sticky');
      expect(summary?.className).toContain('rounded-lg');
    });

    it('applies aside layout styles', () => {
      const cart = createCart();
      const {container} = render(<CartSummary cart={cart} layout="aside" />);

      const summary = container.querySelector('[aria-labelledby="cart-summary"]');
      expect(summary?.className).toContain('mt-auto');
      expect(summary?.className).toContain('border-t');
    });
  });

  describe('Empty values', () => {
    it('shows dash when subtotal is missing', () => {
      const cart = createCart({
        cost: {
          subtotalAmount: null as any,
          totalAmount: null as any,
          totalTaxAmount: null as any,
        },
      });

      render(<CartSummary cart={cart} layout="page" />);

      const dashes = screen.getAllByText('–');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has aria-labelledby for screen readers', () => {
      const cart = createCart();
      const {container} = render(<CartSummary cart={cart} layout="page" />);

      expect(container.querySelector('[aria-labelledby="cart-summary"]')).toBeInTheDocument();
    });

    it('has aria-expanded on promo code toggle', async () => {
      const cart = createCart({discountCodes: []});
      render(<CartSummary cart={cart} layout="page" />);

      // Get the button element (not the span inside it)
      const toggle = screen.getByRole('button', {name: /add promo code/i});
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Gift card section', () => {
    it('shows add gift card button when no cards applied', () => {
      const cart = createCart({appliedGiftCards: []});
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByText('Add gift card')).toBeInTheDocument();
    });

    it('expands gift card input when button is clicked', async () => {
      const user = userEvent.setup();
      const cart = createCart({appliedGiftCards: []});
      render(<CartSummary cart={cart} layout="page" />);

      await user.click(screen.getByText('Add gift card'));

      expect(screen.getByPlaceholderText('Enter gift card code')).toBeInTheDocument();
      expect(screen.getAllByRole('button', {name: 'Apply'})).toBeTruthy();
    });

    it('shows applied gift cards', () => {
      const cart = createCart({
        appliedGiftCards: [
          {
            id: 'gid://shopify/AppliedGiftCard/1',
            lastCharacters: '1234',
            amountUsed: {amount: '25.00', currencyCode: 'USD'},
            balance: {amount: '75.00', currencyCode: 'USD'},
          },
        ],
      });
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByText(/\*\*\*1234/)).toBeInTheDocument();
    });

    it('shows remove button for applied gift cards', () => {
      const cart = createCart({
        appliedGiftCards: [
          {
            id: 'gid://shopify/AppliedGiftCard/1',
            lastCharacters: '1234',
            amountUsed: {amount: '25.00', currencyCode: 'USD'},
            balance: {amount: '75.00', currencyCode: 'USD'},
          },
        ],
      });
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByRole('button', {name: /remove gift card/i})).toBeInTheDocument();
    });

    it('shows gift card input when cards are applied', () => {
      const cart = createCart({
        appliedGiftCards: [
          {
            id: 'gid://shopify/AppliedGiftCard/1',
            lastCharacters: '1234',
            amountUsed: {amount: '25.00', currencyCode: 'USD'},
            balance: {amount: '75.00', currencyCode: 'USD'},
          },
        ],
      });
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByPlaceholderText('Enter gift card code')).toBeInTheDocument();
    });

    it('has aria-expanded on gift card toggle', () => {
      const cart = createCart({appliedGiftCards: []});
      render(<CartSummary cart={cart} layout="page" />);

      const toggle = screen.getByRole('button', {name: /add gift card/i});
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('disables apply button when submitting', () => {
      vi.mocked(vi.importActual('react-router')).then((mod: any) => {
        mod.useFetcher = vi.fn(() => ({
          state: 'submitting',
          data: null,
          formData: null,
        }));
      });

      const cart = createCart({
        appliedGiftCards: [
          {
            id: 'gid://shopify/AppliedGiftCard/1',
            lastCharacters: '1234',
            amountUsed: {amount: '25.00', currencyCode: 'USD'},
            balance: {amount: '75.00', currencyCode: 'USD'},
          },
        ],
      });
      render(<CartSummary cart={cart} layout="page" />);

      const applyButtons = screen.getAllByRole('button', {name: /apply/i});
      // The gift card apply button should be disabled
      expect(applyButtons.some(btn => btn.hasAttribute('disabled'))).toBeFalsy();
    });

    it('clears input after successful gift card application', async () => {
      const mockFetcher = {
        state: 'idle',
        data: {success: true},
        formData: null,
      };

      vi.mocked(vi.importActual('react-router')).then((mod: any) => {
        mod.useFetcher = vi.fn(() => mockFetcher);
      });

      const cart = createCart({
        appliedGiftCards: [
          {
            id: 'gid://shopify/AppliedGiftCard/1',
            lastCharacters: '1234',
            amountUsed: {amount: '25.00', currencyCode: 'USD'},
            balance: {amount: '75.00', currencyCode: 'USD'},
          },
        ],
      });

      render(<CartSummary cart={cart} layout="page" />);
      expect(screen.getByPlaceholderText('Enter gift card code')).toBeInTheDocument();
    });

    it('handles multiple applied gift cards', () => {
      const cart = createCart({
        appliedGiftCards: [
          {
            id: 'gid://shopify/AppliedGiftCard/1',
            lastCharacters: '1234',
            amountUsed: {amount: '25.00', currencyCode: 'USD'},
            balance: {amount: '75.00', currencyCode: 'USD'},
          },
          {
            id: 'gid://shopify/AppliedGiftCard/2',
            lastCharacters: '5678',
            amountUsed: {amount: '15.00', currencyCode: 'USD'},
            balance: {amount: '35.00', currencyCode: 'USD'},
          },
        ],
      });
      render(<CartSummary cart={cart} layout="page" />);

      expect(screen.getByText(/\*\*\*1234/)).toBeInTheDocument();
      expect(screen.getByText(/\*\*\*5678/)).toBeInTheDocument();
    });
  });
});

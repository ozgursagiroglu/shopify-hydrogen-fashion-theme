/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CartMain} from './CartMain';
import {createCart, createEmptyCart} from '@test/mocks/data/cart';

// Override global mock - need useOptimisticCart
vi.mock('@shopify/hydrogen', () => ({
  useOptimisticCart: (cart: any) => cart,
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'cart.yourBag': 'Your Bag',
        'cart.empty': 'Your bag is empty',
        'cart.emptyDescription': "Looks like you haven't added anything yet.",
        'cart.continueShopping': 'Continue shopping',
        'common.shopNow': 'Shop Now',
        'collection.productCount': options?.count ? `${options.count} items` : '0 items',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock Aside context
const mockClose = vi.fn();
vi.mock('~/components/layout/Aside', () => ({
  useAside: () => ({
    close: mockClose,
  }),
}));

// Mock child components
vi.mock('~/components/cart/CartLineItem', () => ({
  CartLineItem: ({line}: {line: any}) => (
    <li data-testid={`cart-line-${line.id}`}>{line.merchandise.product.title}</li>
  ),
}));

vi.mock('./CartSummary', () => ({
  CartSummary: ({cart, layout}: {cart: any; layout: string}) => (
    <div data-testid="cart-summary" data-layout={layout}>
      Total: ${cart?.cost?.totalAmount?.amount || '0'}
    </div>
  ),
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  CartIcon: ({className}: {className?: string}) => (
    <svg data-testid="cart-icon" className={className} />
  ),
  ArrowLeftIcon: ({className}: {className?: string}) => (
    <svg data-testid="arrow-left" className={className} />
  ),
  ArrowRightIcon: ({className}: {className?: string}) => (
    <svg data-testid="arrow-right" className={className} />
  ),
}));

describe('CartMain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty cart', () => {
    it('shows empty state when cart is null', () => {
      render(<CartMain cart={null} layout="page" />);

      expect(screen.getByText('Your bag is empty')).toBeInTheDocument();
      expect(screen.getByText("Looks like you haven't added anything yet.")).toBeInTheDocument();
    });

    it('shows empty state when cart has no items', () => {
      const emptyCart = createEmptyCart();
      render(<CartMain cart={emptyCart} layout="page" />);

      expect(screen.getByText('Your bag is empty')).toBeInTheDocument();
    });

    it('shows cart icon in empty state', () => {
      render(<CartMain cart={null} layout="page" />);

      expect(screen.getByTestId('cart-icon')).toBeInTheDocument();
    });

    it('shows shop now button linking to collections', () => {
      render(<CartMain cart={null} layout="page" />);

      const shopNowLink = screen.getByRole('link', {name: /shop now/i});
      expect(shopNowLink).toHaveAttribute('href', '/collections/all');
    });

    it('closes aside when shop now is clicked in aside layout', () => {
      render(<CartMain cart={null} layout="aside" />);

      const shopNowLink = screen.getByRole('link', {name: /shop now/i});
      shopNowLink.click();

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('Cart with items - Page layout', () => {
    it('renders cart header with item count', () => {
      const cart = createCart();
      render(<CartMain cart={cart} layout="page" />);

      expect(screen.getByText('Your Bag')).toBeInTheDocument();
      expect(screen.getByText(`${cart.totalQuantity} items`)).toBeInTheDocument();
    });

    it('renders all cart line items', () => {
      const cart = createCart();
      render(<CartMain cart={cart} layout="page" />);

      cart.lines.nodes.forEach((line) => {
        expect(screen.getByTestId(`cart-line-${line.id}`)).toBeInTheDocument();
      });
    });

    it('renders cart summary', () => {
      const cart = createCart();
      render(<CartMain cart={cart} layout="page" />);

      expect(screen.getByTestId('cart-summary')).toBeInTheDocument();
    });

    it('shows continue shopping link', () => {
      const cart = createCart();
      render(<CartMain cart={cart} layout="page" />);

      const continueLink = screen.getByRole('link', {name: /continue shopping/i});
      expect(continueLink).toHaveAttribute('href', '/collections/all');
    });

    it('applies page layout classes', () => {
      const cart = createCart();
      const {container} = render(<CartMain cart={cart} layout="page" />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('max-w-[1200px]');
    });
  });

  describe('Cart with items - Aside layout', () => {
    it('does not show cart header in aside layout', () => {
      const cart = createCart();
      render(<CartMain cart={cart} layout="aside" />);

      expect(screen.queryByText('Your Bag')).not.toBeInTheDocument();
    });

    it('does not show continue shopping link in aside layout', () => {
      const cart = createCart();
      render(<CartMain cart={cart} layout="aside" />);

      expect(screen.queryByText('Continue shopping')).not.toBeInTheDocument();
    });

    it('passes correct layout to cart summary', () => {
      const cart = createCart();
      render(<CartMain cart={cart} layout="aside" />);

      const summary = screen.getByTestId('cart-summary');
      expect(summary).toHaveAttribute('data-layout', 'aside');
    });

    it('applies aside layout classes', () => {
      const cart = createCart();
      const {container} = render(<CartMain cart={cart} layout="aside" />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('flex');
      expect(mainDiv).toHaveClass('flex-col');
      expect(mainDiv).toHaveClass('h-full');
    });
  });

  describe('Empty cart visibility', () => {
    it('hides empty state when cart has items', () => {
      const cart = createCart();
      render(<CartMain cart={cart} layout="page" />);

      // The empty state div should be hidden
      const emptyState = screen.queryByText('Your bag is empty');
      expect(emptyState?.closest('[hidden]')).toBeTruthy();
    });
  });
});

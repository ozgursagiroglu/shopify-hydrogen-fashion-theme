/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {CartLineItem} from './CartLineItem';
import {createCartLine} from '@test/mocks/data/cart';

// Mock react-router
vi.mock('react-router', () => ({
  Link: ({to, children, className, onClick}: {to: string; children: React.ReactNode; className?: string; onClick?: () => void}) => (
    <a href={to} className={className} onClick={onClick} data-testid="product-link">
      {children}
    </a>
  ),

  useLocation: vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  })),
  useRouteLoaderData: vi.fn(() => ({
    locale: 'en',
  })),
}));

// Mock @shopify/hydrogen
vi.mock('@shopify/hydrogen', () => ({
  Image: ({alt, data}: {alt: string; data: {url: string}}) => (
    <img src={data.url} alt={alt} data-testid="line-image" />
  ),
  CartForm: Object.assign(
    ({children, action, inputs}: {children: React.ReactNode | ((fetcher: any) => React.ReactNode); action: string; inputs: any}) => (
      <form data-testid={`cart-form-${action}`} data-action={action} data-inputs={JSON.stringify(inputs)}>
        {typeof children === 'function' ? children({state: 'idle'}) : children}
      </form>
    ),
    {
      ACTIONS: {
        LinesUpdate: 'LinesUpdate',
        LinesRemove: 'LinesRemove',
      },
    },
  ),
}));

// Mock useVariantUrl
vi.mock('~/lib/variants', () => ({
  useVariantUrl: (handle: string, options: any[]) => `/products/${handle}?${options?.map(o => `${o.name}=${o.value}`).join('&') || ''}`,
}));

// Mock ProductPrice
vi.mock('~/components/product/ProductPrice', () => ({
  ProductPrice: ({price}: {price: any}) => (
    <span data-testid="product-price">${price?.amount || '0'}</span>
  ),
}));

// Mock Aside context
const mockClose = vi.fn();
vi.mock('~/components/layout/Aside', () => ({
  useAside: () => ({
    close: mockClose,
  }),
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  CloseIcon: ({className}: {className?: string}) => (
    <svg data-testid="close-icon" className={className} />
  ),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CartLineItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders product title', () => {
      const line = createCartLine({
        merchandise: {
          product: {
            handle: 'test-product',
            title: 'Premium Wool Coat',
          },
          title: 'M / Black',
          image: {url: 'https://example.com/image.jpg'},
          selectedOptions: [{name: 'Size', value: 'M'}],
        },
      });

      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByText('Premium Wool Coat')).toBeInTheDocument();
    });

    it('renders product image', () => {
      const line = createCartLine();
      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByTestId('line-image')).toBeInTheDocument();
    });

    it('renders selected options', () => {
      const line = createCartLine({
        merchandise: {
          product: {handle: 'test', title: 'Test'},
          title: 'M / Black',
          image: {url: 'https://example.com/image.jpg'},
          selectedOptions: [
            {name: 'Size', value: 'M'},
            {name: 'Color', value: 'Black'},
          ],
        },
      });

      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByText('Size: M')).toBeInTheDocument();
      expect(screen.getByText('Color: Black')).toBeInTheDocument();
    });

    it('renders product price', () => {
      const line = createCartLine();
      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByTestId('product-price')).toBeInTheDocument();
    });

    it('links to product page', () => {
      const line = createCartLine({
        merchandise: {
          product: {handle: 'wool-coat', title: 'Wool Coat'},
          title: 'M',
          image: {url: 'https://example.com/image.jpg'},
          selectedOptions: [{name: 'Size', value: 'M'}],
        },
      });

      render(<CartLineItem line={line} layout="page" />);

      const links = screen.getAllByTestId('product-link');
      expect(links[0]).toHaveAttribute('href', expect.stringContaining('/products/wool-coat'));
    });
  });

  describe('Quantity controls', () => {
    it('renders current quantity', () => {
      const line = createCartLine({quantity: 3});
      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders decrease quantity button', () => {
      const line = createCartLine({quantity: 2});
      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByRole('button', {name: /decrease quantity/i})).toBeInTheDocument();
    });

    it('renders increase quantity button', () => {
      const line = createCartLine();
      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByRole('button', {name: /increase quantity/i})).toBeInTheDocument();
    });

    it('disables decrease button when quantity is 1', () => {
      const line = createCartLine({quantity: 1});
      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByRole('button', {name: /decrease quantity/i})).toBeDisabled();
    });

    it('enables decrease button when quantity is greater than 1', () => {
      const line = createCartLine({quantity: 2});
      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByRole('button', {name: /decrease quantity/i})).not.toBeDisabled();
    });
  });

  describe('Remove button', () => {
    it('renders remove button', () => {
      const line = createCartLine();
      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByRole('button', {name: /remove item/i})).toBeInTheDocument();
    });

    it('shows close icon on remove button', () => {
      const line = createCartLine();
      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });
  });

  describe('Optimistic updates', () => {
    it('disables controls during optimistic update', () => {
      const line = createCartLine({isOptimistic: true});
      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByRole('button', {name: /decrease quantity/i})).toBeDisabled();
      expect(screen.getByRole('button', {name: /increase quantity/i})).toBeDisabled();
      expect(screen.getByRole('button', {name: /remove item/i})).toBeDisabled();
    });
  });

  describe('Aside layout behavior', () => {
    it('closes aside when clicking image link in aside layout', async () => {
      const user = userEvent.setup();
      const line = createCartLine();
      render(<CartLineItem line={line} layout="aside" />);

      const links = screen.getAllByTestId('product-link');
      await user.click(links[0]); // Image link

      expect(mockClose).toHaveBeenCalled();
    });

    it('closes aside when clicking title link in aside layout', async () => {
      const user = userEvent.setup();
      const line = createCartLine();
      render(<CartLineItem line={line} layout="aside" />);

      const links = screen.getAllByTestId('product-link');
      mockClose.mockClear();
      await user.click(links[1]); // Title link

      expect(mockClose).toHaveBeenCalled();
    });

    it('does not close aside when clicking image link in page layout', async () => {
      const user = userEvent.setup();
      const line = createCartLine();
      render(<CartLineItem line={line} layout="page" />);

      const links = screen.getAllByTestId('product-link');
      await user.click(links[0]); // Image link

      expect(mockClose).not.toHaveBeenCalled();
    });

    it('does not close aside when clicking title link in page layout', async () => {
      const user = userEvent.setup();
      const line = createCartLine();
      render(<CartLineItem line={line} layout="page" />);

      const links = screen.getAllByTestId('product-link');
      await user.click(links[1]); // Title link

      expect(mockClose).not.toHaveBeenCalled();
    });
  });

  describe('Without image', () => {
    it('handles line items without image', () => {
      const line = createCartLine({
        merchandise: {
          product: {handle: 'test', title: 'Digital Product'},
          title: 'Standard',
          image: null,
          selectedOptions: [],
        },
      });

      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByText('Digital Product')).toBeInTheDocument();
      expect(screen.queryByTestId('line-image')).not.toBeInTheDocument();
    });
  });

  describe('CartForm integration', () => {
    it('wraps quantity update in CartForm with LinesUpdate action', () => {
      const line = createCartLine();
      render(<CartLineItem line={line} layout="page" />);

      const updateForms = screen.getAllByTestId('cart-form-LinesUpdate');
      expect(updateForms.length).toBeGreaterThan(0);
    });

    it('wraps remove button in CartForm with LinesRemove action', () => {
      const line = createCartLine();
      render(<CartLineItem line={line} layout="page" />);

      expect(screen.getByTestId('cart-form-LinesRemove')).toBeInTheDocument();
    });
  });
});

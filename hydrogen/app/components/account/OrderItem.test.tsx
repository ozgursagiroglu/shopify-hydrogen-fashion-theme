/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {OrderItem} from './OrderItem';
import type {OrderItemFragment} from 'customer-accountapi.generated';

describe('OrderItem', () => {
  const mockOrder: OrderItemFragment = {
    id: 'gid://shopify/Order/1234567890',
    number: 1001,
    processedAt: '2024-01-15T10:00:00Z',
    financialStatus: 'PAID',
    confirmationNumber: 'ABC123',
    totalPrice: {
      amount: '150.00',
      currencyCode: 'USD',
    },
    fulfillments: {
      nodes: [
        {
          status: 'FULFILLED',
        },
      ],
    },
  };

  it('renders order number', () => {
    render(<OrderItem order={mockOrder} />);

    expect(screen.getByText(/Order #1001/i)).toBeInTheDocument();
  });

  it('renders order date', () => {
    render(<OrderItem order={mockOrder} />);

    // The date will be formatted based on locale
    expect(screen.getByText(/January 15, 2024/i)).toBeInTheDocument();
  });

  it('renders confirmation number when provided', () => {
    render(<OrderItem order={mockOrder} />);

    expect(screen.getByText(/Confirmation:/)).toBeInTheDocument();
    expect(screen.getByText(/ABC123/)).toBeInTheDocument();
  });

  it('does not render confirmation number when not provided', () => {
    const orderWithoutConfirmation = {...mockOrder, confirmationNumber: null};
    render(<OrderItem order={orderWithoutConfirmation} />);

    expect(screen.queryByText(/Confirmation:/)).not.toBeInTheDocument();
  });

  it('renders financial status badge', () => {
    render(<OrderItem order={mockOrder} />);

    expect(screen.getByText('paid')).toBeInTheDocument();
  });

  it('renders fulfillment status when available', () => {
    render(<OrderItem order={mockOrder} />);

    expect(screen.getByText(/Status:/)).toBeInTheDocument();
    expect(screen.getByText('fulfilled')).toBeInTheDocument();
  });

  it('does not render fulfillment status when not available', () => {
    const orderWithoutFulfillment = {
      ...mockOrder,
      fulfillments: {nodes: []},
    };
    render(<OrderItem order={orderWithoutFulfillment} />);

    expect(screen.queryByText(/Status:/)).not.toBeInTheDocument();
  });

  it('renders total price', () => {
    render(<OrderItem order={mockOrder} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('renders view order link', () => {
    render(<OrderItem order={mockOrder} />);

    const links = screen.getAllByRole('link');
    const viewLink = links.find((link) => link.textContent?.includes('View'));
    expect(viewLink).toBeInTheDocument();
  });

  it('view link points to order detail page', () => {
    render(<OrderItem order={mockOrder} />);

    const links = screen.getAllByRole('link');
    const viewLink = links.find((link) => link.textContent?.includes('View'));
    expect(viewLink).toHaveAttribute('href', expect.stringContaining('/account/orders/'));
  });

  it('order number is a link to order detail', () => {
    render(<OrderItem order={mockOrder} />);

    const orderLink = screen.getByText(/Order #1001/i);
    expect(orderLink.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('/account/orders/')
    );
  });

  it('formats fulfillment status with spaces', () => {
    const orderWithUnderscores = {
      ...mockOrder,
      fulfillments: {
        nodes: [
          {
            status: 'PARTIALLY_FULFILLED',
          },
        ],
      },
    };
    render(<OrderItem order={orderWithUnderscores} />);

    expect(screen.getByText('partially fulfilled')).toBeInTheDocument();
  });

  it('has correct container styling', () => {
    const {container} = render(<OrderItem order={mockOrder} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      'p-4',
      'md:p-6',
      'bg-surface',
      'border',
      'border-border',
      'rounded-lg'
    );
  });

  it('renders with different financial status', () => {
    const pendingOrder = {...mockOrder, financialStatus: 'PENDING'};
    render(<OrderItem order={pendingOrder} />);

    expect(screen.getByText('pending')).toBeInTheDocument();
  });
});

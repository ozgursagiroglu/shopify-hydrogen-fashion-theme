/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {OrdersTable} from './OrdersTable';
import type {CustomerOrdersFragment} from 'customer-accountapi.generated';

describe('OrdersTable', () => {
  const mockOrders: CustomerOrdersFragment['orders'] = {
    nodes: [
      {
        id: 'order-1',
        number: 1001,
        processedAt: '2024-01-15T10:00:00Z',
        financialStatus: 'PAID',
        confirmationNumber: 'ABC123',
        totalPrice: {amount: '100.00', currencyCode: 'USD'},
        fulfillments: {nodes: [{status: 'FULFILLED'}]},
      },
      {
        id: 'order-2',
        number: 1002,
        processedAt: '2024-01-20T10:00:00Z',
        financialStatus: 'PENDING',
        confirmationNumber: 'DEF456',
        totalPrice: {amount: '200.00', currencyCode: 'USD'},
        fulfillments: {nodes: []},
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };

  const emptyOrders: CustomerOrdersFragment['orders'] = {
    nodes: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };

  it('renders orders when orders exist', () => {
    render(
      <OrdersTable orders={mockOrders} filters={{name: null, confirmationNumber: null}} />
    );

    expect(screen.getByText(/Order #1001/i)).toBeInTheDocument();
    expect(screen.getByText(/Order #1002/i)).toBeInTheDocument();
  });

  it('renders EmptyOrders when no orders', () => {
    render(
      <OrdersTable
        orders={emptyOrders}
        filters={{name: null, confirmationNumber: null}}
      />
    );

    expect(screen.getByText('No orders yet')).toBeInTheDocument();
  });

  it('passes hasFilters=true when name filter is present', () => {
    render(
      <OrdersTable
        orders={emptyOrders}
        filters={{name: 'test', confirmationNumber: null}}
      />
    );

    expect(screen.getByText('No orders found')).toBeInTheDocument();
  });

  it('passes hasFilters=true when confirmation number filter is present', () => {
    render(
      <OrdersTable
        orders={emptyOrders}
        filters={{name: null, confirmationNumber: 'ABC123'}}
      />
    );

    expect(screen.getByText('No orders found')).toBeInTheDocument();
  });

  it('passes hasFilters=true when both filters are present', () => {
    render(
      <OrdersTable
        orders={emptyOrders}
        filters={{name: 'test', confirmationNumber: 'ABC123'}}
      />
    );

    expect(screen.getByText('No orders found')).toBeInTheDocument();
  });

  it('passes hasFilters=false when no filters are present', () => {
    render(
      <OrdersTable
        orders={emptyOrders}
        filters={{name: null, confirmationNumber: null}}
      />
    );

    expect(screen.getByText('No orders yet')).toBeInTheDocument();
  });

  it('has aria-live attribute for accessibility', () => {
    const {container} = render(
      <OrdersTable orders={mockOrders} filters={{name: null, confirmationNumber: null}} />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('aria-live', 'polite');
  });
});

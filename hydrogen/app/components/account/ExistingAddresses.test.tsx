/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {ExistingAddresses} from './ExistingAddresses';
import type {CustomerFragment} from 'customer-accountapi.generated';

describe('ExistingAddresses', () => {
  const mockDefaultAddress = {
    id: 'address-1',
    address1: '123 Main St',
    address2: 'Apt 4B',
    city: 'New York',
    territoryCode: 'NY',
    zip: '10001',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    company: null,
    zoneCode: 'NY',
  };

  const mockAddresses: CustomerFragment['addresses'] = {
    nodes: [
      mockDefaultAddress,
      {
        id: 'address-2',
        address1: '456 Oak Ave',
        address2: null,
        city: 'Los Angeles',
        territoryCode: 'CA',
        zip: '90001',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+0987654321',
        company: 'ACME Corp',
        zoneCode: 'CA',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };

  it('renders all addresses', () => {
    render(
      <ExistingAddresses
        addresses={mockAddresses}
        defaultAddress={mockDefaultAddress}
      />
    );

    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
  });

  it('renders in grid layout', () => {
    const {container} = render(
      <ExistingAddresses
        addresses={mockAddresses}
        defaultAddress={mockDefaultAddress}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'gap-4'
    );
  });

  it('passes defaultAddress to AddressCard', () => {
    render(
      <ExistingAddresses
        addresses={mockAddresses}
        defaultAddress={mockDefaultAddress}
      />
    );

    // The default address should be marked
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('renders empty grid when no addresses', () => {
    const emptyAddresses: CustomerFragment['addresses'] = {
      nodes: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };

    const {container} = render(
      <ExistingAddresses
        addresses={emptyAddresses}
        defaultAddress={null}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children.length).toBe(0);
  });

  it('renders single address', () => {
    const singleAddress: CustomerFragment['addresses'] = {
      nodes: [mockDefaultAddress],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };

    render(
      <ExistingAddresses
        addresses={singleAddress}
        defaultAddress={mockDefaultAddress}
      />
    );

    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.queryByText('456 Oak Ave')).not.toBeInTheDocument();
  });
});

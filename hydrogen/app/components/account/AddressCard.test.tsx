/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent} from '@test/utils/render';
import {AddressCard} from './AddressCard';
import type {AddressFragment} from 'customer-accountapi.generated';

describe('AddressCard', () => {
  const mockAddress: AddressFragment = {
    id: 'address-1',
    firstName: 'John',
    lastName: 'Doe',
    company: 'ACME Corp',
    address1: '123 Main St',
    address2: 'Apt 4B',
    city: 'New York',
    zoneCode: 'NY',
    zip: '10001',
    territoryCode: 'US',
    phoneNumber: '+1234567890',
  };

  const mockDefaultAddress = mockAddress;

  describe('display mode', () => {
    it('renders full name', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders company when provided', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      expect(screen.getByText('ACME Corp')).toBeInTheDocument();
    });

    it('does not render company when not provided', () => {
      const addressWithoutCompany = {...mockAddress, company: null};
      render(<AddressCard address={addressWithoutCompany} defaultAddress={null} />);

      expect(screen.queryByText('ACME Corp')).not.toBeInTheDocument();
    });

    it('renders address line 1', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });

    it('renders address line 2 when provided', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      expect(screen.getByText('Apt 4B')).toBeInTheDocument();
    });

    it('does not render address line 2 when not provided', () => {
      const addressWithoutLine2 = {...mockAddress, address2: null};
      render(<AddressCard address={addressWithoutLine2} defaultAddress={null} />);

      expect(screen.queryByText('Apt 4B')).not.toBeInTheDocument();
    });

    it('renders city, zone, and zip', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      expect(screen.getByText('New York, NY 10001')).toBeInTheDocument();
    });

    it('renders territory code', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      expect(screen.getByText('US')).toBeInTheDocument();
    });

    it('renders phone number when provided', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      expect(screen.getByText('+1234567890')).toBeInTheDocument();
    });

    it('does not render phone number when not provided', () => {
      const addressWithoutPhone = {...mockAddress, phoneNumber: null};
      render(<AddressCard address={addressWithoutPhone} defaultAddress={null} />);

      expect(screen.queryByText('+1234567890')).not.toBeInTheDocument();
    });

    it('shows default badge for default address', () => {
      render(<AddressCard address={mockAddress} defaultAddress={mockDefaultAddress} />);

      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('does not show default badge for non-default address', () => {
      const otherAddress = {...mockAddress, id: 'address-2'};
      render(<AddressCard address={otherAddress} defaultAddress={mockDefaultAddress} />);

      expect(screen.queryByText('Default')).not.toBeInTheDocument();
    });

    it('renders edit button', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      expect(screen.getByRole('button', {name: 'Edit Address'})).toBeInTheDocument();
    });

    it('switches to edit mode when edit button is clicked', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      const editButton = screen.getByRole('button', {name: 'Edit Address'});
      fireEvent.click(editButton);

      // Should now show edit form with different heading
      expect(screen.getByText('Edit Address')).toBeInTheDocument();
      // The edit button text should now be part of a heading, not a button
      expect(screen.queryByRole('button', {name: 'Edit Address'})).not.toBeInTheDocument();
    });
  });

  describe('edit mode', () => {
    it('renders edit form when in edit mode', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      const editButton = screen.getByRole('button', {name: 'Edit Address'});
      fireEvent.click(editButton);

      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    });

    it('renders close button in edit mode', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      const editButton = screen.getByRole('button', {name: 'Edit Address'});
      fireEvent.click(editButton);

      expect(screen.getByRole('button', {name: 'Close'})).toBeInTheDocument();
    });

    it('switches back to display mode when close button is clicked', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      // Enter edit mode
      const editButton = screen.getByRole('button', {name: 'Edit Address'});
      fireEvent.click(editButton);

      // Exit edit mode
      const closeButton = screen.getByRole('button', {name: 'Close'});
      fireEvent.click(closeButton);

      // Should be back in display mode
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByRole('button', {name: 'Edit Address'})).toBeInTheDocument();
    });

    it('renders save button in edit mode', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      const editButton = screen.getByRole('button', {name: 'Edit Address'});
      fireEvent.click(editButton);

      expect(screen.getByRole('button', {name: 'Save Changes'})).toBeInTheDocument();
    });

    it('renders delete button in edit mode', () => {
      render(<AddressCard address={mockAddress} defaultAddress={null} />);

      const editButton = screen.getByRole('button', {name: 'Edit Address'});
      fireEvent.click(editButton);

      expect(screen.getByRole('button', {name: 'Delete'})).toBeInTheDocument();
    });
  });
});

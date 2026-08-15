/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@test/utils/render';
import {AddressForm} from './AddressForm';
import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';

// Mock react-router hooks and Form component
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  const React = await import('react');
  return {
    ...actual,
    useActionData: () => null,
    useNavigation: () => ({state: 'idle', formMethod: null}),
    Form: ({children, id, ...props}: any) =>
      React.createElement('form', {id, ...props}, children),
  };
});

describe('AddressForm', () => {
  const mockAddress: CustomerAddressInput = {
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

  const defaultChildren = () => (
    <button type="submit">Submit</button>
  );

  it('renders all form fields', () => {
    render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {defaultChildren}
      </AddressForm>
    );

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Company')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Apartment, suite, etc.')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('State / Province')).toBeInTheDocument();
    expect(screen.getByLabelText('ZIP / Postal Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Country Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
  });

  it('populates fields with address data', () => {
    render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {defaultChildren}
      </AddressForm>
    );

    expect(screen.getByLabelText('First Name')).toHaveValue('John');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
    expect(screen.getByLabelText('Company')).toHaveValue('ACME Corp');
    expect(screen.getByLabelText('Address')).toHaveValue('123 Main St');
    expect(screen.getByLabelText('Apartment, suite, etc.')).toHaveValue('Apt 4B');
    expect(screen.getByLabelText('City')).toHaveValue('New York');
    expect(screen.getByLabelText('State / Province')).toHaveValue('NY');
    expect(screen.getByLabelText('ZIP / Postal Code')).toHaveValue('10001');
    expect(screen.getByLabelText('Country Code')).toHaveValue('US');
    expect(screen.getByLabelText('Phone Number')).toHaveValue('+1234567890');
  });

  it('renders empty fields when address is empty', () => {
    const emptyAddress: CustomerAddressInput = {
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      zoneCode: '',
      zip: '',
      territoryCode: '',
      phoneNumber: '',
    };

    render(
      <AddressForm
        addressId="address-1"
        address={emptyAddress}
        defaultAddress={null}
      >
        {defaultChildren}
      </AddressForm>
    );

    expect(screen.getByLabelText('First Name')).toHaveValue('');
    expect(screen.getByLabelText('Last Name')).toHaveValue('');
  });

  it('renders required field indicators', () => {
    render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {defaultChildren}
      </AddressForm>
    );

    // Required fields should have asterisk
    const firstNameLabel = screen.getByText('First Name');
    expect(firstNameLabel.textContent).toContain('*');
  });

  it('renders default address checkbox', () => {
    render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {defaultChildren}
      </AddressForm>
    );

    const checkbox = screen.getByLabelText('Set as default address');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('checks default address checkbox when address is default', () => {
    const defaultAddress = {id: 'address-1'};

    render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={defaultAddress}
      >
        {defaultChildren}
      </AddressForm>
    );

    const checkbox = screen.getByLabelText('Set as default address');
    expect(checkbox).toBeChecked();
  });

  it('renders children content', () => {
    render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {() => <button type="submit">Custom Submit</button>}
      </AddressForm>
    );

    expect(screen.getByRole('button', {name: 'Custom Submit'})).toBeInTheDocument();
  });

  it('passes stateForMethod to children', () => {
    const childrenSpy = vi.fn(() => <div>Test</div>);

    render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {childrenSpy}
      </AddressForm>
    );

    expect(childrenSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        stateForMethod: expect.any(Function),
      })
    );
  });

  it('includes hidden addressId input', () => {
    const {container} = render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {defaultChildren}
      </AddressForm>
    );

    const hiddenInput = container.querySelector('input[name="addressId"]');
    expect(hiddenInput).toHaveValue('address-1');
  });

  it('renders form with correct id', () => {
    const {container} = render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {defaultChildren}
      </AddressForm>
    );

    const form = container.querySelector('form');
    expect(form).toHaveAttribute('id', 'address-1');
  });

  it('sets correct autocomplete attributes', () => {
    render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {defaultChildren}
      </AddressForm>
    );

    expect(screen.getByLabelText('First Name')).toHaveAttribute('autocomplete', 'given-name');
    expect(screen.getByLabelText('Last Name')).toHaveAttribute('autocomplete', 'family-name');
    expect(screen.getByLabelText('Company')).toHaveAttribute('autocomplete', 'organization');
    expect(screen.getByLabelText('Address')).toHaveAttribute('autocomplete', 'address-line1');
    expect(screen.getByLabelText('City')).toHaveAttribute('autocomplete', 'address-level2');
    expect(screen.getByLabelText('ZIP / Postal Code')).toHaveAttribute('autocomplete', 'postal-code');
    expect(screen.getByLabelText('Country Code')).toHaveAttribute('autocomplete', 'country');
    expect(screen.getByLabelText('Phone Number')).toHaveAttribute('autocomplete', 'tel');
  });

  it('sets maxLength on country code input', () => {
    render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {defaultChildren}
      </AddressForm>
    );

    expect(screen.getByLabelText('Country Code')).toHaveAttribute('maxlength', '2');
  });

  it('shows country code hint', () => {
    render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {defaultChildren}
      </AddressForm>
    );

    expect(screen.getByText('Enter 2-letter country code (e.g., US for United States)')).toBeInTheDocument();
  });

  it('sets pattern on phone input', () => {
    render(
      <AddressForm
        addressId="address-1"
        address={mockAddress}
        defaultAddress={null}
      >
        {defaultChildren}
      </AddressForm>
    );

    expect(screen.getByLabelText('Phone Number')).toHaveAttribute('pattern', '^\\+?[1-9]\\d{3,14}$');
  });
});

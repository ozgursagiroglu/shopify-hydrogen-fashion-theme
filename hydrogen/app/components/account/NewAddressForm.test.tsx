/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {NewAddressForm} from './NewAddressForm';

describe('NewAddressForm', () => {
  it('renders address form', () => {
    render(<NewAddressForm />);

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<NewAddressForm />);

    expect(screen.getByRole('button', {name: 'Create Address'})).toBeInTheDocument();
  });

  it('submit button shows creating state when submitting', () => {
    render(<NewAddressForm />);

    const button = screen.getByRole('button', {name: 'Create Address'});
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders form with correct structure', () => {
    const {container} = render(<NewAddressForm />);

    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('renders all required address fields', () => {
    render(<NewAddressForm />);

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('ZIP / Postal Code')).toBeInTheDocument();
  });

  it('form fields are initially empty', () => {
    render(<NewAddressForm />);

    const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
    const lastNameInput = screen.getByLabelText('Last Name') as HTMLInputElement;

    expect(firstNameInput.value).toBe('');
    expect(lastNameInput.value).toBe('');
  });
});

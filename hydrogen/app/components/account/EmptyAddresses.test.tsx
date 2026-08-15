/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@test/utils/render';
import {EmptyAddresses} from './EmptyAddresses';

describe('EmptyAddresses', () => {
  const mockOnAddClick = vi.fn();

  beforeEach(() => {
    mockOnAddClick.mockClear();
  });

  it('renders empty state heading', () => {
    render(<EmptyAddresses onAddClick={mockOnAddClick} />);

    expect(screen.getByText('No addresses saved')).toBeInTheDocument();
  });

  it('renders empty state hint', () => {
    render(<EmptyAddresses onAddClick={mockOnAddClick} />);

    expect(
      screen.getByText('Add an address to make checkout faster.')
    ).toBeInTheDocument();
  });

  it('renders add address button', () => {
    render(<EmptyAddresses onAddClick={mockOnAddClick} />);

    const button = screen.getByRole('button', {name: /Add Address/i});
    expect(button).toBeInTheDocument();
  });

  it('calls onAddClick when button is clicked', () => {
    render(<EmptyAddresses onAddClick={mockOnAddClick} />);

    const button = screen.getByRole('button', {name: /Add Address/i});
    fireEvent.click(button);

    expect(mockOnAddClick).toHaveBeenCalledTimes(1);
  });

  it('button has correct variant', () => {
    render(<EmptyAddresses onAddClick={mockOnAddClick} />);

    const button = screen.getByRole('button', {name: /Add Address/i});
    expect(button).toHaveClass('bg-primary', 'text-white');
  });

  it('has correct container styling', () => {
    const {container} = render(<EmptyAddresses onAddClick={mockOnAddClick} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      'text-center',
      'py-16',
      'px-4',
      'bg-surface-alt',
      'rounded-lg'
    );
  });

  it('renders MapPin icon', () => {
    const {container} = render(<EmptyAddresses onAddClick={mockOnAddClick} />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('icon container has correct styling', () => {
    const {container} = render(<EmptyAddresses onAddClick={mockOnAddClick} />);

    const iconContainer = container.querySelector('.w-16');
    expect(iconContainer).toHaveClass(
      'w-16',
      'h-16',
      'mx-auto',
      'mb-4',
      'rounded-full',
      'bg-surface'
    );
  });

  it('button has plus icon', () => {
    render(<EmptyAddresses onAddClick={mockOnAddClick} />);

    const button = screen.getByRole('button', {name: /Add Address/i});
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});

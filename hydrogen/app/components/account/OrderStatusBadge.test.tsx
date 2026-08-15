/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {OrderStatusBadge} from './OrderStatusBadge';

describe('OrderStatusBadge', () => {
  it('returns null when status is null', () => {
    const {container} = render(<OrderStatusBadge status={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('returns null when status is undefined', () => {
    const {container} = render(<OrderStatusBadge status={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders paid status with correct styling', () => {
    render(<OrderStatusBadge status="PAID" />);

    const badge = screen.getByText('paid');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders pending status with correct styling', () => {
    render(<OrderStatusBadge status="PENDING" />);

    const badge = screen.getByText('pending');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('renders refunded status with correct styling', () => {
    render(<OrderStatusBadge status="REFUNDED" />);

    const badge = screen.getByText('refunded');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('renders unknown status with default styling', () => {
    render(<OrderStatusBadge status="UNKNOWN" />);

    const badge = screen.getByText('unknown');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('displays status in lowercase', () => {
    render(<OrderStatusBadge status="PAID" />);

    expect(screen.getByText('paid')).toBeInTheDocument();
    expect(screen.queryByText('PAID')).not.toBeInTheDocument();
  });

  it('handles mixed case status', () => {
    render(<OrderStatusBadge status="Pending" />);

    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('has correct base styling', () => {
    render(<OrderStatusBadge status="PAID" />);

    const badge = screen.getByText('paid');
    expect(badge).toHaveClass(
      'px-2.5',
      'py-0.5',
      'rounded-full',
      'text-xs',
      'font-medium',
      'capitalize'
    );
  });

  it('renders as span element', () => {
    render(<OrderStatusBadge status="PAID" />);

    const badge = screen.getByText('paid');
    expect(badge.tagName).toBe('SPAN');
  });

  it('handles empty string status', () => {
    const {container} = render(<OrderStatusBadge status="" />);

    expect(container.firstChild).toBeNull();
  });

  it('handles lowercase status input', () => {
    render(<OrderStatusBadge status="paid" />);

    const badge = screen.getByText('paid');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });
});

/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {EmptyOrders} from './EmptyOrders';

describe('EmptyOrders', () => {
  describe('without filters', () => {
    it('renders empty state heading', () => {
      render(<EmptyOrders />);

      expect(screen.getByText('No orders yet')).toBeInTheDocument();
    });

    it('renders empty state description', () => {
      render(<EmptyOrders />);

      expect(
        screen.getByText('When you place an order, it will appear here.')
      ).toBeInTheDocument();
    });

    it('renders start shopping button', () => {
      render(<EmptyOrders />);

      const button = screen.getByRole('link', {name: /Start Shopping/i});
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('href', expect.stringContaining('/collections/all'));
    });

    it('renders package icon', () => {
      const {container} = render(<EmptyOrders />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('with filters', () => {
    it('renders no orders found heading', () => {
      render(<EmptyOrders hasFilters={true} />);

      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });

    it('renders filter criteria message', () => {
      render(<EmptyOrders hasFilters={true} />);

      expect(
        screen.getByText('No orders match your search criteria.')
      ).toBeInTheDocument();
    });

    it('renders clear filters link', () => {
      render(<EmptyOrders hasFilters={true} />);

      const link = screen.getByRole('link', {name: /Clear filters/i});
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', expect.stringContaining('/account/orders'));
    });

    it('does not render start shopping button', () => {
      render(<EmptyOrders hasFilters={true} />);

      expect(screen.queryByRole('link', {name: /Start Shopping/i})).not.toBeInTheDocument();
    });
  });

  it('has correct container styling', () => {
    const {container} = render(<EmptyOrders />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      'text-center',
      'py-16',
      'px-4',
      'bg-surface-alt',
      'rounded-lg'
    );
  });

  it('icon container has correct styling', () => {
    const {container} = render(<EmptyOrders />);

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
});

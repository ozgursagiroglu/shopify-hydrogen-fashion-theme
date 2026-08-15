/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ErrorState, NotFoundState, EmptyState} from './ErrorState';

// Note: react-router mock uses global mock from test/setup.ts

// Mock icons
vi.mock('~/components/icons', () => ({
  ExclamationCircleIcon: ({className}: {className?: string}) => (
    <svg data-testid="exclamation-icon" className={className} />
  ),
}));

// Mock cn utility
vi.mock('~/lib/cn', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

describe('ErrorState', () => {
  describe('Rendering', () => {
    it('renders with default title and message', () => {
      render(<ErrorState />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<ErrorState title="Custom Error" />);

      expect(screen.getByText('Custom Error')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
      render(<ErrorState message="Custom error message" />);

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('renders error icon', () => {
      render(<ErrorState />);

      expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<ErrorState />);

      const container = screen.getByRole('alert');
      expect(container).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(<ErrorState className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Size variants', () => {
    it('applies small size classes', () => {
      render(<ErrorState size="sm" />);

      const icon = screen.getByTestId('exclamation-icon');
      expect(icon).toHaveClass('w-8', 'h-8');
    });

    it('applies medium size classes by default', () => {
      render(<ErrorState />);

      const icon = screen.getByTestId('exclamation-icon');
      expect(icon).toHaveClass('w-12', 'h-12');
    });

    it('applies large size classes', () => {
      render(<ErrorState size="lg" />);

      const icon = screen.getByTestId('exclamation-icon');
      expect(icon).toHaveClass('w-16', 'h-16');
    });
  });

  describe('Retry button', () => {
    it('does not show retry button by default', () => {
      render(<ErrorState />);

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('shows retry button when showRetry is true', () => {
      const onRetry = vi.fn();
      render(<ErrorState showRetry onRetry={onRetry} />);

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('calls onRetry when retry button clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      render(<ErrorState showRetry onRetry={onRetry} />);

      await user.click(screen.getByText('Try Again'));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not show retry button if onRetry not provided', () => {
      render(<ErrorState showRetry />);

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });
  });

  describe('Home link', () => {
    it('does not show home link by default', () => {
      render(<ErrorState />);

      expect(screen.queryByText('Return Home')).not.toBeInTheDocument();
    });

    it('shows home link when showHomeLink is true', () => {
      render(<ErrorState showHomeLink />);

      expect(screen.getByText('Return Home')).toBeInTheDocument();
    });

    it('home link points to root', () => {
      render(<ErrorState showHomeLink />);

      const link = screen.getByText('Return Home');
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('Button combinations', () => {
    it('shows both retry and home link when both enabled', () => {
      const onRetry = vi.fn();
      render(<ErrorState showRetry onRetry={onRetry} showHomeLink />);

      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Return Home')).toBeInTheDocument();
    });
  });

  describe('Button styling', () => {
    it('retry button has primary styling', () => {
      const onRetry = vi.fn();
      render(<ErrorState showRetry onRetry={onRetry} />);

      const button = screen.getByText('Try Again');
      expect(button).toHaveClass('bg-primary', 'text-white');
    });

    it('home link has secondary styling', () => {
      render(<ErrorState showHomeLink />);

      const link = screen.getByText('Return Home');
      expect(link).toHaveClass('border', 'border-primary', 'text-primary');
    });
  });
});

describe('NotFoundState', () => {
  it('renders with default 404 message', () => {
    render(<NotFoundState />);

    expect(screen.getByText('Not Found')).toBeInTheDocument();
    expect(screen.getByText("We couldn't find what you're looking for.")).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<NotFoundState title="Page Not Found" />);

    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<NotFoundState message="This page does not exist" />);

    expect(screen.getByText('This page does not exist')).toBeInTheDocument();
  });

  it('shows home link by default', () => {
    render(<NotFoundState />);

    expect(screen.getByText('Return Home')).toBeInTheDocument();
  });

  it('uses large size by default', () => {
    render(<NotFoundState />);

    const icon = screen.getByTestId('exclamation-icon');
    expect(icon).toHaveClass('w-16', 'h-16');
  });

  it('applies custom className', () => {
    const {container} = render(<NotFoundState className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No items" message="Add items to get started" />);

    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('renders message', () => {
    render(<EmptyState title="No items" message="Add items to get started" />);

    expect(screen.getByText('Add items to get started')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(
      <EmptyState
        title="No items"
        message="Add items to get started"
        icon={<svg data-testid="custom-icon" />}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('does not render icon section when icon not provided', () => {
    const {container} = render(
      <EmptyState title="No items" message="Add items to get started" />
    );

    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const {container} = render(
      <EmptyState
        title="No items"
        message="Add items to get started"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  describe('Action button with link', () => {
    it('renders action button as link when href provided', () => {
      render(
        <EmptyState
          title="No items"
          message="Add items to get started"
          action={{label: 'Add Item', href: '/add'}}
        />
      );

      const button = screen.getByText('Add Item');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('href', '/add');
    });

    it('does not render action button when not provided', () => {
      render(<EmptyState title="No items" message="Add items to get started" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Action button with onClick', () => {
    it('renders action button with onClick', () => {
      const onClick = vi.fn();
      render(
        <EmptyState
          title="No items"
          message="Add items to get started"
          action={{label: 'Add Item', onClick}}
        />
      );

      expect(screen.getByText('Add Item')).toBeInTheDocument();
    });

    it('calls onClick when action button clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <EmptyState
          title="No items"
          message="Add items to get started"
          action={{label: 'Add Item', onClick}}
        />
      );

      await user.click(screen.getByText('Add Item'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Action button styling', () => {
    it('action button has primary styling', () => {
      render(
        <EmptyState
          title="No items"
          message="Add items to get started"
          action={{label: 'Add Item', href: '/add'}}
        />
      );

      const button = screen.getByText('Add Item');
      expect(button).toHaveClass('bg-primary', 'text-white');
    });
  });

  describe('Action priority', () => {
    it('prefers href over onClick when both provided', () => {
      const onClick = vi.fn();
      render(
        <EmptyState
          title="No items"
          message="Add items to get started"
          action={{label: 'Add Item', href: '/add', onClick}}
        />
      );

      const element = screen.getByText('Add Item');
      expect(element.tagName).toBe('A');
      expect(element).toHaveAttribute('href', '/add');
    });
  });
});

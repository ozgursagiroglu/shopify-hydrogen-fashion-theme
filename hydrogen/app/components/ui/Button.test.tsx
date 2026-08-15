/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Button} from './Button';

// Custom mock for react-router Link with data-testid for Button tests
vi.mock('react-router', () => ({
  Link: ({
    to,
    children,
    className,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid="router-link" {...props}>
      {children}
    </a>
  ),
  useLocation: vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  })),
  useRouteLoaderData: vi.fn(() => ({
    locale: 'en',
  })),
}));

// Mock SpinnerIcon
vi.mock('~/components/icons', () => ({
  SpinnerIcon: ({className}: {className?: string}) => (
    <svg data-testid="spinner-icon" className={className} />
  ),
}));

describe('Button', () => {
  describe('Rendering', () => {
    it('renders as a button by default', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', {name: /click me/i});
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('renders children content', () => {
      render(<Button>Submit Form</Button>);

      expect(screen.getByText('Submit Form')).toBeInTheDocument();
    });

    it('renders as an anchor when as="a"', () => {
      render(
        <Button as="a" href="https://example.com">
          External Link
        </Button>,
      );

      const link = screen.getByRole('link', {name: /external link/i});
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link.tagName).toBe('A');
    });

    it('renders as React Router Link when as="link"', () => {
      render(
        <Button as="link" to="/products">
          Shop Products
        </Button>,
      );

      const link = screen.getByTestId('router-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/products');
    });
  });

  describe('Variants', () => {
    it('applies primary variant styles by default', () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-primary');
      expect(button.className).toContain('text-white');
    });

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('border');
      expect(button.className).toContain('border-primary');
      expect(button.className).toContain('text-primary');
    });

    it('applies inverse variant styles', () => {
      render(<Button variant="inverse">Inverse</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-white');
      expect(button.className).toContain('text-primary');
    });

    it('applies inverse-outline variant styles', () => {
      render(<Button variant="inverse-outline">Inverse Outline</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('border-white');
      expect(button.className).toContain('text-white');
    });

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('text-primary');
    });
  });

  describe('Sizes', () => {
    it('applies sm size classes', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('h-10');
      expect(button.className).toContain('px-4');
      expect(button.className).toContain('text-sm');
    });

    it('applies md size classes by default', () => {
      render(<Button>Medium</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('h-12');
      expect(button.className).toContain('px-6');
    });

    it('applies lg size classes', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('h-14');
      expect(button.className).toContain('px-8');
      expect(button.className).toContain('text-lg');
    });
  });

  describe('Loading State', () => {
    it('shows spinner when loading', () => {
      render(<Button loading>Submit</Button>);

      expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
    });

    it('hides children content when loading', () => {
      render(<Button loading>Submit</Button>);

      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('is disabled when loading', () => {
      render(<Button loading>Submit</Button>);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies loading styles', () => {
      render(<Button loading>Submit</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('pointer-events-none');
      expect(button.className).toContain('opacity-70');
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('disabled:opacity-50');
      expect(button.className).toContain('disabled:cursor-not-allowed');
    });
  });

  describe('Icons', () => {
    it('renders left icon', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">←</span>}>
          Back
        </Button>,
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon">→</span>}>
          Next
        </Button>,
      );

      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('renders both icons', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Navigate
        </Button>,
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('hides icons when loading', () => {
      render(
        <Button
          loading
          leftIcon={<span data-testid="left-icon">←</span>}
        >
          Loading
        </Button>,
      );

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    it('applies full width class when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);

      expect(screen.getByRole('button').className).toContain('w-full');
    });

    it('does not apply full width class by default', () => {
      render(<Button>Normal Width</Button>);

      expect(screen.getByRole('button').className).not.toContain('w-full');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>,
      );

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button loading onClick={handleClick}>
          Click me
        </Button>,
      );

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
      expect(button.className).toContain('inline-flex');
    });
  });

  describe('Focus styles', () => {
    it('has focus ring styles', () => {
      render(<Button>Focusable</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('focus:ring-2');
      expect(button.className).toContain('focus:ring-accent');
    });
  });

  describe('Button type', () => {
    it('accepts type attribute', () => {
      render(<Button type="submit">Submit</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });
});

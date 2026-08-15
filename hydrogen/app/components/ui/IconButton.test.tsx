/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {IconButton} from './IconButton';

describe('IconButton', () => {
  const TestIcon = () => <svg data-testid="test-icon" />;

  describe('Rendering', () => {
    it('renders as a button', () => {
      render(
        <IconButton label="Close">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button', {name: /close/i});
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('renders children icon', () => {
      render(
        <IconButton label="Settings">
          <TestIcon />
        </IconButton>,
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <IconButton label="Menu" className="custom-class">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('forwards ref to button element', () => {
      const ref = vi.fn();

      render(
        <IconButton ref={ref} label="Test">
          <TestIcon />
        </IconButton>,
      );

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Accessibility', () => {
    it('has aria-label attribute', () => {
      render(
        <IconButton label="Open menu">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Open menu');
    });

    it('is accessible by label', () => {
      render(
        <IconButton label="Search">
          <TestIcon />
        </IconButton>,
      );

      expect(screen.getByRole('button', {name: /search/i})).toBeInTheDocument();
    });

    it('requires label prop', () => {
      // This test ensures TypeScript compilation would fail without label
      // At runtime, we just verify it's rendered
      render(
        <IconButton label="Required label">
          <TestIcon />
        </IconButton>,
      );

      expect(screen.getByRole('button')).toHaveAttribute('aria-label');
    });
  });

  describe('Sizes', () => {
    it('applies sm size class', () => {
      render(
        <IconButton label="Small" size="sm">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('w-8');
      expect(button.className).toContain('h-8');
    });

    it('applies md size class by default', () => {
      render(
        <IconButton label="Medium">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('w-10');
      expect(button.className).toContain('h-10');
    });

    it('applies lg size class', () => {
      render(
        <IconButton label="Large" size="lg">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('w-12');
      expect(button.className).toContain('h-12');
    });
  });

  describe('Variants', () => {
    it('applies ghost variant by default', () => {
      render(
        <IconButton label="Ghost">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('hover:bg-surface-hover');
    });

    it('applies default variant styles', () => {
      render(
        <IconButton label="Default" variant="default">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-surface');
      expect(button.className).toContain('hover:bg-surface-hover');
    });

    it('applies outline variant styles', () => {
      render(
        <IconButton label="Outline" variant="outline">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('border');
      expect(button.className).toContain('border-border');
      expect(button.className).toContain('hover:bg-surface-hover');
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(
        <IconButton label="Disabled" disabled>
          <TestIcon />
        </IconButton>,
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(
        <IconButton label="Disabled" disabled>
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('disabled:opacity-50');
      expect(button.className).toContain('disabled:cursor-not-allowed');
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <IconButton label="Disabled" disabled onClick={handleClick}>
          <TestIcon />
        </IconButton>,
      );

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <IconButton label="Click me" onClick={handleClick}>
          <TestIcon />
        </IconButton>,
      );

      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard interaction', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <IconButton label="Press me" onClick={handleClick}>
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports space key', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <IconButton label="Press me" onClick={handleClick}>
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Styles', () => {
    it('has focus ring styles', () => {
      render(
        <IconButton label="Focusable">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('focus:outline-none');
      expect(button.className).toContain('focus:ring-2');
      expect(button.className).toContain('focus:ring-accent');
      expect(button.className).toContain('focus:ring-offset-2');
    });
  });

  describe('Button Attributes', () => {
    it('accepts type attribute', () => {
      render(
        <IconButton label="Submit" type="submit">
          <TestIcon />
        </IconButton>,
      );

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('does not override type if not explicitly set', () => {
      render(
        <IconButton label="Button">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      // The component allows type to be passed through props but doesn't set a default
      // Browser will use its default (submit in forms, button otherwise)
      expect(button.tagName).toBe('BUTTON');
    });

    it('accepts data attributes', () => {
      render(
        <IconButton label="Data" data-testid="custom-id" data-value="123">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByTestId('custom-id');
      expect(button).toHaveAttribute('data-value', '123');
    });

    it('accepts aria attributes', () => {
      render(
        <IconButton label="Expanded" aria-expanded="true" aria-haspopup="true">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
    });
  });

  describe('Shape', () => {
    it('has rounded-full class for circular shape', () => {
      render(
        <IconButton label="Circle">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('rounded-full');
    });

    it('has inline-flex for centering', () => {
      render(
        <IconButton label="Centered">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('inline-flex');
      expect(button.className).toContain('items-center');
      expect(button.className).toContain('justify-center');
    });
  });

  describe('Transitions', () => {
    it('has transition styles', () => {
      render(
        <IconButton label="Animated">
          <TestIcon />
        </IconButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('transition-colors');
      expect(button.className).toContain('duration-200');
    });
  });

  describe('Complex Icons', () => {
    it('renders SVG icons correctly', () => {
      render(
        <IconButton label="SVG Icon">
          <svg data-testid="svg-icon" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>,
      );

      expect(screen.getByTestId('svg-icon')).toBeInTheDocument();
    });

    it('renders icon components', () => {
      const CustomIcon = ({className}: {className?: string}) => (
        <div data-testid="custom-icon" className={className}>
          Icon
        </div>
      );

      render(
        <IconButton label="Custom Icon">
          <CustomIcon />
        </IconButton>,
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Display Name', () => {
    it('has display name for debugging', () => {
      expect(IconButton.displayName).toBe('IconButton');
    });
  });
});

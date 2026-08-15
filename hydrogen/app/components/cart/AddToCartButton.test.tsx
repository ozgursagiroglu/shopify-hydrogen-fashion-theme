/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AddToCartButton} from './AddToCartButton';

// Track fetcher state for tests
let mockFetcherState = 'idle';

// Override global mock - need CartForm with dynamic state
vi.mock('@shopify/hydrogen', () => ({
  CartForm: Object.assign(
    ({children, action, inputs}: {children: (fetcher: any) => React.ReactNode; action: string; inputs: any}) => (
      <form data-testid="cart-form" data-action={action} data-inputs={JSON.stringify(inputs)}>
        {children({state: mockFetcherState, formData: null})}
      </form>
    ),
    {
      ACTIONS: {
        LinesAdd: 'LinesAdd',
      },
    },
  ),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'product.adding': 'Adding...',
        'product.addToCart': 'Add to Cart',
        'product.addedToCart': 'Item added to cart',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock SpinnerIcon
vi.mock('~/components/icons', () => ({
  SpinnerIcon: ({className}: {className?: string}) => (
    <svg data-testid="spinner-icon" className={className} />
  ),
}));

describe('AddToCartButton', () => {
  const defaultLines = [
    {
      merchandiseId: 'variant-123',
      quantity: 1,
    },
  ];

  beforeEach(() => {
    mockFetcherState = 'idle';
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders children when idle', () => {
      render(
        <AddToCartButton lines={defaultLines}>
          Add to Cart
        </AddToCartButton>,
      );

      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    it('renders as a button', () => {
      render(
        <AddToCartButton lines={defaultLines}>
          Add to Cart
        </AddToCartButton>,
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is submit type', () => {
      render(
        <AddToCartButton lines={defaultLines}>
          Add to Cart
        </AddToCartButton>,
      );

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('Variants', () => {
    it('applies primary variant styles by default', () => {
      render(
        <AddToCartButton lines={defaultLines}>
          Add to Cart
        </AddToCartButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-primary');
      expect(button.className).toContain('text-white');
    });
  });

  describe('Loading state', () => {
    it('shows spinner when loading', () => {
      mockFetcherState = 'submitting';
      render(
        <AddToCartButton lines={defaultLines}>
          Add to Cart
        </AddToCartButton>,
      );

      expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
    });

    it('shows "Adding..." text when loading', () => {
      mockFetcherState = 'submitting';
      render(
        <AddToCartButton lines={defaultLines}>
          Add to Cart
        </AddToCartButton>,
      );

      expect(screen.getAllByText('Adding...')[0]).toBeInTheDocument();
    });

    it('shows children when loading', () => {
      mockFetcherState = 'submitting';
      render(
        <AddToCartButton lines={defaultLines}>
          Add to Cart
        </AddToCartButton>,
      );

      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    it('is disabled when loading', () => {
      mockFetcherState = 'loading';
      render(
        <AddToCartButton lines={defaultLines}>
          Add to Cart
        </AddToCartButton>,
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Disabled state', () => {
    it('can be disabled via prop', () => {
      render(
        <AddToCartButton lines={defaultLines} disabled>
          Add to Cart
        </AddToCartButton>,
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies disabled styling', () => {
      render(
        <AddToCartButton lines={defaultLines} disabled>
          Add to Cart
        </AddToCartButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('disabled:cursor-not-allowed');
    });
  });

  describe('onClick handler', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <AddToCartButton lines={defaultLines} onClick={handleClick}>
          Add to Cart
        </AddToCartButton>,
      );

      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('CartForm integration', () => {
    it('wraps button in CartForm with LinesAdd action', () => {
      render(
        <AddToCartButton lines={defaultLines}>
          Add to Cart
        </AddToCartButton>,
      );

      const form = screen.getByTestId('cart-form');
      expect(form).toHaveAttribute('data-action', 'LinesAdd');
    });

    it('passes lines to CartForm inputs', () => {
      render(
        <AddToCartButton lines={defaultLines}>
          Add to Cart
        </AddToCartButton>,
      );

      const form = screen.getByTestId('cart-form');
      const inputs = JSON.parse(form.getAttribute('data-inputs') || '{}');
      expect(inputs.lines).toEqual(defaultLines);
    });

    it('includes hidden analytics input', () => {
      const analytics = {event: 'add_to_cart'};
      render(
        <AddToCartButton lines={defaultLines} analytics={analytics}>
          Add to Cart
        </AddToCartButton>,
      );

      const hiddenInput = document.querySelector('input[name="analytics"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveValue(JSON.stringify(analytics));
    });
  });

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(
        <AddToCartButton lines={defaultLines} className="custom-button">
          Add to Cart
        </AddToCartButton>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-button');
    });
  });

  describe('Multiple items', () => {
    it('handles multiple line items', () => {
      const multipleLines = [
        {merchandiseId: 'variant-1', quantity: 2},
        {merchandiseId: 'variant-2', quantity: 1},
      ];

      render(
        <AddToCartButton lines={multipleLines}>
          Add 3 items
        </AddToCartButton>,
      );

      const form = screen.getByTestId('cart-form');
      const inputs = JSON.parse(form.getAttribute('data-inputs') || '{}');
      expect(inputs.lines).toHaveLength(2);
    });
  });
});

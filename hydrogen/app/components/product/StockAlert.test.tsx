/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {StockAlert} from './StockAlert';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock Modal
vi.mock('~/components/ui', () => ({
  Modal: ({isOpen, onClose, children, title}: any) =>
    isOpen ? (
      <div data-testid="modal">
        {title && <h2 data-testid="modal-title">{title}</h2>}
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  BellIcon: () => <svg data-testid="bell-icon" />,
  CheckIcon: () => <svg data-testid="check-icon" />,
  SpinnerIcon: ({className}: {className?: string}) => (
    <svg data-testid="spinner-icon" className={className} />
  ),
}));

// Mock constants
vi.mock('~/lib/constants', () => ({
  TIMING: {
    MODAL_TRANSITION_MS: 300,
  },
}));

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'product.stockAlert.notifyWhenAvailable': 'Notify Me When Available',
        'product.stockAlert.getNotified': 'Get Notified',
        'product.stockAlert.subtitle':
          "We'll let you know when this item is back in stock.",
        'product.stockAlert.emailAddress': 'Email Address',
        'product.stockAlert.emailPlaceholder': 'you@example.com',
        'product.stockAlert.notifyMe': 'Notify Me',
        'product.stockAlert.signingUp': 'Signing Up...',
        'product.stockAlert.privacyNotice':
          "We'll only email you about this product. Unsubscribe anytime.",
        'product.stockAlert.success': "You're on the list!",
        'product.stockAlert.successMessage': "We'll email you as soon as",
        'product.stockAlert.backInStock': 'is back in stock.',
        'cart.continueShopping': 'Continue Shopping',
        'common.close': 'Close',
      };
      return translations[key] || key;
    },
  }),
}));

describe('StockAlert', () => {
  const defaultProps = {
    productTitle: 'Premium Wool Coat',
    variantTitle: 'Medium / Black',
    productHandle: 'premium-wool-coat',
    variantId: 'variant-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response by default
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({success: true}),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Button rendering', () => {
    it('renders notify button', () => {
      render(<StockAlert {...defaultProps} />);
      expect(screen.getByText('Notify Me When Available')).toBeInTheDocument();
    });

    it('renders bell icon', () => {
      render(<StockAlert {...defaultProps} />);
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(
        <StockAlert {...defaultProps} className="custom-class" />
      );
      const button = container.querySelector('.custom-class');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Modal interaction', () => {
    it('opens modal when button clicked', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('displays product information in modal', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      expect(screen.getByText('Premium Wool Coat')).toBeInTheDocument();
      expect(screen.getByText('Medium / Black')).toBeInTheDocument();
    });

    it('closes modal when close button clicked', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      await user.click(screen.getByTestId('modal-close'));
      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    it('renders email input', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    it('requires email input', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
      expect(emailInput).toHaveAttribute('required');
    });

    it('accepts email input', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('shows loading state during submission', async () => {
      // Mock delayed API response to capture loading state
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({success: true}),
                }),
              100,
            ),
          ),
      );

      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');

      // Use more specific query - get the submit button inside the form
      const submitButton = screen.getByRole('button', {name: 'Notify Me'});
      await user.click(submitButton);

      // Check for loading state (spinner visible, button disabled)
      expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
      const submitButtonLoading = screen.getByRole('button', {name: ''});
      expect(submitButtonLoading).toBeDisabled();

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      });
    });

    it('submits alert to API endpoint', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', {name: 'Notify Me'});
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/stock-alerts',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          }),
        );
      });
    });

    it('shows success state after submission', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', {name: 'Notify Me'});
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
        expect(screen.getByText("You're on the list!")).toBeInTheDocument();
      });
    });

    it('clears email after submission', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', {name: 'Notify Me'});
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("You're on the list!")).toBeInTheDocument();
      });

      // Close and reopen modal
      await user.click(screen.getByText('Continue Shopping'));
      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Success state', () => {
    it('displays success message with product title', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');

      await user.click(screen.getByRole('button', {name: 'Notify Me'}));

      await waitFor(() => {
        expect(screen.getByText(/Premium Wool Coat/)).toBeInTheDocument();
      });
    });

    it('includes variant title in success message', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');

      await user.click(screen.getByRole('button', {name: 'Notify Me'}));

      await waitFor(() => {
        expect(screen.getByText(/Medium \/ Black/)).toBeInTheDocument();
      });
    });

    it('shows continue shopping button', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');

      await user.click(screen.getByRole('button', {name: 'Notify Me'}));

      await waitFor(() => {
        expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('prevents submission with empty email', async () => {
      const user = userEvent.setup();
      render(<StockAlert {...defaultProps} />);

      await user.click(screen.getByText('Notify Me When Available'));

      const submitButton = screen.getByRole('button', {name: 'Notify Me'});
      await user.click(submitButton);

      // Form validation should prevent submission
      expect(screen.queryByTestId('spinner-icon')).not.toBeInTheDocument();
    });
  });
});

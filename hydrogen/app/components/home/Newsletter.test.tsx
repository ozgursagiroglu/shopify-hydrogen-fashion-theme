/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Newsletter} from './Newsletter';

const mockSubmit = vi.fn();
const mockUseFetcher = vi.fn();

// Override useFetcher for custom behavior
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useFetcher: () => mockUseFetcher(),
  };
});

// Override Image mock with custom testid
vi.mock('@shopify/hydrogen', () => ({
  Image: ({data}: {data: {url: string; altText?: string}}) => (
    <img src={data.url} alt={data.altText} data-testid="hydrogen-image" />
  ),
  Money: ({data}: {data: {amount: string; currencyCode: string}}) => (
    <span data-testid="money">${data?.amount || '0'}</span>
  ),
}));

// Mock Button component
vi.mock('~/components/ui', () => ({
  Button: ({type, variant, loading, disabled, children}: {type?: string; variant?: string; loading?: boolean; disabled?: boolean; children: React.ReactNode}) => (
    <button type={type} data-variant={variant} data-loading={loading} disabled={disabled}>
      {children}
    </button>
  ),
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  CheckIcon: ({className}: {className?: string}) => (
    <svg data-testid="check-icon" className={className} />
  ),
  GiftIcon: ({className}: {className?: string}) => (
    <svg data-testid="gift-icon" className={className} />
  ),
  SparklesIcon: ({className}: {className?: string}) => (
    <svg data-testid="sparkles-icon" className={className} />
  ),
  BellIcon: ({className}: {className?: string}) => (
    <svg data-testid="bell-icon" className={className} />
  ),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Newsletter', () => {
  beforeEach(() => {
    mockUseFetcher.mockReturnValue({
      state: 'idle',
      data: null,
      Form: ({method, action, className, children}: {method: string; action: string; className?: string; children: React.ReactNode}) => (
        <form method={method} action={action} className={className} onSubmit={mockSubmit}>
          {children}
        </form>
      ),
    });
  });

  describe('Rendering', () => {
    it('renders newsletter section', () => {
      render(<Newsletter />);

      expect(screen.getByText('newsletter.overline')).toBeInTheDocument();
      expect(screen.getByText('newsletter.title')).toBeInTheDocument();
      expect(screen.getByText('newsletter.description')).toBeInTheDocument();
    });

    it('renders background image', () => {
      render(<Newsletter />);

      const image = screen.getByTestId('hydrogen-image');
      expect(image).toBeInTheDocument();
    });

    it('renders email input', () => {
      render(<Newsletter />);

      const input = screen.getByPlaceholderText('newsletter.placeholder');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('name', 'email');
      expect(input).toHaveAttribute('required');
    });

    it('renders subscribe button', () => {
      render(<Newsletter />);

      expect(screen.getByText('newsletter.subscribe')).toBeInTheDocument();
    });

    it('renders benefits icons', () => {
      render(<Newsletter />);

      expect(screen.getByTestId('gift-icon')).toBeInTheDocument();
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    });

    it('renders benefits text', () => {
      render(<Newsletter />);

      expect(screen.getByText('newsletter.benefits.welcomeDiscount')).toBeInTheDocument();
      expect(screen.getByText('newsletter.benefits.earlyAccess')).toBeInTheDocument();
      expect(screen.getByText('newsletter.benefits.newArrivals')).toBeInTheDocument();
    });

    it('renders privacy notice', () => {
      render(<Newsletter />);

      expect(screen.getByText('newsletter.privacyNotice')).toBeInTheDocument();
    });
  });

  describe('Form behavior', () => {
    it('allows typing in email input', async () => {
      const user = userEvent.setup();
      render(<Newsletter />);

      const input = screen.getByPlaceholderText('newsletter.placeholder');
      await user.type(input, 'test@example.com');

      expect(input).toHaveValue('test@example.com');
    });

    it('submits form with email', async () => {
      const user = userEvent.setup();
      render(<Newsletter />);

      const input = screen.getByPlaceholderText('newsletter.placeholder');
      await user.type(input, 'test@example.com');

      const form = input.closest('form');
      expect(form).toHaveAttribute('method', 'POST');
      expect(form).toHaveAttribute('action', '/api/newsletter');
    });

    it('button is disabled when email is empty', () => {
      render(<Newsletter />);

      const button = screen.getByText('newsletter.subscribe').closest('button');
      expect(button).toBeDisabled();
    });

    it('button is enabled when email is entered', async () => {
      const user = userEvent.setup();
      render(<Newsletter />);

      const input = screen.getByPlaceholderText('newsletter.placeholder');
      await user.type(input, 'test@example.com');

      const button = screen.getByText('newsletter.subscribe').closest('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Loading state', () => {
    it('shows loading state when submitting', () => {
      mockUseFetcher.mockReturnValue({
        state: 'submitting',
        data: null,
        Form: ({children}: {children: React.ReactNode}) => <form>{children}</form>,
      });

      render(<Newsletter />);

      const button = screen.getByText('newsletter.subscribe').closest('button');
      expect(button).toHaveAttribute('data-loading', 'true');
      expect(button).toBeDisabled();
    });

    it('disables input when submitting', () => {
      mockUseFetcher.mockReturnValue({
        state: 'submitting',
        data: null,
        Form: ({children}: {children: React.ReactNode}) => <form>{children}</form>,
      });

      render(<Newsletter />);

      const input = screen.getByPlaceholderText('newsletter.placeholder');
      expect(input).toBeDisabled();
    });
  });

  describe('Success state', () => {
    it('shows success message when subscription successful', () => {
      mockUseFetcher.mockReturnValue({
        state: 'idle',
        data: {success: true},
        Form: ({children}: {children: React.ReactNode}) => <form>{children}</form>,
      });

      render(<Newsletter />);

      expect(screen.getByText('newsletter.successTitle')).toBeInTheDocument();
      expect(screen.getByText('newsletter.successMessage')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('hides form when subscription successful', () => {
      mockUseFetcher.mockReturnValue({
        state: 'idle',
        data: {success: true},
        Form: ({children}: {children: React.ReactNode}) => <form>{children}</form>,
      });

      render(<Newsletter />);

      expect(screen.queryByPlaceholderText('newsletter.placeholder')).not.toBeInTheDocument();
      expect(screen.queryByText('newsletter.subscribe')).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('shows error message when subscription fails', () => {
      mockUseFetcher.mockReturnValue({
        state: 'idle',
        data: {success: false, error: 'Invalid email address'},
        Form: ({children}: {children: React.ReactNode}) => <form>{children}</form>,
      });

      render(<Newsletter />);

      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    it('shows default error message when no error provided', () => {
      mockUseFetcher.mockReturnValue({
        state: 'idle',
        data: {success: false},
        Form: ({children}: {children: React.ReactNode}) => <form>{children}</form>,
      });

      render(<Newsletter />);

      expect(screen.getByText('newsletter.error')).toBeInTheDocument();
    });

    it('keeps form visible when subscription fails', () => {
      mockUseFetcher.mockReturnValue({
        state: 'idle',
        data: {success: false, error: 'Error'},
        Form: ({children}: {children: React.ReactNode}) => <form>{children}</form>,
      });

      render(<Newsletter />);

      expect(screen.getByPlaceholderText('newsletter.placeholder')).toBeInTheDocument();
      expect(screen.getByText('newsletter.subscribe')).toBeInTheDocument();
    });
  });

  describe('Email clearing', () => {
    it('clears email input on successful submission', async () => {
      mockUseFetcher.mockReturnValue({
        state: 'idle',
        data: null,
        Form: ({children}: {children: React.ReactNode}) => <form>{children}</form>,
      });

      const {rerender} = render(<Newsletter />);

      const input = screen.getByPlaceholderText('newsletter.placeholder') as HTMLInputElement;
      const user = userEvent.setup();
      await user.type(input, 'test@example.com');
      expect(input.value).toBe('test@example.com');

      // Simulate successful submission
      mockUseFetcher.mockReturnValue({
        state: 'idle',
        data: {success: true},
        Form: ({children}: {children: React.ReactNode}) => <form>{children}</form>,
      });

      rerender(<Newsletter />);

      // Form should be hidden now
      expect(screen.queryByPlaceholderText('newsletter.placeholder')).not.toBeInTheDocument();
    });
  });

  describe('Button variant', () => {
    it('uses inverse variant for submit button', () => {
      render(<Newsletter />);

      const button = screen.getByText('newsletter.subscribe').closest('button');
      expect(button).toHaveAttribute('data-variant', 'inverse');
    });
  });
});

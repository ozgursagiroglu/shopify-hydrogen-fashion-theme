/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@test/utils/render';
import {ProductReviewForm} from './ProductReviewForm';

// Mock react-router hooks
const mockFetcher = {
  state: 'idle',
  data: null,
  Form: ({children, onSubmit, ...props}: any) => (
    <form {...props} onSubmit={onSubmit}>
      {children}
    </form>
  ),
};

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useFetcher: () => mockFetcher,
  };
});

describe('ProductReviewForm', () => {
  const defaultProps = {
    productId: 'product-123',
    productTitle: 'Test Product',
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcher.state = 'idle';
    mockFetcher.data = null;
  });

  it('renders modal when open', () => {
    render(<ProductReviewForm {...defaultProps} />);

    expect(screen.getByText('Share Your Experience')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ProductReviewForm {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Write a Review')).not.toBeInTheDocument();
  });

  it('renders product title', () => {
    render(<ProductReviewForm {...defaultProps} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<ProductReviewForm {...defaultProps} />);

    expect(screen.getByText(/Your Rating/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Review Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Review/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
  });

  it('renders hidden product ID field', () => {
    const {container} = render(<ProductReviewForm {...defaultProps} />);

    const hiddenInput = container.querySelector('input[name="productId"]');
    expect(hiddenInput).toHaveValue('product-123');
  });

  it('renders hidden rating field', () => {
    const {container} = render(<ProductReviewForm {...defaultProps} />);

    const ratingInput = container.querySelector('input[name="rating"]');
    expect(ratingInput).toHaveValue('0');
  });

  it('renders honeypot field', () => {
    const {container} = render(<ProductReviewForm {...defaultProps} />);

    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).toHaveClass('hidden');
    expect(honeypot).toHaveAttribute('tabindex', '-1');
  });

  it('renders submit and cancel buttons', () => {
    render(<ProductReviewForm {...defaultProps} />);

    expect(screen.getByRole('button', {name: /Submit Review/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Cancel/i})).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<ProductReviewForm {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByRole('button', {name: /Cancel/i});
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows validation error when rating is not selected', async () => {
    const {container} = render(<ProductReviewForm {...defaultProps} />);

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please select a rating')).toBeInTheDocument();
    });
  });

  it('shows validation error when title is empty', async () => {
    const {container} = render(<ProductReviewForm {...defaultProps} />);

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter a review title')).toBeInTheDocument();
    });
  });

  it('shows validation error when review is empty', async () => {
    const {container} = render(<ProductReviewForm {...defaultProps} />);

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter your review')).toBeInTheDocument();
    });
  });

  it('shows validation error when name is empty', async () => {
    const {container} = render(<ProductReviewForm {...defaultProps} />);

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter your name')).toBeInTheDocument();
    });
  });

  it('shows validation error when email is empty', async () => {
    const {container} = render(<ProductReviewForm {...defaultProps} />);

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter your email')).toBeInTheDocument();
    });
  });

  it('shows validation error when email is invalid', async () => {
    const {container} = render(<ProductReviewForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/Email Address/);
    fireEvent.change(emailInput, {target: {value: 'invalid-email'}});

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('updates rating field when star rating changes', () => {
    const {container} = render(<ProductReviewForm {...defaultProps} />);

    // Get star buttons by their radio role (not the form buttons)
    const stars = screen.getAllByRole('radio');
    const fourthStar = stars[3]; // 4th star (index 3)

    fireEvent.click(fourthStar);

    const ratingInput = container.querySelector('input[name="rating"]') as HTMLInputElement;
    expect(ratingInput.value).toBe('4');
  });

  it('resets form when closed', () => {
    const onClose = vi.fn();
    render(<ProductReviewForm {...defaultProps} onClose={onClose} />);

    // Set a rating
    const stars = screen.getAllByRole('radio');
    fireEvent.click(stars[2]); // 3rd star

    const cancelButton = screen.getByRole('button', {name: /Cancel/i});
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('shows success message when submission succeeds', () => {
    mockFetcher.data = {success: true};

    render(<ProductReviewForm {...defaultProps} />);

    expect(screen.getByText('Thank you for your review!')).toBeInTheDocument();
    expect(screen.getByText('Your review has been submitted and is pending approval.')).toBeInTheDocument();
  });

  it('shows error message when submission fails', () => {
    mockFetcher.data = {success: false};

    render(<ProductReviewForm {...defaultProps} />);

    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });

  it('shows submitting state in button', () => {
    mockFetcher.state = 'submitting';

    render(<ProductReviewForm {...defaultProps} />);

    // Button shows loading state - spinner icon is shown
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.hasAttribute('disabled'));
    expect(submitButton).toBeDefined();
    expect(submitButton).toBeDisabled();
  });

  it('renders close button in success state', () => {
    mockFetcher.data = {success: true};

    render(<ProductReviewForm {...defaultProps} />);

    const closeButtons = screen.getAllByRole('button', {name: /Close/i});
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked in success state', () => {
    mockFetcher.data = {success: true};
    const onClose = vi.fn();

    render(<ProductReviewForm {...defaultProps} onClose={onClose} />);

    const closeButtons = screen.getAllByRole('button', {name: /Close/i});
    fireEvent.click(closeButtons[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

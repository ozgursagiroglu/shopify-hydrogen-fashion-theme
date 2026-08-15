/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@test/utils/render';
import {OrderSearchForm} from './OrderSearchForm';

// Mock react-router hooks
const mockSetSearchParams = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
    useNavigation: () => ({state: 'idle', location: null}),
  };
});

describe('OrderSearchForm', () => {
  beforeEach(() => {
    mockSetSearchParams.mockClear();
  });

  it('renders order name input', () => {
    render(<OrderSearchForm currentFilters={{name: null, confirmationNumber: null}} />);

    const input = screen.getByLabelText('Order #');
    expect(input).toBeInTheDocument();
  });

  it('renders confirmation number input', () => {
    render(<OrderSearchForm currentFilters={{name: null, confirmationNumber: null}} />);

    const input = screen.getByLabelText('Confirmation #');
    expect(input).toBeInTheDocument();
  });

  it('renders search button', () => {
    render(<OrderSearchForm currentFilters={{name: null, confirmationNumber: null}} />);

    expect(screen.getByRole('button', {name: 'Search'})).toBeInTheDocument();
  });

  it('does not render clear button when no filters', () => {
    render(<OrderSearchForm currentFilters={{name: null, confirmationNumber: null}} />);

    expect(screen.queryByRole('button', {name: 'Clear'})).not.toBeInTheDocument();
  });

  it('renders clear button when name filter exists', () => {
    render(<OrderSearchForm currentFilters={{name: 'test', confirmationNumber: null}} />);

    expect(screen.getByRole('button', {name: 'Clear'})).toBeInTheDocument();
  });

  it('renders clear button when confirmation number filter exists', () => {
    render(<OrderSearchForm currentFilters={{name: null, confirmationNumber: 'ABC123'}} />);

    expect(screen.getByRole('button', {name: 'Clear'})).toBeInTheDocument();
  });

  it('populates inputs with current filters', () => {
    render(
      <OrderSearchForm
        currentFilters={{name: 'test order', confirmationNumber: 'ABC123'}}
      />
    );

    const nameInput = screen.getByLabelText('Order #') as HTMLInputElement;
    const confirmationInput = screen.getByLabelText('Confirmation #') as HTMLInputElement;

    expect(nameInput.value).toBe('test order');
    expect(confirmationInput.value).toBe('ABC123');
  });

  it('submits form with name only', () => {
    render(<OrderSearchForm currentFilters={{name: null, confirmationNumber: null}} />);

    const nameInput = screen.getByLabelText('Order #');
    const submitButton = screen.getByRole('button', {name: 'Search'});

    fireEvent.change(nameInput, {target: {value: 'test order'}});
    fireEvent.click(submitButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('submits form with confirmation number only', () => {
    render(<OrderSearchForm currentFilters={{name: null, confirmationNumber: null}} />);

    const confirmationInput = screen.getByLabelText('Confirmation #');
    const submitButton = screen.getByRole('button', {name: 'Search'});

    fireEvent.change(confirmationInput, {target: {value: 'ABC123'}});
    fireEvent.click(submitButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('clears filters when clear button is clicked', () => {
    render(<OrderSearchForm currentFilters={{name: 'test', confirmationNumber: 'ABC'}} />);

    const clearButton = screen.getByRole('button', {name: 'Clear'});
    fireEvent.click(clearButton);

    expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams));
  });

  it('has correct form aria-label', () => {
    const {container} = render(
      <OrderSearchForm currentFilters={{name: null, confirmationNumber: null}} />
    );

    const form = container.querySelector('form');
    expect(form).toHaveAttribute('aria-label', 'Order History');
  });

  it('has correct container styling', () => {
    const {container} = render(
      <OrderSearchForm currentFilters={{name: null, confirmationNumber: null}} />
    );

    const form = container.querySelector('form');
    expect(form).toHaveClass('p-4', 'md:p-6', 'bg-surface-alt', 'rounded-lg');
  });
});

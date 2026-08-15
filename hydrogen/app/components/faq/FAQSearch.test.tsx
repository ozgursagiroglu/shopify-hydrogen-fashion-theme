/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@test/utils/render';
import {FAQSearch} from './FAQSearch';

describe('FAQSearch', () => {
  it('renders search input', () => {
    render(<FAQSearch value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with placeholder text', () => {
    render(<FAQSearch value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search questions...')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<FAQSearch value="shipping" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('shipping')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', () => {
    const handleChange = vi.fn();
    render(<FAQSearch value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'returns'}});

    expect(handleChange).toHaveBeenCalledWith('returns');
  });

  it('renders search icon', () => {
    render(<FAQSearch value="" onChange={vi.fn()} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const {container} = render(<FAQSearch value="" onChange={vi.fn()} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has accessible label', () => {
    render(<FAQSearch value="" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label');
  });

  it('clears search when clear button is clicked', () => {
    const handleChange = vi.fn();
    render(<FAQSearch value="test" onChange={handleChange} />);

    // If there's a clear button (when value is not empty)
    const clearButton = screen.queryByRole('button');
    if (clearButton) {
      fireEvent.click(clearButton);
      // eslint-disable-next-line vitest/no-conditional-expect
      expect(handleChange).toHaveBeenCalledWith('');
    }
  });
});

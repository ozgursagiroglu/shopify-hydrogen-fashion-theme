/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@test/utils/render';
import {Textarea} from './Textarea';

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with a label', () => {
    render(<Textarea label="Message" name="message" />);
    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(<Textarea error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays helper text when helperText prop is provided', () => {
    render(<Textarea helperText="Enter your message" />);
    expect(screen.getByText('Enter your message')).toBeInTheDocument();
  });

  it('prioritizes error over helper text', () => {
    render(<Textarea error="Error message" helperText="Helper text" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Textarea error="Error" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-error');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {target: {value: 'Test message'}});

    expect(handleChange).toHaveBeenCalled();
  });

  it('accepts placeholder text', () => {
    render(<Textarea placeholder="Enter your message here" />);
    expect(screen.getByPlaceholderText('Enter your message here')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('accepts rows prop', () => {
    render(<Textarea rows={6} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '6');
  });

  it('can be required', () => {
    render(<Textarea required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('forwards ref to textarea element', () => {
    const ref = vi.fn();
    render(<Textarea ref={ref} />);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('applies aria-invalid when error is present', () => {
    render(<Textarea error="Error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
});

/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Input} from './Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders an input element', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter your name" />);

      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<Input defaultValue="John Doe" />);

      expect(screen.getByRole('textbox')).toHaveValue('John Doe');
    });
  });

  describe('Label', () => {
    it('renders label when provided', () => {
      render(<Input label="Email" name="email" />);

      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('associates label with input via htmlFor', () => {
      render(<Input label="Email" name="email" />);

      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'email');
      expect(input).toHaveAttribute('id', 'email');
    });

    it('uses id prop over name for label association', () => {
      render(<Input label="Email" id="email-field" name="email" />);

      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'email-field');
      expect(input).toHaveAttribute('id', 'email-field');
    });

    it('does not render label when not provided', () => {
      render(<Input name="email" />);

      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('displays error message when error prop is provided', () => {
      render(<Input error="This field is required" name="email" />);

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('sets aria-invalid to true when error', () => {
      render(<Input error="Error message" name="email" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-invalid to false when no error', () => {
      render(<Input name="email" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });

    it('sets aria-describedby to error id when error', () => {
      render(<Input error="Error message" name="email" />);

      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByText('Error message');

      expect(input).toHaveAttribute('aria-describedby', 'email-error');
      expect(errorMessage).toHaveAttribute('id', 'email-error');
    });

    it('applies error styling classes', () => {
      render(<Input error="Error" name="email" />);

      const input = screen.getByRole('textbox');
      expect(input.className).toContain('border-error');
    });
  });

  describe('Helper text', () => {
    it('displays helper text when provided', () => {
      render(<Input helperText="We'll never share your email" name="email" />);

      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });

    it('does not display helper text when error is shown', () => {
      render(
        <Input
          helperText="Helper text"
          error="Error message"
          name="email"
        />,
      );

      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('applies muted text styling to helper text', () => {
      render(<Input helperText="Helper text" name="email" />);

      const helperText = screen.getByText('Helper text');
      expect(helperText.className).toContain('text-text-muted');
    });
  });

  describe('Interactions', () => {
    it('allows typing', async () => {
      const user = userEvent.setup();
      render(<Input name="email" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test@example.com');

      expect(input).toHaveValue('test@example.com');
    });

    it('calls onChange when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input name="email" onChange={handleChange} />);

      await user.type(screen.getByRole('textbox'), 'a');

      expect(handleChange).toHaveBeenCalled();
    });

    it('calls onBlur when input loses focus', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();

      render(<Input name="email" onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Input types', () => {
    it('supports email type', () => {
      render(<Input type="email" name="email" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('supports password type', () => {
      render(<Input type="password" name="password" />);

      // Password inputs don't have textbox role
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('supports tel type', () => {
      render(<Input type="tel" name="phone" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');
    });
  });

  describe('Disabled state', () => {
    it('can be disabled', () => {
      render(<Input disabled name="email" />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('does not allow typing when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled name="email" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(input).toHaveValue('');
    });
  });

  describe('Required state', () => {
    it('can be marked as required', () => {
      render(<Input required name="email" />);

      expect(screen.getByRole('textbox')).toBeRequired();
    });
  });

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(<Input className="custom-input" name="email" />);

      const input = screen.getByRole('textbox');
      expect(input.className).toContain('custom-input');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn();
      render(<Input ref={ref} name="email" />);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });
  });
});

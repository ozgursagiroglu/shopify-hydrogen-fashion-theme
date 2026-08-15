/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Select} from './Select';

// Mock ChevronDownIcon
vi.mock('~/components/icons', () => ({
  ChevronDownIcon: ({className}: {className?: string}) => (
    <svg data-testid="chevron-icon" className={className} />
  ),
}));

const defaultOptions = [
  {label: 'Option 1', value: 'option-1'},
  {label: 'Option 2', value: 'option-2'},
  {label: 'Option 3', value: 'option-3'},
];

describe('Select', () => {
  describe('Rendering', () => {
    it('renders a select element', () => {
      render(<Select options={defaultOptions} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders all options', () => {
      render(<Select options={defaultOptions} />);

      expect(screen.getByRole('option', {name: 'Option 1'})).toBeInTheDocument();
      expect(screen.getByRole('option', {name: 'Option 2'})).toBeInTheDocument();
      expect(screen.getByRole('option', {name: 'Option 3'})).toBeInTheDocument();
    });

    it('renders chevron icon', () => {
      render(<Select options={defaultOptions} />);

      expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
    });
  });

  describe('Placeholder', () => {
    it('renders placeholder option when provided', () => {
      render(<Select options={defaultOptions} placeholder="Select an option" />);

      const placeholder = screen.getByRole('option', {name: 'Select an option'});
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toBeDisabled();
    });

    it('does not render placeholder when not provided', () => {
      render(<Select options={defaultOptions} />);

      expect(screen.queryByRole('option', {name: 'Select an option'})).not.toBeInTheDocument();
    });
  });

  describe('Label', () => {
    it('renders label when provided', () => {
      render(<Select options={defaultOptions} label="Choose size" />);

      expect(screen.getByText('Choose size')).toBeInTheDocument();
    });

    it('does not render label when not provided', () => {
      render(<Select options={defaultOptions} />);

      expect(screen.queryByText('Choose size')).not.toBeInTheDocument();
    });

    it('applies label styling', () => {
      render(<Select options={defaultOptions} label="Choose size" />);

      const label = screen.getByText('Choose size');
      expect(label.className).toContain('text-sm');
      expect(label.className).toContain('font-medium');
    });
  });

  describe('Size variants', () => {
    it('applies sm size classes', () => {
      render(<Select options={defaultOptions} size="sm" />);

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('h-9');
    });

    it('applies md size classes by default', () => {
      render(<Select options={defaultOptions} />);

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('h-11');
    });

    it('applies lg size classes', () => {
      render(<Select options={defaultOptions} size="lg" />);

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('h-12');
    });
  });

  describe('Error state', () => {
    it('applies error styling when error is true', () => {
      render(<Select options={defaultOptions} error />);

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('border-error');
    });

    it('applies error styling to helper text', () => {
      render(<Select options={defaultOptions} error helperText="This field is required" />);

      const helperText = screen.getByText('This field is required');
      expect(helperText.className).toContain('text-error');
    });

    it('applies normal styling when no error', () => {
      render(<Select options={defaultOptions} />);

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('border-border');
    });
  });

  describe('Helper text', () => {
    it('renders helper text when provided', () => {
      render(<Select options={defaultOptions} helperText="Please select an option" />);

      expect(screen.getByText('Please select an option')).toBeInTheDocument();
    });

    it('applies muted styling to helper text without error', () => {
      render(<Select options={defaultOptions} helperText="Please select an option" />);

      const helperText = screen.getByText('Please select an option');
      expect(helperText.className).toContain('text-text-muted');
    });

    it('does not render helper text when not provided', () => {
      render(<Select options={defaultOptions} />);

      const helperTexts = document.querySelectorAll('p');
      expect(helperTexts).toHaveLength(0);
    });
  });

  describe('Disabled state', () => {
    it('can be disabled', () => {
      render(<Select options={defaultOptions} disabled />);

      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('applies disabled styling', () => {
      render(<Select options={defaultOptions} disabled />);

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('disabled:opacity-50');
      expect(select.className).toContain('disabled:cursor-not-allowed');
    });
  });

  describe('Disabled options', () => {
    it('renders disabled options', () => {
      const optionsWithDisabled = [
        {label: 'Option 1', value: 'option-1'},
        {label: 'Option 2', value: 'option-2', disabled: true},
        {label: 'Option 3', value: 'option-3'},
      ];

      render(<Select options={optionsWithDisabled} />);

      const disabledOption = screen.getByRole('option', {name: 'Option 2'});
      expect(disabledOption).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('allows selecting an option', async () => {
      const user = userEvent.setup();
      render(<Select options={defaultOptions} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'option-2');

      expect(select).toHaveValue('option-2');
    });

    it('calls onChange when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Select options={defaultOptions} onChange={handleChange} />);

      await user.selectOptions(screen.getByRole('combobox'), 'option-2');

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(<Select options={defaultOptions} className="custom-select" />);

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('custom-select');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to select element', () => {
      const ref = vi.fn();
      render(<Select ref={ref} options={defaultOptions} />);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLSelectElement));
    });
  });

  describe('Additional props', () => {
    it('passes through additional props', () => {
      render(
        <Select
          options={defaultOptions}
          name="country"
          id="country-select"
          data-testid="country"
        />,
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('name', 'country');
      expect(select).toHaveAttribute('id', 'country-select');
    });
  });
});

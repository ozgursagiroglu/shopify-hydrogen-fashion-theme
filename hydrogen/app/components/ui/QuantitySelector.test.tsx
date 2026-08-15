/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {QuantitySelector} from './QuantitySelector';

// Mock icons
vi.mock('~/components/icons', () => ({
  MinusIcon: ({className, strokeWidth}: {className?: string; strokeWidth?: number}) => (
    <svg
      data-testid="minus-icon"
      className={className}
      data-stroke-width={strokeWidth}
    />
  ),
  PlusIcon: ({className, strokeWidth}: {className?: string; strokeWidth?: number}) => (
    <svg
      data-testid="plus-icon"
      className={className}
      data-stroke-width={strokeWidth}
    />
  ),
}));

describe('QuantitySelector', () => {
  const defaultProps = {
    value: 1,
    onChange: vi.fn(),
  };

  describe('Rendering', () => {
    it('renders quantity value', () => {
      render(<QuantitySelector {...defaultProps} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders decrease button', () => {
      render(<QuantitySelector {...defaultProps} />);

      expect(screen.getByRole('button', {name: /decrease quantity/i})).toBeInTheDocument();
    });

    it('renders increase button', () => {
      render(<QuantitySelector {...defaultProps} />);

      expect(screen.getByRole('button', {name: /increase quantity/i})).toBeInTheDocument();
    });

    it('renders minus icon', () => {
      render(<QuantitySelector {...defaultProps} />);

      expect(screen.getByTestId('minus-icon')).toBeInTheDocument();
    });

    it('renders plus icon', () => {
      render(<QuantitySelector {...defaultProps} />);

      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(
        <QuantitySelector {...defaultProps} className="custom-selector" />,
      );

      const selector = container.querySelector('.custom-selector');
      expect(selector).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('displays current value', () => {
      render(<QuantitySelector value={5} onChange={vi.fn()} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays large values', () => {
      render(<QuantitySelector value={99} onChange={vi.fn()} />);

      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('applies tabular-nums class for consistent width', () => {
      const {container} = render(<QuantitySelector {...defaultProps} />);

      const valueDisplay = container.querySelector('.tabular-nums');
      expect(valueDisplay).toBeInTheDocument();
    });

    it('centers the value', () => {
      const {container} = render(<QuantitySelector {...defaultProps} />);

      const valueDisplay = container.querySelector('.text-center');
      expect(valueDisplay).toBeInTheDocument();
    });
  });

  describe('Increase Functionality', () => {
    it('calls onChange with increased value', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<QuantitySelector value={1} onChange={onChange} />);

      await user.click(screen.getByRole('button', {name: /increase quantity/i}));

      expect(onChange).toHaveBeenCalledWith(2);
    });

    it('increases from current value', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<QuantitySelector value={5} onChange={onChange} />);

      await user.click(screen.getByRole('button', {name: /increase quantity/i}));

      expect(onChange).toHaveBeenCalledWith(6);
    });

    it('does not increase beyond max', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<QuantitySelector value={10} onChange={onChange} max={10} />);

      await user.click(screen.getByRole('button', {name: /increase quantity/i}));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('disables increase button at max value', () => {
      render(<QuantitySelector value={10} onChange={vi.fn()} max={10} />);

      const increaseBtn = screen.getByRole('button', {name: /increase quantity/i});
      expect(increaseBtn).toBeDisabled();
    });
  });

  describe('Decrease Functionality', () => {
    it('calls onChange with decreased value', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<QuantitySelector value={2} onChange={onChange} />);

      await user.click(screen.getByRole('button', {name: /decrease quantity/i}));

      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('decreases from current value', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<QuantitySelector value={10} onChange={onChange} />);

      await user.click(screen.getByRole('button', {name: /decrease quantity/i}));

      expect(onChange).toHaveBeenCalledWith(9);
    });

    it('does not decrease below min', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<QuantitySelector value={1} onChange={onChange} min={1} />);

      await user.click(screen.getByRole('button', {name: /decrease quantity/i}));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('disables decrease button at min value', () => {
      render(<QuantitySelector value={1} onChange={vi.fn()} min={1} />);

      const decreaseBtn = screen.getByRole('button', {name: /decrease quantity/i});
      expect(decreaseBtn).toBeDisabled();
    });
  });

  describe('Min/Max Bounds', () => {
    it('uses default min of 1', () => {
      render(<QuantitySelector value={1} onChange={vi.fn()} />);

      const decreaseBtn = screen.getByRole('button', {name: /decrease quantity/i});
      expect(decreaseBtn).toBeDisabled();
    });

    it('uses default max of 99', () => {
      render(<QuantitySelector value={99} onChange={vi.fn()} />);

      const increaseBtn = screen.getByRole('button', {name: /increase quantity/i});
      expect(increaseBtn).toBeDisabled();
    });

    it('respects custom min value', () => {
      render(<QuantitySelector value={5} onChange={vi.fn()} min={5} />);

      const decreaseBtn = screen.getByRole('button', {name: /decrease quantity/i});
      expect(decreaseBtn).toBeDisabled();
    });

    it('respects custom max value', () => {
      render(<QuantitySelector value={20} onChange={vi.fn()} max={20} />);

      const increaseBtn = screen.getByRole('button', {name: /increase quantity/i});
      expect(increaseBtn).toBeDisabled();
    });

    it('allows values between custom min and max', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<QuantitySelector value={15} onChange={onChange} min={10} max={20} />);

      await user.click(screen.getByRole('button', {name: /increase quantity/i}));
      expect(onChange).toHaveBeenCalledWith(16);

      onChange.mockClear();

      await user.click(screen.getByRole('button', {name: /decrease quantity/i}));
      expect(onChange).toHaveBeenCalledWith(14);
    });
  });

  describe('Disabled State', () => {
    it('disables both buttons when disabled', () => {
      render(<QuantitySelector value={5} onChange={vi.fn()} disabled />);

      const decreaseBtn = screen.getByRole('button', {name: /decrease quantity/i});
      const increaseBtn = screen.getByRole('button', {name: /increase quantity/i});

      expect(decreaseBtn).toBeDisabled();
      expect(increaseBtn).toBeDisabled();
    });

    it('applies opacity when disabled', () => {
      const {container} = render(
        <QuantitySelector value={5} onChange={vi.fn()} disabled />,
      );

      const selector = container.querySelector('.opacity-50');
      expect(selector).toBeInTheDocument();
    });

    it('does not call onChange when disabled', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<QuantitySelector value={5} onChange={onChange} disabled />);

      await user.click(screen.getByRole('button', {name: /increase quantity/i}));
      await user.click(screen.getByRole('button', {name: /decrease quantity/i}));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on decrease button', () => {
      render(<QuantitySelector {...defaultProps} />);

      const decreaseBtn = screen.getByRole('button', {name: /decrease quantity/i});
      expect(decreaseBtn).toHaveAttribute('aria-label', 'Decrease quantity');
    });

    it('has aria-label on increase button', () => {
      render(<QuantitySelector {...defaultProps} />);

      const increaseBtn = screen.getByRole('button', {name: /increase quantity/i});
      expect(increaseBtn).toHaveAttribute('aria-label', 'Increase quantity');
    });

    it('buttons have type="button"', () => {
      render(<QuantitySelector {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Button Styles', () => {
    it('applies hover styles to buttons', () => {
      render(<QuantitySelector {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toContain('hover:text-text');
        expect(button.className).toContain('hover:bg-surface-hover');
      });
    });

    it('applies disabled cursor styles', () => {
      render(<QuantitySelector value={1} onChange={vi.fn()} min={1} />);

      const decreaseBtn = screen.getByRole('button', {name: /decrease quantity/i});
      expect(decreaseBtn.className).toContain('disabled:cursor-not-allowed');
    });

    it('applies transition styles', () => {
      render(<QuantitySelector {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toContain('transition-colors');
      });
    });
  });

  describe('Layout', () => {
    it('has inline-flex layout', () => {
      const {container} = render(<QuantitySelector {...defaultProps} />);

      const selector = container.querySelector('.inline-flex');
      expect(selector).toBeInTheDocument();
    });

    it('has border and rounded corners', () => {
      const {container} = render(<QuantitySelector {...defaultProps} />);

      const selector = container.querySelector('.border');
      expect(selector).toBeInTheDocument();
      expect(selector).toHaveClass('rounded-md');
    });

    it('buttons have fixed dimensions', () => {
      render(<QuantitySelector {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toContain('w-10');
        expect(button.className).toContain('h-10');
      });
    });

    it('value display has fixed width', () => {
      render(<QuantitySelector {...defaultProps} />);

      const valueDisplay = screen.getByText('1');
      expect(valueDisplay.className).toContain('w-12');
    });
  });

  describe('Icon Props', () => {
    it('passes strokeWidth to icons', () => {
      render(<QuantitySelector {...defaultProps} />);

      const minusIcon = screen.getByTestId('minus-icon');
      const plusIcon = screen.getByTestId('plus-icon');

      expect(minusIcon).toHaveAttribute('data-stroke-width', '2');
      expect(plusIcon).toHaveAttribute('data-stroke-width', '2');
    });

    it('applies size classes to icons', () => {
      render(<QuantitySelector {...defaultProps} />);

      const minusIcon = screen.getByTestId('minus-icon');
      const plusIcon = screen.getByTestId('plus-icon');

      const minusClasses = minusIcon.getAttribute('class') || '';
      const plusClasses = plusIcon.getAttribute('class') || '';

      expect(minusClasses).toContain('h-4');
      expect(minusClasses).toContain('w-4');
      expect(plusClasses).toContain('h-4');
      expect(plusClasses).toContain('w-4');
    });
  });

  describe('Multiple Interactions', () => {
    it('handles multiple increases', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      const {rerender} = render(<QuantitySelector value={1} onChange={onChange} />);

      const increaseBtn = screen.getByRole('button', {name: /increase quantity/i});

      await user.click(increaseBtn);
      expect(onChange).toHaveBeenCalledWith(2);

      onChange.mockClear();
      rerender(<QuantitySelector value={2} onChange={onChange} />);

      await user.click(screen.getByRole('button', {name: /increase quantity/i}));
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('handles multiple decreases', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      const {rerender} = render(<QuantitySelector value={5} onChange={onChange} />);

      const decreaseBtn = screen.getByRole('button', {name: /decrease quantity/i});

      await user.click(decreaseBtn);
      expect(onChange).toHaveBeenCalledWith(4);

      onChange.mockClear();
      rerender(<QuantitySelector value={4} onChange={onChange} />);

      await user.click(screen.getByRole('button', {name: /decrease quantity/i}));
      expect(onChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles value of 0 with min of 0', () => {
      render(<QuantitySelector value={0} onChange={vi.fn()} min={0} />);

      const decreaseBtn = screen.getByRole('button', {name: /decrease quantity/i});
      expect(decreaseBtn).toBeDisabled();
    });

    it('handles large max values', () => {
      render(<QuantitySelector value={999} onChange={vi.fn()} max={1000} />);

      const increaseBtn = screen.getByRole('button', {name: /increase quantity/i});
      expect(increaseBtn).not.toBeDisabled();
    });

    it('handles min equal to max', () => {
      render(<QuantitySelector value={5} onChange={vi.fn()} min={5} max={5} />);

      const decreaseBtn = screen.getByRole('button', {name: /decrease quantity/i});
      const increaseBtn = screen.getByRole('button', {name: /increase quantity/i});

      expect(decreaseBtn).toBeDisabled();
      expect(increaseBtn).toBeDisabled();
    });
  });
});

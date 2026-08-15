/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {SizeSelector} from './SizeSelector';

describe('SizeSelector', () => {
  const defaultSizes = [
    {value: 'xs', label: 'XS', available: true},
    {value: 's', label: 'S', available: true},
    {value: 'm', label: 'M', available: true},
    {value: 'l', label: 'L', available: false},
    {value: 'xl', label: 'XL', available: true},
  ];

  const defaultProps = {
    sizes: defaultSizes,
    selectedSize: null,
    onSelect: vi.fn(),
  };

  describe('Rendering', () => {
    it('renders all size options', () => {
      render(<SizeSelector {...defaultProps} />);

      expect(screen.getByRole('radio', {name: 'XS'})).toBeInTheDocument();
      expect(screen.getByRole('radio', {name: 'S'})).toBeInTheDocument();
      expect(screen.getByRole('radio', {name: 'M'})).toBeInTheDocument();
      expect(screen.getByRole('radio', {name: /^L/})).toBeInTheDocument();
      expect(screen.getByRole('radio', {name: 'XL'})).toBeInTheDocument();
    });

    it('renders size labels', () => {
      render(<SizeSelector {...defaultProps} />);

      expect(screen.getByText('XS')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
      expect(screen.getByText('XL')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(
        <SizeSelector {...defaultProps} className="custom-selector" />,
      );

      const selector = container.querySelector('.custom-selector');
      expect(selector).toBeInTheDocument();
    });

    it('renders with empty sizes array', () => {
      render(
        <SizeSelector sizes={[]} selectedSize={null} onSelect={vi.fn()} />,
      );

      const radios = screen.queryAllByRole('radio');
      expect(radios).toHaveLength(0);
    });

    it('renders radiogroup container', () => {
      render(<SizeSelector {...defaultProps} />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('calls onSelect when available size is clicked', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<SizeSelector {...defaultProps} onSelect={onSelect} />);

      await user.click(screen.getByRole('radio', {name: 'M'}));

      expect(onSelect).toHaveBeenCalledWith('m');
    });

    it('highlights selected size', () => {
      render(<SizeSelector {...defaultProps} selectedSize="m" />);

      const selectedRadio = screen.getByRole('radio', {name: 'M'});
      expect(selectedRadio.className).toContain('bg-primary');
      expect(selectedRadio.className).toContain('text-text-inverse');
      expect(selectedRadio.className).toContain('border-primary');
    });

    it('applies non-selected styles to unselected sizes', () => {
      render(<SizeSelector {...defaultProps} selectedSize="m" />);

      const unselectedRadio = screen.getByRole('radio', {name: 'S'});
      expect(unselectedRadio.className).toContain('bg-surface');
      expect(unselectedRadio.className).toContain('border-border');
    });

    it('updates selection when selectedSize prop changes', () => {
      const {rerender} = render(<SizeSelector {...defaultProps} selectedSize="s" />);

      let selectedRadio = screen.getByRole('radio', {name: 'S'});
      expect(selectedRadio.className).toContain('bg-primary');

      rerender(<SizeSelector {...defaultProps} selectedSize="xl" />);

      selectedRadio = screen.getByRole('radio', {name: 'XL'});
      expect(selectedRadio.className).toContain('bg-primary');
    });
  });

  describe('Availability', () => {
    it('disables unavailable sizes', () => {
      render(<SizeSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {name: /l - out of stock/i});
      expect(unavailableRadio).toBeDisabled();
    });

    it('does not disable available sizes', () => {
      render(<SizeSelector {...defaultProps} />);

      const availableRadio = screen.getByRole('radio', {name: 'M'});
      expect(availableRadio).not.toBeDisabled();
    });

    it('applies unavailable styles', () => {
      render(<SizeSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {name: /l - out of stock/i});
      expect(unavailableRadio.className).toContain('opacity-40');
      expect(unavailableRadio.className).toContain('cursor-not-allowed');
      expect(unavailableRadio.className).toContain('line-through');
    });

    it('does not call onSelect when unavailable size is clicked', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<SizeSelector {...defaultProps} onSelect={onSelect} />);

      await user.click(screen.getByRole('radio', {name: /l - out of stock/i}));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('indicates out of stock in aria-label', () => {
      render(<SizeSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {name: 'L - Out of Stock'});
      expect(unavailableRadio).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on each radio', () => {
      render(<SizeSelector {...defaultProps} />);

      expect(screen.getByRole('radio', {name: 'XS'})).toHaveAttribute(
        'aria-label',
        'XS',
      );
      expect(screen.getByRole('radio', {name: 'M'})).toHaveAttribute(
        'aria-label',
        'M',
      );
    });

    it('has aria-checked attribute', () => {
      render(<SizeSelector {...defaultProps} selectedSize="m" />);

      const selectedRadio = screen.getByRole('radio', {name: 'M'});
      expect(selectedRadio).toHaveAttribute('aria-checked', 'true');

      const unselectedRadio = screen.getByRole('radio', {name: 'S'});
      expect(unselectedRadio).toHaveAttribute('aria-checked', 'false');
    });

    it('radios have type="button"', () => {
      render(<SizeSelector {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('type', 'button');
      });
    });

    it('has radiogroup with label', () => {
      render(<SizeSelector {...defaultProps} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-label', 'Size');
    });

    it('supports custom radiogroup label', () => {
      render(<SizeSelector {...defaultProps} label="Select Size" />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-label', 'Select Size');
    });
  });

  describe('Button Styles', () => {
    it('applies base styles to all radios', () => {
      render(<SizeSelector {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio.className).toContain('min-w-[3rem]');
        expect(radio.className).toContain('h-10');
        expect(radio.className).toContain('px-3');
        expect(radio.className).toContain('text-sm');
        expect(radio.className).toContain('font-medium');
        expect(radio.className).toContain('border');
        expect(radio.className).toContain('rounded-md');
      });
    });

    it('applies hover styles to available radios', () => {
      render(<SizeSelector {...defaultProps} />);

      const availableRadio = screen.getByRole('radio', {name: 'M'});
      expect(availableRadio.className).toContain('hover:border-border-hover');
    });

    it('applies transition-all for smooth changes', () => {
      render(<SizeSelector {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio.className).toContain('transition-all');
      });
    });
  });

  describe('Layout', () => {
    it('uses flex layout with gap', () => {
      const {container} = render(<SizeSelector {...defaultProps} />);

      const selector = container.firstChild;
      expect(selector).toHaveClass('flex');
      expect(selector).toHaveClass('flex-wrap');
      expect(selector).toHaveClass('gap-2');
    });
  });

  describe('Different Size Options', () => {
    it('renders numeric sizes', () => {
      const numericSizes = [
        {value: '36', label: '36', available: true},
        {value: '38', label: '38', available: true},
        {value: '40', label: '40', available: false},
      ];

      render(<SizeSelector sizes={numericSizes} selectedSize={null} onSelect={vi.fn()} />);

      expect(screen.getByText('36')).toBeInTheDocument();
      expect(screen.getByText('38')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
    });

    it('renders single size', () => {
      const singleSize = [{value: 'onesize', label: 'One Size', available: true}];

      render(<SizeSelector sizes={singleSize} selectedSize={null} onSelect={vi.fn()} />);

      expect(screen.getByText('One Size')).toBeInTheDocument();
    });

    it('renders custom labels', () => {
      const customSizes = [
        {value: 'petite', label: 'Petite', available: true},
        {value: 'regular', label: 'Regular', available: true},
        {value: 'tall', label: 'Tall', available: true},
      ];

      render(<SizeSelector sizes={customSizes} selectedSize={null} onSelect={vi.fn()} />);

      expect(screen.getByText('Petite')).toBeInTheDocument();
      expect(screen.getByText('Regular')).toBeInTheDocument();
      expect(screen.getByText('Tall')).toBeInTheDocument();
    });
  });

  describe('Multiple Selections', () => {
    it('allows changing selection', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<SizeSelector {...defaultProps} onSelect={onSelect} />);

      await user.click(screen.getByRole('radio', {name: 'S'}));
      expect(onSelect).toHaveBeenCalledWith('s');

      onSelect.mockClear();

      await user.click(screen.getByRole('radio', {name: 'M'}));
      expect(onSelect).toHaveBeenCalledWith('m');
    });

    it('allows reselecting same size', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<SizeSelector {...defaultProps} selectedSize="m" onSelect={onSelect} />);

      await user.click(screen.getByRole('radio', {name: 'M'}));
      expect(onSelect).toHaveBeenCalledWith('m');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports Enter key activation', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<SizeSelector {...defaultProps} selectedSize="m" onSelect={onSelect} />);

      const sizeRadio = screen.getByRole('radio', {name: 'M'});
      sizeRadio.focus();
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledWith('m');
    });

    it('supports space key activation', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<SizeSelector {...defaultProps} selectedSize="m" onSelect={onSelect} />);

      const sizeRadio = screen.getByRole('radio', {name: 'M'});
      sizeRadio.focus();
      await user.keyboard(' ');

      expect(onSelect).toHaveBeenCalledWith('m');
    });

    it('uses roving tabindex pattern', () => {
      render(<SizeSelector {...defaultProps} selectedSize="m" />);

      const selectedRadio = screen.getByRole('radio', {name: 'M'});
      expect(selectedRadio).toHaveAttribute('tabIndex', '0');

      const unselectedRadio = screen.getByRole('radio', {name: 'S'});
      expect(unselectedRadio).toHaveAttribute('tabIndex', '-1');
    });

    it('supports arrow key navigation', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<SizeSelector {...defaultProps} selectedSize="xs" onSelect={onSelect} />);

      const selectedRadio = screen.getByRole('radio', {name: 'XS'});
      selectedRadio.focus();

      // Arrow right moves to next available size
      await user.keyboard('{ArrowRight}');
      expect(onSelect).toHaveBeenCalledWith('s');
    });

    it('wraps around at end with arrow keys', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<SizeSelector {...defaultProps} selectedSize="xl" onSelect={onSelect} />);

      const selectedRadio = screen.getByRole('radio', {name: 'XL'});
      selectedRadio.focus();

      // Arrow right at last item wraps to first
      await user.keyboard('{ArrowRight}');
      expect(onSelect).toHaveBeenCalledWith('xs');
    });

    it('supports Home key to jump to first', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<SizeSelector {...defaultProps} selectedSize="xl" onSelect={onSelect} />);

      const selectedRadio = screen.getByRole('radio', {name: 'XL'});
      selectedRadio.focus();

      await user.keyboard('{Home}');
      expect(onSelect).toHaveBeenCalledWith('xs');
    });

    it('supports End key to jump to last', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<SizeSelector {...defaultProps} selectedSize="xs" onSelect={onSelect} />);

      const selectedRadio = screen.getByRole('radio', {name: 'XS'});
      selectedRadio.focus();

      await user.keyboard('{End}');
      expect(onSelect).toHaveBeenCalledWith('xl');
    });
  });

  describe('Edge Cases', () => {
    it('handles all sizes unavailable', () => {
      const allUnavailable = defaultSizes.map((size) => ({...size, available: false}));

      render(<SizeSelector sizes={allUnavailable} selectedSize={null} onSelect={vi.fn()} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('handles all sizes available', () => {
      const allAvailable = defaultSizes.map((size) => ({...size, available: true}));

      render(<SizeSelector sizes={allAvailable} selectedSize={null} onSelect={vi.fn()} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).not.toBeDisabled();
      });
    });

    it('handles selecting unavailable size', () => {
      render(<SizeSelector {...defaultProps} selectedSize="l" />);

      const unavailableSelected = screen.getByRole('radio', {
        name: /l - out of stock/i,
      });
      expect(unavailableSelected.className).toContain('bg-primary');
      expect(unavailableSelected).toBeDisabled();
    });

    it('handles long labels', () => {
      const longLabelSize = [
        {value: 'long', label: 'Extra Extra Large Plus', available: true},
      ];

      render(<SizeSelector sizes={longLabelSize} selectedSize={null} onSelect={vi.fn()} />);

      expect(screen.getByText('Extra Extra Large Plus')).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('shows selected state visually distinct', () => {
      render(<SizeSelector {...defaultProps} selectedSize="m" />);

      const selectedRadio = screen.getByRole('radio', {name: 'M'});
      const unselectedRadio = screen.getByRole('radio', {name: 'S'});

      expect(selectedRadio.className).toContain('bg-primary');
      expect(unselectedRadio.className).not.toContain('bg-primary');
    });

    it('shows unavailable state visually', () => {
      render(<SizeSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {name: /l - out of stock/i});
      expect(unavailableRadio.className).toContain('line-through');
      expect(unavailableRadio.className).toContain('opacity-40');
    });
  });

  describe('Integration with Forms', () => {
    it('works within a form', async () => {
      const onSelect = vi.fn();
      const onSubmit = vi.fn((e) => e.preventDefault());
      const user = userEvent.setup();

      render(
        <form onSubmit={onSubmit}>
          <SizeSelector {...defaultProps} onSelect={onSelect} />
          <button type="submit">Submit</button>
        </form>,
      );

      await user.click(screen.getByRole('radio', {name: 'M'}));
      expect(onSelect).toHaveBeenCalledWith('m');

      await user.click(screen.getByRole('button', {name: /submit/i}));
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});

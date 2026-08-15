/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ColorSelector, type ColorOption} from './ColorSelector';

describe('ColorSelector', () => {
  const defaultColors: ColorOption[] = [
    {value: 'black', label: 'Black', hex: '#000000', available: true},
    {value: 'white', label: 'White', hex: '#FFFFFF', available: true},
    {value: 'red', label: 'Red', hex: '#FF0000', available: true},
    {value: 'blue', label: 'Blue', hex: '#0000FF', available: false},
    {value: 'green', label: 'Green', hex: '#00FF00', available: true},
  ];

  const defaultProps = {
    colors: defaultColors,
    selectedColor: null,
    onSelect: vi.fn(),
  };

  describe('Rendering', () => {
    it('renders all color options', () => {
      render(<ColorSelector {...defaultProps} />);

      expect(screen.getByRole('radio', {name: 'Black'})).toBeInTheDocument();
      expect(screen.getByRole('radio', {name: 'White'})).toBeInTheDocument();
      expect(screen.getByRole('radio', {name: 'Red'})).toBeInTheDocument();
      expect(screen.getByRole('radio', {name: /blue/i})).toBeInTheDocument();
      expect(screen.getByRole('radio', {name: 'Green'})).toBeInTheDocument();
    });

    it('applies background color from hex value', () => {
      render(<ColorSelector {...defaultProps} />);

      const blackRadio = screen.getByRole('radio', {name: 'Black'});
      expect(blackRadio).toHaveStyle({backgroundColor: '#000000'});

      const redRadio = screen.getByRole('radio', {name: 'Red'});
      expect(redRadio).toHaveStyle({backgroundColor: '#FF0000'});
    });

    it('applies custom className', () => {
      const {container} = render(
        <ColorSelector {...defaultProps} className="custom-selector" />,
      );

      const selector = container.querySelector('.custom-selector');
      expect(selector).toBeInTheDocument();
    });

    it('renders with empty colors array', () => {
      render(
        <ColorSelector colors={[]} selectedColor={null} onSelect={vi.fn()} />,
      );

      const radios = screen.queryAllByRole('radio');
      expect(radios).toHaveLength(0);
    });

    it('renders radiogroup container', () => {
      render(<ColorSelector {...defaultProps} />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('calls onSelect when available color is clicked', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<ColorSelector {...defaultProps} onSelect={onSelect} />);

      await user.click(screen.getByRole('radio', {name: 'Black'}));

      expect(onSelect).toHaveBeenCalledWith('black');
    });

    it('applies ring to selected color', () => {
      render(<ColorSelector {...defaultProps} selectedColor="red" />);

      const selectedRadio = screen.getByRole('radio', {name: 'Red'});
      expect(selectedRadio.className).toContain('ring-2');
      expect(selectedRadio.className).toContain('ring-offset-2');
      expect(selectedRadio.className).toContain('ring-primary');
    });

    it('does not apply ring to unselected colors', () => {
      render(<ColorSelector {...defaultProps} selectedColor="red" />);

      const unselectedRadio = screen.getByRole('radio', {name: 'Black'});
      expect(unselectedRadio.className).not.toContain('ring-primary');
    });

    it('updates selection when selectedColor prop changes', () => {
      const {rerender} = render(<ColorSelector {...defaultProps} selectedColor="black" />);

      let selectedRadio = screen.getByRole('radio', {name: 'Black'});
      expect(selectedRadio.className).toContain('ring-2');

      rerender(<ColorSelector {...defaultProps} selectedColor="green" />);

      selectedRadio = screen.getByRole('radio', {name: 'Green'});
      expect(selectedRadio.className).toContain('ring-2');
    });
  });

  describe('Availability', () => {
    it('disables unavailable colors', () => {
      render(<ColorSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {
        name: /blue - out of stock/i,
      });
      expect(unavailableRadio).toBeDisabled();
    });

    it('does not disable available colors', () => {
      render(<ColorSelector {...defaultProps} />);

      const availableRadio = screen.getByRole('radio', {name: 'Black'});
      expect(availableRadio).not.toBeDisabled();
    });

    it('applies unavailable styles', () => {
      render(<ColorSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {
        name: /blue - out of stock/i,
      });
      expect(unavailableRadio.className).toContain('opacity-40');
      expect(unavailableRadio.className).toContain('cursor-not-allowed');
    });

    it('shows strikethrough for unavailable colors', () => {
      render(<ColorSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {
        name: /blue - out of stock/i,
      });
      const strikethrough = unavailableRadio.querySelector('.rotate-45');
      expect(strikethrough).toBeInTheDocument();
    });

    it('does not call onSelect when unavailable color is clicked', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<ColorSelector {...defaultProps} onSelect={onSelect} />);

      await user.click(screen.getByRole('radio', {name: /blue - out of stock/i}));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('indicates out of stock in aria-label', () => {
      render(<ColorSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {
        name: 'Blue - Out of Stock',
      });
      expect(unavailableRadio).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on each radio', () => {
      render(<ColorSelector {...defaultProps} />);

      expect(screen.getByRole('radio', {name: 'Black'})).toHaveAttribute(
        'aria-label',
        'Black',
      );
      expect(screen.getByRole('radio', {name: 'Red'})).toHaveAttribute(
        'aria-label',
        'Red',
      );
    });

    it('has aria-checked attribute', () => {
      render(<ColorSelector {...defaultProps} selectedColor="red" />);

      const selectedRadio = screen.getByRole('radio', {name: 'Red'});
      expect(selectedRadio).toHaveAttribute('aria-checked', 'true');

      const unselectedRadio = screen.getByRole('radio', {name: 'Black'});
      expect(unselectedRadio).toHaveAttribute('aria-checked', 'false');
    });

    it('has title attribute for tooltip', () => {
      render(<ColorSelector {...defaultProps} />);

      const blackRadio = screen.getByRole('radio', {name: 'Black'});
      expect(blackRadio).toHaveAttribute('title', 'Black');
    });

    it('has screen reader text for color label', () => {
      render(<ColorSelector {...defaultProps} />);

      const blackRadio = screen.getByRole('radio', {name: 'Black'});
      const srText = blackRadio.querySelector('.sr-only');
      expect(srText).toHaveTextContent('Black');
    });

    it('radios have type="button"', () => {
      render(<ColorSelector {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('type', 'button');
      });
    });

    it('has radiogroup with label', () => {
      render(<ColorSelector {...defaultProps} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-label', 'Color');
    });

    it('supports custom radiogroup label', () => {
      render(<ColorSelector {...defaultProps} label="Select Color" />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-label', 'Select Color');
    });
  });

  describe('Button Styles', () => {
    it('applies base styles to all radios', () => {
      render(<ColorSelector {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio.className).toContain('relative');
        expect(radio.className).toContain('w-8');
        expect(radio.className).toContain('h-8');
        expect(radio.className).toContain('rounded-full');
        expect(radio.className).toContain('transition-transform');
      });
    });

    it('applies hover scale to available colors', () => {
      render(<ColorSelector {...defaultProps} />);

      const availableRadio = screen.getByRole('radio', {name: 'Black'});
      expect(availableRadio.className).toContain('hover:scale-110');
    });

    it('does not apply hover scale to unavailable colors', () => {
      render(<ColorSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {
        name: /blue - out of stock/i,
      });
      expect(unavailableRadio.className).not.toContain('hover:scale-110');
    });
  });

  describe('Layout', () => {
    it('uses flex layout with gap', () => {
      const {container} = render(<ColorSelector {...defaultProps} />);

      const selector = container.firstChild;
      expect(selector).toHaveClass('flex');
      expect(selector).toHaveClass('flex-wrap');
      expect(selector).toHaveClass('gap-3');
    });
  });

  describe('Strikethrough Indicator', () => {
    it('renders strikethrough for unavailable colors', () => {
      render(<ColorSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {
        name: /blue - out of stock/i,
      });
      const strikethrough = unavailableRadio.querySelector('.rotate-45');
      expect(strikethrough).toBeInTheDocument();
    });

    it('does not render strikethrough for available colors', () => {
      render(<ColorSelector {...defaultProps} />);

      const availableRadio = screen.getByRole('radio', {name: 'Black'});
      const strikethrough = availableRadio.querySelector('.rotate-45');
      expect(strikethrough).not.toBeInTheDocument();
    });

    it('strikethrough spans full width', () => {
      render(<ColorSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {
        name: /blue - out of stock/i,
      });
      const strikethrough = unavailableRadio.querySelector('.w-full');
      expect(strikethrough).toBeInTheDocument();
    });

    it('strikethrough is positioned absolutely', () => {
      render(<ColorSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {
        name: /blue - out of stock/i,
      });
      const strikethrough = unavailableRadio.querySelector('.absolute');
      expect(strikethrough).toBeInTheDocument();
    });
  });

  describe('Different Color Options', () => {
    it('renders various hex colors', () => {
      const customColors: ColorOption[] = [
        {value: 'navy', label: 'Navy', hex: '#001f3f', available: true},
        {value: 'maroon', label: 'Maroon', hex: '#85144b', available: true},
        {value: 'teal', label: 'Teal', hex: '#39cccc', available: true},
      ];

      render(<ColorSelector colors={customColors} selectedColor={null} onSelect={vi.fn()} />);

      const navyRadio = screen.getByRole('radio', {name: 'Navy'});
      expect(navyRadio).toHaveStyle({backgroundColor: '#001f3f'});
    });

    it('renders single color', () => {
      const singleColor: ColorOption[] = [
        {value: 'beige', label: 'Beige', hex: '#f5f5dc', available: true},
      ];

      render(<ColorSelector colors={singleColor} selectedColor={null} onSelect={vi.fn()} />);

      expect(screen.getByRole('radio', {name: 'Beige'})).toBeInTheDocument();
    });
  });

  describe('Multiple Selections', () => {
    it('allows changing selection', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<ColorSelector {...defaultProps} onSelect={onSelect} />);

      await user.click(screen.getByRole('radio', {name: 'Black'}));
      expect(onSelect).toHaveBeenCalledWith('black');

      onSelect.mockClear();

      await user.click(screen.getByRole('radio', {name: 'Red'}));
      expect(onSelect).toHaveBeenCalledWith('red');
    });

    it('allows reselecting same color', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<ColorSelector {...defaultProps} selectedColor="red" onSelect={onSelect} />);

      await user.click(screen.getByRole('radio', {name: 'Red'}));
      expect(onSelect).toHaveBeenCalledWith('red');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports Enter key activation', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<ColorSelector {...defaultProps} selectedColor="black" onSelect={onSelect} />);

      const colorRadio = screen.getByRole('radio', {name: 'Black'});
      colorRadio.focus();
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledWith('black');
    });

    it('supports space key activation', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<ColorSelector {...defaultProps} selectedColor="black" onSelect={onSelect} />);

      const colorRadio = screen.getByRole('radio', {name: 'Black'});
      colorRadio.focus();
      await user.keyboard(' ');

      expect(onSelect).toHaveBeenCalledWith('black');
    });

    it('uses roving tabindex pattern', () => {
      render(<ColorSelector {...defaultProps} selectedColor="red" />);

      const selectedRadio = screen.getByRole('radio', {name: 'Red'});
      expect(selectedRadio).toHaveAttribute('tabIndex', '0');

      const unselectedRadio = screen.getByRole('radio', {name: 'Black'});
      expect(unselectedRadio).toHaveAttribute('tabIndex', '-1');
    });

    it('supports arrow key navigation', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<ColorSelector {...defaultProps} selectedColor="black" onSelect={onSelect} />);

      const selectedRadio = screen.getByRole('radio', {name: 'Black'});
      selectedRadio.focus();

      // Arrow right moves to next available color
      await user.keyboard('{ArrowRight}');
      expect(onSelect).toHaveBeenCalledWith('white');
    });

    it('wraps around at end with arrow keys', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<ColorSelector {...defaultProps} selectedColor="green" onSelect={onSelect} />);

      const selectedRadio = screen.getByRole('radio', {name: 'Green'});
      selectedRadio.focus();

      // Arrow right at last item wraps to first
      await user.keyboard('{ArrowRight}');
      expect(onSelect).toHaveBeenCalledWith('black');
    });

    it('supports Home key to jump to first', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<ColorSelector {...defaultProps} selectedColor="green" onSelect={onSelect} />);

      const selectedRadio = screen.getByRole('radio', {name: 'Green'});
      selectedRadio.focus();

      await user.keyboard('{Home}');
      expect(onSelect).toHaveBeenCalledWith('black');
    });

    it('supports End key to jump to last', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();

      render(<ColorSelector {...defaultProps} selectedColor="black" onSelect={onSelect} />);

      const selectedRadio = screen.getByRole('radio', {name: 'Black'});
      selectedRadio.focus();

      await user.keyboard('{End}');
      expect(onSelect).toHaveBeenCalledWith('green');
    });
  });

  describe('Edge Cases', () => {
    it('handles all colors unavailable', () => {
      const allUnavailable = defaultColors.map((color) => ({...color, available: false}));

      render(
        <ColorSelector colors={allUnavailable} selectedColor={null} onSelect={vi.fn()} />,
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('handles all colors available', () => {
      const allAvailable = defaultColors.map((color) => ({...color, available: true}));

      render(<ColorSelector colors={allAvailable} selectedColor={null} onSelect={vi.fn()} />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).not.toBeDisabled();
      });
    });

    it('handles selecting unavailable color', () => {
      render(<ColorSelector {...defaultProps} selectedColor="blue" />);

      const unavailableSelected = screen.getByRole('radio', {
        name: /blue - out of stock/i,
      });
      expect(unavailableSelected.className).toContain('ring-2');
      expect(unavailableSelected).toBeDisabled();
    });

    it('handles long color names', () => {
      const longNameColor: ColorOption[] = [
        {
          value: 'long',
          label: 'Antique White Smoke',
          hex: '#f5f5f5',
          available: true,
        },
      ];

      render(
        <ColorSelector colors={longNameColor} selectedColor={null} onSelect={vi.fn()} />,
      );

      expect(screen.getByRole('radio', {name: 'Antique White Smoke'})).toBeInTheDocument();
    });

    it('handles hex colors with alpha channel', () => {
      const alphaColor: ColorOption[] = [
        {value: 'transparent', label: 'Transparent', hex: '#00000000', available: true},
      ];

      render(<ColorSelector colors={alphaColor} selectedColor={null} onSelect={vi.fn()} />);

      const radio = screen.getByRole('radio', {name: 'Transparent'});
      expect(radio).toHaveStyle({backgroundColor: '#00000000'});
    });
  });

  describe('Visual States', () => {
    it('shows selected state visually distinct', () => {
      render(<ColorSelector {...defaultProps} selectedColor="red" />);

      const selectedRadio = screen.getByRole('radio', {name: 'Red'});
      const unselectedRadio = screen.getByRole('radio', {name: 'Black'});

      expect(selectedRadio.className).toContain('ring-primary');
      expect(unselectedRadio.className).not.toContain('ring-primary');
    });

    it('shows unavailable state visually', () => {
      render(<ColorSelector {...defaultProps} />);

      const unavailableRadio = screen.getByRole('radio', {
        name: /blue - out of stock/i,
      });
      expect(unavailableRadio.className).toContain('opacity-40');

      const strikethrough = unavailableRadio.querySelector('.rotate-45');
      expect(strikethrough).toBeInTheDocument();
    });
  });

  describe('Integration with Forms', () => {
    it('works within a form', async () => {
      const onSelect = vi.fn();
      const onSubmit = vi.fn((e) => e.preventDefault());
      const user = userEvent.setup();

      render(
        <form onSubmit={onSubmit}>
          <ColorSelector {...defaultProps} onSelect={onSelect} />
          <button type="submit">Submit</button>
        </form>,
      );

      await user.click(screen.getByRole('radio', {name: 'Black'}));
      expect(onSelect).toHaveBeenCalledWith('black');

      await user.click(screen.getByRole('button', {name: /submit/i}));
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('Hover Effects', () => {
    it('applies scale on hover for available colors', async () => {
      const user = userEvent.setup();

      render(<ColorSelector {...defaultProps} />);

      const availableRadio = screen.getByRole('radio', {name: 'Black'});
      expect(availableRadio.className).toContain('hover:scale-110');

      await user.hover(availableRadio);
      // Visual scaling is CSS-based, just verify class exists
      expect(availableRadio.className).toContain('hover:scale-110');
    });
  });
});

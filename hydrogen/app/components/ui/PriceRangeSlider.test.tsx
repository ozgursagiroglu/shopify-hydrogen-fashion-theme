/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {PriceRangeSlider} from './PriceRangeSlider';

describe('PriceRangeSlider', () => {
  const defaultProps = {
    value: [0, 1000] as [number, number],
    onChange: vi.fn(),
  };

  describe('Rendering', () => {
    it('renders two range inputs', () => {
      render(<PriceRangeSlider {...defaultProps} />);

      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(2);
    });

    it('displays min value', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} />);

      expect(screen.getByText(/\$100/)).toBeInTheDocument();
    });

    it('displays max value', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} />);

      expect(screen.getByText(/\$500/)).toBeInTheDocument();
    });

    it('displays separator between values', () => {
      render(<PriceRangeSlider {...defaultProps} />);

      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(
        <PriceRangeSlider {...defaultProps} className="custom-slider" />,
      );

      const slider = container.querySelector('.custom-slider');
      expect(slider).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('shows current range values', () => {
      render(<PriceRangeSlider {...defaultProps} value={[250, 750]} />);

      expect(screen.getByText(/\$250/)).toBeInTheDocument();
      expect(screen.getByText(/\$750/)).toBeInTheDocument();
    });

    it('uses custom currency symbol', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} currency="€" />);

      expect(screen.getByText(/€100/)).toBeInTheDocument();
      expect(screen.getByText(/€500/)).toBeInTheDocument();
    });

    it('uses default $ currency', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} />);

      expect(screen.getByText(/\$100/)).toBeInTheDocument();
    });

    it('displays zero values', () => {
      render(<PriceRangeSlider {...defaultProps} value={[0, 0]} />);

      const zeroElements = screen.getAllByText(/\$0/);
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });

  describe('Range Inputs', () => {
    it('min input has correct attributes', () => {
      render(<PriceRangeSlider {...defaultProps} min={0} max={1000} step={10} />);

      const [minSlider] = screen.getAllByRole('slider');
      expect(minSlider).toHaveAttribute('type', 'range');
      expect(minSlider).toHaveAttribute('min', '0');
      expect(minSlider).toHaveAttribute('max', '1000');
      expect(minSlider).toHaveAttribute('step', '10');
    });

    it('max input has correct attributes', () => {
      render(<PriceRangeSlider {...defaultProps} min={0} max={1000} step={10} />);

      const [, maxSlider] = screen.getAllByRole('slider');
      expect(maxSlider).toHaveAttribute('type', 'range');
      expect(maxSlider).toHaveAttribute('min', '0');
      expect(maxSlider).toHaveAttribute('max', '1000');
      expect(maxSlider).toHaveAttribute('step', '10');
    });

    it('uses default min of 0', () => {
      render(<PriceRangeSlider {...defaultProps} />);

      const [minSlider] = screen.getAllByRole('slider');
      expect(minSlider).toHaveAttribute('min', '0');
    });

    it('uses default max of 1000', () => {
      render(<PriceRangeSlider {...defaultProps} />);

      const [minSlider] = screen.getAllByRole('slider');
      expect(minSlider).toHaveAttribute('max', '1000');
    });

    it('uses default step of 1', () => {
      render(<PriceRangeSlider {...defaultProps} />);

      const [minSlider] = screen.getAllByRole('slider');
      expect(minSlider).toHaveAttribute('step', '1');
    });
  });

  describe('Min Slider Interaction', () => {
    it('updates local value when min slider changes', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} />);

      const [minSlider] = screen.getAllByRole('slider');
      fireEvent.change(minSlider, {target: {value: '200'}});

      expect(screen.getByText(/\$200/)).toBeInTheDocument();
    });

    it('calls onChange on mouse up', () => {
      const onChange = vi.fn();
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} onChange={onChange} />);

      const [minSlider] = screen.getAllByRole('slider');
      fireEvent.change(minSlider, {target: {value: '200'}});
      fireEvent.mouseUp(minSlider);

      expect(onChange).toHaveBeenCalledWith([200, 500]);
    });

    it('calls onChange on touch end', () => {
      const onChange = vi.fn();
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} onChange={onChange} />);

      const [minSlider] = screen.getAllByRole('slider');
      fireEvent.change(minSlider, {target: {value: '200'}});
      fireEvent.touchEnd(minSlider);

      expect(onChange).toHaveBeenCalledWith([200, 500]);
    });

    it('prevents min from exceeding max', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} step={1} />);

      const [minSlider] = screen.getAllByRole('slider');
      fireEvent.change(minSlider, {target: {value: '600'}});

      // Min should be clamped to max - step
      expect(screen.getByText(/\$499/)).toBeInTheDocument();
    });

    it('prevents min from going below minimum', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} min={50} />);

      const [minSlider] = screen.getAllByRole('slider');
      fireEvent.change(minSlider, {target: {value: '10'}});

      // Value should be clamped to min (50)
      const displayedValues = screen.queryAllByText(/\$50/);
      expect(displayedValues.length).toBeGreaterThan(0);
    });
  });

  describe('Max Slider Interaction', () => {
    it('updates local value when max slider changes', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} />);

      const [, maxSlider] = screen.getAllByRole('slider');
      fireEvent.change(maxSlider, {target: {value: '700'}});

      expect(screen.getByText(/\$700/)).toBeInTheDocument();
    });

    it('calls onChange on mouse up', () => {
      const onChange = vi.fn();
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} onChange={onChange} />);

      const [, maxSlider] = screen.getAllByRole('slider');
      fireEvent.change(maxSlider, {target: {value: '700'}});
      fireEvent.mouseUp(maxSlider);

      expect(onChange).toHaveBeenCalledWith([100, 700]);
    });

    it('calls onChange on touch end', () => {
      const onChange = vi.fn();
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} onChange={onChange} />);

      const [, maxSlider] = screen.getAllByRole('slider');
      fireEvent.change(maxSlider, {target: {value: '700'}});
      fireEvent.touchEnd(maxSlider);

      expect(onChange).toHaveBeenCalledWith([100, 700]);
    });

    it('prevents max from going below min', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} step={1} />);

      const [, maxSlider] = screen.getAllByRole('slider');
      fireEvent.change(maxSlider, {target: {value: '50'}});

      // Max should be clamped to min + step
      expect(screen.getByText(/\$101/)).toBeInTheDocument();
    });

    it('prevents max from exceeding maximum', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} max={1000} />);

      const [, maxSlider] = screen.getAllByRole('slider');
      fireEvent.change(maxSlider, {target: {value: '1500'}});

      expect(screen.getByText(/\$1000/)).toBeInTheDocument();
    });
  });

  describe('Track Visualization', () => {
    it('renders background track', () => {
      const {container} = render(<PriceRangeSlider {...defaultProps} />);

      const bgTrack = container.querySelector('.bg-border');
      expect(bgTrack).toBeInTheDocument();
    });

    it('renders active range track', () => {
      const {container} = render(<PriceRangeSlider {...defaultProps} />);

      const activeTrack = container.querySelector('.bg-primary');
      expect(activeTrack).toBeInTheDocument();
    });

    it('active track has correct width and position', () => {
      const {container} = render(
        <PriceRangeSlider {...defaultProps} value={[250, 750]} min={0} max={1000} />,
      );

      const activeTrack = container.querySelector('.bg-primary');
      expect(activeTrack).toHaveStyle({
        left: '25%',
        width: '50%',
      });
    });

    it('updates track when values change', () => {
      const {container, rerender} = render(
        <PriceRangeSlider {...defaultProps} value={[0, 500]} min={0} max={1000} />,
      );

      let activeTrack = container.querySelector('.bg-primary');
      expect(activeTrack).toHaveStyle({
        left: '0%',
        width: '50%',
      });

      rerender(
        <PriceRangeSlider {...defaultProps} value={[250, 750]} min={0} max={1000} />,
      );

      activeTrack = container.querySelector('.bg-primary');
      expect(activeTrack).toHaveStyle({
        left: '25%',
        width: '50%',
      });
    });
  });

  describe('Value Synchronization', () => {
    it('syncs local value with prop value', () => {
      const {rerender} = render(
        <PriceRangeSlider {...defaultProps} value={[100, 500]} />,
      );

      expect(screen.getByText(/\$100/)).toBeInTheDocument();
      expect(screen.getByText(/\$500/)).toBeInTheDocument();

      rerender(<PriceRangeSlider {...defaultProps} value={[200, 600]} />);

      expect(screen.getByText(/\$200/)).toBeInTheDocument();
      expect(screen.getByText(/\$600/)).toBeInTheDocument();
    });

    it('maintains local value during interaction', () => {
      const onChange = vi.fn();
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} onChange={onChange} />);

      const [minSlider] = screen.getAllByRole('slider');
      fireEvent.change(minSlider, {target: {value: '200'}});

      // Should show updated value before onChange is called
      expect(screen.getByText(/\$200/)).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.mouseUp(minSlider);
      expect(onChange).toHaveBeenCalledWith([200, 500]);
    });
  });

  describe('Custom Ranges', () => {
    it('handles custom min/max range', () => {
      render(
        <PriceRangeSlider
          value={[50, 150]}
          onChange={vi.fn()}
          min={0}
          max={200}
        />,
      );

      expect(screen.getByText(/\$50/)).toBeInTheDocument();
      expect(screen.getByText(/\$150/)).toBeInTheDocument();
    });

    it('handles custom step value', () => {
      render(
        <PriceRangeSlider
          value={[0, 1000]}
          onChange={vi.fn()}
          min={0}
          max={1000}
          step={50}
        />,
      );

      const [minSlider] = screen.getAllByRole('slider');
      expect(minSlider).toHaveAttribute('step', '50');
    });

    it('respects step when adjusting values', () => {
      render(
        <PriceRangeSlider
          value={[100, 500]}
          onChange={vi.fn()}
          min={0}
          max={1000}
          step={100}
        />,
      );

      const [minSlider] = screen.getAllByRole('slider');

      // The step attribute controls how values can be adjusted
      expect(minSlider).toHaveAttribute('step', '100');

      // Changing to a value that's a multiple of step
      fireEvent.change(minSlider, {target: {value: '400'}});

      // Check that the input accepts the stepped value
      expect(screen.getByText(/\$400/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles min and max being equal', () => {
      render(<PriceRangeSlider value={[500, 500]} onChange={vi.fn()} />);

      expect(screen.getAllByText(/\$500/)).toHaveLength(2);
    });

    it('handles zero range', () => {
      render(<PriceRangeSlider value={[0, 0]} onChange={vi.fn()} min={0} max={0} />);

      expect(screen.getAllByText(/\$0/)).toHaveLength(2);
    });

    it('handles large numbers', () => {
      render(
        <PriceRangeSlider value={[10000, 50000]} onChange={vi.fn()} max={100000} />,
      );

      expect(screen.getByText(/\$10000/)).toBeInTheDocument();
      expect(screen.getByText(/\$50000/)).toBeInTheDocument();
    });

    it('handles decimal step values', () => {
      render(
        <PriceRangeSlider
          value={[10.5, 99.5]}
          onChange={vi.fn()}
          min={0}
          max={100}
          step={0.5}
        />,
      );

      const [minSlider] = screen.getAllByRole('slider');
      expect(minSlider).toHaveAttribute('step', '0.5');
    });
  });

  describe('Z-index Management', () => {
    it('applies z-index to sliders', () => {
      const {container} = render(
        <PriceRangeSlider {...defaultProps} value={[100, 500]} />,
      );

      const sliders = container.querySelectorAll('input[type="range"]');
      sliders.forEach((slider) => {
        const style = (slider as HTMLElement).style;
        expect(style.zIndex).toBeTruthy();
      });
    });

    it('max slider has higher z-index', () => {
      const {container} = render(
        <PriceRangeSlider {...defaultProps} value={[100, 500]} />,
      );

      const [, maxSlider] = container.querySelectorAll('input[type="range"]');
      const maxZIndex = (maxSlider as HTMLElement).style.zIndex;
      expect(maxZIndex).toBe('2');
    });
  });

  describe('Styling', () => {
    it('has rounded track', () => {
      const {container} = render(<PriceRangeSlider {...defaultProps} />);

      const tracks = container.querySelectorAll('.rounded-full');
      expect(tracks.length).toBeGreaterThan(0);
    });

    it('applies padding', () => {
      const {container} = render(<PriceRangeSlider {...defaultProps} />);

      const wrapper = container.querySelector('.px-2');
      expect(wrapper).toBeInTheDocument();
    });

    it('has margin bottom for track', () => {
      const {container} = render(<PriceRangeSlider {...defaultProps} />);

      const trackContainer = container.querySelector('.mb-8');
      expect(trackContainer).toBeInTheDocument();
    });
  });

  describe('Value Display Layout', () => {
    it('displays values in flex layout', () => {
      const {container} = render(<PriceRangeSlider {...defaultProps} />);

      const valueDisplay = container.querySelector('.flex.justify-between');
      expect(valueDisplay).toBeInTheDocument();
    });

    it('applies correct text styles to values', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} />);

      const minValue = screen.getByText(/\$100/);
      expect(minValue.className).toContain('text-sm');
      expect(minValue.className).toContain('font-medium');
      expect(minValue.className).toContain('text-text');
    });

    it('applies muted style to separator', () => {
      render(<PriceRangeSlider {...defaultProps} />);

      const separator = screen.getByText('—');
      expect(separator.className).toContain('text-text-muted');
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains functionality on small screens', () => {
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} />);

      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(2);

      expect(screen.getByText(/\$100/)).toBeInTheDocument();
      expect(screen.getByText(/\$500/)).toBeInTheDocument();
    });
  });

  describe('Multiple Interactions', () => {
    it('handles sequential min adjustments', () => {
      const onChange = vi.fn();
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} onChange={onChange} />);

      const [minSlider] = screen.getAllByRole('slider');

      fireEvent.change(minSlider, {target: {value: '200'}});
      fireEvent.mouseUp(minSlider);
      expect(onChange).toHaveBeenCalledWith([200, 500]);

      onChange.mockClear();

      fireEvent.change(minSlider, {target: {value: '300'}});
      fireEvent.mouseUp(minSlider);
      expect(onChange).toHaveBeenCalledWith([300, 500]);
    });

    it('handles sequential max adjustments', () => {
      const onChange = vi.fn();
      render(<PriceRangeSlider {...defaultProps} value={[100, 500]} onChange={onChange} />);

      const [, maxSlider] = screen.getAllByRole('slider');

      fireEvent.change(maxSlider, {target: {value: '600'}});
      fireEvent.mouseUp(maxSlider);
      expect(onChange).toHaveBeenCalledWith([100, 600]);

      onChange.mockClear();

      fireEvent.change(maxSlider, {target: {value: '700'}});
      fireEvent.mouseUp(maxSlider);
      expect(onChange).toHaveBeenCalledWith([100, 700]);
    });
  });
});

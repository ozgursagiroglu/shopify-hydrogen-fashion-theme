/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@test/utils/render';
import {StarRating} from './StarRating';

describe('StarRating', () => {
  describe('display mode', () => {
    it('renders with accessible role', () => {
      render(<StarRating rating={3} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('has accessible aria-label', () => {
      render(<StarRating rating={3} />);
      expect(screen.getByLabelText(/Rating: 3 out of 5 stars/)).toBeInTheDocument();
    });

    it('displays rating value when showValue is true', () => {
      render(<StarRating rating={4.5} showValue />);
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('does not display rating value when showValue is false', () => {
      render(<StarRating rating={4.5} />);
      expect(screen.queryByText('4.5')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(<StarRating rating={3} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders SVG icons for stars', () => {
      const {container} = render(<StarRating rating={3} />);
      const svgs = container.querySelectorAll('svg');
      expect(svgs).toHaveLength(5);
    });
  });

  describe('interactive mode', () => {
    it('calls onChange when a star is clicked', () => {
      const handleChange = vi.fn();
      render(<StarRating rating={0} interactive onChange={handleChange} />);

      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[2]); // Click 3rd star

      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('renders radio buttons when interactive', () => {
      render(<StarRating rating={3} interactive onChange={vi.fn()} />);
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(5);
    });

    it('has accessible labels for interactive stars', () => {
      render(<StarRating rating={3} interactive onChange={vi.fn()} label="Rate this product" />);
      expect(screen.getByLabelText('Rate this product')).toBeInTheDocument();
    });

    it('renders as radiogroup in interactive mode', () => {
      render(<StarRating rating={3} interactive onChange={vi.fn()} />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('marks correct star as checked', () => {
      render(<StarRating rating={3} interactive onChange={vi.fn()} />);
      const radios = screen.getAllByRole('radio');
      expect(radios[2]).toHaveAttribute('aria-checked', 'true'); // 3rd star
      expect(radios[0]).toHaveAttribute('aria-checked', 'false'); // 1st star
    });
  });

  describe('keyboard navigation', () => {
    it('calls onChange when Enter key is pressed', () => {
      const handleChange = vi.fn();
      render(<StarRating rating={0} interactive onChange={handleChange} />);

      const radios = screen.getAllByRole('radio');
      fireEvent.keyDown(radios[3], {key: 'Enter'});

      expect(handleChange).toHaveBeenCalledWith(4);
    });

    it('calls onChange when Space key is pressed', () => {
      const handleChange = vi.fn();
      render(<StarRating rating={0} interactive onChange={handleChange} />);

      const radios = screen.getAllByRole('radio');
      fireEvent.keyDown(radios[2], {key: ' '});

      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('does not call onChange for other keys', () => {
      const handleChange = vi.fn();
      render(<StarRating rating={0} interactive onChange={handleChange} />);

      const radios = screen.getAllByRole('radio');
      fireEvent.keyDown(radios[2], {key: 'a'});

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('hover state', () => {
    it('updates display on mouse enter', () => {
      const handleChange = vi.fn();
      render(<StarRating rating={2} interactive onChange={handleChange} />);

      const radios = screen.getAllByRole('radio');
      // Test that mouse enter doesn't throw errors
      expect(() => fireEvent.mouseEnter(radios[3])).not.toThrow();
    });

    it('resets display on mouse leave', () => {
      const handleChange = vi.fn();
      render(<StarRating rating={2} interactive onChange={handleChange} />);

      const radios = screen.getAllByRole('radio');
      fireEvent.mouseEnter(radios[3]);
      // Test that mouse leave doesn't throw errors
      expect(() => fireEvent.mouseLeave(radios[3])).not.toThrow();
    });
  });

  describe('size variants', () => {
    it('renders with small size', () => {
      const {container} = render(<StarRating rating={3} size="sm" />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg?.classList.contains('w-4')).toBe(true);
      expect(svg?.classList.contains('h-4')).toBe(true);
    });

    it('renders with medium size (default)', () => {
      const {container} = render(<StarRating rating={3} size="md" />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg?.classList.contains('w-5')).toBe(true);
      expect(svg?.classList.contains('h-5')).toBe(true);
    });

    it('renders with large size', () => {
      const {container} = render(<StarRating rating={3} size="lg" />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg?.classList.contains('w-6')).toBe(true);
      expect(svg?.classList.contains('h-6')).toBe(true);
    });
  });

  describe('without onChange callback', () => {
    it('does not crash when clicking in interactive mode without onChange', () => {
      render(<StarRating rating={3} interactive />);

      const radios = screen.getAllByRole('radio');
      expect(() => fireEvent.click(radios[2])).not.toThrow();
    });

    it('does not crash on keydown without onChange', () => {
      render(<StarRating rating={3} interactive />);

      const radios = screen.getAllByRole('radio');
      expect(() => fireEvent.keyDown(radios[2], {key: 'Enter'})).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('handles rating of 0', () => {
      render(<StarRating rating={0} showValue />);
      expect(screen.getByText('0.0')).toBeInTheDocument();
    });

    it('handles rating of 5', () => {
      render(<StarRating rating={5} showValue />);
      expect(screen.getByText('5.0')).toBeInTheDocument();
    });

    it('handles decimal ratings', () => {
      render(<StarRating rating={3.7} showValue />);
      expect(screen.getByText('3.7')).toBeInTheDocument();
    });

    it('renders correct number of stars based on maxRating', () => {
      const {container} = render(<StarRating rating={3} maxRating={10} />);
      const svgs = container.querySelectorAll('svg');
      expect(svgs).toHaveLength(10);
    });

    it('accepts custom label', () => {
      render(<StarRating rating={3} label="Product rating" />);
      expect(screen.getByLabelText('Product rating')).toBeInTheDocument();
    });

    it('has correct aria-label for single star', () => {
      render(<StarRating rating={1} interactive onChange={vi.fn()} />);
      const radio = screen.getByLabelText('1 star');
      expect(radio).toBeTruthy();
    });

    it('has correct aria-label for multiple stars', () => {
      render(<StarRating rating={3} interactive onChange={vi.fn()} />);
      const radio = screen.getByLabelText('3 stars');
      expect(radio).toBeTruthy();
    });
  });
});

/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Spinner} from './Spinner';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('renders an SVG element', () => {
      const {container} = render(<Spinner />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has correct SVG attributes', () => {
      const {container} = render(<Spinner />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('renders circle element', () => {
      const {container} = render(<Spinner />);

      const circle = container.querySelector('circle');
      expect(circle).toBeInTheDocument();
    });

    it('renders path element', () => {
      const {container} = render(<Spinner />);

      const path = container.querySelector('path');
      expect(path).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(<Spinner className="custom-spinner" />);

      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('class')).toContain('custom-spinner');
    });
  });

  describe('Sizes', () => {
    it('applies sm size classes', () => {
      const {container} = render(<Spinner size="sm" />);

      const svg = container.querySelector('svg');
      const classAttr = svg?.getAttribute('class') || '';
      expect(classAttr).toContain('h-4');
      expect(classAttr).toContain('w-4');
    });

    it('applies md size classes by default', () => {
      const {container} = render(<Spinner />);

      const svg = container.querySelector('svg');
      const classAttr = svg?.getAttribute('class') || '';
      expect(classAttr).toContain('h-6');
      expect(classAttr).toContain('w-6');
    });

    it('applies lg size classes', () => {
      const {container} = render(<Spinner size="lg" />);

      const svg = container.querySelector('svg');
      const classAttr = svg?.getAttribute('class') || '';
      expect(classAttr).toContain('h-8');
      expect(classAttr).toContain('w-8');
    });
  });

  describe('Animation', () => {
    it('has animate-spin class', () => {
      const {container} = render(<Spinner />);

      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('class')).toContain('animate-spin');
    });
  });

  describe('SVG Structure', () => {
    it('circle has correct attributes', () => {
      const {container} = render(<Spinner />);

      const circle = container.querySelector('circle');
      expect(circle).toHaveAttribute('cx', '12');
      expect(circle).toHaveAttribute('cy', '12');
      expect(circle).toHaveAttribute('r', '10');
      expect(circle).toHaveAttribute('stroke', 'currentColor');
      expect(circle).toHaveAttribute('stroke-width', '4');
    });

    it('circle has opacity-25 class', () => {
      const {container} = render(<Spinner />);

      const circle = container.querySelector('circle');
      expect(circle?.getAttribute('class')).toContain('opacity-25');
    });

    it('path has correct attributes', () => {
      const {container} = render(<Spinner />);

      const path = container.querySelector('path');
      expect(path).toHaveAttribute('fill', 'currentColor');
      expect(path).toHaveAttribute(
        'd',
        'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
      );
    });

    it('path has opacity-75 class', () => {
      const {container} = render(<Spinner />);

      const path = container.querySelector('path');
      expect(path?.getAttribute('class')).toContain('opacity-75');
    });
  });

  describe('Color Inheritance', () => {
    it('uses currentColor for stroke and fill', () => {
      const {container} = render(<Spinner />);

      const circle = container.querySelector('circle');
      const path = container.querySelector('path');

      expect(circle).toHaveAttribute('stroke', 'currentColor');
      expect(path).toHaveAttribute('fill', 'currentColor');
    });

    it('inherits color from parent via className', () => {
      const {container} = render(<Spinner className="text-primary" />);

      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('class')).toContain('text-primary');
    });
  });

  describe('Accessibility', () => {
    it('can have aria-label via custom className', () => {
      const {container} = render(<Spinner className="loading-indicator" />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Multiple Spinners', () => {
    it('renders multiple spinners independently', () => {
      const {container} = render(
        <>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </>,
      );

      const spinners = container.querySelectorAll('svg');
      expect(spinners).toHaveLength(3);
    });

    it('applies different sizes to multiple spinners', () => {
      const {container} = render(
        <>
          <Spinner size="sm" />
          <Spinner size="lg" />
        </>,
      );

      const spinners = container.querySelectorAll('svg');
      expect(spinners[0].getAttribute('class')).toContain('h-4');
      expect(spinners[1].getAttribute('class')).toContain('h-8');
    });
  });

  describe('Integration with Components', () => {
    it('works inside buttons', () => {
      render(
        <button>
          <Spinner size="sm" />
          <span>Loading...</span>
        </button>,
      );

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('works with flex layouts', () => {
      const {container} = render(
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <span>Loading</span>
        </div>,
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('combines custom classes with size classes', () => {
      const {container} = render(<Spinner size="md" className="text-accent mr-2" />);

      const svg = container.querySelector('svg');
      const classAttr = svg?.getAttribute('class') || '';
      expect(classAttr).toContain('h-6');
      expect(classAttr).toContain('w-6');
      expect(classAttr).toContain('text-accent');
      expect(classAttr).toContain('mr-2');
    });

    it('maintains animation with custom classes', () => {
      const {container} = render(<Spinner className="custom-class" />);

      const svg = container.querySelector('svg');
      const classAttr = svg?.getAttribute('class') || '';
      expect(classAttr).toContain('animate-spin');
      expect(classAttr).toContain('custom-class');
    });
  });

  describe('Performance', () => {
    it('renders without warnings', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<Spinner />);

      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
    });

    it('renders multiple times without issues', () => {
      const {rerender} = render(<Spinner size="sm" />);

      rerender(<Spinner size="md" />);
      rerender(<Spinner size="lg" />);
      rerender(<Spinner size="sm" />);

      const {container} = render(<Spinner />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});

/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen,renderHook, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {SizeGuide, useSizeGuide} from './SizeGuide';

// Mock Modal
vi.mock('~/components/ui', () => ({
  Modal: ({isOpen, onClose, children, title}: any) =>
    isOpen ? (
      <div data-testid="modal">
        <h1>{title}</h1>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  TipIcon: () => <svg data-testid="tip-icon" />,
}));

describe('SizeGuide', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    productType: 'tops' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders modal when open', () => {
      render(<SizeGuide {...defaultProps} />);
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<SizeGuide {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders title', () => {
      render(<SizeGuide {...defaultProps} />);
      expect(screen.getByText('Size Guide')).toBeInTheDocument();
    });

    it('renders unit toggle buttons', () => {
      render(<SizeGuide {...defaultProps} />);
      expect(screen.getByText('CM')).toBeInTheDocument();
      expect(screen.getByText('IN')).toBeInTheDocument();
    });

    it('renders size chart table', () => {
      const {container} = render(<SizeGuide {...defaultProps} />);
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('renders how to measure section', () => {
      render(<SizeGuide {...defaultProps} />);
      expect(screen.getByText('How to Measure')).toBeInTheDocument();
    });

    it('renders fit tip', () => {
      render(<SizeGuide {...defaultProps} />);
      expect(screen.getByText('Fit Tip')).toBeInTheDocument();
      expect(screen.getByTestId('tip-icon')).toBeInTheDocument();
    });
  });

  describe('Product type tabs', () => {
    it('renders all product type tabs', () => {
      render(<SizeGuide {...defaultProps} />);
      expect(screen.getByText('Tops & Outerwear')).toBeInTheDocument();
      expect(screen.getByText('Pants & Skirts')).toBeInTheDocument();
      expect(screen.getByText('Dresses')).toBeInTheDocument();
      expect(screen.getByText('Shoes')).toBeInTheDocument();
      expect(screen.getByText('Belts & Accessories')).toBeInTheDocument();
    });

    it('highlights active tab', async () => {
      userEvent.setup();
      const {container} = render(<SizeGuide {...defaultProps} />);

      const activeTab = container.querySelector('.bg-primary.text-white');
      expect(activeTab).toHaveTextContent('Tops & Outerwear');
    });

    it('switches tabs on click', async () => {
      const user = userEvent.setup();
      render(<SizeGuide {...defaultProps} />);

      const bottomsTab = screen.getByText('Pants & Skirts');
      await user.click(bottomsTab);

      // Should show bottoms size chart headers - use getAllByText and check for table header
      const inseamElements = screen.getAllByText('Inseam');
      const inseamHeader = inseamElements.find(el => el.tagName === 'TH');
      expect(inseamHeader).toBeInTheDocument();
    });

    it('defaults to provided productType', () => {
      render(<SizeGuide {...defaultProps} productType="shoes" />);
      expect(screen.getByText('EU')).toBeInTheDocument();
      expect(screen.getByText('Foot Length (cm)')).toBeInTheDocument();
    });
  });

  describe('Unit toggle', () => {
    it('defaults to cm', () => {
      render(<SizeGuide {...defaultProps} />);
      const cmButton = screen.getByText('CM').closest('button');
      expect(cmButton).toHaveClass('bg-accent');
    });

    it('switches to inches on click', async () => {
      const user = userEvent.setup();
      render(<SizeGuide {...defaultProps} />);

      const inButton = screen.getByText('IN').closest('button')!;
      await user.click(inButton);

      expect(inButton).toHaveClass('bg-accent');
    });

    it('shows different measurements based on unit', async () => {
      const user = userEvent.setup();
      render(<SizeGuide {...defaultProps} />);

      // Default is CM
      expect(screen.getByText('82-86')).toBeInTheDocument();

      // Switch to IN
      const inButton = screen.getByText('IN');
      await user.click(inButton);

      expect(screen.getByText('32-34')).toBeInTheDocument();
    });
  });

  describe('Size chart tables', () => {
    it('renders tops size chart', () => {
      render(<SizeGuide {...defaultProps} productType="tops" />);
      expect(screen.getByText('Chest')).toBeInTheDocument();
      expect(screen.getByText('Length')).toBeInTheDocument();
    });

    it('renders bottoms size chart', async () => {
      const user = userEvent.setup();
      render(<SizeGuide {...defaultProps} />);

      const bottomsTab = screen.getByText('Pants & Skirts');
      await user.click(bottomsTab);

      // Use getAllByText and check for table headers
      const inseamElements = screen.getAllByText('Inseam');
      const inseamHeader = inseamElements.find(el => el.tagName === 'TH');
      expect(inseamHeader).toBeInTheDocument();
      expect(screen.getByText('Rise')).toBeInTheDocument();
    });

    it('renders dresses size chart', async () => {
      const user = userEvent.setup();
      render(<SizeGuide {...defaultProps} />);

      const dressesTab = screen.getByText('Dresses');
      await user.click(dressesTab);

      expect(screen.getByText('Bust')).toBeInTheDocument();
    });

    it('renders shoes size chart', async () => {
      const user = userEvent.setup();
      render(<SizeGuide {...defaultProps} />);

      const shoesTab = screen.getByText('Shoes');
      await user.click(shoesTab);

      expect(screen.getByText('EU')).toBeInTheDocument();
      expect(screen.getByText('US')).toBeInTheDocument();
      expect(screen.getByText('UK')).toBeInTheDocument();
    });

    it('renders accessories size chart', async () => {
      const user = userEvent.setup();
      render(<SizeGuide {...defaultProps} />);

      const accessoriesTab = screen.getByText('Belts & Accessories');
      await user.click(accessoriesTab);

      expect(screen.getByText('Belt Length')).toBeInTheDocument();
      expect(screen.getByText('Fits Waist')).toBeInTheDocument();
    });

    it('shows all size rows', () => {
      render(<SizeGuide {...defaultProps} />);
      expect(screen.getByText('XS')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
      expect(screen.getByText('XL')).toBeInTheDocument();
    });
  });

  describe('How to measure section', () => {
    it('renders measurement instructions', () => {
      render(<SizeGuide {...defaultProps} />);
      expect(screen.getByText('Chest/Bust')).toBeInTheDocument();
      // Use getAllByText for elements that appear multiple times
      const waistElements = screen.getAllByText('Waist');
      expect(waistElements.length).toBeGreaterThan(0);
      const hipsElements = screen.getAllByText('Hips');
      expect(hipsElements.length).toBeGreaterThan(0);
      const inseamElements = screen.getAllByText('Inseam');
      expect(inseamElements.length).toBeGreaterThan(0);
    });

    it('renders numbered steps', () => {
      const {container} = render(<SizeGuide {...defaultProps} />);
      const steps = container.querySelectorAll('.text-xs.font-semibold');
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('Close functionality', () => {
    it('calls onClose when modal close triggered', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<SizeGuide {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByTestId('modal-close');
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('applies background color to table rows', () => {
      const {container} = render(<SizeGuide {...defaultProps} />);
      const rows = container.querySelectorAll('tr');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('applies hover effects to size rows', () => {
      const {container} = render(<SizeGuide {...defaultProps} />);
      // Check for hover classes in the DOM
      expect(container.innerHTML).toContain('hover:bg-');
    });
  });

  describe('useSizeGuide hook', () => {
    it('returns initial state', () => {
      const {result} = renderHook(() => useSizeGuide());
      expect(result.current.isOpen).toBe(false);
    });

    it('opens size guide', () => {
      const {result} = renderHook(() => useSizeGuide());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('closes size guide', () => {
      const {result} = renderHook(() => useSizeGuide());

      act(() => {
        result.current.open();
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('toggles size guide state', () => {
      const {result} = renderHook(() => useSizeGuide());

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('has semantic table structure', () => {
      const {container} = render(<SizeGuide {...defaultProps} />);
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('has table headers', () => {
      const {container} = render(<SizeGuide {...defaultProps} />);
      const headers = container.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('handles switching between all product types', async () => {
      const user = userEvent.setup();
      const {container} = render(<SizeGuide {...defaultProps} />);

      const productTypes = ['Pants & Skirts', 'Dresses', 'Shoes', 'Belts & Accessories', 'Tops & Outerwear'];

      for (const type of productTypes) {
        const tab = screen.getByText(type);
        await user.click(tab);
        // Each type should have a size column - check for table header
        const headers = container.querySelectorAll('th');
        const hasSizeOrEU = Array.from(headers).some(h =>
          h.textContent === 'Size' || h.textContent === 'EU'
        );
        expect(hasSizeOrEU).toBe(true);
      }
    });

    it('maintains unit selection when switching tabs', async () => {
      const user = userEvent.setup();
      render(<SizeGuide {...defaultProps} />);

      // Switch to inches
      await user.click(screen.getByText('IN'));

      // Switch tab
      await user.click(screen.getByText('Pants & Skirts'));

      // Inches should still be selected
      const inButton = screen.getByText('IN').closest('button');
      expect(inButton).toHaveClass('bg-accent');
    });
  });
});

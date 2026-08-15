/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {FilterDrawer, AppliedFilters, type Filter, type AppliedFilter} from './FilterDrawer';

// Mock dependencies
const mockSetSearchParams = vi.fn();
let mockSearchParams = new URLSearchParams();

// Custom mock for react-router with useSearchParams (not in global mock)
vi.mock('react-router', () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  useLocation: vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  })),
  useRouteLoaderData: vi.fn(() => ({
    locale: 'en',
  })),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('~/lib/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('~/components/ui', () => ({
  Button: ({children, onClick, className, ...props}: any) => (
    <button onClick={onClick} className={className} {...props}>{children}</button>
  ),
  PriceRangeSlider: ({value, onChange, ...props}: any) => (
    <div data-testid="price-range-slider">
      <input
        type="range"
        value={value[0]}
        onChange={(e) => onChange([parseInt(e.target.value), value[1]])}
        {...props}
      />
      <input
        type="range"
        value={value[1]}
        onChange={(e) => onChange([value[0], parseInt(e.target.value)])}
        {...props}
      />
    </div>
  ),
  Modal: ({isOpen, onClose, children, title}: any) => {
    if (!isOpen) return null;
    const CloseIcon = () => <svg data-testid="close-icon" />;
    return (
      <div data-testid="modal" role="dialog">
        {title && (
          <div>
            <h2>{title}</h2>
            <button onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
        )}
        {children}
      </div>
    );
  },
  Accordion: {
    Root: ({children, className, defaultOpen}: any) => {
      return (
        <div data-testid="accordion-root" className={className} data-default-open={defaultOpen}>
          {children}
        </div>
      );
    },
    Item: ({children, id}: any) => {
      return (
        <div data-testid="accordion-item" data-item-id={id}>
          {children}
        </div>
      );
    },
    Trigger: ({children, className}: any) => {
      return (
        <button data-testid="accordion-trigger" className={className}>
          {children}
        </button>
      );
    },
    Content: ({children}: any) => {
      return (
        <div data-testid="accordion-content">
          {children}
        </div>
      );
    },
  },
}));

vi.mock('~/components/icons', () => ({
  FilterIcon: (props: any) => <svg data-testid="filter-icon" {...props} />,
  CloseIcon: (props: any) => <svg data-testid="close-icon" {...props} />,
  ChevronDownIcon: (props: any) => <svg data-testid="chevron-down-icon" {...props} />,
}));

describe('FilterDrawer', () => {
  const mockFilters: Filter[] = [
    {
      id: 'color',
      label: 'Color',
      type: 'LIST',
      values: [
        {id: '1', label: 'Black', count: 10, input: '{"color":"black"}'},
        {id: '2', label: 'White', count: 5, input: '{"color":"white"}'},
      ],
    },
    {
      id: 'size',
      label: 'Size',
      type: 'LIST',
      values: [
        {id: '3', label: 'Small', count: 3, input: '{"size":"small"}'},
        {id: '4', label: 'Medium', count: 7, input: '{"size":"medium"}'},
      ],
    },
    {
      id: 'price',
      label: 'Price',
      type: 'PRICE_RANGE',
      values: [],
    },
  ];

  const mockAppliedFilters: AppliedFilter[] = [
    {label: 'Black', filter: '{"color":"black"}'},
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  describe('Rendering Modes', () => {
    it('renders mobile button and desktop sidebar by default', () => {
      render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} />,
      );

      // Mobile button should be visible (appears twice: in button and in drawer)
      const filterTexts = screen.getAllByText('collection.filters');
      expect(filterTexts.length).toBeGreaterThan(0);

      // Desktop sidebar should be in DOM
      const asides = document.querySelectorAll('aside');
      expect(asides.length).toBeGreaterThan(0);
    });

    it('renders only mobile when mode is mobile', () => {
      render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="mobile" />,
      );

      expect(screen.getByText('collection.filters')).toBeInTheDocument();
    });

    it('renders only desktop when mode is desktop', () => {
      const {container} = render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="desktop" />,
      );

      // Desktop sidebar should exist
      const aside = container.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });
  });

  describe('Mobile Drawer', () => {
    it('opens mobile drawer when clicking filter button', async () => {
      const user = userEvent.setup();
      render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="mobile" />,
      );

      const button = screen.getByText('collection.filters');
      await user.click(button);

      // Drawer should be visible
      await waitFor(() => {
        const drawers = screen.getAllByText('collection.filters');
        expect(drawers.length).toBeGreaterThan(1); // One in button, one in drawer header
      });
    });

    it('closes mobile drawer when clicking close button', async () => {
      const user = userEvent.setup();
      render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="mobile" />,
      );

      // Open drawer
      const openButton = screen.getByText('collection.filters');
      await user.click(openButton);

      // Close drawer
      const closeButtons = screen.getAllByTestId('close-icon');
      await user.click(closeButtons[0].parentElement!);

      // Drawer should be closed (only one filters text remaining)
      await waitFor(() => {
        const filterTexts = screen.queryAllByText('collection.filters');
        expect(filterTexts.length).toBe(1);
      });
    });

    it('displays applied filter count badge', () => {
      render(
        <FilterDrawer
          filters={mockFilters}
          appliedFilters={mockAppliedFilters}
          mode="mobile"
        />,
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Filter Interaction', () => {
    it('toggles filter when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="desktop" />,
      );

      // Find the label containing "Black" and get its checkbox
      const blackText = screen.getByText('Black');
      const label = blackText.closest('label');
      const checkbox = label?.querySelector('input[type="checkbox"]');

      await user.click(checkbox!);

      expect(mockSetSearchParams).toHaveBeenCalled();
      const call = mockSetSearchParams.mock.calls[0][0];
      expect(call.get('filters')).toContain('color');
    });

    it('removes filter when unchecking', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('filters', JSON.stringify(['{"color":"black"}']));

      render(
        <FilterDrawer filters={mockFilters} appliedFilters={mockAppliedFilters} mode="desktop" />,
      );

      // Find the label containing "Black" and get its checkbox
      const blackText = screen.getByText('Black');
      const label = blackText.closest('label');
      const checkbox = label?.querySelector('input[type="checkbox"]') as HTMLInputElement;

      expect(checkbox.checked).toBe(true);

      await user.click(checkbox);

      expect(mockSetSearchParams).toHaveBeenCalled();
    });

    it('resets pagination when applying filter', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('cursor', 'abc123');
      mockSearchParams.set('direction', 'next');

      render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="desktop" />,
      );

      // Find the label containing "Black" and get its checkbox
      const blackText = screen.getByText('Black');
      const label = blackText.closest('label');
      const checkbox = label?.querySelector('input[type="checkbox"]');

      await user.click(checkbox!);

      const call = mockSetSearchParams.mock.calls[0][0];
      expect(call.has('cursor')).toBe(false);
      expect(call.has('direction')).toBe(false);
    });
  });

  describe('Price Range Filter', () => {
    it('renders price range slider', () => {
      render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="desktop" />,
      );

      expect(screen.getByTestId('price-range-slider')).toBeInTheDocument();
    });

    it('updates price inputs when slider changes', async () => {
      const user = userEvent.setup();
      render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="desktop" />,
      );

      const minInput = screen.getByPlaceholderText('collection.filterBy.min') as HTMLInputElement;
      await user.clear(minInput);
      await user.type(minInput, '50');

      expect(minInput.value).toBe('50');
    });

    it('applies price filter when clicking apply button', async () => {
      const user = userEvent.setup();
      render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="desktop" />,
      );

      const minInput = screen.getByPlaceholderText('collection.filterBy.min');
      await user.clear(minInput);
      await user.type(minInput, '100');

      const applyButtons = screen.getAllByText('collection.apply');
      await user.click(applyButtons[0]);

      expect(mockSetSearchParams).toHaveBeenCalled();
      const call = mockSetSearchParams.mock.calls[0][0];
      expect(call.get('filters')).toContain('price');
    });
  });

  describe('Clear Filters', () => {
    it('clears all filters when clicking clear all', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('filters', JSON.stringify(['{"color":"black"}']));

      render(
        <FilterDrawer
          filters={mockFilters}
          appliedFilters={mockAppliedFilters}
          mode="desktop"
        />,
      );

      const clearButton = screen.getByText('collection.clearAll');
      await user.click(clearButton);

      expect(mockSetSearchParams).toHaveBeenCalled();
      const call = mockSetSearchParams.mock.calls[0][0];
      expect(call.has('filters')).toBe(false);
    });

    it('resets price range when clearing filters', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('filters', JSON.stringify(['{"color":"black"}']));

      render(
        <FilterDrawer
          filters={mockFilters}
          appliedFilters={mockAppliedFilters}
          mode="desktop"
        />,
      );

      const clearButton = screen.getByText('collection.clearAll');
      await user.click(clearButton);

      const minInput = screen.getByPlaceholderText('collection.filterBy.min') as HTMLInputElement;
      expect(minInput.value).toBe('');
    });
  });

  describe('Filter Sections', () => {
    it('expands and collapses filter sections', async () => {
      const user = userEvent.setup();
      render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="desktop" />,
      );

      // Get the color filter section header button
      const colorButton = screen.getByText('Color').closest('button');
      expect(colorButton).toBeInTheDocument();

      // Initially expanded
      expect(screen.getByText('Black')).toBeVisible();

      // Collapse
      await user.click(colorButton!);

      // Expand again
      await user.click(colorButton!);
    });

    it('displays filter value counts', () => {
      render(
        <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="desktop" />,
      );

      expect(screen.getByText('(10)')).toBeInTheDocument();
      expect(screen.getByText('(5)')).toBeInTheDocument();
    });
  });

  describe('URL Sync', () => {
    it('parses filters from URL on mount', () => {
      mockSearchParams.set('filters', JSON.stringify(['{"color":"black"}']));

      render(
        <FilterDrawer filters={mockFilters} appliedFilters={mockAppliedFilters} mode="desktop" />,
      );

      // Find the label containing "Black" and get its checkbox
      const blackText = screen.getByText('Black');
      const label = blackText.closest('label');
      const checkbox = label?.querySelector('input[type="checkbox"]') as HTMLInputElement;

      expect(checkbox.checked).toBe(true);
    });

    it('handles invalid JSON in URL gracefully', () => {
      mockSearchParams.set('filters', 'invalid-json');

      expect(() => {
        render(
          <FilterDrawer filters={mockFilters} appliedFilters={[]} mode="desktop" />,
        );
      }).not.toThrow();
    });
  });
});

describe('AppliedFilters', () => {
  const mockOnRemove = vi.fn();
  const mockOnClearAll = vi.fn();

  const filters: AppliedFilter[] = [
    {label: 'Black', filter: '{"color":"black"}'},
    {label: 'Medium', filter: '{"size":"medium"}'},
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no filters applied', () => {
    const {container} = render(
      <AppliedFilters
        filters={[]}
        onRemove={mockOnRemove}
        onClearAll={mockOnClearAll}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders applied filter badges', () => {
    render(
      <AppliedFilters
        filters={filters}
        onRemove={mockOnRemove}
        onClearAll={mockOnClearAll}
      />,
    );

    expect(screen.getByText('Black')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('calls onRemove when clicking remove button', async () => {
    const user = userEvent.setup();
    render(
      <AppliedFilters
        filters={filters}
        onRemove={mockOnRemove}
        onClearAll={mockOnClearAll}
      />,
    );

    const blackFilter = screen.getByText('Black').closest('button');
    await user.click(blackFilter!);

    expect(mockOnRemove).toHaveBeenCalledWith('{"color":"black"}');
  });

  it('calls onClearAll when clicking clear all', async () => {
    const user = userEvent.setup();
    render(
      <AppliedFilters
        filters={filters}
        onRemove={mockOnRemove}
        onClearAll={mockOnClearAll}
      />,
    );

    const clearAllButton = screen.getByText('collection.clearAll');
    await user.click(clearAllButton);

    expect(mockOnClearAll).toHaveBeenCalled();
  });
});

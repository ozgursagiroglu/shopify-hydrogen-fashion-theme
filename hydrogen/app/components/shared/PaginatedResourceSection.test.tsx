/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {PaginatedResourceSection} from './PaginatedResourceSection';

// Mock Spinner
vi.mock('~/components/ui/Spinner', () => ({
  Spinner: ({size}: {size?: string}) => (
    <div data-testid="spinner" data-size={size}>Loading...</div>
  ),
}));

// Custom mock for @shopify/hydrogen Pagination component
const mockPagination = vi.fn();

vi.mock('@shopify/hydrogen', () => ({
  Pagination: ({children}: {children: (props: unknown) => React.ReactNode}) => {
    const props = mockPagination();
    return <div data-testid="pagination">{children(props)}</div>;
  },
}));

interface MockNode {
  id: string;
  title: string;
}

const mockNodes: MockNode[] = [
  {id: '1', title: 'Item 1'},
  {id: '2', title: 'Item 2'},
  {id: '3', title: 'Item 3'},
];

const mockConnection = {
  edges: mockNodes.map(node => ({node})),
  pageInfo: {
    hasNextPage: true,
    hasPreviousPage: false,
  },
};

describe('PaginatedResourceSection', () => {
  beforeEach(() => {
    mockPagination.mockReturnValue({
      nodes: mockNodes,
      isLoading: false,
      PreviousLink: ({children, className}: {children: React.ReactNode; className?: string}) => (
        <button className={className} disabled data-testid="previous-link">
          {children}
        </button>
      ),
      NextLink: ({children, className}: {children: React.ReactNode; className?: string}) => (
        <button className={className} data-testid="next-link">
          {children}
        </button>
      ),
    });
  });

  describe('Rendering', () => {
    it('renders all resource nodes', () => {
      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('passes node and index to children function', () => {
      const childrenFn = vi.fn(({node}) => <div key={node.id}>{node.title}</div>);

      render(
        <PaginatedResourceSection connection={mockConnection}>
          {childrenFn}
        </PaginatedResourceSection>
      );

      expect(childrenFn).toHaveBeenCalledTimes(3);
      expect(childrenFn).toHaveBeenCalledWith({node: mockNodes[0], index: 0});
      expect(childrenFn).toHaveBeenCalledWith({node: mockNodes[1], index: 1});
      expect(childrenFn).toHaveBeenCalledWith({node: mockNodes[2], index: 2});
    });

    it('wraps resources in custom className when provided', () => {
      const {container} = render(
        <PaginatedResourceSection
          connection={mockConnection}
          resourcesClassName="custom-grid"
        >
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      const resourcesContainer = container.querySelector('.custom-grid');
      expect(resourcesContainer).toBeInTheDocument();
      expect(resourcesContainer).toContainElement(screen.getByText('Item 1'));
    });

    it('renders resources without wrapper when no className', () => {
      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id} data-testid="item">{node.title}</div>}
        </PaginatedResourceSection>
      );

      const items = screen.getAllByTestId('item');
      expect(items).toHaveLength(3);
    });
  });

  describe('Navigation links', () => {
    it('renders previous link', () => {
      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      expect(screen.getByTestId('previous-link')).toBeInTheDocument();
      expect(screen.getByText('Load previous')).toBeInTheDocument();
    });

    it('renders next link', () => {
      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      expect(screen.getByTestId('next-link')).toBeInTheDocument();
      expect(screen.getByText('Load more')).toBeInTheDocument();
    });

    it('renders up arrow icon in previous link', () => {
      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      const previousLink = screen.getByTestId('previous-link');
      const svg = previousLink.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelector('path')).toHaveAttribute('d', 'm18 15-6-6-6 6');
    });

    it('renders down arrow icon in next link', () => {
      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      const nextLink = screen.getByTestId('next-link');
      const svg = nextLink.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelector('path')).toHaveAttribute('d', 'm6 9 6 6 6-6');
    });
  });

  describe('Loading state', () => {
    it('shows spinner when loading', () => {
      mockPagination.mockReturnValue({
        nodes: mockNodes,
        isLoading: true,
        PreviousLink: ({children}: {children: React.ReactNode}) => <button>{children}</button>,
        NextLink: ({children}: {children: React.ReactNode}) => <button>{children}</button>,
      });

      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      const spinners = screen.getAllByTestId('spinner');
      expect(spinners.length).toBeGreaterThan(0);
      expect(spinners[0]).toHaveAttribute('data-size', 'sm');
    });

    it('shows loading text when loading', () => {
      mockPagination.mockReturnValue({
        nodes: mockNodes,
        isLoading: true,
        PreviousLink: ({children}: {children: React.ReactNode}) => <button>{children}</button>,
        NextLink: ({children}: {children: React.ReactNode}) => <button>{children}</button>,
      });

      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      const loadingTexts = screen.getAllByText('Loading...');
      expect(loadingTexts.length).toBeGreaterThan(0);
    });

    it('hides icons when loading', () => {
      mockPagination.mockReturnValue({
        nodes: mockNodes,
        isLoading: true,
        PreviousLink: ({children}: {children: React.ReactNode}) => <button data-testid="prev">{children}</button>,
        NextLink: ({children}: {children: React.ReactNode}) => <button data-testid="next">{children}</button>,
      });

      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      // When loading, previous/next text should not be present
      expect(screen.queryByText('Load previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Load more')).not.toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('wraps content in flex column with gap', () => {
      const {container} = render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      const wrapper = container.querySelector('.flex.flex-col.gap-8');
      expect(wrapper).toBeInTheDocument();
    });

    it('centers navigation buttons', () => {
      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      const previousLink = screen.getByTestId('previous-link');
      const nextLink = screen.getByTestId('next-link');

      expect(previousLink).toHaveClass('mx-auto');
      expect(nextLink).toHaveClass('mx-auto');
    });
  });

  describe('Button styling', () => {
    it('applies consistent styling to navigation buttons', () => {
      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      const previousLink = screen.getByTestId('previous-link');
      const nextLink = screen.getByTestId('next-link');

      [previousLink, nextLink].forEach(button => {
        expect(button).toHaveClass('inline-flex');
        expect(button).toHaveClass('items-center');
        expect(button).toHaveClass('justify-center');
        expect(button).toHaveClass('gap-2');
        expect(button).toHaveClass('px-8');
        expect(button).toHaveClass('py-3');
        expect(button).toHaveClass('border');
        expect(button).toHaveClass('border-border');
        expect(button).toHaveClass('rounded-lg');
      });
    });

    it('has hover styles on navigation buttons', () => {
      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      const previousLink = screen.getByTestId('previous-link');
      const nextLink = screen.getByTestId('next-link');

      [previousLink, nextLink].forEach(button => {
        expect(button).toHaveClass('hover:border-text');
        expect(button).toHaveClass('hover:bg-surface-hover');
      });
    });

    it('has disabled styles on navigation buttons', () => {
      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      const previousLink = screen.getByTestId('previous-link');
      const nextLink = screen.getByTestId('next-link');

      [previousLink, nextLink].forEach(button => {
        expect(button).toHaveClass('disabled:opacity-50');
        expect(button).toHaveClass('disabled:cursor-not-allowed');
      });
    });
  });

  describe('Pagination integration', () => {
    it('passes connection to Pagination component', () => {
      render(
        <PaginatedResourceSection connection={mockConnection}>
          {({node}) => <div key={node.id}>{node.title}</div>}
        </PaginatedResourceSection>
      );

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });
});

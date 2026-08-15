/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {SectionHeader} from './SectionHeader';

// Custom mock for react-router Link with data-testid for SectionHeader tests
vi.mock('react-router', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid="router-link">
      {children}
    </a>
  ),
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

// Mock ArrowRightIcon
vi.mock('~/components/icons', () => ({
  ArrowRightIcon: ({className}: {className?: string}) => (
    <svg data-testid="arrow-right-icon" className={className} />
  ),
}));

describe('SectionHeader', () => {
  describe('Rendering', () => {
    it('renders title', () => {
      render(<SectionHeader title="New Arrivals" />);

      expect(screen.getByText('New Arrivals')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(<SectionHeader title="Featured" subtitle="Discover our latest collection" />);

      expect(screen.getByText('Featured')).toBeInTheDocument();
      expect(screen.getByText('Discover our latest collection')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      render(<SectionHeader title="Products" />);

      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(
        <SectionHeader title="Title" className="custom-header" />,
      );

      const header = container.querySelector('.custom-header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Action Link', () => {
    it('renders action link when provided', () => {
      render(
        <SectionHeader
          title="Best Sellers"
          action={{label: 'View All', href: '/products'}}
        />,
      );

      const link = screen.getByTestId('router-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('View All');
      expect(link).toHaveAttribute('href', '/products');
    });

    it('does not render action when not provided', () => {
      render(<SectionHeader title="Title" />);

      expect(screen.queryByTestId('router-link')).not.toBeInTheDocument();
    });

    it('renders arrow icon with action', () => {
      render(
        <SectionHeader
          title="Title"
          action={{label: 'See More', href: '/collections'}}
        />,
      );

      expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument();
    });

    it('applies correct link styles', () => {
      render(
        <SectionHeader
          title="Title"
          action={{label: 'Shop Now', href: '/shop'}}
        />,
      );

      const link = screen.getByTestId('router-link');
      expect(link.className).toContain('group');
      expect(link.className).toContain('inline-flex');
      expect(link.className).toContain('items-center');
      expect(link.className).toContain('gap-2');
      expect(link.className).toContain('uppercase');
      expect(link.className).toContain('tracking-wider');
    });
  });

  describe('Centered Variant', () => {
    it('applies centered layout when centered is true', () => {
      const {container} = render(<SectionHeader title="Title" centered />);

      const header = container.firstChild;
      expect(header).toHaveClass('items-center');
      expect(header).toHaveClass('text-center');
    });

    it('applies horizontal layout by default', () => {
      const {container} = render(<SectionHeader title="Title" />);

      const header = container.firstChild;
      expect(header).toHaveClass('md:flex-row');
      expect(header).toHaveClass('md:items-end');
      expect(header).toHaveClass('md:justify-between');
    });

    it('applies correct layout with centered and action', () => {
      const {container} = render(
        <SectionHeader
          title="Title"
          centered
          action={{label: 'View', href: '/view'}}
        />,
      );

      const header = container.firstChild;
      expect(header).toHaveClass('items-center');
      expect(header).toHaveClass('text-center');
    });
  });

  describe('Typography', () => {
    it('applies correct title styles', () => {
      render(<SectionHeader title="Heading" />);

      // TextReveal renders the text inside an animated <span> within the heading element,
      // so query the heading itself rather than the text node's direct parent.
      const title = screen.getByRole('heading', {level: 2});
      expect(title).toHaveTextContent('Heading');
      expect(title.className).toContain('text-3xl');
      expect(title.className).toContain('md:text-4xl');
      expect(title.className).toContain('font-display');
      expect(title.className).toContain('text-text');
    });

    it('applies correct subtitle styles', () => {
      render(<SectionHeader title="Title" subtitle="Subtitle text" />);

      const subtitle = screen.getByText('Subtitle text');
      expect(subtitle.tagName).toBe('P');
      expect(subtitle.className).toContain('mt-2');
      expect(subtitle.className).toContain('text-text-muted');
      expect(subtitle.className).toContain('text-base');
      expect(subtitle.className).toContain('md:text-lg');
    });

    it('applies correct action text styles', () => {
      render(
        <SectionHeader
          title="Title"
          action={{label: 'Explore', href: '/explore'}}
        />,
      );

      const link = screen.getByTestId('router-link');
      expect(link.className).toContain('text-sm');
      expect(link.className).toContain('uppercase');
      expect(link.className).toContain('tracking-wider');
      expect(link.className).toContain('font-medium');
    });
  });

  describe('Layout Structure', () => {
    it('renders title and subtitle in same container', () => {
      const {container} = render(
        <SectionHeader title="Main Title" subtitle="Supporting text" />,
      );

      const titleContainer = container.querySelector('div > div');
      const title = titleContainer?.querySelector('h2');
      const subtitle = titleContainer?.querySelector('p');

      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    });

    it('applies gap-2 to main container', () => {
      const {container} = render(<SectionHeader title="Title" />);

      const header = container.firstChild;
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('gap-2');
    });

    it('applies mt-4 to action on mobile', () => {
      render(
        <SectionHeader
          title="Title"
          action={{label: 'Link', href: '/link'}}
        />,
      );

      const link = screen.getByTestId('router-link');
      expect(link.className).toContain('mt-4');
      expect(link.className).toContain('md:mt-0');
    });
  });

  describe('Icon Animation', () => {
    it('applies transition to arrow icon', () => {
      render(
        <SectionHeader
          title="Title"
          action={{label: 'Go', href: '/go'}}
        />,
      );

      const icon = screen.getByTestId('arrow-right-icon');
      const iconClasses = icon.getAttribute('class') || '';
      expect(iconClasses).toContain('transition-transform');
      expect(iconClasses).toContain('group-hover:translate-x-1');
    });

    it('sets icon size', () => {
      render(
        <SectionHeader
          title="Title"
          action={{label: 'Next', href: '/next'}}
        />,
      );

      const icon = screen.getByTestId('arrow-right-icon');
      const iconClasses = icon.getAttribute('class') || '';
      expect(iconClasses).toContain('w-4');
      expect(iconClasses).toContain('h-4');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic heading element', () => {
      render(<SectionHeader title="Section Title" />);

      expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument();
    });

    it('action link is keyboard accessible', () => {
      render(
        <SectionHeader
          title="Title"
          action={{label: 'Navigate', href: '/navigate'}}
        />,
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href');
    });
  });

  describe('Complete Examples', () => {
    it('renders minimal header with title only', () => {
      render(<SectionHeader title="Simple Header" />);

      expect(screen.getByRole('heading')).toHaveTextContent('Simple Header');
      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders full header with all props', () => {
      render(
        <SectionHeader
          title="Complete Header"
          subtitle="This is a complete example"
          action={{label: 'View All Products', href: '/products/all'}}
          centered
          className="custom-section"
        />,
      );

      expect(screen.getByText('Complete Header')).toBeInTheDocument();
      expect(screen.getByText('This is a complete example')).toBeInTheDocument();
      expect(screen.getByText('View All Products')).toBeInTheDocument();
      expect(screen.getByTestId('router-link')).toHaveAttribute('href', '/products/all');
    });

    it('renders header with long subtitle', () => {
      const longSubtitle =
        'This is a very long subtitle that provides detailed information about the section';

      render(<SectionHeader title="Title" subtitle={longSubtitle} />);

      expect(screen.getByText(longSubtitle)).toBeInTheDocument();
    });

    it('renders header with special characters in title', () => {
      render(<SectionHeader title="Spring/Summer '25" />);

      expect(screen.getByText("Spring/Summer '25")).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive text sizes', () => {
      render(<SectionHeader title="Title" subtitle="Subtitle" />);

      const title = screen.getByRole('heading');
      expect(title.className).toContain('text-3xl');
      expect(title.className).toContain('md:text-4xl');

      const subtitle = screen.getByText('Subtitle');
      expect(subtitle.className).toContain('text-base');
      expect(subtitle.className).toContain('md:text-lg');
    });

    it('applies responsive layout classes', () => {
      const {container} = render(<SectionHeader title="Title" />);

      const header = container.firstChild;
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('md:flex-row');
      expect(header).toHaveClass('md:items-end');
      expect(header).toHaveClass('md:justify-between');
    });
  });

  describe('Action Link Height', () => {
    it('applies fixed height to action link', () => {
      render(
        <SectionHeader
          title="Title"
          action={{label: 'Link', href: '/link'}}
        />,
      );

      const link = screen.getByTestId('router-link');
      expect(link.className).toContain('h-6');
    });
  });
});

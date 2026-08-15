/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Hero, SplitHero} from './Hero';

// Override Image mock with custom testid
vi.mock('@shopify/hydrogen', () => ({
  Image: ({data, className}: {data: {url: string; altText?: string}; className?: string}) => (
    <img src={data.url} alt={data.altText} className={className} data-testid="hydrogen-image" />
  ),
  Money: ({data}: {data: {amount: string; currencyCode: string}}) => (
    <span data-testid="money">${data?.amount || '0'}</span>
  ),
}));

// Mock Button component
vi.mock('~/components/ui/Button', () => ({
  Button: ({as, to, variant, size, children}: {as?: string; to?: string; variant?: string; size?: string; children: React.ReactNode}) => (
    <button data-as={as} data-to={to} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  ArrowRightIcon: ({className, strokeWidth}: {className?: string; strokeWidth?: number}) => (
    <svg data-testid="arrow-icon" className={className} data-stroke-width={strokeWidth} />
  ),
}));

// Mock cn utility
vi.mock('~/lib/cn', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

describe('Hero', () => {
  describe('Rendering', () => {
    it('renders title', () => {
      render(<Hero title="Welcome to Our Store" />);

      expect(screen.getByText('Welcome to Our Store')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(
        <Hero
          title="Welcome"
          subtitle="Discover amazing products"
        />
      );

      expect(screen.getByText('Discover amazing products')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      render(<Hero title="Welcome" />);

      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });

    it('renders background image when provided', () => {
      render(
        <Hero
          title="Welcome"
          backgroundImage={{url: 'https://example.com/bg.jpg', altText: 'Hero background'}}
        />
      );

      const image = screen.getByTestId('hydrogen-image');
      expect(image).toHaveAttribute('src', 'https://example.com/bg.jpg');
      expect(image).toHaveAttribute('alt', 'Hero background');
    });

    it('uses title as alt text when altText not provided', () => {
      render(
        <Hero
          title="Welcome"
          backgroundImage={{url: 'https://example.com/bg.jpg'}}
        />
      );

      const image = screen.getByTestId('hydrogen-image');
      expect(image).toHaveAttribute('alt', 'Welcome');
    });
  });

  describe('CTAs', () => {
    it('renders primary CTA when provided', () => {
      render(
        <Hero
          title="Welcome"
          primaryCta={{label: 'Shop Now', href: '/shop'}}
        />
      );

      const button = screen.getByText('Shop Now');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-to', '/shop');
    });

    it('renders secondary CTA when provided', () => {
      render(
        <Hero
          title="Welcome"
          secondaryCta={{label: 'Learn More', href: '/about'}}
        />
      );

      const button = screen.getByText('Learn More');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-to', '/about');
    });

    it('renders both CTAs', () => {
      render(
        <Hero
          title="Welcome"
          primaryCta={{label: 'Shop Now', href: '/shop'}}
          secondaryCta={{label: 'Learn More', href: '/about'}}
        />
      );

      expect(screen.getByText('Shop Now')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('uses inverse variant for primary CTA with background image', () => {
      render(
        <Hero
          title="Welcome"
          primaryCta={{label: 'Shop Now', href: '/shop'}}
          backgroundImage={{url: 'https://example.com/bg.jpg'}}
        />
      );

      const button = screen.getByText('Shop Now');
      expect(button).toHaveAttribute('data-variant', 'inverse');
    });

    it('uses primary variant for primary CTA without background image', () => {
      render(
        <Hero
          title="Welcome"
          primaryCta={{label: 'Shop Now', href: '/shop'}}
        />
      );

      const button = screen.getByText('Shop Now');
      expect(button).toHaveAttribute('data-variant', 'primary');
    });

    it('uses inverse-outline variant for secondary CTA with background image', () => {
      render(
        <Hero
          title="Welcome"
          secondaryCta={{label: 'Learn More', href: '/about'}}
          backgroundImage={{url: 'https://example.com/bg.jpg'}}
        />
      );

      const button = screen.getByText('Learn More');
      expect(button).toHaveAttribute('data-variant', 'inverse-outline');
    });

    it('uses secondary variant for secondary CTA without background image', () => {
      render(
        <Hero
          title="Welcome"
          secondaryCta={{label: 'Learn More', href: '/about'}}
        />
      );

      const button = screen.getByText('Learn More');
      expect(button).toHaveAttribute('data-variant', 'secondary');
    });

    it('uses large size for CTA buttons', () => {
      render(
        <Hero
          title="Welcome"
          primaryCta={{label: 'Shop Now', href: '/shop'}}
        />
      );

      const button = screen.getByText('Shop Now');
      expect(button).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('Layout options', () => {
    it('applies custom className', () => {
      const {container} = render(
        <Hero title="Welcome" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies full height by default', () => {
      const {container} = render(<Hero title="Welcome" />);

      expect(container.firstChild).toHaveClass('min-h-[85vh]');
    });

    it('applies large height', () => {
      const {container} = render(<Hero title="Welcome" height="large" />);

      expect(container.firstChild).toHaveClass('min-h-[85vh]');
    });

    it('applies medium height', () => {
      const {container} = render(<Hero title="Welcome" height="medium" />);

      expect(container.firstChild).toHaveClass('min-h-[60vh]');
    });

    it('applies full viewport height', () => {
      const {container} = render(<Hero title="Welcome" height="full" />);

      expect(container.firstChild).toHaveClass('min-h-screen');
    });

    it('applies center alignment by default', () => {
      const {container} = render(<Hero title="Welcome" />);

      expect(container.querySelector('div')).toHaveClass('items-center');
    });

    it('applies left alignment', () => {
      const {container} = render(<Hero title="Welcome" align="left" />);

      expect(container.querySelector('div')).toHaveClass('items-start');
    });

    it('applies right alignment', () => {
      const {container} = render(<Hero title="Welcome" align="right" />);

      expect(container.querySelector('div')).toHaveClass('items-end');
    });
  });

  describe('Overlay', () => {
    it('renders overlay by default when background image is present', () => {
      const {container} = render(
        <Hero
          title="Welcome"
          backgroundImage={{url: 'https://example.com/bg.jpg'}}
        />
      );

      const overlays = container.querySelectorAll('.overlay-hero');
      expect(overlays.length).toBeGreaterThan(0);
    });

    it('does not render overlay when overlay is false', () => {
      const {container} = render(
        <Hero
          title="Welcome"
          backgroundImage={{url: 'https://example.com/bg.jpg'}}
          overlay={false}
        />
      );

      const overlays = container.querySelectorAll('.bg-black\\/40');
      expect(overlays.length).toBe(0);
    });
  });
});

describe('SplitHero', () => {
  const mockLeftPanel = {
    title: 'Women',
    cta: {label: 'Shop Women', href: '/collections/women'},
    image: {url: 'https://example.com/women.jpg', altText: 'Women collection'},
  };

  const mockRightPanel = {
    title: 'Men',
    cta: {label: 'Shop Men', href: '/collections/men'},
    image: {url: 'https://example.com/men.jpg', altText: 'Men collection'},
  };

  it('renders both panels', () => {
    render(<SplitHero leftPanel={mockLeftPanel} rightPanel={mockRightPanel} />);

    expect(screen.getByText('Women')).toBeInTheDocument();
    expect(screen.getByText('Men')).toBeInTheDocument();
  });

  it('renders panel images', () => {
    render(<SplitHero leftPanel={mockLeftPanel} rightPanel={mockRightPanel} />);

    const images = screen.getAllByTestId('hydrogen-image');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/women.jpg');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/men.jpg');
  });

  it('renders panel CTAs', () => {
    render(<SplitHero leftPanel={mockLeftPanel} rightPanel={mockRightPanel} />);

    expect(screen.getByText('Shop Women')).toBeInTheDocument();
    expect(screen.getByText('Shop Men')).toBeInTheDocument();
  });

  it('links panels to correct URLs', () => {
    render(<SplitHero leftPanel={mockLeftPanel} rightPanel={mockRightPanel} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/collections/women');
    expect(links[1]).toHaveAttribute('href', '/collections/men');
  });

  it('renders arrow icons in CTAs', () => {
    render(<SplitHero leftPanel={mockLeftPanel} rightPanel={mockRightPanel} />);

    const arrows = screen.getAllByTestId('arrow-icon');
    expect(arrows).toHaveLength(2);
  });

  it('applies custom className', () => {
    const {container} = render(
      <SplitHero
        leftPanel={mockLeftPanel}
        rightPanel={mockRightPanel}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('uses title as alt text when not provided', () => {
    const panelWithoutAlt = {
      ...mockLeftPanel,
      image: {url: 'https://example.com/women.jpg'},
    };

    render(<SplitHero leftPanel={panelWithoutAlt} rightPanel={mockRightPanel} />);

    const images = screen.getAllByTestId('hydrogen-image');
    expect(images[0]).toHaveAttribute('alt', 'Women');
  });
});

/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CategoryGrid, FeaturedCategory} from './CategoryGrid';

// Override Image mock to include sizes prop and custom testid
vi.mock('@shopify/hydrogen', () => ({
  Image: ({data, className, sizes}: {data: {url: string; altText?: string}; className?: string; sizes?: string}) => (
    <img src={data.url} alt={data.altText} className={className} data-sizes={sizes} data-testid="hydrogen-image" />
  ),
  Money: ({data}: {data: {amount: string; currencyCode: string}}) => (
    <span data-testid="money">${data?.amount || '0'}</span>
  ),
}));

// Mock SectionHeader
vi.mock('~/components/ui', () => ({
  SectionHeader: ({title, subtitle, centered}: {title?: string; subtitle?: string; centered?: boolean}) => (
    <div data-testid="section-header" data-centered={centered}>
      {title && <h2>{title}</h2>}
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  ArrowRightIcon: ({className}: {className?: string}) => (
    <svg data-testid="arrow-icon" className={className} />
  ),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock cn utility
vi.mock('~/lib/cn', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

const mockCategories = [
  {
    title: 'Dresses',
    href: '/collections/dresses',
    image: {url: 'https://example.com/dresses.jpg', altText: 'Dresses collection'},
  },
  {
    title: 'Tops',
    href: '/collections/tops',
    image: {url: 'https://example.com/tops.jpg'},
  },
  {
    title: 'Pants',
    href: '/collections/pants',
    image: {url: 'https://example.com/pants.jpg'},
    description: 'Comfortable and stylish pants',
  },
];

describe('CategoryGrid', () => {
  describe('Rendering', () => {
    it('renders all categories', () => {
      render(<CategoryGrid categories={mockCategories} />);

      expect(screen.getByText('Dresses')).toBeInTheDocument();
      expect(screen.getByText('Tops')).toBeInTheDocument();
      expect(screen.getByText('Pants')).toBeInTheDocument();
    });

    it('renders category images', () => {
      render(<CategoryGrid categories={mockCategories} />);

      const images = screen.getAllByTestId('hydrogen-image');
      expect(images).toHaveLength(3);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/dresses.jpg');
    });

    it('renders title when provided', () => {
      render(<CategoryGrid categories={mockCategories} title="Shop by Category" />);

      expect(screen.getByText('Shop by Category')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(
        <CategoryGrid
          categories={mockCategories}
          title="Shop by Category"
          subtitle="Find your perfect style"
        />
      );

      expect(screen.getByText('Find your perfect style')).toBeInTheDocument();
    });

    it('does not render section header when no title', () => {
      render(<CategoryGrid categories={mockCategories} />);

      expect(screen.queryByTestId('section-header')).not.toBeInTheDocument();
    });

    it('renders category description when provided', () => {
      render(<CategoryGrid categories={mockCategories} />);

      expect(screen.getByText('Comfortable and stylish pants')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(
        <CategoryGrid categories={mockCategories} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // The layout is driven by how many categories are passed in, not by a column prop:
  // three or more render an editorial bento grid, fewer render a simple two-up grid.
  describe('Grid layouts', () => {
    it('renders the bento grid for three or more categories', () => {
      const {container} = render(<CategoryGrid categories={mockCategories} />);

      const grid = container.querySelector('.grid-cols-2.md\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('gives the first category the featured span in the bento grid', () => {
      const {container} = render(<CategoryGrid categories={mockCategories} />);

      const featured = container.querySelector('.md\\:col-span-2.md\\:row-span-2');
      expect(featured).toBeInTheDocument();
    });

    it('renders a simple two-column grid for fewer than three categories', () => {
      const {container} = render(
        <CategoryGrid categories={mockCategories.slice(0, 2)} />,
      );

      expect(container.querySelector('.grid-cols-2')).toBeInTheDocument();
      expect(container.querySelector('.md\\:grid-cols-3')).not.toBeInTheDocument();
    });
  });

  describe('Category cards', () => {
    it('links to correct URLs', () => {
      render(<CategoryGrid categories={mockCategories} />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/collections/dresses');
      expect(links[1]).toHaveAttribute('href', '/collections/tops');
      expect(links[2]).toHaveAttribute('href', '/collections/pants');
    });

    it('uses title as alt text when not provided', () => {
      render(<CategoryGrid categories={mockCategories} />);

      const images = screen.getAllByTestId('hydrogen-image');
      expect(images[1]).toHaveAttribute('alt', 'Tops');
    });

    it('renders shop now text', () => {
      render(<CategoryGrid categories={mockCategories} />);

      const shopNowTexts = screen.getAllByText('common.shopNow');
      expect(shopNowTexts.length).toBeGreaterThan(0);
    });

    it('renders arrow icons', () => {
      render(<CategoryGrid categories={mockCategories} />);

      const arrows = screen.getAllByTestId('arrow-icon');
      expect(arrows).toHaveLength(3);
    });
  });

  describe('Section header', () => {
    it('centers section header when title provided', () => {
      render(<CategoryGrid categories={mockCategories} title="Categories" />);

      const header = screen.getByTestId('section-header');
      expect(header).toHaveAttribute('data-centered', 'true');
    });
  });
});

describe('FeaturedCategory', () => {
  const mockCategory = {
    title: 'Summer Collection',
    href: '/collections/summer',
    image: {url: 'https://example.com/summer.jpg', altText: 'Summer collection'},
    description: 'Explore our latest summer styles',
  };

  it('renders category title', () => {
    render(<FeaturedCategory category={mockCategory} />);

    expect(screen.getByText('Summer Collection')).toBeInTheDocument();
  });

  it('renders category description', () => {
    render(<FeaturedCategory category={mockCategory} />);

    expect(screen.getByText('Explore our latest summer styles')).toBeInTheDocument();
  });

  it('renders category image', () => {
    render(<FeaturedCategory category={mockCategory} />);

    const image = screen.getByTestId('hydrogen-image');
    expect(image).toHaveAttribute('src', 'https://example.com/summer.jpg');
    expect(image).toHaveAttribute('alt', 'Summer collection');
  });

  it('links to category URL', () => {
    render(<FeaturedCategory category={mockCategory} />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', '/collections/summer');
  });

  it('renders explore collection text', () => {
    render(<FeaturedCategory category={mockCategory} />);

    expect(screen.getByText('collection.exploreCollection')).toBeInTheDocument();
  });

  it('renders arrow icon', () => {
    render(<FeaturedCategory category={mockCategory} />);

    expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const {container} = render(
      <FeaturedCategory category={mockCategory} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies reverse layout', () => {
    const {container} = render(
      <FeaturedCategory category={mockCategory} reverse />
    );

    const image = container.querySelector('.md\\:order-2');
    expect(image).toBeInTheDocument();
  });

  it('does not apply reverse layout by default', () => {
    const {container} = render(<FeaturedCategory category={mockCategory} />);

    const image = container.querySelector('.md\\:order-2');
    expect(image).not.toBeInTheDocument();
  });

  it('uses title as alt text when not provided', () => {
    const categoryWithoutAlt = {
      ...mockCategory,
      image: {url: 'https://example.com/summer.jpg'},
    };

    render(<FeaturedCategory category={categoryWithoutAlt} />);

    const image = screen.getByTestId('hydrogen-image');
    expect(image).toHaveAttribute('alt', 'Summer Collection');
  });

  it('does not render description when not provided', () => {
    const categoryWithoutDescription = {
      title: 'Summer Collection',
      href: '/collections/summer',
      image: {url: 'https://example.com/summer.jpg'},
    };

    render(<FeaturedCategory category={categoryWithoutDescription} />);

    expect(screen.queryByText('Explore our latest summer styles')).not.toBeInTheDocument();
  });
});

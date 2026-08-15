/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Lookbook, FeatureStrip} from './Lookbook';

// Override Image mock to include sizes prop and custom testid
vi.mock('@shopify/hydrogen', () => ({
  Image: ({data, sizes, className}: {data: {url: string; altText?: string}; sizes?: string; className?: string}) => (
    <img src={data.url} alt={data.altText} data-sizes={sizes} className={className} data-testid="hydrogen-image" />
  ),
  Money: ({data}: {data: {amount: string; currencyCode: string}}) => (
    <span data-testid="money">${data?.amount || '0'}</span>
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

const mockItems = [
  {
    image: {url: 'https://example.com/look1.jpg', altText: 'Spring Look'},
    title: 'Spring Collection',
    href: '/lookbook/spring',
  },
  {
    image: {url: 'https://example.com/look2.jpg'},
    title: 'Summer Vibes',
    href: '/lookbook/summer',
  },
  {
    image: {url: 'https://example.com/look3.jpg'},
    href: '/lookbook/fall',
  },
];

describe('Lookbook', () => {
  describe('Rendering', () => {
    it('renders all lookbook items', () => {
      render(<Lookbook items={mockItems} />);

      const images = screen.getAllByTestId('hydrogen-image');
      expect(images).toHaveLength(3);
    });

    it('returns null when no items', () => {
      const {container} = render(<Lookbook items={[]} />);

      expect(container).toBeEmptyDOMElement();
    });

    it('returns null when items is null', () => {
      const {container} = render(<Lookbook items={null as any} />);

      expect(container).toBeEmptyDOMElement();
    });

    it('renders item images', () => {
      render(<Lookbook items={mockItems} />);

      const images = screen.getAllByTestId('hydrogen-image');
      expect(images[0]).toHaveAttribute('src', 'https://example.com/look1.jpg');
      expect(images[0]).toHaveAttribute('alt', 'Spring Look');
    });

    it('uses title as alt text when not provided', () => {
      render(<Lookbook items={mockItems} />);

      const images = screen.getAllByTestId('hydrogen-image');
      expect(images[1]).toHaveAttribute('alt', 'Summer Vibes');
    });

    it('uses fallback alt text when no title or altText', () => {
      render(<Lookbook items={mockItems} />);

      const images = screen.getAllByTestId('hydrogen-image');
      expect(images[2]).toHaveAttribute('alt', 'Lookbook image');
    });

    it('renders optional title', () => {
      render(<Lookbook items={mockItems} title="Our Lookbook" />);

      expect(screen.getByText('Our Lookbook')).toBeInTheDocument();
    });

    it('renders optional subtitle', () => {
      render(
        <Lookbook
          items={mockItems}
          title="Our Lookbook"
          subtitle="Discover our latest collections"
        />
      );

      expect(screen.getByText('Discover our latest collections')).toBeInTheDocument();
    });

    it('does not render header when no title', () => {
      const {container} = render(<Lookbook items={mockItems} />);

      const headers = container.querySelectorAll('h2');
      expect(headers.length).toBe(0);
    });

    it('applies custom className', () => {
      const {container} = render(
        <Lookbook items={mockItems} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Item links', () => {
    it('links to correct URLs', () => {
      render(<Lookbook items={mockItems} />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/lookbook/spring');
      expect(links[1]).toHaveAttribute('href', '/lookbook/summer');
      expect(links[2]).toHaveAttribute('href', '/lookbook/fall');
    });
  });

  describe('Item titles', () => {
    it('renders item title when provided', () => {
      render(<Lookbook items={mockItems} />);

      expect(screen.getByText('Spring Collection')).toBeInTheDocument();
      expect(screen.getByText('Summer Vibes')).toBeInTheDocument();
    });

    it('renders shop the look text with title', () => {
      render(<Lookbook items={mockItems} />);

      const shopTexts = screen.getAllByText('Shop the Look');
      expect(shopTexts.length).toBe(2); // Only items with titles
    });

    it('does not render title overlay when title not provided', () => {
      render(<Lookbook items={mockItems} />);

      // Third item has no title
      expect(screen.queryAllByText('Shop the Look')).toHaveLength(2);
    });

    it('renders arrow icons with titles', () => {
      render(<Lookbook items={mockItems} />);

      const arrows = screen.getAllByTestId('arrow-icon');
      expect(arrows.length).toBe(2); // Only items with titles
    });
  });

  describe('Grid layout', () => {
    it('applies single column for 1 item', () => {
      const {container} = render(<Lookbook items={[mockItems[0]]} />);

      const grid = container.querySelector('.grid-cols-1:not(.md\\:grid-cols-2)');
      expect(grid).toBeInTheDocument();
    });

    it('applies the asymmetric five-column layout for 2 items', () => {
      const {container} = render(<Lookbook items={mockItems.slice(0, 2)} />);

      expect(container.querySelector('.md\\:grid-cols-5')).toBeInTheDocument();
      expect(container.querySelectorAll('.md\\:col-span-3')).toHaveLength(1);
      expect(container.querySelectorAll('.md\\:col-span-2')).toHaveLength(1);
    });

    it('stacks two items beside a featured one for 3 items', () => {
      const {container} = render(<Lookbook items={mockItems} />);

      expect(container.querySelector('.md\\:grid-cols-5')).toBeInTheDocument();
      expect(
        container.querySelector('.md\\:col-span-3.md\\:row-span-2'),
      ).toBeInTheDocument();
      expect(container.querySelectorAll('.md\\:col-span-2')).toHaveLength(2);
    });

    it('applies an equal three-column grid for 4 or more items', () => {
      const fourItems = [...mockItems, {...mockItems[0], href: '/looks/4'}];
      const {container} = render(<Lookbook items={fourItems} />);

      expect(container.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
    });
  });

  describe('Aspect ratio', () => {
    it('applies the 4:5 aspect ratio to the non-featured items', () => {
      const {container} = render(<Lookbook items={mockItems} />);

      // With three items the first card is rendered tall, the other two are 4:5.
      expect(container.querySelectorAll('.aspect-4\\/5')).toHaveLength(2);
      expect(container.querySelectorAll('.aspect-3\\/4')).toHaveLength(1);
    });
  });
});

describe('FeatureStrip', () => {
  const mockFeature = {
    image: {url: 'https://example.com/feature.jpg', altText: 'Feature'},
    title: 'Sustainability',
    subtitle: 'Our commitment to the planet',
    cta: {label: 'Learn More', href: '/sustainability'},
  };

  it('renders title', () => {
    render(<FeatureStrip {...mockFeature} />);

    expect(screen.getByText('Sustainability')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<FeatureStrip {...mockFeature} />);

    expect(screen.getByText('Our commitment to the planet')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    const featureWithoutSubtitle = {...mockFeature, subtitle: undefined};
    render(<FeatureStrip {...featureWithoutSubtitle} />);

    expect(screen.queryByText('Our commitment to the planet')).not.toBeInTheDocument();
  });

  it('renders CTA link', () => {
    render(<FeatureStrip {...mockFeature} />);

    const link = screen.getByText('Learn More');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/sustainability');
  });

  it('renders the call to action as a link', () => {
    render(<FeatureStrip {...mockFeature} />);

    const cta = screen.getByRole('link', {name: mockFeature.cta.label});
    expect(cta).toHaveAttribute('href', mockFeature.cta.href);
  });

  it('renders background image', () => {
    render(<FeatureStrip {...mockFeature} />);

    const image = screen.getByTestId('hydrogen-image');
    expect(image).toHaveAttribute('src', 'https://example.com/feature.jpg');
    expect(image).toHaveAttribute('alt', 'Feature');
  });

  it('uses title as alt text when not provided', () => {
    const featureWithoutAlt = {
      ...mockFeature,
      image: {url: 'https://example.com/feature.jpg'},
    };
    render(<FeatureStrip {...featureWithoutAlt} />);

    const image = screen.getByTestId('hydrogen-image');
    expect(image).toHaveAttribute('alt', 'Sustainability');
  });

  it('applies custom className', () => {
    const {container} = render(
      <FeatureStrip {...mockFeature} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  describe('Alignment', () => {
    it('applies center alignment by default', () => {
      const {container} = render(<FeatureStrip {...mockFeature} />);

      const content = container.querySelector('.items-center');
      expect(content).toBeInTheDocument();
    });

    it('applies left alignment', () => {
      const {container} = render(<FeatureStrip {...mockFeature} align="left" />);

      const content = container.querySelector('.items-start');
      expect(content).toBeInTheDocument();
    });

    it('applies right alignment', () => {
      const {container} = render(<FeatureStrip {...mockFeature} align="right" />);

      const content = container.querySelector('.items-end');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Height', () => {
    it('applies generous vertical padding', () => {
      const {container} = render(<FeatureStrip {...mockFeature} />);

      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass('py-20');
      expect(section).toHaveClass('md:py-32');
    });
  });

  describe('Overlay', () => {
    it('renders the hero gradient overlay', () => {
      const {container} = render(<FeatureStrip {...mockFeature} />);

      const overlay = container.querySelector('.overlay-hero');
      expect(overlay).toBeInTheDocument();
    });
  });
});

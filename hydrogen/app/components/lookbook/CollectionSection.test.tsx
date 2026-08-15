/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {CollectionSection} from './CollectionSection';
import type {LookbookCollection} from '~/graphql/storefront/MetaobjectQueries';

describe('CollectionSection', () => {
  const mockHeroImage = {
    url: 'https://example.com/hero.jpg',
    altText: 'Hero image',
  };

  const mockCollection: LookbookCollection = {
    title: 'Spring/Summer 2025',
    subtitle: 'A celebration of light and color',
    description:
      'Our latest collection brings together sustainable fabrics and timeless designs.',
    season: 'Spring/Summer',
    year: 2025,
    featured: true,
    heroImage: mockHeroImage,
  };

  it('renders collection title', () => {
    render(<CollectionSection collection={mockCollection} />);

    expect(screen.getByText('Spring/Summer 2025')).toBeInTheDocument();
  });

  it('renders featured badge when collection is featured', () => {
    render(<CollectionSection collection={mockCollection} />);

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('does not render featured badge when collection is not featured', () => {
    const nonFeaturedCollection = {...mockCollection, featured: false};
    render(<CollectionSection collection={nonFeaturedCollection} />);

    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<CollectionSection collection={mockCollection} />);

    expect(
      screen.getByText('A celebration of light and color')
    ).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    const collectionWithoutSubtitle = {...mockCollection, subtitle: null};
    render(<CollectionSection collection={collectionWithoutSubtitle} />);

    expect(
      screen.queryByText('A celebration of light and color')
    ).not.toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<CollectionSection collection={mockCollection} />);

    expect(
      screen.getByText(
        'Our latest collection brings together sustainable fabrics and timeless designs.'
      )
    ).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const collectionWithoutDescription = {...mockCollection, description: null};
    render(<CollectionSection collection={collectionWithoutDescription} />);

    expect(
      screen.queryByText(
        'Our latest collection brings together sustainable fabrics and timeless designs.'
      )
    ).not.toBeInTheDocument();
  });

  it('renders season when provided', () => {
    render(<CollectionSection collection={mockCollection} />);

    expect(screen.getByText(/Season: Spring\/Summer/)).toBeInTheDocument();
  });

  it('renders year when provided and greater than 0', () => {
    render(<CollectionSection collection={mockCollection} />);

    expect(screen.getByText(/Year: 2025/)).toBeInTheDocument();
  });

  it('does not render year when 0', () => {
    const collectionWithoutYear = {...mockCollection, year: 0};
    render(<CollectionSection collection={collectionWithoutYear} />);

    expect(screen.queryByText(/Year:/)).not.toBeInTheDocument();
  });

  it('does not render season section when season is not provided', () => {
    const collectionWithoutSeason = {...mockCollection, season: null};
    render(<CollectionSection collection={collectionWithoutSeason} />);

    expect(screen.queryByText(/Season:/)).not.toBeInTheDocument();
  });

  it('renders hero image when provided', () => {
    render(<CollectionSection collection={mockCollection} />);

    const image = screen.getByAltText('Hero image');
    expect(image).toBeInTheDocument();
  });

  it('uses collection title as alt text when image altText is missing', () => {
    const collectionWithoutAltText = {
      ...mockCollection,
      heroImage: {url: mockHeroImage.url, altText: null},
    };
    render(<CollectionSection collection={collectionWithoutAltText} />);

    const image = screen.getByAltText('Spring/Summer 2025');
    expect(image).toBeInTheDocument();
  });

  it('does not render hero image when not provided', () => {
    const collectionWithoutImage = {...mockCollection, heroImage: null};
    render(<CollectionSection collection={collectionWithoutImage} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders all elements together', () => {
    render(<CollectionSection collection={mockCollection} />);

    expect(screen.getByText('Spring/Summer 2025')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(
      screen.getByText('A celebration of light and color')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Our latest collection brings together sustainable fabrics and timeless designs.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Season: Spring\/Summer/)).toBeInTheDocument();
    expect(screen.getByText(/Year: 2025/)).toBeInTheDocument();
    expect(screen.getByAltText('Hero image')).toBeInTheDocument();
  });

  it('hero image has correct aspect ratio', () => {
    render(<CollectionSection collection={mockCollection} />);

    const imageContainer = screen.getByAltText('Hero image').closest('div');
    expect(imageContainer).toHaveClass('aspect-[21/9]');
  });

  it('featured badge has correct styling', () => {
    render(<CollectionSection collection={mockCollection} />);

    const badge = screen.getByText('Featured');
    expect(badge).toHaveClass(
      'px-3',
      'py-1',
      'bg-accent/10',
      'text-accent',
      'text-xs',
      'font-medium',
      'rounded-full',
      'uppercase',
      'tracking-wider'
    );
  });

  it('description has max-width constraint', () => {
    render(<CollectionSection collection={mockCollection} />);

    const description = screen.getByText(
      'Our latest collection brings together sustainable fabrics and timeless designs.'
    );
    expect(description).toHaveClass('max-w-3xl');
  });
});

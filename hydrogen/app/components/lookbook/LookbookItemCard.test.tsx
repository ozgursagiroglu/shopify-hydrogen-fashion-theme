/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {LookbookItemCard} from './LookbookItemCard';
import type {LookbookItemData} from '~/graphql/storefront/MetaobjectQueries';

describe('LookbookItemCard', () => {
  const mockImage = {
    url: 'https://example.com/image.jpg',
    altText: 'Test image',
  };

  const mockCollection = {
    handle: 'summer-collection',
    title: 'Summer Collection',
  };

  const mockItem: LookbookItemData = {
    title: 'Summer Essentials',
    image: mockImage,
    collection: mockCollection,
    url: null,
  };

  it('renders item with collection link', () => {
    render(<LookbookItemCard item={mockItem} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('/collections/summer-collection'));
  });

  it('renders item title', () => {
    render(<LookbookItemCard item={mockItem} />);

    expect(screen.getByText('Summer Essentials')).toBeInTheDocument();
  });

  it('renders explore collection text', () => {
    const {container} = render(<LookbookItemCard item={mockItem} />);

    // Text is in a hidden div (opacity-0), so we need to query the container
    expect(container.textContent).toContain('Explore');
  });

  it('renders image with correct alt text', () => {
    render(<LookbookItemCard item={mockItem} />);

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });

  it('uses item title as alt text when image altText is missing', () => {
    const itemWithoutAltText: LookbookItemData = {
      ...mockItem,
      image: {url: mockImage.url, altText: null},
    };
    render(<LookbookItemCard item={itemWithoutAltText} />);

    const image = screen.getByAltText('Summer Essentials');
    expect(image).toBeInTheDocument();
  });

  it('uses custom URL when no collection is provided', () => {
    const itemWithUrl: LookbookItemData = {
      title: 'Custom Link',
      image: mockImage,
      collection: null,
      url: '/custom-page',
    };
    render(<LookbookItemCard item={itemWithUrl} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('/custom-page'));
  });

  it('uses # as fallback when no collection or URL', () => {
    const itemWithoutLink: LookbookItemData = {
      title: 'No Link',
      image: mockImage,
      collection: null,
      url: null,
    };
    render(<LookbookItemCard item={itemWithoutLink} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('#'));
  });

  it('renders without image', () => {
    const itemWithoutImage: LookbookItemData = {
      title: 'No Image',
      image: null,
      collection: mockCollection,
      url: null,
    };
    render(<LookbookItemCard item={itemWithoutImage} />);

    expect(screen.getByText('No Image')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders without title', () => {
    const itemWithoutTitle: LookbookItemData = {
      title: null,
      image: mockImage,
      collection: mockCollection,
      url: null,
    };
    render(<LookbookItemCard item={itemWithoutTitle} />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('has correct aspect ratio', () => {
    render(<LookbookItemCard item={mockItem} />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('aspect-[4/5]');
  });

  it('has group class for hover effects', () => {
    render(<LookbookItemCard item={mockItem} />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('group');
  });

  it('prioritizes collection over custom URL', () => {
    const itemWithBoth: LookbookItemData = {
      title: 'Both Links',
      image: mockImage,
      collection: mockCollection,
      url: '/custom-page',
    };
    render(<LookbookItemCard item={itemWithBoth} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('/collections/summer-collection'));
    expect(link).not.toHaveAttribute('href', expect.stringContaining('/custom-page'));
  });
});

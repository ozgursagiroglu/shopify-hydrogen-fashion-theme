/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {InstagramFeed} from './InstagramFeed';

// Note: @shopify/hydrogen Image mock uses global mock from test/setup.ts

// Mock icons
vi.mock('~/components/icons', () => ({
  HeartIcon: ({className}: {className?: string}) => (
    <svg data-testid="heart-icon" className={className} />
  ),
  CommentIcon: ({className}: {className?: string}) => (
    <svg data-testid="comment-icon" className={className} />
  ),
  InstagramIcon: ({className}: {className?: string}) => (
    <svg data-testid="instagram-icon" className={className} />
  ),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockPosts = [
  {
    id: '1',
    url: 'https://instagram.com/p/1',
    image: {url: 'https://example.com/post1.jpg', altText: 'Post 1'},
    likes: 1250,
    comments: 45,
  },
  {
    id: '2',
    url: 'https://instagram.com/p/2',
    image: {url: 'https://example.com/post2.jpg', altText: 'Post 2'},
    likes: 3456,
    comments: 89,
  },
  {
    id: '3',
    url: 'https://instagram.com/p/3',
    image: {url: 'https://example.com/post3.jpg', altText: 'Post 3'},
    likes: 567,
    comments: 23,
  },
];

describe('InstagramFeed', () => {
  describe('Rendering', () => {
    it('renders Instagram feed section', () => {
      render(<InstagramFeed posts={mockPosts} />);

      expect(screen.getByText('@ELAN.FASHION')).toBeInTheDocument();
      expect(screen.getByText('home.followUs')).toBeInTheDocument();
      expect(screen.getByText('home.joinCommunity')).toBeInTheDocument();
    });

    it('returns null when no posts', () => {
      const {container} = render(<InstagramFeed posts={[]} />);

      expect(container).toBeEmptyDOMElement();
    });

    it('returns null when posts is null', () => {
      const {container} = render(<InstagramFeed posts={null as any} />);

      expect(container).toBeEmptyDOMElement();
    });

    it('renders all posts', () => {
      render(<InstagramFeed posts={mockPosts} />);

      const images = screen.getAllByTestId('image');
      expect(images).toHaveLength(3);
    });

    it('renders post images', () => {
      render(<InstagramFeed posts={mockPosts} />);

      const images = screen.getAllByTestId('image');
      expect(images[0]).toHaveAttribute('src', 'https://example.com/post1.jpg');
      expect(images[0]).toHaveAttribute('alt', 'Post 1');
      expect(images[1]).toHaveAttribute('src', 'https://example.com/post2.jpg');
      expect(images[2]).toHaveAttribute('src', 'https://example.com/post3.jpg');
    });
  });

  describe('Post links', () => {
    it('links to Instagram posts', () => {
      render(<InstagramFeed posts={mockPosts} />);

      const links = screen.getAllByRole('link').slice(0, 3); // First 3 links are posts
      expect(links[0]).toHaveAttribute('href', 'https://instagram.com/p/1');
      expect(links[1]).toHaveAttribute('href', 'https://instagram.com/p/2');
      expect(links[2]).toHaveAttribute('href', 'https://instagram.com/p/3');
    });

    it('opens links in new tab', () => {
      render(<InstagramFeed posts={mockPosts} />);

      const links = screen.getAllByRole('link').slice(0, 3);
      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('Engagement stats', () => {
    it('renders heart icons', () => {
      render(<InstagramFeed posts={mockPosts} />);

      const hearts = screen.getAllByTestId('heart-icon');
      expect(hearts).toHaveLength(3);
    });

    it('renders comment icons', () => {
      render(<InstagramFeed posts={mockPosts} />);

      const comments = screen.getAllByTestId('comment-icon');
      expect(comments).toHaveLength(3);
    });

    it('displays like counts', () => {
      render(<InstagramFeed posts={mockPosts} />);

      expect(screen.getByText('1.3K')).toBeInTheDocument(); // 1250 likes
      expect(screen.getByText('3.5K')).toBeInTheDocument(); // 3456 likes
      expect(screen.getByText('567')).toBeInTheDocument(); // 567 likes
    });

    it('displays comment counts', () => {
      render(<InstagramFeed posts={mockPosts} />);

      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('89')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    it('formats large numbers correctly', () => {
      const postsWithLargeLikes = [
        {
          id: '1',
          url: 'https://instagram.com/p/1',
          image: {url: 'https://example.com/post1.jpg', altText: 'Post'},
          likes: 12500,
          comments: 100,
        },
      ];

      render(<InstagramFeed posts={postsWithLargeLikes} />);

      expect(screen.getByText('12.5K')).toBeInTheDocument();
    });

    it('does not format small numbers', () => {
      const postsWithSmallLikes = [
        {
          id: '1',
          url: 'https://instagram.com/p/1',
          image: {url: 'https://example.com/post1.jpg', altText: 'Post'},
          likes: 999,
          comments: 50,
        },
      ];

      render(<InstagramFeed posts={postsWithSmallLikes} />);

      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });

  describe('Follow button', () => {
    it('renders follow button', () => {
      render(<InstagramFeed posts={mockPosts} />);

      expect(screen.getByText('misc.followOnInstagram')).toBeInTheDocument();
    });

    it('links to Instagram', () => {
      render(<InstagramFeed posts={mockPosts} />);

      const followButton = screen.getByText('misc.followOnInstagram').closest('a');
      expect(followButton).toHaveAttribute('href', 'https://instagram.com');
      expect(followButton).toHaveAttribute('target', '_blank');
      expect(followButton).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders Instagram icon', () => {
      render(<InstagramFeed posts={mockPosts} />);

      expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    });
  });

  describe('Grid layout', () => {
    it('renders posts in a grid', () => {
      const {container} = render(<InstagramFeed posts={mockPosts} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('has responsive grid columns', () => {
      const {container} = render(<InstagramFeed posts={mockPosts} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2');
      expect(grid).toHaveClass('md:grid-cols-3');
      expect(grid).toHaveClass('lg:grid-cols-6');
    });
  });

  describe('Hover effects', () => {
    it('has group class for hover effects', () => {
      const {container} = render(<InstagramFeed posts={mockPosts} />);

      const postLinks = container.querySelectorAll('a[class*="group"]');
      expect(postLinks.length).toBeGreaterThan(0);
    });
  });
});

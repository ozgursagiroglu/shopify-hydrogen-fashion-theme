/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent} from '@test/utils/render';
import {ProductReviews} from './ProductReviews';
import type {ProductReviewsData} from '~/graphql/storefront';
import {createMemoryRouter, RouterProvider} from 'react-router';

const mockReviewsData: ProductReviewsData = {
  reviews: [
    {
      id: 'review-1',
      rating: 5,
      title: 'Excellent quality',
      content: 'Love this product!',
      authorName: 'Jane Smith',
      verified: true,
      createdAt: '2024-01-20T10:00:00Z',
    },
    {
      id: 'review-2',
      rating: 4,
      title: 'Good but could be better',
      content: 'Nice product overall.',
      authorName: 'John Doe',
      verified: false,
      createdAt: '2024-01-15T10:00:00Z',
    },
  ],
  averageRating: 4.5,
  totalCount: 2,
  ratingDistribution: {1: 0, 2: 0, 3: 0, 4: 1, 5: 1},
};

const emptyReviewsData: ProductReviewsData = {
  reviews: [],
  averageRating: 0,
  totalCount: 0,
  ratingDistribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
};

// Helper to render ProductReviews with RouterProvider (needed for useFetcher in ProductReviewForm)
function renderProductReviews(
  reviewsData: ProductReviewsData,
  props: {className?: string; canReview?: boolean; isAuthenticated?: boolean} = {},
) {
  const routes = [
    {
      path: '/',
      element: (
        <ProductReviews
          productId="product-1"
          productTitle="Test Product"
          reviewsData={reviewsData}
          {...props}
        />
      ),
    },
    {
      path: '/api/reviews',
      action: async () => ({success: true}),
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries: ['/'],
  });

  return render(<RouterProvider router={router} />);
}

describe('ProductReviews', () => {
  describe('with reviews', () => {
    it('renders the reviews section title', () => {
      renderProductReviews(mockReviewsData);
      expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
    });

    it('displays average rating', () => {
      renderProductReviews(mockReviewsData);
      // Average rating appears multiple times, use getAllByText
      const ratings = screen.getAllByText('4.5');
      expect(ratings.length).toBeGreaterThanOrEqual(1);
    });

    it('displays total review count', () => {
      renderProductReviews(mockReviewsData);
      // Review count appears multiple times, use getAllByText
      const counts = screen.getAllByText(/Based on 2 reviews/);
      expect(counts.length).toBeGreaterThanOrEqual(1);
    });

    it('renders review cards', () => {
      renderProductReviews(mockReviewsData);
      expect(screen.getByText('Excellent quality')).toBeInTheDocument();
      expect(screen.getByText('Good but could be better')).toBeInTheDocument();
    });

    it('renders write review button', () => {
      renderProductReviews(mockReviewsData, {canReview: true});
      expect(screen.getByText('Write a Review')).toBeInTheDocument();
    });

    it('renders sort dropdown', () => {
      renderProductReviews(mockReviewsData);
      expect(screen.getByText('Sort by')).toBeInTheDocument();
    });

    it('renders rating distribution bars', () => {
      renderProductReviews(mockReviewsData);
      // Should show 5 star, 4 star, 3 star, 2 star, 1 star rows
      expect(screen.getByText('5 ★')).toBeInTheDocument();
      expect(screen.getByText('4 ★')).toBeInTheDocument();
    });
  });

  describe('without reviews (empty state)', () => {
    it('renders empty state message', () => {
      renderProductReviews(emptyReviewsData);
      expect(screen.getByText('No reviews yet')).toBeInTheDocument();
    });

    it('renders call to action for first review', () => {
      renderProductReviews(emptyReviewsData);
      expect(
        screen.getByText('Be the first to review this product'),
      ).toBeInTheDocument();
    });

    it('does not render rating distribution when empty', () => {
      renderProductReviews(emptyReviewsData);
      expect(screen.queryByText('5 ★')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('opens review form modal when write review button is clicked', () => {
      renderProductReviews(mockReviewsData, {canReview: true});

      fireEvent.click(screen.getByText('Write a Review'));

      // Modal should be open with form title
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('can change sort order', () => {
      renderProductReviews(mockReviewsData);

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, {target: {value: 'oldest'}});

      // Component should still render (sort happens internally)
      expect(screen.getByText('Excellent quality')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const {container} = renderProductReviews(mockReviewsData, {
      className: 'custom-class',
    });
    expect(container.querySelector('section')).toHaveClass('custom-class');
  });
});

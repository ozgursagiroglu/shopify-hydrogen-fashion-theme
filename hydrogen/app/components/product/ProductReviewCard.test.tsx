/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {ProductReviewCard} from './ProductReviewCard';
import type {ProductReview} from '~/graphql/storefront';

const mockReview: ProductReview = {
  id: 'review-1',
  rating: 5,
  title: 'Amazing product!',
  content: 'This is the best product I have ever purchased. Highly recommend!',
  authorName: 'John Doe',
  verified: true,
  createdAt: '2024-01-15T10:00:00Z',
};

describe('ProductReviewCard', () => {
  it('renders review title', () => {
    render(<ProductReviewCard review={mockReview} />);
    expect(screen.getByText('Amazing product!')).toBeInTheDocument();
  });

  it('renders review content', () => {
    render(<ProductReviewCard review={mockReview} />);
    expect(screen.getByText(/This is the best product/)).toBeInTheDocument();
  });

  it('renders author name', () => {
    render(<ProductReviewCard review={mockReview} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders verified badge when review is verified', () => {
    render(<ProductReviewCard review={mockReview} />);
    expect(screen.getByText('Verified Purchase')).toBeInTheDocument();
  });

  it('does not render verified badge when review is not verified', () => {
    const unverifiedReview = {...mockReview, verified: false};
    render(<ProductReviewCard review={unverifiedReview} />);
    expect(screen.queryByText('Verified Purchase')).not.toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<ProductReviewCard review={mockReview} />);
    // Date should be formatted (exact format depends on locale)
    expect(screen.getByText(/2024|Jan|January/i)).toBeInTheDocument();
  });

  it('renders star rating', () => {
    render(<ProductReviewCard review={mockReview} />);
    // Star rating component should be present
    const starContainer = screen.getByRole('img', {hidden: true});
    expect(starContainer).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const {container} = render(<ProductReviewCard review={mockReview} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles reviews with different ratings', () => {
    const lowRatingReview = {...mockReview, rating: 2};
    render(<ProductReviewCard review={lowRatingReview} />);
    // Component should render without errors
    expect(screen.getByText('Amazing product!')).toBeInTheDocument();
  });

  it('handles reviews with empty content', () => {
    const emptyContentReview = {...mockReview, content: ''};
    render(<ProductReviewCard review={emptyContentReview} />);
    expect(screen.getByText('Amazing product!')).toBeInTheDocument();
  });
});

/**
 * Product Reviews Parser Utilities
 * Parse review metaobject responses into typed data structures
 */

import type {ProductReviewsQuery} from 'storefrontapi.generated';

export interface ProductReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  authorName: string;
  verified: boolean;
  createdAt: string;
  productId?: string;
}

export interface ProductReviewsData {
  reviews: ProductReview[];
  averageRating: number;
  totalCount: number;
  ratingDistribution: Record<number, number>;
}

/**
 * Parse product reviews from metaobjects response
 */
export function parseProductReviews(
  metaobjects: ProductReviewsQuery['metaobjects'] | null | undefined,
  productId?: string,
): ProductReviewsData {
  const emptyResult: ProductReviewsData = {
    reviews: [],
    averageRating: 0,
    totalCount: 0,
    ratingDistribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
  };

  if (!metaobjects?.nodes?.length) return emptyResult;

  // Parse all reviews
  const allReviews = metaobjects.nodes.map((node) => {
    const fields = new Map(
      node.fields.map((f) => [
        f.key,
        {value: f.value ?? null, reference: f.reference ?? null},
      ]),
    );

    return {
      id: node.id,
      rating: Math.min(
        5,
        Math.max(1, parseInt(fields.get('rating')?.value ?? '5', 10)),
      ),
      title: fields.get('title')?.value ?? '',
      content: fields.get('content')?.value ?? '',
      authorName: fields.get('author_name')?.value ?? 'Anonymous',
      verified: fields.get('verified')?.value === 'true',
      createdAt: fields.get('created_at')?.value ?? new Date().toISOString(),
      productId: fields.get('product')?.reference?.id,
      status: fields.get('status')?.value ?? 'approved',
    };
  });

  // Filter by product ID if provided and only approved reviews
  let reviews = allReviews.filter((r) => r.status === 'approved');
  if (productId) {
    reviews = reviews.filter((r) => !r.productId || r.productId === productId);
  }

  // Sort by date (newest first)
  reviews.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Calculate statistics
  const totalCount = reviews.length;
  const ratingDistribution: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
  let ratingSum = 0;

  for (const review of reviews) {
    ratingSum += review.rating;
    ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
  }

  const averageRating = totalCount > 0 ? ratingSum / totalCount : 0;

  return {
    reviews,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalCount,
    ratingDistribution,
  };
}

/**
 * Sort reviews by different criteria
 */
export type ReviewSortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export function sortReviews(
  reviews: ProductReview[],
  sortBy: ReviewSortOption,
): ProductReview[] {
  const sorted = [...reviews];

  switch (sortBy) {
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case 'highest':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'lowest':
      return sorted.sort((a, b) => a.rating - b.rating);
    default:
      return sorted;
  }
}

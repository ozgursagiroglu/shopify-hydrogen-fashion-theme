import {useState, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Select, StarRating, useModal} from '~/components/ui';
import {ProductReviewCard} from './ProductReviewCard';
import {ProductReviewForm} from './ProductReviewForm';
import type {ProductReviewsData, ReviewSortOption} from '~/graphql/storefront';
import {sortReviews} from '~/graphql/storefront';
import {cn} from '~/lib/cn';

export interface ProductReviewsProps {
  productId: string;
  productTitle: string;
  reviewsData: ProductReviewsData;
  className?: string;
  canReview?: boolean;
  isAuthenticated?: boolean;
}

export function ProductReviews({
  productId,
  productTitle,
  reviewsData,
  className,
  canReview = false,
  isAuthenticated = false,
}: ProductReviewsProps) {
  const {t} = useTranslation();
  const [sortBy, setSortBy] = useState<ReviewSortOption>('newest');
  const {isOpen, open, close} = useModal();

  const sortOptions = [
    {value: 'newest', label: t('reviews.sortOptions.newest')},
    {value: 'oldest', label: t('reviews.sortOptions.oldest')},
    {value: 'highest', label: t('reviews.sortOptions.highest')},
    {value: 'lowest', label: t('reviews.sortOptions.lowest')},
  ];

  const sortedReviews = useMemo(
    () => sortReviews(reviewsData.reviews, sortBy),
    [reviewsData.reviews, sortBy],
  );

  const hasReviews = reviewsData.totalCount > 0;

  return (
    <section className={cn('pt-12 md:pt-16', className)} aria-labelledby="reviews-title">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2
              id="reviews-title"
              className="font-display text-h2 text-primary mb-2"
            >
              {t('reviews.title')}
            </h2>
            {hasReviews && (
              <div className="flex items-center gap-3">
                <StarRating rating={reviewsData.averageRating} showValue />
                <span className="text-sm text-text-muted">
                  {t('reviews.basedOnReviews', {count: reviewsData.totalCount})}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {canReview ? (
              <Button variant="secondary" onClick={open}>
                {t('reviews.writeReview')}
              </Button>
            ) : (
              <p className="text-sm text-text-muted text-right">
                {!isAuthenticated
                  ? t('reviews.loginToPurchase')
                  : t('reviews.purchaseToReview')}
              </p>
            )}
          </div>
        </div>

        {/* Rating Distribution (if has reviews) */}
        {hasReviews && (
          <div className="mb-8 p-6 bg-surface-alt rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="text-center sm:text-left">
                <div className="text-4xl font-display text-primary mb-2">
                  {reviewsData.averageRating.toFixed(1)}
                </div>
                <StarRating rating={reviewsData.averageRating} size="md" />
                <p className="text-sm text-text-muted mt-2">
                  {t('reviews.basedOnReviews', {count: reviewsData.totalCount})}
                </p>
              </div>

              {/* Distribution Bars */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewsData.ratingDistribution[star] || 0;
                  const percentage =
                    reviewsData.totalCount > 0
                      ? (count / reviewsData.totalCount) * 100
                      : 0;

                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-8 text-text-muted">{star} ★</span>
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{width: `${percentage}%`}}
                        />
                      </div>
                      <span className="w-8 text-text-muted text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sort & Reviews List */}
        {hasReviews ? (
          <>
            {/* Sort dropdown */}
            <div className="flex justify-end mb-6">
              <Select
                label={t('reviews.sortBy')}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ReviewSortOption)}
                options={sortOptions}
                className="w-48"
              />
            </div>

            {/* Reviews list */}
            <div className="divide-y divide-border">
              {sortedReviews.map((review) => (
                <ProductReviewCard key={review.id} review={review} />
              ))}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-12 bg-surface-alt rounded-lg">
            <p className="text-text-secondary mb-4">{t('reviews.noReviews')}</p>
            <p className="text-text-muted mb-6">
              {t('reviews.beFirstToReview')}
            </p>
            {canReview ? (
              <Button variant="primary" onClick={open}>
                {t('reviews.writeReview')}
              </Button>
            ) : (
              <p className="text-sm text-text-muted">
                {!isAuthenticated
                  ? t('reviews.loginToPurchase')
                  : t('reviews.purchaseToReview')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      <ProductReviewForm
        productId={productId}
        productTitle={productTitle}
        isOpen={isOpen}
        onClose={close}
      />
    </section>
  );
}

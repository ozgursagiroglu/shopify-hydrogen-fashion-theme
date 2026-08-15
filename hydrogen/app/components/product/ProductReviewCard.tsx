import {useTranslation} from 'react-i18next';
import {StarRating} from '~/components/ui';
import {VerifiedIcon} from '~/components/icons';
import type {ProductReview} from '~/graphql/storefront';
import {cn} from '~/lib/cn';

export interface ProductReviewCardProps {
  review: ProductReview;
  className?: string;
}

export function ProductReviewCard({review, className}: ProductReviewCardProps) {
  const {t, i18n} = useTranslation();

  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(review.createdAt));

  return (
    <article
      className={cn(
        'py-6 first:pt-0 last:pb-0',
        'border-b border-border last:border-b-0',
        className,
      )}
    >
      {/* Header: Rating, Name, Verified */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <StarRating rating={review.rating} size="sm" />
          <div className="flex items-center gap-2 mt-2">
            <span className="font-medium text-text">{review.authorName}</span>
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <VerifiedIcon className="w-3.5 h-3.5" />
                {t('reviews.verifiedPurchase')}
              </span>
            )}
          </div>
        </div>
        <time
          dateTime={review.createdAt}
          className="text-sm text-text-muted"
        >
          {formattedDate}
        </time>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-medium text-text mb-2">{review.title}</h4>
      )}

      {/* Content */}
      <p className="text-text-secondary whitespace-pre-wrap">{review.content}</p>
    </article>
  );
}

import {useState} from 'react';
import {StarIcon} from '~/components/icons';
import {cn} from '~/lib/cn';

export interface StarRatingProps {
  /** Current rating value (0-5) */
  rating: number;
  /** Maximum rating value */
  maxRating?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the rating is interactive (for input) */
  interactive?: boolean;
  /** Callback when rating changes (only in interactive mode) */
  onChange?: (rating: number) => void;
  /** Show rating number */
  showValue?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Label for accessibility */
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className,
  label,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: number) => {
    if (interactive && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(value);
    }
  };

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={label || `Rating: ${rating} out of ${maxRating} stars`}
    >
      {[...Array(maxRating)].map((_, index) => {
        const value = index + 1;
        const isFilled = value <= displayRating;

        if (interactive) {
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={value === rating}
              aria-label={`${value} star${value !== 1 ? 's' : ''}`}
              className={cn(
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 rounded-sm transition-transform',
                'hover:scale-110',
              )}
              onClick={() => handleClick(value)}
              onKeyDown={(e) => handleKeyDown(e, value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <StarIcon
                className={cn(
                  sizeClasses[size],
                  'transition-colors',
                  isFilled
                    ? 'text-primary fill-primary'
                    : 'text-border-default hover:text-primary/50',
                )}
                filled={isFilled}
              />
            </button>
          );
        }

        return (
          <StarIcon
            key={value}
            className={cn(
              sizeClasses[size],
              isFilled ? 'text-primary fill-primary' : 'text-border-default',
            )}
            filled={isFilled}
          />
        );
      })}
      {showValue && (
        <span className="ml-1.5 text-sm text-text-secondary">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

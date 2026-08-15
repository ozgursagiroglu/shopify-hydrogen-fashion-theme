import {cn} from '~/lib/cn';
import {ExclamationCircleIcon} from '~/components/icons';
import {Button} from '~/components/ui/Button';

interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error message */
  message?: string;
  /** Whether to show a retry button */
  showRetry?: boolean;
  /** Callback when retry is clicked */
  onRetry?: () => void;
  /** Whether to show a home link */
  showHomeLink?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

/**
 * Reusable error state component for inline error displays
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  showRetry = false,
  onRetry,
  showHomeLink = false,
  size = 'md',
  className,
}: ErrorStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-6 px-4',
      icon: 'w-8 h-8',
      title: 'text-base',
      message: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-12 h-12',
      title: 'text-lg',
      message: 'text-base',
      button: 'px-5 py-2.5 text-sm',
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-16 h-16',
      title: 'text-xl',
      message: 'text-base',
      button: 'px-6 py-3 text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        classes.container,
        className,
      )}
      role="alert"
    >
      <div className="mb-4 text-text-muted">
        <ExclamationCircleIcon className={classes.icon} />
      </div>

      <h3 className={cn('font-medium text-text mb-2', classes.title)}>
        {title}
      </h3>

      <p className={cn('text-text-muted max-w-md mb-6', classes.message)}>
        {message}
      </p>

      {(showRetry || showHomeLink) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {showRetry && onRetry && (
            <Button
              type="button"
              onClick={onRetry}
              variant="primary"
              size={size}
            >
              Try Again
            </Button>
          )}
          {showHomeLink && (
            <Button
              as="link"
              to="/"
              variant="secondary"
              size={size}
            >
              Return Home
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 404 Not Found inline component
 */
export function NotFoundState({
  title = 'Not Found',
  message = "We couldn't find what you're looking for.",
  className,
}: Pick<ErrorStateProps, 'title' | 'message' | 'className'>) {
  return (
    <ErrorState
      title={title}
      message={message}
      showHomeLink
      size="lg"
      className={className}
    />
  );
}

/**
 * Empty state component for lists with no items
 */
export function EmptyState({
  title,
  message,
  icon,
  action,
  className,
}: {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      )}
    >
      {icon && <div className="mb-4 text-text-muted">{icon}</div>}

      <h3 className="font-medium text-text text-lg mb-2">{title}</h3>

      <p className="text-text-muted max-w-md mb-6">{message}</p>

      {action && (
        action.href ? (
          <Button
            as="link"
            to={action.href}
            variant="primary"
          >
            {action.label}
          </Button>
        ) : action.onClick ? (
          <Button
            type="button"
            onClick={action.onClick}
            variant="primary"
          >
            {action.label}
          </Button>
        ) : null
      )}
    </div>
  );
}

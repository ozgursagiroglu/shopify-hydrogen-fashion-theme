import {cn} from '~/lib/cn';

/**
 * Badge Variants
 *
 * Product Badges:
 * - new: New product
 * - sale: On sale
 * - limited: Limited edition
 * - soldout: Sold out
 *
 * Status Badges:
 * - success: Success/positive state
 * - warning: Warning/cautionary state
 * - info: Informational state
 * - error: Error/negative state
 */
export type BadgeVariant =
  | 'new'
  | 'sale'
  | 'limited'
  | 'soldout'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';

export interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  // Product variants
  new: 'bg-primary text-white',
  sale: 'bg-error text-white',
  limited: 'bg-primary text-white',
  soldout: 'bg-text-muted text-white',

  // Status variants
  success: 'bg-green-600 text-white',
  warning: 'bg-accent text-white',
  info: 'bg-blue-600 text-white',
  error: 'bg-error text-white',
};

export function Badge({variant, children, className}: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center justify-center px-2 py-1 text-xs font-medium uppercase tracking-wider rounded',
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
}

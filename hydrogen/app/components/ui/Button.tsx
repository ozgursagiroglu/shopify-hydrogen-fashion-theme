import {forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes} from 'react';
import {type LinkProps} from 'react-router';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {cn} from '~/lib/cn';
import {SpinnerIcon} from '~/components/icons';

/**
 * Button Variants (Monochromatic Design System)
 *
 * primary         Black fill, white text (light backgrounds)
 * secondary       Black outline (light backgrounds)
 * inverse         White fill, black text (dark backgrounds)
 * inverse-outline White outline (dark backgrounds)
 * ghost           Transparent background
 * danger          Red fill, white text (destructive actions)
 */
export type ButtonVariant = 'primary' | 'secondary' | 'inverse' | 'inverse-outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    as?: 'button';
    href?: never;
    to?: never;
  };

type ButtonAsAnchor = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    as: 'a';
    href: string;
    to?: never;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<LinkProps, keyof ButtonBaseProps> & {
    as: 'link';
    to: string;
    href?: never;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink;

/**
 * Button variant styles - exported for reuse in custom button implementations
 */
export const buttonVariantStyles: Record<ButtonVariant, string> = {
  // Black fill, white text — for light backgrounds
  primary: 'bg-primary text-white hover:bg-primary-light active:bg-primary-light',
  // Black outline — for light backgrounds
  secondary: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white active:bg-primary active:text-white',
  // White fill, black text — for dark backgrounds
  inverse: 'bg-white text-primary hover:bg-white/90 active:bg-white/90',
  // White outline — for dark backgrounds
  'inverse-outline': 'bg-transparent border border-white text-white hover:bg-white hover:text-primary active:bg-white active:text-primary',
  // Transparent — tertiary actions
  ghost: 'bg-transparent text-primary hover:bg-surface-hover active:bg-surface-hover',
  // Red fill, white text — for destructive actions (delete, remove, etc.)
  danger: 'bg-error text-white hover:bg-error/90 active:bg-error/90',
};

/**
 * Button size styles - exported for reuse in custom button implementations
 */
export const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      children,
      as,
      ...rest
    } = props;

    const sharedClassName = cn(
      // Base styles + V3 micro-interaction
      'inline-flex items-center justify-center gap-2 cursor-pointer',
      'font-medium',
      'rounded-md transition-all duration-200',
      'active:scale-[0.98]',
      // Focus state
      'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
      // Variant & size
      buttonVariantStyles[variant],
      buttonSizeStyles[size],
      // Modifiers
      fullWidth && 'w-full',
      loading && 'pointer-events-none opacity-70',
      className,
    );

    const content = loading ? (
      <SpinnerIcon className="h-5 w-5 animate-spin" />
    ) : (
      <>
        {leftIcon}
        {children}
        {rightIcon}
      </>
    );

    // Render as anchor
    if (as === 'a') {
      const {href, ...anchorProps} = rest as Omit<ButtonAsAnchor, keyof ButtonBaseProps | 'as'>;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={sharedClassName}
          {...anchorProps}
        >
          {content}
        </a>
      );
    }

    // Render as React Router Link
    if (as === 'link') {
      const {to, ...linkProps} = rest as Omit<ButtonAsLink, keyof ButtonBaseProps | 'as'>;
      return (
        <Link
          to={to}
          className={sharedClassName}
          {...linkProps}
        >
          {content}
        </Link>
      );
    }

    // Render as button (default)
    const {disabled, ...buttonProps} = rest as Omit<ButtonAsButton, keyof ButtonBaseProps | 'as'>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cn(
          sharedClassName,
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        disabled={disabled || loading}
        {...buttonProps}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = 'Button';

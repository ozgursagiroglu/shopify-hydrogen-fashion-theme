import {forwardRef, type ButtonHTMLAttributes} from 'react';
import {cn} from '~/lib/cn';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'default' | 'ghost' | 'outline';

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  label: string;
  children: React.ReactNode;
}

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const variantStyles: Record<IconButtonVariant, string> = {
  default: 'bg-surface hover:bg-surface-hover',
  ghost: 'bg-transparent hover:bg-surface-hover',
  outline: 'bg-transparent border border-border hover:bg-surface-hover',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({size = 'md', variant = 'ghost', label, className, children, ...props}, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeStyles[size],
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';

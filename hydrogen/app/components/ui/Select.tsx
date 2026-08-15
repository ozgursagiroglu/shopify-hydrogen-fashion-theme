import {forwardRef} from 'react';
import {cn} from '~/lib/cn';
import {ChevronDownIcon} from '~/components/icons';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  label?: string;
  helperText?: string;
}

const sizeStyles = {
  sm: 'h-9 text-sm pl-3 pr-8',
  md: 'h-11 text-sm pl-4 pr-10',
  lg: 'h-12 text-base pl-4 pr-10',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      size = 'md',
      error,
      label,
      helperText,
      className,
      disabled,
      id,
      name,
      ...props
    },
    ref,
  ) => {
    const selectId = id || name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            disabled={disabled}
            className={cn(
              'w-full appearance-none rounded-md border bg-surface transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-alt',
              error
                ? 'border-error focus:ring-error'
                : 'border-border hover:border-text',
              sizeStyles[size],
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDownIcon className="h-4 w-4 text-text-muted" />
          </div>
        </div>
        {helperText && (
          <p
            className={cn(
              'text-xs',
              error ? 'text-error' : 'text-text-muted',
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

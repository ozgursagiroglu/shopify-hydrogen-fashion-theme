import {cn} from '~/lib/cn';
import {MinusIcon, PlusIcon} from '~/components/icons';

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center border border-border rounded-md',
        disabled && 'opacity-50',
        className,
      )}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        <MinusIcon className="h-4 w-4" strokeWidth={2} />
      </button>
      <span className="w-12 text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        <PlusIcon className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

import {useRef, useCallback, type KeyboardEvent} from 'react';
import {cn} from '~/lib/cn';
import {useTranslation} from 'react-i18next';

export interface SizeOption {
  value: string;
  label: string;
  available: boolean;
}

export interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
  className?: string;
  label?: string;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  className,
  label,
}: SizeSelectorProps) {
  const {t} = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const displayLabel = label ?? t('product.size');

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const availableSizes = sizes.filter((s) => s.available);
      if (availableSizes.length === 0) return;

      const currentIndex = selectedSize
        ? availableSizes.findIndex((s) => s.value === selectedSize)
        : -1;

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex =
            currentIndex < availableSizes.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : availableSizes.length - 1;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = availableSizes.length - 1;
          break;
      }

      if (nextIndex !== null) {
        onSelect(availableSizes[nextIndex].value);
        // Focus the newly selected button
        const buttons = containerRef.current?.querySelectorAll('button');
        const targetSize = availableSizes[nextIndex].value;
        const targetButton = Array.from(buttons || []).find(
          (btn) => btn.getAttribute('data-value') === targetSize,
        );
        (targetButton as HTMLElement)?.focus();
      }
    },
    [sizes, selectedSize, onSelect],
  );

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={displayLabel}
      tabIndex={0}
      className={cn('flex flex-wrap gap-2', className)}
      onKeyDown={handleKeyDown}
    >
      {sizes.map((size) => (
        <button
          key={size.value}
          type="button"
          role="radio"
          data-value={size.value}
          onClick={() => size.available && onSelect(size.value)}
          disabled={!size.available}
          tabIndex={selectedSize === size.value ? 0 : -1}
          className={cn(
            'min-w-[3rem] h-10 px-3 text-sm font-medium border rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            selectedSize === size.value
              ? 'bg-primary text-text-inverse border-primary'
              : 'bg-surface border-border hover:border-border-hover',
            !size.available &&
              'opacity-40 cursor-not-allowed line-through text-text-light',
          )}
          aria-label={`${size.label}${!size.available ? ` - ${t('product.outOfStock')}` : ''}`}
          aria-checked={selectedSize === size.value}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
}

import {useRef, useCallback, type KeyboardEvent} from 'react';
import {cn} from '~/lib/cn';
import {useTranslation} from 'react-i18next';

export interface ColorOption {
  value: string;
  label: string;
  hex: string;
  available: boolean;
}

export interface ColorSelectorProps {
  colors: ColorOption[];
  selectedColor: string | null;
  onSelect: (color: string) => void;
  className?: string;
  label?: string;
}

export function ColorSelector({
  colors,
  selectedColor,
  onSelect,
  className,
  label,
}: ColorSelectorProps) {
  const {t} = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const displayLabel = label ?? t('product.color');

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const availableColors = colors.filter((c) => c.available);
      if (availableColors.length === 0) return;

      const currentIndex = selectedColor
        ? availableColors.findIndex((c) => c.value === selectedColor)
        : -1;

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex =
            currentIndex < availableColors.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : availableColors.length - 1;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = availableColors.length - 1;
          break;
      }

      if (nextIndex !== null) {
        onSelect(availableColors[nextIndex].value);
        // Focus the newly selected button
        const buttons = containerRef.current?.querySelectorAll('button');
        const targetColor = availableColors[nextIndex].value;
        const targetButton = Array.from(buttons || []).find(
          (btn) => btn.getAttribute('data-value') === targetColor,
        );
        (targetButton as HTMLElement)?.focus();
      }
    },
    [colors, selectedColor, onSelect],
  );

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={displayLabel}
      tabIndex={0}
      className={cn('flex flex-wrap gap-3', className)}
      onKeyDown={handleKeyDown}
    >
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          role="radio"
          data-value={color.value}
          onClick={() => color.available && onSelect(color.value)}
          disabled={!color.available}
          tabIndex={selectedColor === color.value ? 0 : -1}
          className={cn(
            'relative w-8 h-8 rounded-full transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            selectedColor === color.value && 'ring-2 ring-offset-2 ring-primary',
            color.available ? 'hover:scale-110' : 'opacity-40 cursor-not-allowed',
          )}
          style={{backgroundColor: color.hex}}
          aria-label={`${color.label}${!color.available ? ` - ${t('product.outOfStock')}` : ''}`}
          aria-checked={selectedColor === color.value}
          title={color.label}
        >
          {!color.available && (
            <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <span className="w-full h-px bg-text rotate-45 absolute" />
            </span>
          )}
          <span className="sr-only">{color.label}</span>
        </button>
      ))}
    </div>
  );
}

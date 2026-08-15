import {useState, useEffect, useRef} from 'react';
import {cn} from '~/lib/cn';

export interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
  currency?: string;
  className?: string;
}

export function PriceRangeSlider({
  min = 0,
  max = 1000,
  step = 1,
  value,
  onChange,
  currency = '$',
  className,
}: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const minThumbRef = useRef<HTMLInputElement>(null);
  const maxThumbRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (newMin: number) => {
    const clampedMin = Math.max(min, Math.min(newMin, localValue[1] - step));
    const newRange: [number, number] = [clampedMin, localValue[1]];
    setLocalValue(newRange);
  };

  const handleMaxChange = (newMax: number) => {
    const clampedMax = Math.min(max, Math.max(newMax, localValue[0] + step));
    const newRange: [number, number] = [localValue[0], clampedMax];
    setLocalValue(newRange);
  };

  const handleMinCommit = () => {
    onChange(localValue);
  };

  const handleMaxCommit = () => {
    onChange(localValue);
  };

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  const minPercent = getPercentage(localValue[0]);
  const maxPercent = getPercentage(localValue[1]);

  return (
    <div className={cn('px-2 pt-2', className)}>
      {/* Slider Track */}
      <div className="relative h-1.5 mb-8">
        {/* Background track */}
        <div className="absolute w-full h-full bg-border rounded-full" />

        {/* Active range track */}
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min thumb slider */}
        <input
          ref={minThumbRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          onMouseUp={handleMinCommit}
          onTouchEnd={handleMinCommit}
          className={cn(
            'absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none',
            'focus:outline-none',
            '[&::-webkit-slider-thumb]:pointer-events-auto',
            '[&::-webkit-slider-thumb]:w-5',
            '[&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-primary',
            '[&::-webkit-slider-thumb]:border-2',
            '[&::-webkit-slider-thumb]:border-white',
            '[&::-webkit-slider-thumb]:shadow-md',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:pointer-events-auto',
            '[&::-moz-range-thumb]:w-5',
            '[&::-moz-range-thumb]:h-5',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-primary',
            '[&::-moz-range-thumb]:border-2',
            '[&::-moz-range-thumb]:border-white',
            '[&::-moz-range-thumb]:shadow-md',
            '[&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:transition-transform',
            '[&::-moz-range-thumb]:hover:scale-110',
          )}
          style={{zIndex: localValue[0] > max - (max - min) / 2 ? 2 : 1}}
        />

        {/* Max thumb slider */}
        <input
          ref={maxThumbRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          onMouseUp={handleMaxCommit}
          onTouchEnd={handleMaxCommit}
          className={cn(
            'absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none',
            'focus:outline-none',
            '[&::-webkit-slider-thumb]:pointer-events-auto',
            '[&::-webkit-slider-thumb]:w-5',
            '[&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-primary',
            '[&::-webkit-slider-thumb]:border-2',
            '[&::-webkit-slider-thumb]:border-white',
            '[&::-webkit-slider-thumb]:shadow-md',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:pointer-events-auto',
            '[&::-moz-range-thumb]:w-5',
            '[&::-moz-range-thumb]:h-5',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-primary',
            '[&::-moz-range-thumb]:border-2',
            '[&::-moz-range-thumb]:border-white',
            '[&::-moz-range-thumb]:shadow-md',
            '[&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:transition-transform',
            '[&::-moz-range-thumb]:hover:scale-110',
          )}
          style={{zIndex: 2}}
        />
      </div>

      {/* Value Display */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-text">
          {currency}
          {localValue[0]}
        </span>
        <span className="text-sm text-text-muted">—</span>
        <span className="text-sm font-medium text-text">
          {currency}
          {localValue[1]}
        </span>
      </div>
    </div>
  );
}

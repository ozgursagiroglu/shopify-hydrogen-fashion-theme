import type {IconProps} from './types';

export function LeafIcon({className, filled, strokeWidth = 1.5}: IconProps) {
  return (
    <svg
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12c0 1.66-4 7-9 7s-9-5.34-9-7c0-5 4-9 9-9s9 4 9 9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
      />
    </svg>
  );
}

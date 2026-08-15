import {useRouteLoaderData} from 'react-router';
import {cn} from '~/lib/cn';
import type {RootLoader} from '~/root';

interface RTLIconProps {
  icon: React.ComponentType<{className?: string; strokeWidth?: number}>;
  shouldFlip?: boolean;
  className?: string;
  strokeWidth?: number;
}

/**
 * RTLIcon - Automatically flips directional icons in RTL mode
 *
 * Usage:
 * ```tsx
 * // Icons that should flip in RTL (arrows, chevrons)
 * <RTLIcon icon={ChevronRightIcon} className="w-5 h-5" />
 *
 * // Icons that should NOT flip (social media, search, etc.)
 * <RTLIcon icon={SearchIcon} shouldFlip={false} className="w-5 h-5" />
 * ```
 *
 * @param icon - The icon component to render
 * @param shouldFlip - Whether to flip the icon in RTL mode (default: true)
 * @param className - Additional CSS classes
 * @param strokeWidth - Icon stroke width
 */
export function RTLIcon({
  icon: Icon,
  shouldFlip = true,
  className,
  strokeWidth,
}: RTLIconProps) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isRTL = rootData?.locale === 'ar';

  return (
    <Icon
      className={cn(
        className,
        shouldFlip && isRTL && 'scale-x-[-1]', // Flip horizontally in RTL
      )}
      strokeWidth={strokeWidth}
    />
  );
}

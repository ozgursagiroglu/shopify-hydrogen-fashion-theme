import {useEffect, useRef} from 'react';
import {cn} from '~/lib/cn';

export interface ScreenReaderAnnouncementProps {
  message: string;
  /**
   * Politeness level for screen reader announcements
   * - 'polite': Waits for current speech to finish (default)
   * - 'assertive': Interrupts current speech immediately
   */
  politeness?: 'polite' | 'assertive';
  /**
   * Clear message after announcement
   */
  clearOnUnmount?: boolean;
  className?: string;
}

/**
 * Screen reader announcement component using aria-live regions
 *
 * Use this component to announce dynamic content changes to screen reader users.
 * The component is visually hidden but accessible to assistive technologies.
 *
 * @example
 * // Announce cart updates
 * <ScreenReaderAnnouncement
 *   message="Item added to cart"
 *   politeness="polite"
 * />
 *
 * @example
 * // Announce errors immediately
 * <ScreenReaderAnnouncement
 *   message="Invalid promo code"
 *   politeness="assertive"
 * />
 */
export function ScreenReaderAnnouncement({
  message,
  politeness = 'polite',
  clearOnUnmount = false,
  className,
}: ScreenReaderAnnouncementProps) {
  const messageRef = useRef<string>('');

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    return () => {
      if (clearOnUnmount) {
        messageRef.current = '';
      }
    };
  }, [clearOnUnmount]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  );
}

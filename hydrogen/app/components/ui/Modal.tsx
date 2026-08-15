import {useEffect, useRef, useState, useCallback, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {cn} from '~/lib/cn';
import {CloseIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  title?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'w-full h-full max-w-[95vw] max-h-[95vh]',
};

export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  className,
  overlayClassName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  title,
}: ModalProps) {
  const {t} = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the modal
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors),
    ).filter(
      (el) =>
        !el.hasAttribute('disabled') &&
        !el.getAttribute('aria-hidden') &&
        el.offsetParent !== null,
    );
  }, []);

  // Handle keyboard navigation and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle escape key
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap - handle Tab key
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: go to last element if on first
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: go to first element if on last
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscape, getFocusableElements]);

  // Focus management & body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Store current focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Focus the modal
      modalRef.current?.focus();
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Restore focus to previous element
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Portal to body
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        overlayClassName,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop - handles click to close */}
      <div
        className="absolute inset-0 bg-primary/60 backdrop-blur-sm animate-[modal-backdrop-in_0.2s_ease-out]"
        aria-hidden="true"
        onClick={handleOverlayClick}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative w-full max-h-[calc(100vh-2rem)] bg-surface-0 rounded-xl shadow-modal',
          'flex flex-col overflow-hidden',
          'animate-[modal-content-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]',
          sizeClasses[size],
          className,
        )}
      >
        {/* Header (optional) */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-medium text-primary"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'p-2 rounded-full hover:bg-surface-2 transition-colors',
                  !title && 'ml-auto',
                )}
                aria-label={t('common.closeModal')}
              >
                <CloseIcon className="w-5 h-5 text-text-secondary" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={cn('px-6 py-4 h-full overflow-y-auto', !title && !showCloseButton && 'relative')}>
          {!title && showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="sticky top-4 right-4 z-10 float-right p-2 rounded-full bg-surface-0/80 backdrop-blur-sm hover:bg-surface-2 transition-colors shadow-sm"
              aria-label={t('common.closeModal')}
            >
              <CloseIcon className="w-5 h-5 text-text-secondary" />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Hook for modal state management
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {isOpen, open, close, toggle};
}

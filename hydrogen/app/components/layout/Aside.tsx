import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {cn} from '~/lib/cn';
import {CloseIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';
import {useIsRTL} from '~/lib/hooks/useIsRTL';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {t} = useTranslation();
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const isRTL = useIsRTL();

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  // Determine slide direction based on type and RTL
  const isMobileMenu = type === 'mobile';
  // Mobile menu slides from start (left in LTR, right in RTL)
  // Cart/Search slides from end (right in LTR, left in RTL)

  return (
    <div
      aria-modal
      className={cn(
        'fixed inset-0 z-100 transition-all duration-300',
        expanded
          ? 'visible opacity-100'
          : 'invisible opacity-0 pointer-events-none',
      )}
      role="dialog"
    >
      {/* Overlay */}
      <button
        className={cn(
          'absolute inset-0 bg-primary/60 backdrop-blur-sm transition-opacity duration-300 cursor-default',
          expanded ? 'opacity-100' : 'opacity-0',
        )}
        onClick={close}
        aria-label={t('common.close')}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'absolute top-0 bottom-0 w-full max-w-[420px] bg-surface flex flex-col shadow-modal transition-transform duration-300 ease-out',
          // Position: mobile menu from start, cart/search from end
          isMobileMenu ? 'start-0' : 'end-0',
          // Slide direction based on RTL
          expanded
            ? 'translate-x-0'
            : cn(
                // Mobile menu slides out to start
                isMobileMenu && !isRTL && '-translate-x-full',
                isMobileMenu && isRTL && 'translate-x-full',
                // Cart/Search slides out to end
                !isMobileMenu && !isRTL && 'translate-x-full',
                !isMobileMenu && isRTL && '-translate-x-full',
              ),
        )}
      >
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-surface shrink-0">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-text">
            {heading}
          </h3>
          <button
            className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text transition-colors duration-200 rounded-lg hover:bg-surface-alt -me-2"
            onClick={close}
            aria-label={t('common.close')}
          >
            <CloseIcon className="w-5 h-5" strokeWidth={2} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

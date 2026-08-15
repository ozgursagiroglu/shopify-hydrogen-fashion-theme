import {useState, createContext, useContext, useCallback, useRef, useEffect, type ReactNode} from 'react';
import {cn} from '~/lib/cn';
import {PlusIcon} from '~/components/icons';

// Context for accordion state management
interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
  allowMultiple: boolean;
  registerTrigger: (id: string, element: HTMLButtonElement | null) => void;
  unregisterTrigger: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an AccordionRoot');
  }
  return context;
}

// AccordionRoot - Container for accordion items
export interface AccordionRootProps {
  children: ReactNode;
  defaultOpen?: string[];
  allowMultiple?: boolean;
  className?: string;
}

export function AccordionRoot({
  children,
  defaultOpen = [],
  allowMultiple = false,
  className,
}: AccordionRootProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));
  const triggersRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  const toggle = useCallback((id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  }, [allowMultiple]);

  const registerTrigger = useCallback((id: string, element: HTMLButtonElement | null) => {
    if (element) {
      triggersRef.current.set(id, element);
    } else {
      triggersRef.current.delete(id);
    }
  }, []);

  const unregisterTrigger = useCallback((id: string) => {
    triggersRef.current.delete(id);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') !== 'button' && target.tagName !== 'BUTTON') {
      return;
    }

    const triggers = Array.from(triggersRef.current.values());
    const currentIndex = triggers.findIndex((trigger) => trigger === target);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = currentIndex + 1;
        if (nextIndex >= triggers.length) {
          nextIndex = 0;
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) {
          nextIndex = triggers.length - 1;
        }
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = triggers.length - 1;
        break;
      default:
        return;
    }

    triggers[nextIndex]?.focus();
  }, []);

  return (
    <AccordionContext.Provider value={{openItems, toggle, allowMultiple, registerTrigger, unregisterTrigger}}>
      <div
        className={cn('divide-y divide-border', className)}
        onKeyDown={handleKeyDown}
        role="presentation"
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// AccordionItem - Individual accordion section
export interface AccordionItemProps {
  id: string;
  children: ReactNode;
  className?: string;
}

const AccordionItemContext = createContext<{id: string; isOpen: boolean} | null>(null);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionTrigger/Content must be used within an AccordionItem');
  }
  return context;
}

export function AccordionItem({id, children, className}: AccordionItemProps) {
  const {openItems} = useAccordionContext();
  const isOpen = openItems.has(id);

  return (
    <AccordionItemContext.Provider value={{id, isOpen}}>
      <div className={cn('py-0', className)} data-state={isOpen ? 'open' : 'closed'}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

// AccordionTrigger - Clickable header
export interface AccordionTriggerProps {
  children: ReactNode;
  className?: string;
}

export function AccordionTrigger({children, className}: AccordionTriggerProps) {
  const {toggle, registerTrigger, unregisterTrigger} = useAccordionContext();
  const {id, isOpen} = useAccordionItemContext();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerTrigger(id, triggerRef.current);
    return () => unregisterTrigger(id);
  }, [id, registerTrigger, unregisterTrigger]);

  return (
    <button
      ref={triggerRef}
      type="button"
      id={`accordion-trigger-${id}`}
      onClick={() => toggle(id)}
      className={cn(
        'flex w-full items-center justify-between py-4',
        'text-left text-sm font-medium text-text',
        'hover:text-accent transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
        className,
      )}
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${id}`}
    >
      <span>{children}</span>
      <AccordionIcon isOpen={isOpen} />
    </button>
  );
}

// AccordionContent - Expandable content area
export interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}

export function AccordionContent({children, className}: AccordionContentProps) {
  const {id, isOpen} = useAccordionItemContext();

  return (
    <div
      id={`accordion-content-${id}`}
      role="region"
      aria-labelledby={`accordion-trigger-${id}`}
      className={cn(
        'grid transition-all duration-300 ease-out',
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <div className="overflow-hidden">
        <div className={cn('pb-4 text-sm text-text-secondary leading-relaxed', className)}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Icon component for accordion trigger
function AccordionIcon({isOpen}: {isOpen: boolean}) {
  return (
    <PlusIcon
      className={cn(
        'h-5 w-5 text-text-muted transition-transform duration-300',
        isOpen && 'rotate-45',
      )}
      strokeWidth={1.5}
    />
  );
}

// Compound export for cleaner API
export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useEffect,
} from 'react';
import {useFetcher} from 'react-router';
import {QuickView, type QuickViewProduct} from '~/components/product';

interface QuickViewContextType {
  openQuickView: (handle: string) => void;
  closeQuickView: () => void;
  isOpen: boolean;
}

const QuickViewContext = createContext<QuickViewContextType | null>(null);

export function QuickViewProvider({children}: {children: ReactNode}) {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const fetcher = useFetcher();

  const openQuickView = useCallback(
    (handle: string) => {
      setIsOpen(true);

      // Fetch product data
      void fetcher.load(`/api/product/${handle}`);
    },
    [fetcher],
  );

  const closeQuickView = useCallback(() => {
    setIsOpen(false);
    setProduct(null);
  }, []);

  // Update product when fetcher returns data
  /* eslint-disable react-hooks/set-state-in-effect -- legitimate state sync from async fetcher data */
  useEffect(() => {
    if (fetcher.data && fetcher.data.product) {
      setProduct(fetcher.data.product as QuickViewProduct);
    }
  }, [fetcher.data]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <QuickViewContext.Provider value={{openQuickView, closeQuickView, isOpen}}>
      {children}
      <QuickView isOpen={isOpen} onClose={closeQuickView} product={product} />
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
}

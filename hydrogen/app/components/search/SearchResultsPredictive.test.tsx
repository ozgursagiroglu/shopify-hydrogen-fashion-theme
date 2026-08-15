/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {SearchResultsPredictive} from './SearchResultsPredictive';

// Mock dependencies
const mockAsideClose = vi.fn();
const mockFetcher = {
  state: 'idle' as 'idle' | 'loading' | 'submitting',
  data: null as any,
  formData: null as any,
};

// Mock LocaleLink (component uses LocaleLink)
vi.mock('~/components/shared/LocaleLink', () => ({
  LocaleLink: ({children, onClick, ...props}: any) => (
    <a {...props} onClick={onClick}>{children}</a>
  ),
}));

// Override useFetcher for custom behavior
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useFetcher: () => mockFetcher,
  };
});

// Override Image and Money mocks for custom behavior
vi.mock('@shopify/hydrogen', () => ({
  Image: ({src, alt, ...props}: any) => <img src={src} alt={alt} {...props} />,
  Money: ({data}: any) => <span>{data.currencyCode} {data.amount}</span>,
}));

vi.mock('~/components/layout/Aside', () => ({
  useAside: () => ({
    close: mockAsideClose,
  }),
}));

describe('SearchResultsPredictive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcher.state = 'idle';
    mockFetcher.data = null;
    mockFetcher.formData = null;

    // Mock querySelector to return a search input
    const mockInput = document.createElement('input');
    mockInput.setAttribute('type', 'search');
    vi.spyOn(document, 'querySelector').mockReturnValue(mockInput);
  });

  describe('Main Component', () => {
    it('renders children with search state', () => {
      render(
        <SearchResultsPredictive>
          {({state}) => <div data-testid="state">{state}</div>}
        </SearchResultsPredictive>,
      );

      expect(screen.getByTestId('state')).toHaveTextContent('idle');
    });

    it('provides empty results initially', () => {
      render(
        <SearchResultsPredictive>
          {({total, items}) => (
            <div>
              <span data-testid="total">{total}</span>
              <span data-testid="products">{items.products.length}</span>
            </div>
          )}
        </SearchResultsPredictive>,
      );

      expect(screen.getByTestId('total')).toHaveTextContent('0');
      expect(screen.getByTestId('products')).toHaveTextContent('0');
    });

    it('provides closeSearch function', () => {
      let capturedCloseSearch: any = null;

      render(
        <SearchResultsPredictive>
          {({closeSearch}) => {
            capturedCloseSearch = closeSearch;
            return <div>Test</div>;
          }}
        </SearchResultsPredictive>,
      );

      expect(typeof capturedCloseSearch).toBe('function');
    });

    it('closeSearch resets input and closes aside', () => {
      const mockInput = document.createElement('input');
      mockInput.setAttribute('type', 'search');
      mockInput.value = 'test query';
      vi.spyOn(document, 'querySelector').mockReturnValue(mockInput);

      render(
        <SearchResultsPredictive>
          {({closeSearch}) => (
            <button onClick={closeSearch} data-testid="close-btn">Close</button>
          )}
        </SearchResultsPredictive>,
      );

      const button = screen.getByTestId('close-btn');
      button.click();

      expect(mockInput.value).toBe('');
      expect(mockAsideClose).toHaveBeenCalled();
    });
  });

  describe('SearchResultsPredictive.Articles', () => {
    it('returns null when no articles', () => {
      const {container} = render(
        <SearchResultsPredictive.Articles
          term={{current: 'test'}}
          articles={[]}
          closeSearch={vi.fn()}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders articles list', () => {
      const articles = [
        {
          id: '1',
          handle: 'article-1',
          title: 'Test Article 1',
          blog: {handle: 'news'},
          image: null,
          trackingParameters: null,
        },
        {
          id: '2',
          handle: 'article-2',
          title: 'Test Article 2',
          blog: {handle: 'news'},
          image: {url: 'https://example.com/image.jpg', altText: 'Article'},
          trackingParameters: null,
        },
      ];

      render(
        <SearchResultsPredictive.Articles
          term={{current: 'test'}}
          articles={articles}
          closeSearch={vi.fn()}
        />,
      );

      expect(screen.getByText('Articles')).toBeInTheDocument();
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
      expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    });

    it('calls closeSearch when clicking article link', async () => {
      const closeSearch = vi.fn();
      const articles = [
        {
          id: '1',
          handle: 'article-1',
          title: 'Test Article',
          blog: {handle: 'news'},
          image: null,
          trackingParameters: null,
        },
      ];

      render(
        <SearchResultsPredictive.Articles
          term={{current: 'test'}}
          articles={articles}
          closeSearch={closeSearch}
        />,
      );

      const link = screen.getByText('Test Article');
      link.click();

      expect(closeSearch).toHaveBeenCalled();
    });
  });

  describe('SearchResultsPredictive.Collections', () => {
    it('returns null when no collections', () => {
      const {container} = render(
        <SearchResultsPredictive.Collections
          term={{current: 'test'}}
          collections={[]}
          closeSearch={vi.fn()}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders collections list', () => {
      const collections = [
        {
          id: '1',
          handle: 'collection-1',
          title: 'Test Collection 1',
          image: {url: 'https://example.com/image.jpg', altText: 'Collection'},
          trackingParameters: null,
        },
        {
          id: '2',
          handle: 'collection-2',
          title: 'Test Collection 2',
          image: null,
          trackingParameters: null,
        },
      ];

      render(
        <SearchResultsPredictive.Collections
          term={{current: 'test'}}
          collections={collections}
          closeSearch={vi.fn()}
        />,
      );

      expect(screen.getByText('Collections')).toBeInTheDocument();
      expect(screen.getByText('Test Collection 1')).toBeInTheDocument();
      expect(screen.getByText('Test Collection 2')).toBeInTheDocument();
    });
  });

  describe('SearchResultsPredictive.Pages', () => {
    it('returns null when no pages', () => {
      const {container} = render(
        <SearchResultsPredictive.Pages
          term={{current: 'test'}}
          pages={[]}
          closeSearch={vi.fn()}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders pages list', () => {
      const pages = [
        {
          id: '1',
          handle: 'page-1',
          title: 'Test Page',
          trackingParameters: null,
        },
      ];

      render(
        <SearchResultsPredictive.Pages
          term={{current: 'test'}}
          pages={pages}
          closeSearch={vi.fn()}
        />,
      );

      expect(screen.getByText('Pages')).toBeInTheDocument();
      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });
  });

  describe('SearchResultsPredictive.Products', () => {
    it('returns null when no products', () => {
      const {container} = render(
        <SearchResultsPredictive.Products
          term={{current: 'test'}}
          products={[]}
          closeSearch={vi.fn()}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders products list', () => {
      const products = [
        {
          id: '1',
          handle: 'product-1',
          title: 'Test Product',
          selectedOrFirstAvailableVariant: {
            price: {amount: '100.00', currencyCode: 'USD'},
            image: {url: 'https://example.com/image.jpg', altText: 'Product'},
          },
          trackingParameters: null,
        },
      ];

      render(
        <SearchResultsPredictive.Products
          term={{current: 'test'}}
          products={products}
          closeSearch={vi.fn()}
        />,
      );

      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('USD 100.00')).toBeInTheDocument();
    });

    it('renders products without images', () => {
      const products = [
        {
          id: '1',
          handle: 'product-1',
          title: 'No Image Product',
          selectedOrFirstAvailableVariant: {
            price: {amount: '50.00', currencyCode: 'USD'},
            image: null,
          },
          trackingParameters: null,
        },
      ];

      render(
        <SearchResultsPredictive.Products
          term={{current: 'test'}}
          products={products}
          closeSearch={vi.fn()}
        />,
      );

      expect(screen.getByText('No Image Product')).toBeInTheDocument();
    });
  });

  describe('SearchResultsPredictive.Queries', () => {
    it('returns null when no queries', () => {
      const {container} = render(
        <SearchResultsPredictive.Queries
          queries={[]}
          queriesDatalistId="suggestions"
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders datalist with suggestions', () => {
      const queries = [
        {text: 'suggestion 1'},
        {text: 'suggestion 2'},
        {text: 'suggestion 3'},
      ];

      const {container} = render(
        <SearchResultsPredictive.Queries
          queries={queries}
          queriesDatalistId="suggestions"
        />,
      );

      const datalist = container.querySelector('datalist');
      expect(datalist).toBeInTheDocument();
      expect(datalist?.id).toBe('suggestions');

      const options = container.querySelectorAll('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveAttribute('value', 'suggestion 1');
    });

    it('filters out null suggestions', () => {
      const queries = [
        {text: 'suggestion 1'},
        null,
        {text: 'suggestion 2'},
      ];

      const {container} = render(
        <SearchResultsPredictive.Queries
          queries={queries as any}
          queriesDatalistId="suggestions"
        />,
      );

      const options = container.querySelectorAll('option');
      expect(options).toHaveLength(2);
    });
  });

  describe('SearchResultsPredictive.Empty', () => {
    it('returns null when term is empty', () => {
      const {container} = render(
        <SearchResultsPredictive.Empty term={{current: ''}} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders empty state with term', () => {
      render(
        <SearchResultsPredictive.Empty term={{current: 'missing'}} />,
      );

      expect(screen.getByText(/No results for "missing"/)).toBeInTheDocument();
    });
  });

  describe('usePredictiveSearch hook', () => {
    it('updates term when fetcher is loading', async () => {
      const formData = new FormData();
      formData.append('q', 'new query');
      mockFetcher.state = 'loading';
      mockFetcher.formData = formData;

      let capturedTerm: any = null;
      render(
        <SearchResultsPredictive>
          {({term}) => {
            capturedTerm = term;
            return <div data-testid="term">{term.current}</div>;
          }}
        </SearchResultsPredictive>,
      );

      // Wait for effect to run
      await waitFor(() => {
        expect(capturedTerm.current).toBe('new query');
      });
    });

    it('uses empty string when formData has no query', () => {
      mockFetcher.state = 'loading';
      mockFetcher.formData = new FormData();

      render(
        <SearchResultsPredictive>
          {({term}) => <div data-testid="term">{term.current}</div>}
        </SearchResultsPredictive>,
      );

      expect(screen.getByTestId('term')).toHaveTextContent('');
    });

    it('provides fetcher data results', () => {
      mockFetcher.data = {
        result: {
          total: 5,
          items: {
            products: [{id: '1', title: 'Product'}],
            articles: [],
            collections: [],
            pages: [],
            queries: [],
          },
        },
      };

      render(
        <SearchResultsPredictive>
          {({total, items}) => (
            <div>
              <span data-testid="total">{total}</span>
              <span data-testid="products">{items.products.length}</span>
            </div>
          )}
        </SearchResultsPredictive>,
      );

      expect(screen.getByTestId('total')).toHaveTextContent('5');
      expect(screen.getByTestId('products')).toHaveTextContent('1');
    });
  });

  describe('Component Static Properties', () => {
    it('exposes Articles subcomponent', () => {
      expect(SearchResultsPredictive.Articles).toBeDefined();
    });

    it('exposes Collections subcomponent', () => {
      expect(SearchResultsPredictive.Collections).toBeDefined();
    });

    it('exposes Pages subcomponent', () => {
      expect(SearchResultsPredictive.Pages).toBeDefined();
    });

    it('exposes Products subcomponent', () => {
      expect(SearchResultsPredictive.Products).toBeDefined();
    });

    it('exposes Queries subcomponent', () => {
      expect(SearchResultsPredictive.Queries).toBeDefined();
    });

    it('exposes Empty subcomponent', () => {
      expect(SearchResultsPredictive.Empty).toBeDefined();
    });
  });
});

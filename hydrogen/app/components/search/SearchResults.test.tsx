/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {SearchResults} from './SearchResults';

// Override Hydrogen mocks for custom Pagination behavior
vi.mock('@shopify/hydrogen', () => ({
  Image: ({data, alt, ...props}: any) => (
    <img src={data.url} alt={alt} {...props} />
  ),
  Money: ({data}: any) => <span>{data.currencyCode} {data.amount}</span>,
  Pagination: ({children, connection}: any) => {
    const mockNodes = connection.nodes || [];
    const mockPagination = {
      nodes: mockNodes,
      isLoading: false,
      NextLink: ({children}: any) => <div data-testid="next-link">{children}</div>,
      PreviousLink: ({children}: any) => <div data-testid="previous-link">{children}</div>,
    };
    return <div>{children(mockPagination)}</div>;
  },
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  SearchIcon: (props: any) => <svg data-testid="search-icon" {...props} />,
  ArticleIcon: (props: any) => <svg data-testid="article-icon" {...props} />,
  PageIcon: (props: any) => <svg data-testid="page-icon" {...props} />,
  ArrowUpIcon: (props: any) => <svg data-testid="arrow-up-icon" {...props} />,
  ArrowDownIcon: (props: any) => <svg data-testid="arrow-down-icon" {...props} />,
  ArrowRightIcon: (props: any) => <svg data-testid="arrow-right-icon" {...props} />,
  EyeIcon: (props: any) => <svg data-testid="eye-icon" {...props} />,
  HeartIcon: (props: any) => <svg data-testid="heart-icon" {...props} />,
  CompareIcon: (props: any) => <svg data-testid="compare-icon" {...props} />,
}));

// Mock ProductCard to avoid context dependencies in tests
vi.mock('~/components/product/ProductCard', () => ({
  ProductCard: ({product, to}: any) => (
    <a href={to || `/products/${product.handle}`} data-testid="product-card">
      <img src={product.featuredImage?.url} alt={product.title} />
      <span>{product.title}</span>
      {product.vendor && <span>{product.vendor}</span>}
      <span>{product.priceRange?.minVariantPrice?.currencyCode} {product.priceRange?.minVariantPrice?.amount}</span>
    </a>
  ),
}));

describe('SearchResults', () => {
  describe('Main Component', () => {
    it('returns null when no results', () => {
      const {container} = render(
        <SearchResults
          term="test"
          result={{total: 0, items: {products: {nodes: []}, articles: {nodes: []}, pages: {nodes: []}}}}
        >
          {() => <div>Results</div>}
        </SearchResults>,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders children with results', () => {
      const result = {
        total: 1,
        items: {
          products: {nodes: []},
          articles: {nodes: []},
          pages: {nodes: []},
        },
      };

      render(
        <SearchResults term="test" result={result}>
          {({term}) => <div data-testid="results">Results for {term}</div>}
        </SearchResults>,
      );

      expect(screen.getByTestId('results')).toHaveTextContent('Results for test');
    });

    it('passes all items and term to children', () => {
      const result = {
        total: 3,
        items: {
          products: {nodes: [{id: '1', title: 'Product 1'}]},
          articles: {nodes: [{id: '2', title: 'Article 1'}]},
          pages: {nodes: [{id: '3', title: 'Page 1'}]},
        },
      };

      render(
        <SearchResults term="test" result={result}>
          {({products, articles, pages, term}) => (
            <div>
              <span data-testid="term">{term}</span>
              <span data-testid="products">{products.nodes.length}</span>
              <span data-testid="articles">{articles.nodes.length}</span>
              <span data-testid="pages">{pages.nodes.length}</span>
            </div>
          )}
        </SearchResults>,
      );

      expect(screen.getByTestId('term')).toHaveTextContent('test');
      expect(screen.getByTestId('products')).toHaveTextContent('1');
      expect(screen.getByTestId('articles')).toHaveTextContent('1');
      expect(screen.getByTestId('pages')).toHaveTextContent('1');
    });
  });

  describe('SearchResults.Articles', () => {
    it('returns null when no articles', () => {
      const {container} = render(
        <SearchResults.Articles term="test" articles={{nodes: []}} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders articles list', () => {
      const articles = {
        nodes: [
          {
            id: '1',
            handle: 'article-1',
            title: 'Test Article 1',
            trackingParameters: null,
          },
          {
            id: '2',
            handle: 'article-2',
            title: 'Test Article 2',
            trackingParameters: 'utm_source=test',
          },
        ],
      };

      render(<SearchResults.Articles term="test" articles={articles} />);

      expect(screen.getByText('Articles')).toBeInTheDocument();
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
      expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    });

    it('generates correct URLs with tracking params', () => {
      const articles = {
        nodes: [
          {
            id: '1',
            handle: 'article-1',
            title: 'Test Article',
            trackingParameters: 'utm_source=shopify',
          },
        ],
      };

      render(<SearchResults.Articles term="query" articles={articles} />);

      const link = screen.getByText('Test Article').closest('a');
      expect(link?.getAttribute('href')).toContain('/blogs/article-1');
      expect(link?.getAttribute('href')).toContain('q=query');
      expect(link?.getAttribute('href')).toContain('utm_source=shopify');
    });
  });

  describe('SearchResults.Pages', () => {
    it('returns null when no pages', () => {
      const {container} = render(
        <SearchResults.Pages term="test" pages={{nodes: []}} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders pages list', () => {
      const pages = {
        nodes: [
          {
            id: '1',
            handle: 'page-1',
            title: 'Test Page 1',
            trackingParameters: null,
          },
          {
            id: '2',
            handle: 'page-2',
            title: 'Test Page 2',
            trackingParameters: null,
          },
        ],
      };

      render(<SearchResults.Pages term="test" pages={pages} />);

      expect(screen.getByText('Pages')).toBeInTheDocument();
      expect(screen.getByText('Test Page 1')).toBeInTheDocument();
      expect(screen.getByText('Test Page 2')).toBeInTheDocument();
    });

    it('generates correct URLs with tracking params', () => {
      const pages = {
        nodes: [
          {
            id: '1',
            handle: 'about',
            title: 'About Us',
            trackingParameters: 'utm_campaign=search',
          },
        ],
      };

      render(<SearchResults.Pages term="about" pages={pages} />);

      const link = screen.getByText('About Us').closest('a');
      expect(link?.getAttribute('href')).toContain('/about');
      expect(link?.getAttribute('href')).toContain('q=about');
      expect(link?.getAttribute('href')).toContain('utm_campaign=search');
    });
  });

  describe('SearchResults.Products', () => {
    it('returns null when no products', () => {
      const {container} = render(
        <SearchResults.Products term="test" products={{nodes: []}} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders products grid with pagination', () => {
      const products = {
        nodes: [
          {
            id: '1',
            handle: 'product-1',
            title: 'Test Product',
            vendor: 'Test Vendor',
            selectedOrFirstAvailableVariant: {
              price: {amount: '100.00', currencyCode: 'USD'},
              compareAtPrice: null,
              image: {url: 'https://example.com/image.jpg', altText: 'Product'},
            },
            trackingParameters: null,
          },
        ],
      };

      render(<SearchResults.Products term="test" products={products} />);

      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Test Vendor')).toBeInTheDocument();
    });

    it('renders discounted products via ProductCard', () => {
      const products = {
        nodes: [
          {
            id: '1',
            handle: 'product-1',
            title: 'Sale Product',
            vendor: 'Test Vendor',
            priceRange: {
              minVariantPrice: {amount: '80.00', currencyCode: 'USD'},
            },
            compareAtPriceRange: {
              minVariantPrice: {amount: '100.00', currencyCode: 'USD'},
            },
            featuredImage: {url: 'https://example.com/image.jpg', altText: 'Product'},
            trackingParameters: null,
          },
        ],
      };

      render(<SearchResults.Products term="test" products={products} />);

      // ProductCard is rendered (mocked)
      expect(screen.getByTestId('product-card')).toBeInTheDocument();
      expect(screen.getByText('Sale Product')).toBeInTheDocument();
    });

    it('renders products without images via ProductCard', () => {
      const products = {
        nodes: [
          {
            id: '1',
            handle: 'product-1',
            title: 'No Image Product',
            vendor: null,
            priceRange: {
              minVariantPrice: {amount: '50.00', currencyCode: 'USD'},
            },
            featuredImage: null,
            trackingParameters: null,
          },
        ],
      };

      render(<SearchResults.Products term="test" products={products} />);

      // ProductCard is rendered even without image (mocked)
      expect(screen.getByTestId('product-card')).toBeInTheDocument();
      expect(screen.getByText('No Image Product')).toBeInTheDocument();
    });

    it('displays pagination controls', () => {
      const products = {
        nodes: [
          {
            id: '1',
            handle: 'product-1',
            title: 'Product 1',
            selectedOrFirstAvailableVariant: {
              price: {amount: '100.00', currencyCode: 'USD'},
            },
          },
        ],
      };

      render(<SearchResults.Products term="test" products={products} />);

      expect(screen.getByTestId('previous-link')).toBeInTheDocument();
      expect(screen.getByTestId('next-link')).toBeInTheDocument();
    });
  });

  describe('SearchResults.Empty', () => {
    it('renders empty state with term', () => {
      render(<SearchResults.Empty term="missing" />);

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText(/We couldn't find any results for "missing"/)).toBeInTheDocument();
    });

    it('renders empty state without term', () => {
      render(<SearchResults.Empty />);

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText(/Enter a search term/)).toBeInTheDocument();
    });

    it('includes browse collections link', () => {
      render(<SearchResults.Empty term="test" />);

      const link = screen.getByText('Browse Collections').closest('a');
      expect(link?.getAttribute('href')).toBe('/collections/all');
    });
  });

  describe('Component Static Properties', () => {
    it('exposes Articles subcomponent', () => {
      expect(SearchResults.Articles).toBeDefined();
    });

    it('exposes Pages subcomponent', () => {
      expect(SearchResults.Pages).toBeDefined();
    });

    it('exposes Products subcomponent', () => {
      expect(SearchResults.Products).toBeDefined();
    });

    it('exposes Empty subcomponent', () => {
      expect(SearchResults.Empty).toBeDefined();
    });
  });
});

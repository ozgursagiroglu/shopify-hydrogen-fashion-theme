/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {PageLayout} from './PageLayout';

// Mock LocaleLink to avoid router context issues
vi.mock('~/components/shared/LocaleLink', () => ({
  LocaleLink: ({to, children, className, onClick}: any) => (
    <a href={to} className={className} onClick={onClick}>{children}</a>
  ),
  LocaleNavLink: ({to, children, className, onClick}: any) => {
    const resolvedClassName = typeof className === 'function'
      ? className({isActive: false, isPending: false})
      : className;
    return <a href={to} className={resolvedClassName} onClick={onClick}>{children}</a>;
  },
}));

// Mock Aside component - define inside factory to avoid hoisting issues
vi.mock('~/components/layout/Aside', () => {
  const AsideMock = ({children, type, heading}: {children: React.ReactNode; type: string; heading: string}) => (
    <div data-testid={`aside-${type}`} data-heading={heading}>{children}</div>
  );
  AsideMock.Provider = ({children}: {children: React.ReactNode}) => (
    <div data-testid="aside-provider">{children}</div>
  );

  return {
    Aside: AsideMock,
    useAside: () => ({
      type: 'closed',
      open: vi.fn(),
      close: vi.fn(),
    }),
  };
});

// Mock Header
vi.mock('~/components/layout/Header', () => ({
  Header: ({header}: {header: {shop: {name: string}}}) => (
    <header data-testid="header">{header.shop.name}</header>
  ),
  HeaderMenu: () => <nav data-testid="header-menu">Menu</nav>,
}));

// Mock Footer
vi.mock('~/components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

// Mock LocaleSelector
vi.mock('~/components/layout/LocaleSelector', () => ({
  LocaleSelector: () => <div data-testid="locale-selector">Locale</div>,
}));

// Mock CartMain
vi.mock('~/components/cart/CartMain', () => ({
  CartMain: ({cart, layout}: {cart: unknown; layout: string}) => (
    <div data-testid="cart-main" data-layout={layout}>Cart: {cart ? 'loaded' : 'empty'}</div>
  ),
}));

// Mock SearchFormPredictive
vi.mock('~/components/search/SearchFormPredictive', () => ({
  SEARCH_ENDPOINT: '/search',
  SearchFormPredictive: ({children}: {children: (props: unknown) => React.ReactNode}) => {
    const mockInputRef = {current: document.createElement('input')};
    const props = {
      fetchResults: vi.fn(),
      goToSearch: vi.fn(),
      inputRef: mockInputRef,
    };
    return <div data-testid="search-form">{children(props)}</div>;
  },
}));

// Mock SearchResultsPredictive with sub-components
vi.mock('~/components/search/SearchResultsPredictive', () => {
  const SearchResultsPredictiveMock = ({children}: {children: (props: unknown) => React.ReactNode}) => {
    const props = {
      items: {
        articles: [],
        collections: [],
        pages: [],
        products: [],
        queries: [],
      },
      total: 0,
      term: {current: ''},
      state: 'idle',
      closeSearch: () => {},
    };
    return <div data-testid="search-results">{children(props)}</div>;
  };
  SearchResultsPredictiveMock.Queries = () => null;
  SearchResultsPredictiveMock.Products = () => null;
  SearchResultsPredictiveMock.Collections = () => null;
  SearchResultsPredictiveMock.Pages = () => null;
  SearchResultsPredictiveMock.Articles = () => null;

  return {
    SearchResultsPredictive: SearchResultsPredictiveMock,
  };
});

// Mock QuickViewContext
vi.mock('~/context/QuickViewContext', () => ({
  QuickViewProvider: ({children}: {children: React.ReactNode}) => (
    <div data-testid="quickview-provider">{children}</div>
  ),
}));

// Mock CompareDrawer
vi.mock('~/components/product/CompareDrawer', () => ({
  CompareDrawer: () => <div data-testid="compare-drawer">Compare</div>,
}));

// Mock Spinner
vi.mock('~/components/ui/Spinner', () => ({
  Spinner: ({size}: {size?: string}) => (
    <div data-testid="spinner" data-size={size}>Loading...</div>
  ),
}));

// Note: react-router mock uses global mock from test/setup.ts

const mockHeader = {
  shop: {
    name: 'Test Shop',
    primaryDomain: {
      url: 'https://test-shop.myshopify.com',
    },
    brand: null,
  },
  menu: {
    id: 'main',
    items: [
      {id: '1', title: 'Home', url: '/'},
      {id: '2', title: 'Shop', url: '/collections'},
    ],
  },
};

const mockCart = {
  id: 'cart-1',
  totalQuantity: 2,
  lines: {nodes: []},
};

describe('PageLayout', () => {
  it('renders all layout components', () => {
    render(
      <PageLayout
        header={mockHeader}
        cart={Promise.resolve(mockCart)}
        isLoggedIn={Promise.resolve(false)}
        footerMenus={Promise.resolve(null)}
        publicStoreDomain="test-shop.myshopify.com"
      >
        <div>Content</div>
      </PageLayout>,
    );

    expect(screen.getByTestId('aside-provider')).toBeInTheDocument();
    expect(screen.getByTestId('quickview-provider')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('compare-drawer')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <PageLayout
        header={mockHeader}
        cart={Promise.resolve(mockCart)}
        isLoggedIn={Promise.resolve(false)}
        footerMenus={Promise.resolve(null)}
        publicStoreDomain="test-shop.myshopify.com"
      >
        <div>Page Content</div>
      </PageLayout>,
    );

    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders main content in main element', () => {
    render(
      <PageLayout
        header={mockHeader}
        cart={Promise.resolve(mockCart)}
        isLoggedIn={Promise.resolve(false)}
        footerMenus={Promise.resolve(null)}
        publicStoreDomain="test-shop.myshopify.com"
      >
        <div>Page Content</div>
      </PageLayout>,
    );

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toContainElement(screen.getByText('Page Content'));
  });

  it('renders cart aside', () => {
    render(
      <PageLayout
        header={mockHeader}
        cart={Promise.resolve(mockCart)}
        isLoggedIn={Promise.resolve(false)}
        footerMenus={Promise.resolve(null)}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByTestId('aside-cart')).toBeInTheDocument();
    expect(screen.getByTestId('cart-main')).toBeInTheDocument();
  });

  it('renders search aside with form', () => {
    render(
      <PageLayout
        header={mockHeader}
        cart={Promise.resolve(mockCart)}
        isLoggedIn={Promise.resolve(false)}
        footerMenus={Promise.resolve(null)}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByTestId('aside-search')).toBeInTheDocument();
    expect(screen.getByTestId('search-form')).toBeInTheDocument();
    expect(screen.getByTestId('search-results')).toBeInTheDocument();
  });

  it('renders mobile menu aside', () => {
    render(
      <PageLayout
        header={mockHeader}
        cart={Promise.resolve(mockCart)}
        isLoggedIn={Promise.resolve(false)}
        footerMenus={Promise.resolve(null)}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByTestId('aside-mobile')).toBeInTheDocument();
    expect(screen.getByTestId('header-menu')).toBeInTheDocument();
    expect(screen.getByTestId('locale-selector')).toBeInTheDocument();
  });

  it('renders search input with placeholder', () => {
    render(
      <PageLayout
        header={mockHeader}
        cart={Promise.resolve(mockCart)}
        isLoggedIn={Promise.resolve(false)}
        footerMenus={Promise.resolve(null)}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    const searchInput = screen.getByPlaceholderText('Search for products, articles...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'search');
  });

  it('handles null children', () => {
    render(
      <PageLayout
        header={mockHeader}
        cart={Promise.resolve(mockCart)}
        isLoggedIn={Promise.resolve(false)}
        footerMenus={Promise.resolve(null)}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('renders header with shop name', () => {
    render(
      <PageLayout
        header={mockHeader}
        cart={Promise.resolve(mockCart)}
        isLoggedIn={Promise.resolve(false)}
        footerMenus={Promise.resolve(null)}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByText('Test Shop')).toBeInTheDocument();
  });

  it('provides QuickView context', () => {
    render(
      <PageLayout
        header={mockHeader}
        cart={Promise.resolve(mockCart)}
        isLoggedIn={Promise.resolve(false)}
        footerMenus={Promise.resolve(null)}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByTestId('quickview-provider')).toBeInTheDocument();
  });

  it('provides Aside context', () => {
    render(
      <PageLayout
        header={mockHeader}
        cart={Promise.resolve(mockCart)}
        isLoggedIn={Promise.resolve(false)}
        footerMenus={Promise.resolve(null)}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByTestId('aside-provider')).toBeInTheDocument();
  });
});

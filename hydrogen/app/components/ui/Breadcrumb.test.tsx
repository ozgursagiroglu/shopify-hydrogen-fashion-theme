/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import i18next from 'i18next';
import {
  Breadcrumb,
  buildProductBreadcrumbs,
  buildCollectionBreadcrumbs,
  buildSearchBreadcrumbs,
  buildAccountBreadcrumbs,
  type BreadcrumbItem,
} from './Breadcrumb';

// Get translation function for testing helper functions (use i18next.t directly)
const t = i18next.t.bind(i18next);

// Custom mock for react-router Link with data-testid for Breadcrumb tests
vi.mock('react-router', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid="router-link">
      {children}
    </a>
  ),
  useRouteLoaderData: vi.fn(() => ({
    locale: 'en',
  })),
  useLocation: vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  })),
}));

describe('Breadcrumb', () => {
  const simpleItems: BreadcrumbItem[] = [
    {label: 'Home', href: '/'},
    {label: 'Products', href: '/products'},
    {label: 'T-Shirt'},
  ];

  describe('Rendering', () => {
    it('renders breadcrumb navigation', () => {
      render(<Breadcrumb items={simpleItems} />);

      const nav = screen.getByRole('navigation', {name: /breadcrumb/i});
      expect(nav).toBeInTheDocument();
    });

    it('renders all breadcrumb items', () => {
      render(<Breadcrumb items={simpleItems} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('T-Shirt')).toBeInTheDocument();
    });

    it('renders links for items with href except last item', () => {
      render(<Breadcrumb items={simpleItems} />);

      const links = screen.getAllByTestId('router-link');
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAttribute('href', '/');
      expect(links[1]).toHaveAttribute('href', '/products');
    });

    it('renders last item as span without link', () => {
      render(<Breadcrumb items={simpleItems} />);

      const lastItem = screen.getByText('T-Shirt');
      expect(lastItem.tagName).toBe('SPAN');
      expect(lastItem).not.toHaveAttribute('href');
    });

    it('applies custom className', () => {
      render(<Breadcrumb items={simpleItems} className="custom-breadcrumb" />);

      const nav = screen.getByRole('navigation');
      expect(nav.className).toContain('custom-breadcrumb');
    });

    it('returns null when items array is empty', () => {
      const {container} = render(<Breadcrumb items={[]} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Separators', () => {
    it('renders separators between items', () => {
      render(<Breadcrumb items={simpleItems} />);

      const separators = screen.getAllByText('/', {exact: false});
      expect(separators.length).toBeGreaterThan(0);
    });

    it('does not render separator after last item', () => {
      const {container} = render(<Breadcrumb items={simpleItems} />);

      const listItems = container.querySelectorAll('li');
      const lastItem = listItems[listItems.length - 1];
      const separator = lastItem.querySelector('[aria-hidden="true"]');

      expect(separator).toBeNull();
    });

    it('separator has aria-hidden attribute', () => {
      render(<Breadcrumb items={simpleItems} />);

      const separators = screen.getAllByText('/', {exact: true});
      separators.forEach((sep) => {
        expect(sep).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('ARIA Attributes', () => {
    it('last item has aria-current="page"', () => {
      render(<Breadcrumb items={simpleItems} />);

      const lastItem = screen.getByText('T-Shirt');
      expect(lastItem).toHaveAttribute('aria-current', 'page');
    });

    it('non-last items do not have aria-current', () => {
      render(<Breadcrumb items={simpleItems} />);

      const homeLink = screen.getByText('Home');
      expect(homeLink).not.toHaveAttribute('aria-current');
    });

    it('navigation has aria-label', () => {
      render(<Breadcrumb items={simpleItems} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });
  });

  describe('Styling', () => {
    it('applies hover styles to links', () => {
      render(<Breadcrumb items={simpleItems} />);

      const links = screen.getAllByTestId('router-link');
      links.forEach((link) => {
        expect(link.className).toContain('hover:text-primary');
        expect(link.className).toContain('transition-colors');
      });
    });

    it('applies font-medium to last item', () => {
      render(<Breadcrumb items={simpleItems} />);

      const lastItem = screen.getByText('T-Shirt');
      expect(lastItem.className).toContain('font-medium');
    });

    it('applies text-text-muted to non-last items without href', () => {
      const items: BreadcrumbItem[] = [
        {label: 'Home', href: '/'},
        {label: 'Category'},
        {label: 'Product'},
      ];

      render(<Breadcrumb items={items} />);

      const categoryItem = screen.getByText('Category');
      expect(categoryItem.className).toContain('text-text-muted');
    });
  });

  describe('Structured Data', () => {
    it('renders schema.org structured data script', () => {
      const {container} = render(<Breadcrumb items={simpleItems} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();
    });

    it('structured data contains correct context and type', () => {
      const {container} = render(<Breadcrumb items={simpleItems} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(script?.textContent || '{}');

      expect(data['@context']).toBe('https://schema.org');
      expect(data['@type']).toBe('BreadcrumbList');
    });

    it('structured data contains all items', () => {
      const {container} = render(<Breadcrumb items={simpleItems} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(script?.textContent || '{}');

      expect(data.itemListElement).toHaveLength(3);
    });

    it('structured data items have correct positions', () => {
      const {container} = render(<Breadcrumb items={simpleItems} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(script?.textContent || '{}');

      expect(data.itemListElement[0].position).toBe(1);
      expect(data.itemListElement[1].position).toBe(2);
      expect(data.itemListElement[2].position).toBe(3);
    });

    it('structured data items include href when provided', () => {
      const {container} = render(<Breadcrumb items={simpleItems} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(script?.textContent || '{}');

      expect(data.itemListElement[0].item).toBe('/');
      expect(data.itemListElement[1].item).toBe('/products');
      expect(data.itemListElement[2].item).toBeUndefined();
    });

    it('structured data items include labels', () => {
      const {container} = render(<Breadcrumb items={simpleItems} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(script?.textContent || '{}');

      expect(data.itemListElement[0].name).toBe('Home');
      expect(data.itemListElement[1].name).toBe('Products');
      expect(data.itemListElement[2].name).toBe('T-Shirt');
    });
  });

  describe('Edge Cases', () => {
    it('handles single item', () => {
      const items: BreadcrumbItem[] = [{label: 'Home'}];

      render(<Breadcrumb items={items} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.queryByText('/')).not.toBeInTheDocument();
    });

    it('handles items with same label', () => {
      const items: BreadcrumbItem[] = [
        {label: 'Test', href: '/test1'},
        {label: 'Test', href: '/test2'},
        {label: 'Test'},
      ];

      render(<Breadcrumb items={items} />);

      const testItems = screen.getAllByText('Test');
      expect(testItems).toHaveLength(3);
    });

    it('handles items without href', () => {
      const items: BreadcrumbItem[] = [
        {label: 'Home'},
        {label: 'Products'},
        {label: 'Item'},
      ];

      render(<Breadcrumb items={items} />);

      expect(screen.queryByTestId('router-link')).not.toBeInTheDocument();
    });
  });
});

describe('buildProductBreadcrumbs', () => {
  it('builds breadcrumbs with product only', () => {
    const product = {title: 'Blue Jeans', handle: 'blue-jeans'};
    const breadcrumbs = buildProductBreadcrumbs(t, product);

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({label: 'Home', href: '/'});
    expect(breadcrumbs[1]).toEqual({label: 'Blue Jeans'});
  });

  it('builds breadcrumbs with product and collection', () => {
    const product = {title: 'Blue Jeans', handle: 'blue-jeans'};
    const collection = {title: 'Denim', handle: 'denim'};
    const breadcrumbs = buildProductBreadcrumbs(t, product, collection);

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({label: 'Home', href: '/'});
    expect(breadcrumbs[1]).toEqual({label: 'Denim', href: '/collections/denim'});
    expect(breadcrumbs[2]).toEqual({label: 'Blue Jeans'});
  });

  it('handles null collection', () => {
    const product = {title: 'Blue Jeans', handle: 'blue-jeans'};
    const breadcrumbs = buildProductBreadcrumbs(t, product, null);

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({label: 'Home', href: '/'});
    expect(breadcrumbs[1]).toEqual({label: 'Blue Jeans'});
  });
});

describe('buildCollectionBreadcrumbs', () => {
  it('builds collection breadcrumbs', () => {
    const collection = {title: 'Summer Collection'};
    const breadcrumbs = buildCollectionBreadcrumbs(t, collection);

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({label: 'Home', href: '/'});
    expect(breadcrumbs[1]).toEqual({label: 'Collections', href: '/collections'});
    expect(breadcrumbs[2]).toEqual({label: 'Summer Collection'});
  });
});

describe('buildSearchBreadcrumbs', () => {
  it('builds search breadcrumbs without query', () => {
    const breadcrumbs = buildSearchBreadcrumbs(t);

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({label: 'Home', href: '/'});
    expect(breadcrumbs[1]).toEqual({label: 'Search'});
  });

  it('builds search breadcrumbs with query', () => {
    const breadcrumbs = buildSearchBreadcrumbs(t, 'blue jeans');

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({label: 'Home', href: '/'});
    expect(breadcrumbs[1]).toEqual({label: 'Search: blue jeans'});
  });

  it('handles empty query string', () => {
    const breadcrumbs = buildSearchBreadcrumbs(t, '');

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[1]).toEqual({label: 'Search'});
  });
});

describe('buildAccountBreadcrumbs', () => {
  it('builds account breadcrumbs without parent pages', () => {
    const breadcrumbs = buildAccountBreadcrumbs(t, 'Orders');

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({label: 'Home', href: '/'});
    expect(breadcrumbs[1]).toEqual({label: 'Account', href: '/account'});
    expect(breadcrumbs[2]).toEqual({label: 'Orders'});
  });

  it('builds account breadcrumbs with parent pages', () => {
    const parentPages = [
      {label: 'Orders', href: '/account/orders'},
      {label: 'Order #1234', href: '/account/orders/1234'},
    ];
    const breadcrumbs = buildAccountBreadcrumbs(t, 'Return', parentPages);

    expect(breadcrumbs).toHaveLength(5);
    expect(breadcrumbs[0]).toEqual({label: 'Home', href: '/'});
    expect(breadcrumbs[1]).toEqual({label: 'Account', href: '/account'});
    expect(breadcrumbs[2]).toEqual({label: 'Orders', href: '/account/orders'});
    expect(breadcrumbs[3]).toEqual({label: 'Order #1234', href: '/account/orders/1234'});
    expect(breadcrumbs[4]).toEqual({label: 'Return'});
  });

  it('handles empty parent pages array', () => {
    const breadcrumbs = buildAccountBreadcrumbs(t, 'Profile', []);

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[2]).toEqual({label: 'Profile'});
  });
});

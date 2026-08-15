/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {LocaleLink, LocaleNavLink} from './LocaleLink';

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      PUBLIC_STORE_DOMAIN: 'localhost:3000',
    },
  },
});

// Mock the locale utilities
vi.mock('~/lib/locale', () => {
  const PUBLIC_STORE_DOMAIN = 'localhost:3000';

  function extractPathFromSameOriginUrl(url: string): string | null {
    if (!/^https?:\/\//i.test(url) && !url.startsWith('//')) {
      return null;
    }

    try {
      const urlObj = new URL(url);

      // Compare hostnames (ignore protocol and port)
      if (urlObj.hostname === PUBLIC_STORE_DOMAIN || urlObj.host === PUBLIC_STORE_DOMAIN) {
        return urlObj.pathname + urlObj.search + urlObj.hash;
      }

      return null;
    } catch {
      return null;
    }
  }

  return {
    useLocalePrefix: vi.fn(() => ''),
    getLocalePath: vi.fn((path: string, prefix: string) => {
      // Check if same-origin URL
      const extractedPath = extractPathFromSameOriginUrl(path);
      if (extractedPath !== null) {
        path = extractedPath;
      } else if (/^https?:\/\//i.test(path) || path.startsWith('//')) {
        // External URL
        return path;
      }

      if (!prefix) return path;
      return path === '/' ? prefix : `${prefix}${path}`;
    }),
    isExternalUrl: vi.fn((url: string) => {
      if (!/^https?:\/\//i.test(url) && !url.startsWith('//')) {
        return false;
      }

      const extractedPath = extractPathFromSameOriginUrl(url);
      return extractedPath === null;
    }),
  };
});

// Custom mock for react-router with NavLink for LocaleLink tests
vi.mock('react-router', () => ({
  Link: ({to, children, ...props}: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  NavLink: ({to, children, ...props}: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useLocation: vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  })),
  useRouteLoaderData: vi.fn(() => ({
    locale: 'en',
  })),
}));

describe('LocaleLink', () => {
  it('renders a link with localized path', () => {
    render(<LocaleLink to="/products">Products</LocaleLink>);

    const link = screen.getByRole('link', {name: 'Products'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/products');
  });

  it('passes through additional props', () => {
    render(
      <LocaleLink to="/products" className="custom-class">
        Products
      </LocaleLink>
    );

    const link = screen.getByRole('link', {name: 'Products'});
    expect(link).toHaveClass('custom-class');
  });

  it('handles root path', () => {
    render(<LocaleLink to="/">Home</LocaleLink>);

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toBeInTheDocument();
  });

  it('renders external URLs without locale prefix', () => {
    render(<LocaleLink to="https://example.com/products">External</LocaleLink>);

    const link = screen.getByRole('link', {name: 'External'});
    expect(link).toHaveAttribute('href', 'https://example.com/products');
  });

  it('handles protocol-relative URLs', () => {
    render(<LocaleLink to="//cdn.example.com/asset">CDN Asset</LocaleLink>);

    const link = screen.getByRole('link', {name: 'CDN Asset'});
    expect(link).toHaveAttribute('href', '//cdn.example.com/asset');
  });

  it('renders external URLs as anchor tags', () => {
    const {container} = render(
      <LocaleLink to="https://example.com" className="external-link">
        External Site
      </LocaleLink>
    );

    const link = container.querySelector('a[href="https://example.com"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass('external-link');
  });

  it('extracts pathname from same-origin URLs', () => {
    render(<LocaleLink to="http://localhost:3000/products">Same Origin</LocaleLink>);

    const link = screen.getByRole('link', {name: 'Same Origin'});
    // Should extract pathname and use it as internal link
    expect(link).toHaveAttribute('href', '/products');
  });

  it('handles same-origin URLs with query params and hash', () => {
    render(
      <LocaleLink to="http://localhost:3000/search?q=shoes#results">
        Search Results
      </LocaleLink>
    );

    const link = screen.getByRole('link', {name: 'Search Results'});
    expect(link).toHaveAttribute('href', '/search?q=shoes#results');
  });

  it('treats same-origin URLs as internal links (uses Link component)', () => {
    const {container} = render(
      <LocaleLink to="http://localhost:3000/collections/all">
        Same Origin Collection
      </LocaleLink>
    );

    // Should be rendered as Link (mocked as <a>), not as external anchor
    const link = container.querySelector('a[href="/collections/all"]');
    expect(link).toBeInTheDocument();
  });
});

describe('LocaleNavLink', () => {
  it('renders a navlink with localized path', () => {
    render(<LocaleNavLink to="/collections">Collections</LocaleNavLink>);

    const link = screen.getByRole('link', {name: 'Collections'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/collections');
  });

  it('passes through additional props', () => {
    render(
      <LocaleNavLink to="/collections" className="nav-class">
        Collections
      </LocaleNavLink>
    );

    const link = screen.getByRole('link', {name: 'Collections'});
    expect(link).toHaveClass('nav-class');
  });

  it('handles root path', () => {
    render(<LocaleNavLink to="/">Home</LocaleNavLink>);

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toBeInTheDocument();
  });

  it('renders external URLs without locale prefix', () => {
    render(<LocaleNavLink to="https://example.com/blog">External Blog</LocaleNavLink>);

    const link = screen.getByRole('link', {name: 'External Blog'});
    expect(link).toHaveAttribute('href', 'https://example.com/blog');
  });

  it('handles protocol-relative URLs', () => {
    render(<LocaleNavLink to="//cdn.example.com/styles">CDN Styles</LocaleNavLink>);

    const link = screen.getByRole('link', {name: 'CDN Styles'});
    expect(link).toHaveAttribute('href', '//cdn.example.com/styles');
  });

  it('extracts pathname from same-origin URLs', () => {
    render(<LocaleNavLink to="http://localhost:3000/account">Same Origin</LocaleNavLink>);

    const link = screen.getByRole('link', {name: 'Same Origin'});
    expect(link).toHaveAttribute('href', '/account');
  });

  it('handles same-origin URLs with query params', () => {
    render(
      <LocaleNavLink to="http://localhost:3000/collections?sort=price">
        Sorted Collection
      </LocaleNavLink>
    );

    const link = screen.getByRole('link', {name: 'Sorted Collection'});
    expect(link).toHaveAttribute('href', '/collections?sort=price');
  });
});

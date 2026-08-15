/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Footer} from './Footer';

// Mock LocaleLink component (used as NavLink in Footer)
vi.mock('~/components/shared/LocaleLink', () => ({
  LocaleNavLink: ({to, children, className, prefetch}: {to: string; children: React.ReactNode; className?: string; prefetch?: string}) => (
    <a href={to} className={className} data-prefetch={prefetch}>
      {children}
    </a>
  ),
  LocaleLink: ({to, children, className}: {to: string; children: React.ReactNode; className?: string}) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Custom mock for react-router with specific loader data for Footer tests
vi.mock('react-router', () => ({
  Await: ({children, resolve}: {children: (data: unknown) => React.ReactNode; resolve: unknown}) => {
    return <>{children(resolve)}</>;
  },
  useRouteLoaderData: vi.fn(() => ({
    localization: {
      localization: {
        availableCountries: [
          {
            isoCode: 'US',
            name: 'United States',
            currency: {
              isoCode: 'USD',
              name: 'US Dollar',
              symbol: '$',
            },
            availableLanguages: [
              {isoCode: 'EN', name: 'English'},
            ],
          },
        ],
      },
    },
  })),
  useLocation: vi.fn(() => ({
    pathname: '/',
  })),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  GlobeIcon: ({className}: {className?: string}) => (
    <svg data-testid="globe-icon" className={className} />
  ),
  FacebookIcon: () => <svg data-testid="facebook-icon" />,
  InstagramIcon: () => <svg data-testid="instagram-icon" />,
  TwitterIcon: () => <svg data-testid="twitter-icon" />,
  PinterestIcon: () => <svg data-testid="pinterest-icon" />,
  YouTubeIcon: () => <svg data-testid="youtube-icon" />,
  TikTokIcon: () => <svg data-testid="tiktok-icon" />,
}));

const mockHeader = {
  shop: {
    name: 'Test Shop',
    primaryDomain: {
      url: 'https://test-shop.myshopify.com',
    },
    brand: null,
  },
  menu: null,
};

const mockFooterMenus = {
  shopMenu: {
    id: 'shop',
    items: [
      {
        id: '1',
        title: 'New Arrivals',
        url: '/collections/new-arrivals',
      },
      {
        id: '2',
        title: 'Women',
        url: '/collections/women',
      },
    ],
  },
  helpMenu: {
    id: 'help',
    items: [
      {
        id: '3',
        title: 'Contact',
        url: '/contact',
      },
      {
        id: '4',
        title: 'FAQ',
        url: '/faq',
      },
    ],
  },
  aboutMenu: {
    id: 'about',
    items: [
      {
        id: '5',
        title: 'Our Story',
        url: '/about',
      },
    ],
  },
  legalMenu: {
    id: 'legal',
    items: [
      {
        id: '6',
        title: 'Privacy Policy',
        url: '/policies/privacy-policy',
      },
      {
        id: '7',
        title: 'Terms of Service',
        url: '/policies/terms-of-service',
      },
    ],
  },
};

describe('Footer', () => {
  it('renders shop name', () => {
    render(
      <Footer
        header={mockHeader}
        footerMenus={mockFooterMenus as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByText('Test Shop')).toBeInTheDocument();
  });

  it('renders footer menus', () => {
    render(
      <Footer
        header={mockHeader}
        footerMenus={mockFooterMenus as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByText('New Arrivals')).toBeInTheDocument();
    expect(screen.getByText('Women')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Our Story')).toBeInTheDocument();
  });

  it('renders legal menu', () => {
    render(
      <Footer
        header={mockHeader}
        footerMenus={mockFooterMenus as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('renders copyright', () => {
    render(
      <Footer
        header={mockHeader}
        footerMenus={mockFooterMenus as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${year} Test Shop`))).toBeInTheDocument();
  });

  it('renders social links', () => {
    const mockShopMetafields = {
      shop: {
        social_instagram: {value: 'https://instagram.com/test'},
        social_pinterest: {value: 'https://pinterest.com/test'},
        social_tiktok: {value: 'https://tiktok.com/@test'},
      },
    };

    render(
      <Footer
        header={mockHeader}
        footerMenus={mockFooterMenus as any}
        shopMetafields={mockShopMetafields as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    const socialLinks = screen.getAllByRole('link', {name: /Instagram|Pinterest|TikTok/i});
    expect(socialLinks.length).toBeGreaterThan(0);
  });

  it('renders brand description', () => {
    render(
      <Footer
        header={mockHeader}
        footerMenus={mockFooterMenus as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByText('footer.brandDescription')).toBeInTheDocument();
  });

  it('renders section headers', () => {
    render(
      <Footer
        header={mockHeader}
        footerMenus={mockFooterMenus as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByText('footer.sections.shop')).toBeInTheDocument();
    expect(screen.getByText('footer.sections.help')).toBeInTheDocument();
    expect(screen.getByText('footer.sections.about')).toBeInTheDocument();
  });

  it('renders locale information', () => {
    render(
      <Footer
        header={mockHeader}
        footerMenus={mockFooterMenus as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByText(/United States/)).toBeInTheDocument();
    expect(screen.getByText(/USD/)).toBeInTheDocument();
    expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
  });

  it('handles external URLs', () => {
    const menusWithExternal = {
      ...mockFooterMenus,
      shopMenu: {
        id: 'shop',
        items: [
          {
            id: '1',
            title: 'External Link',
            url: 'https://external.com',
          },
        ],
      },
    };

    render(
      <Footer
        header={mockHeader}
        footerMenus={menusWithExternal as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    const link = screen.getByText('External Link');
    expect(link).toHaveAttribute('href', 'https://external.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('hides menu sections when no data provided', () => {
    render(
      <Footer
        header={mockHeader}
        footerMenus={null as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    // Should not render menu links when footerMenus is null
    expect(screen.queryByText('New Arrivals')).toBeNull();
    expect(screen.queryByText('Women')).toBeNull();
    expect(screen.queryByText('Contact')).toBeNull();
    expect(screen.queryByText('Our Story')).toBeNull();
  });

  it('filters out menu items without URLs', () => {
    const menusWithNullUrl = {
      ...mockFooterMenus,
      shopMenu: {
        id: 'shop',
        items: [
          {
            id: '1',
            title: 'No URL',
            url: null,
          },
          {
            id: '2',
            title: 'Has URL',
            url: '/test',
          },
        ],
      },
    };

    render(
      <Footer
        header={mockHeader}
        footerMenus={menusWithNullUrl as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    expect(screen.getByText('Has URL')).toBeInTheDocument();
    expect(screen.queryByText('No URL')).not.toBeInTheDocument();
  });

  it('renders separators in legal menu', () => {
    render(
      <Footer
        header={mockHeader}
        footerMenus={mockFooterMenus as any}
        publicStoreDomain="test-shop.myshopify.com"
      />,
    );

    const separators = screen.getAllByText('·');
    expect(separators.length).toBeGreaterThan(0);
  });
});

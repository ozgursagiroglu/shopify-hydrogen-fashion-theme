/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Header} from './Header';

const mockPublish = vi.fn();
const mockOpen = vi.fn();

// Mock useAside
vi.mock('~/components/layout/Aside', () => ({
  useAside: () => ({
    type: 'closed',
    open: mockOpen,
    close: vi.fn(),
  }),
}));

// Mock LocaleSelector
vi.mock('~/components/layout/LocaleSelector', () => ({
  LocaleSelector: ({className}: {className?: string}) => (
    <div data-testid="locale-selector" className={className}>
      Locale
    </div>
  ),
}));

// Mock LocaleLink component
vi.mock('~/components/shared/LocaleLink', () => ({
  LocaleNavLink: ({
    to,
    children,
    className,
    prefetch,
    end,
    ...rest
  }: {
    to: string;
    children: React.ReactNode;
    className?: string | (({isActive}: {isActive: boolean}) => string);
    prefetch?: string;
    end?: boolean;
    [key: string]: unknown;
  }) => {
    const computedClassName =
      typeof className === 'function'
        ? className({isActive: to === '/'})
        : className;
    return (
      <a
        href={to}
        className={computedClassName}
        data-prefetch={prefetch}
        data-end={end}
        {...rest}
      >
        {children}
      </a>
    );
  },
  LocaleLink: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Custom mock for react-router with NavLink and useAsyncValue for Header tests
vi.mock('react-router', () => {
  // Track async value for useAsyncValue hook
  const state = {asyncValue: {totalQuantity: 2} as unknown};

  return {
    NavLink: ({
      to,
      children,
      className,
      prefetch,
      end,
      ...rest
    }: {
      to: string;
      children: React.ReactNode;
      className?: string | (({isActive}: {isActive: boolean}) => string);
      prefetch?: string;
      end?: boolean;
      [key: string]: unknown;
    }) => {
      const computedClassName =
        typeof className === 'function'
          ? className({isActive: to === '/'})
          : className;
      return (
        <a
          href={to}
          className={computedClassName}
          data-prefetch={prefetch}
          data-end={end}
          {...rest}
        >
          {children}
        </a>
      );
    },
    Await: ({
      children,
      resolve,
    }: {
      children: React.ReactNode | ((data: unknown) => React.ReactNode);
      resolve: unknown;
    }) => {
      const resolvedValue = resolve;
      state.asyncValue = resolvedValue;

      if (typeof children === 'function') {
        return <>{children(resolvedValue)}</>;
      }
      return <>{children}</>;
    },
    useAsyncValue: () => state.asyncValue,
  };
});

// Custom mock for @shopify/hydrogen with useAnalytics and useOptimisticCart
vi.mock('@shopify/hydrogen', () => ({
  Image: ({
    data,
    sizes,
    className,
  }: {
    data: {url?: string; altText?: string};
    sizes?: string;
    className?: string;
  }) => (
    <img
      src={data.url}
      alt={data.altText}
      data-sizes={sizes}
      className={className}
      data-testid="hydrogen-image"
    />
  ),
  useAnalytics: () => ({
    publish: mockPublish,
    shop: {},
    cart: {},
    prevCart: {},
  }),
  useOptimisticCart: (cart: unknown) => cart,
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: {count?: number}) => {
      if (
        key === 'header.actions.cartWithCount' &&
        options?.count !== undefined
      ) {
        return `Cart (${options.count} items)`;
      }
      return key;
    },
  }),
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  MenuIcon: ({
    className,
    strokeWidth,
  }: {
    className?: string;
    strokeWidth?: number;
  }) => (
    <svg
      data-testid="menu-icon"
      className={className}
      data-stroke-width={strokeWidth}
    />
  ),
  SearchIcon: ({
    className,
    strokeWidth,
  }: {
    className?: string;
    strokeWidth?: number;
  }) => (
    <svg
      data-testid="search-icon"
      className={className}
      data-stroke-width={strokeWidth}
    />
  ),
  HeartIcon: ({
    className,
    strokeWidth,
  }: {
    className?: string;
    strokeWidth?: number;
  }) => (
    <svg
      data-testid="heart-icon"
      className={className}
      data-stroke-width={strokeWidth}
    />
  ),
  UserIcon: ({
    className,
    strokeWidth,
    filled,
  }: {
    className?: string;
    strokeWidth?: number;
    filled?: boolean;
  }) => (
    <svg
      data-testid="user-icon"
      className={className}
      data-stroke-width={strokeWidth}
      data-filled={filled}
    />
  ),
  CartIcon: ({
    className,
    strokeWidth,
  }: {
    className?: string;
    strokeWidth?: number;
  }) => (
    <svg
      data-testid="cart-icon"
      className={className}
      data-stroke-width={strokeWidth}
    />
  ),
  ArrowRightIcon: ({
    className,
    strokeWidth,
  }: {
    className?: string;
    strokeWidth?: number;
  }) => (
    <svg
      data-testid="arrow-icon"
      className={className}
      data-stroke-width={strokeWidth}
    />
  ),
  ChevronDownIcon: ({
    className,
    strokeWidth,
  }: {
    className?: string;
    strokeWidth?: number;
  }) => (
    <svg
      data-testid="chevron-icon"
      className={className}
      data-stroke-width={strokeWidth}
    />
  ),
}));

// Mock cn utility
vi.mock('~/lib/cn', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

// Mock constants
vi.mock('~/lib/constants', () => ({
  TIMING: {
    MENU_CLOSE_DELAY_MS: 200,
  },
}));

const mockHeader = {
  shop: {
    name: 'Test Shop',
    primaryDomain: {
      url: 'https://test-shop.myshopify.com',
    },
    brand: {
      logo: {
        image: {
          url: 'https://example.com/logo.png',
          altText: 'Test Shop Logo',
        },
      },
    },
  },
  menu: {
    id: 'main',
    items: [
      {id: '1', title: 'New In', url: '/collections/new-in'},
      {id: '2', title: 'Women', url: '/collections/women'},
      {id: '3', title: 'Men', url: '/collections/men'},
      {id: '4', title: 'Sale', url: '/collections/sale'},
    ],
  },
};

const mockCart = {
  id: 'cart-1',
  totalQuantity: 2,
  lines: {nodes: []},
};

describe('Header', () => {
  beforeEach(() => {
    mockOpen.mockClear();
    mockPublish.mockClear();
  });

  describe('Rendering', () => {
    it('renders announcement bar', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      expect(
        screen.getByText('header.announcement.freeShipping'),
      ).toBeInTheDocument();
    });

    it('renders shop logo when available', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const logo = screen.getByTestId('hydrogen-image');
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
      expect(logo).toHaveAttribute('alt', 'Test Shop Logo');
    });

    it('renders shop name when no logo', () => {
      const headerWithoutLogo = {
        ...mockHeader,
        shop: {
          ...mockHeader.shop,
          brand: null,
        },
      };

      render(
        <Header
          header={headerWithoutLogo}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      expect(screen.getByText('Test Shop')).toBeInTheDocument();
    });

    it('renders all menu items', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      expect(screen.getByText('New In')).toBeInTheDocument();
      expect(screen.getByText('Women')).toBeInTheDocument();
      expect(screen.getByText('Men')).toBeInTheDocument();
      expect(screen.getByText('Sale')).toBeInTheDocument();
    });

    it('renders locale selector', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      expect(screen.getByTestId('locale-selector')).toBeInTheDocument();
    });
  });

  describe('Action buttons', () => {
    it('renders search button', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const searchButton = screen.getByLabelText('header.actions.search');
      expect(searchButton).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('renders wishlist link', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const wishlistLink = screen.getByLabelText('header.actions.wishlist');
      expect(wishlistLink).toHaveAttribute('href', '/wishlist');
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    it('renders account link', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const accountLink = screen.getByLabelText('header.actions.account');
      expect(accountLink).toHaveAttribute('href', '/account');
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('renders cart button', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const cartButton = screen.getByLabelText(/cart/i);
      expect(cartButton).toBeInTheDocument();
      expect(screen.getByTestId('cart-icon')).toBeInTheDocument();
    });

    it('renders mobile menu toggle', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const menuButton = screen.getByLabelText('header.actions.openMenu');
      expect(menuButton).toBeInTheDocument();
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });
  });

  describe('Cart badge', () => {
    it('displays cart item count', () => {
      render(
        <Header
          header={mockHeader}
          cart={mockCart as unknown as Promise<typeof mockCart>}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('displays 99+ for counts over 99', () => {
      const largeCart = {
        ...mockCart,
        totalQuantity: 150,
      };

      render(
        <Header
          header={mockHeader}
          cart={largeCart as unknown as Promise<typeof mockCart>}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('does not show badge when cart is empty', () => {
      const emptyCart = {
        ...mockCart,
        totalQuantity: 0,
      };

      render(
        <Header
          header={mockHeader}
          cart={emptyCart as unknown as Promise<typeof mockCart>}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('opens mobile menu when menu button clicked', async () => {
      const user = userEvent.setup();
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      await user.click(screen.getByLabelText('header.actions.openMenu'));

      expect(mockOpen).toHaveBeenCalledWith('mobile');
    });

    it('opens search when search button clicked', async () => {
      const user = userEvent.setup();
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      await user.click(screen.getByLabelText('header.actions.search'));

      expect(mockOpen).toHaveBeenCalledWith('search');
    });

    it('opens cart when cart button clicked', async () => {
      const user = userEvent.setup();
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      await user.click(screen.getByLabelText(/cart/i));

      expect(mockOpen).toHaveBeenCalledWith('cart');
    });

    it('publishes cart_viewed analytics when cart opened', async () => {
      const user = userEvent.setup();
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      await user.click(screen.getByLabelText(/cart/i));

      expect(mockPublish).toHaveBeenCalledWith(
        'cart_viewed',
        expect.any(Object),
      );
    });
  });

  describe('Logged in state', () => {
    it('shows filled user icon when logged in', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={true as unknown as Promise<boolean>}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const userIcon = screen.getByTestId('user-icon');
      expect(userIcon).toHaveAttribute('data-filled', 'true');
    });

    it('shows outlined user icon when not logged in', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={false as unknown as Promise<boolean>}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const userIcon = screen.getByTestId('user-icon');
      expect(userIcon).toHaveAttribute('data-filled', 'false');
    });
  });

  describe('Announcement bar', () => {
    it('shows multiple announcements', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      expect(
        screen.getByText('header.announcement.freeShipping'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('header.announcement.newArrivals'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('header.announcement.freeReturns'),
      ).toBeInTheDocument();
    });
  });

  describe('Sticky behavior', () => {
    it('has sticky positioning', () => {
      const {container} = render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky', 'top-0');
    });

    it('has high z-index', () => {
      const {container} = render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const header = container.querySelector('header');
      expect(header).toHaveClass('z-50');
    });
  });

  describe('Responsive visibility', () => {
    it('hides wishlist on mobile', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const wishlistLink = screen.getByLabelText('header.actions.wishlist');
      expect(wishlistLink).toHaveClass('hidden', 'sm:flex');
    });

    it('hides account link on mobile', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const accountLink = screen.getByLabelText('header.actions.account');
      expect(accountLink).toHaveClass('hidden', 'sm:flex');
    });

    it('hides locale selector on mobile', () => {
      render(
        <Header
          header={mockHeader}
          cart={Promise.resolve(mockCart)}
          isLoggedIn={Promise.resolve(false)}
          publicStoreDomain="test-shop.myshopify.com"
        />,
      );

      const localeSelector = screen.getByTestId('locale-selector');
      expect(localeSelector).toHaveClass('hidden', 'md:block');
    });
  });
});

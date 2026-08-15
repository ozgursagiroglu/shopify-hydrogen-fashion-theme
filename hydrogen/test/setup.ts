import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach, vi} from 'vitest';
import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import resources from '../app/locales';
import React from 'react';

// Make React available globally for test mocks with JSX
globalThis.React = React;

// Initialize i18next for tests
await i18next.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'translation',
  interpolation: {escapeValue: false},
  react: {useSuspense: false},
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ============================================================================
// Icon Mocks - Must be before other mocks
// ============================================================================

// Mock icons to return simple SVG elements
vi.mock('~/components/icons', () => {
  const MockIcon = ({className}: {className?: string}) =>
    React.createElement('svg', {className, 'data-testid': 'mock-icon'});

  return {
    FacebookIcon: MockIcon,
    InstagramIcon: MockIcon,
    TwitterIcon: MockIcon,
    PinterestIcon: MockIcon,
    YouTubeIcon: MockIcon,
    TikTokIcon: MockIcon,
    GlobeIcon: MockIcon,
    HeartIcon: MockIcon,
    SearchIcon: MockIcon,
    CartIcon: MockIcon,
    MenuIcon: MockIcon,
    CloseIcon: MockIcon,
    ChevronDownIcon: MockIcon,
    ChevronUpIcon: MockIcon,
    ChevronLeftIcon: MockIcon,
    ChevronRightIcon: MockIcon,
    StarIcon: MockIcon,
    CheckIcon: MockIcon,
    MailIcon: MockIcon,
    PhoneIcon: MockIcon,
    MapPinIcon: MockIcon,
    ClockIcon: MockIcon,
    ShippingIcon: MockIcon,
    ReturnIcon: MockIcon,
    PackageIcon: MockIcon,
    LockClosedIcon: MockIcon,
    CheckCircleIcon: MockIcon,
    ExclamationCircleIcon: MockIcon,
    GiftIcon: MockIcon,
    BellIcon: MockIcon,
    SparklesIcon: MockIcon,
    FilterIcon: MockIcon,
    CompareIcon: MockIcon,
    ExternalLinkIcon: MockIcon,
    ArrowLeftIcon: MockIcon,
    ArrowRightIcon: MockIcon,
    ArrowUpIcon: MockIcon,
    ArrowDownIcon: MockIcon,
    PlusIcon: MockIcon,
    MinusIcon: MockIcon,
    UserIcon: MockIcon,
    LogoutIcon: MockIcon,
    TagIcon: MockIcon,
    QuoteIcon: MockIcon,
    PlayIcon: MockIcon,
    EyeIcon: MockIcon,
    VerifiedIcon: MockIcon,
    CommentIcon: MockIcon,
    SpinnerIcon: MockIcon,
    CareIcon: MockIcon,
    FabricIcon: MockIcon,
    LeafIcon: MockIcon,
    TipIcon: MockIcon,
    PhotoIcon: MockIcon,
    CollectionIcon: MockIcon,
    ArticleIcon: MockIcon,
    PageIcon: MockIcon,
    RTLIcon: MockIcon,
  };
});

// ============================================================================
// Context Module Mocks
// ============================================================================
// NOTE: Context mocks are NOT defined globally to allow context tests to use
// real implementations. Component tests that need mocked contexts should define
// their own mocks using vi.mock() at the file level.

// Mock Aside Context
vi.mock('~/components/layout/Aside', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../app/components/layout/Aside')>();
  return {
    ...actual,
    useAside: vi.fn(() => ({
      type: 'closed' as const,
      open: vi.fn(),
      close: vi.fn(),
    })),
  };
});

// Mock window.matchMedia (needed for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();
Object.defineProperty(window, 'localStorage', {value: localStorageMock});

// Mock ResizeObserver.
// These must be real classes, not arrow functions: consumers (framer-motion) call them with
// `new`, and an arrow function cannot be used as a constructor.
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock IntersectionObserver.
// Reports the observed element as intersecting so that `whileInView` animations settle into their
// visible state instead of staying hidden for the whole test run.
class IntersectionObserverMock {
  root: Element | null = null;
  rootMargin = '';
  thresholds: number[] = [];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe = (element: Element) => {
    this.callback(
      [{isIntersecting: true, target: element} as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  };

  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}
globalThis.IntersectionObserver =
  IntersectionObserverMock as unknown as typeof IntersectionObserver;

// jsdom does not implement the scroll methods used by carousels.
Element.prototype.scrollBy = vi.fn();
Element.prototype.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();

// Reset localStorage between tests
afterEach(() => {
  localStorageMock.clear();
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock getComputedStyle for portal tests
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = vi.fn().mockImplementation((element) => {
  return originalGetComputedStyle(element);
});

// ============================================================================
// UI Component Mocks
// ============================================================================

// Mock UI components
vi.mock('~/components/ui', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../app/components/ui')>();
  return {
    ...actual,
    Modal: ({
      isOpen,
      onClose,
      children,
      title,
    }: {
      isOpen: boolean;
      onClose: () => void;
      children: React.ReactNode;
      title?: string;
    }) => {
      if (!isOpen) return null;
      return React.createElement(
        'div',
        {'data-testid': 'modal', role: 'dialog'},
        title && React.createElement('h2', null, title),
        children,
        React.createElement('button', {onClick: onClose}, 'Close'),
      );
    },
    Accordion: {
      Root: ({children, className, allowMultiple}: {children: React.ReactNode; className?: string; allowMultiple?: boolean}) => {
        return React.createElement('div', {
          'data-testid': 'accordion-root',
          className,
          'data-allow-multiple': allowMultiple,
        }, children);
      },
      Item: ({children, id}: {children: React.ReactNode; id: string}) => {
        return React.createElement('div', {
          'data-testid': 'accordion-item',
          'data-item-id': id,
        }, children);
      },
      Trigger: ({children, className}: {children: React.ReactNode; className?: string}) => {
        return React.createElement('button', {
          'data-testid': 'accordion-trigger',
          className,
        }, children);
      },
      Content: ({children}: {children: React.ReactNode}) => {
        return React.createElement('div', {
          'data-testid': 'accordion-content',
        }, children);
      },
    },
  }
});

// ============================================================================
// Shopify Hydrogen Mocks
// ============================================================================

// Mock @shopify/hydrogen components
vi.mock('@shopify/hydrogen', () => {
  // CartForm component with render prop pattern
  const CartFormComponent = ({
    children,
    action,
  }: {
    children: (fetcher: any) => React.ReactNode;
    action?: string;
  }) => {
    const mockFetcher = {
      submit: vi.fn(),
      state: 'idle' as const,
      formData: null,
      data: null,
    };
    return React.createElement(
      'form',
      {'data-action': action},
      typeof children === 'function' ? children(mockFetcher) : children,
    );
  };
  CartFormComponent.ACTIONS = {
    LinesAdd: 'LinesAdd',
    LinesUpdate: 'LinesUpdate',
    LinesRemove: 'LinesRemove',
    DiscountCodesUpdate: 'DiscountCodesUpdate',
    BuyerIdentityUpdate: 'BuyerIdentityUpdate',
  };

  // flattenConnection utility
  const flattenConnection = <T,>(connection: {edges?: Array<{node: T}> | null; nodes?: T[] | null} | null | undefined): T[] => {
    if (!connection) return [];
    if (connection.nodes) return connection.nodes;
    if (connection.edges) return connection.edges.map((edge) => edge.node);
    return [];
  };

  // Pagination component
  const Pagination = ({
    children,
    connection,
  }: {
    children: (pagination: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      isLoading: boolean;
      nextPageUrl: string;
      previousPageUrl: string;
      state: any;
      nodes: any[];
      PreviousLink: React.ComponentType<any>;
      NextLink: React.ComponentType<any>;
    }) => React.ReactNode;
    connection: any;
  }) => {
    const nodes = flattenConnection(connection);
    const PreviousLink = ({children, className}: {children: React.ReactNode; className?: string}) =>
      React.createElement('button', {className, disabled: true, 'data-testid': 'previous-link'}, children);
    const NextLink = ({children, className}: {children: React.ReactNode; className?: string}) =>
      React.createElement('button', {className, disabled: true, 'data-testid': 'next-link'}, children);

    const pagination = {
      hasNextPage: false,
      hasPreviousPage: false,
      isLoading: false,
      nextPageUrl: '',
      previousPageUrl: '',
      state: {},
      nodes,
      PreviousLink,
      NextLink,
    };
    return React.createElement('div', {'data-testid': 'pagination'}, children(pagination));
  };

  return {
    Image: ({
      data,
      alt,
      className,
      loading,
    }: {
      data: {url: string; altText?: string};
      alt?: string;
      className?: string;
      loading?: string;
    }) =>
      React.createElement('img', {
        src: data?.url || '',
        alt: alt || data?.altText || '',
        className,
        loading,
        'data-testid': 'image',
      }),
    Money: ({data}: {data: {amount: string; currencyCode: string}}) =>
      React.createElement('span', {'data-testid': 'money'}, `$${data?.amount || '0'}`),
    CartForm: CartFormComponent,
    flattenConnection,
    Pagination,
  };
});

// ============================================================================
// React Router Mocks
// ============================================================================

// Mock react-router with all commonly used exports
// Note: Preserves real exports like createMemoryRouter, RouterProvider for integration tests
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual, // Preserve all real exports (createMemoryRouter, RouterProvider, etc.)
    // Override only the hooks and components we want to mock
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
    useNavigation: vi.fn(() => ({
      state: 'idle' as const,
      formMethod: null,
      location: undefined,
      formAction: undefined,
      formData: undefined,
      formEncType: undefined,
    })),
    useActionData: vi.fn(() => null),
    useFetcher: () => ({
      submit: vi.fn(),
      state: 'idle' as const,
      formData: null,
      data: null,
      Form: ({
        children,
        method,
        action,
        className,
        onSubmit,
      }: {
        children: React.ReactNode;
        method?: string;
        action?: string;
        className?: string;
        onSubmit?: (e: any) => void;
      }) =>
        React.createElement(
          'form',
          {
            method,
            action,
            className,
            onSubmit,
          },
          children,
        ),
    }),
    useId: () => 'test-id',
    // Components
    Form: ({
      children,
      method,
      action,
      className,
      onSubmit,
      id,
    }: {
      children: React.ReactNode;
      method?: string;
      action?: string;
      className?: string;
      onSubmit?: (e: any) => void;
      id?: string;
    }) =>
      React.createElement(
        'form',
        {
          method,
          action,
          className,
          onSubmit: (e: any) => {
            e.preventDefault();
            onSubmit?.(e);
          },
          id,
        },
        children,
      ),
    Link: ({
      to,
      children,
      className,
      onClick,
      prefetch,
    }: {
      to: string;
      children: React.ReactNode;
      className?: string;
      onClick?: () => void;
      prefetch?: string;
    }) =>
      React.createElement(
        'a',
        {
          href: to,
          className,
          onClick,
          'data-prefetch': prefetch,
        },
        children,
      ),
    Await: ({
      children,
      resolve,
    }: {
      children: (data: any) => React.ReactNode;
      resolve: any;
    }) => {
      // For testing, immediately resolve promises
      if (resolve instanceof Promise) {
        return React.createElement(React.Fragment, null, children(null));
      }
      return React.createElement(React.Fragment, null, children(resolve));
    },
  };
});

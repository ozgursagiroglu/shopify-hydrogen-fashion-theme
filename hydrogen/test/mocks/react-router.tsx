import {vi} from 'vitest';
import React, {type ReactNode} from 'react';

// Mock location state
let mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

// Mock Link component
export const Link = vi.fn(
  ({
    to,
    children,
    prefetch,
    onClick,
    className,
    ...props
  }: {
    to: string;
    children: ReactNode;
    prefetch?: 'intent' | 'viewport' | 'render' | 'none';
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a
      href={to}
      data-testid="router-link"
      data-prefetch={prefetch}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
      className={className}
      {...props}
    >
      {children}
    </a>
  ),
);

// Mock NavLink component
export const NavLink = vi.fn(
  ({
    to,
    children,
    className,
    ...props
  }: {
    to: string;
    children: ReactNode | ((props: {isActive: boolean; isPending: boolean}) => ReactNode);
    className?: string | ((props: {isActive: boolean; isPending: boolean}) => string);
    [key: string]: unknown;
  }) => {
    const isActive = mockLocation.pathname === to;
    const isPending = false;

    return (
      <a
        href={to}
        data-testid="nav-link"
        className={
          typeof className === 'function' ? className({isActive, isPending}) : className
        }
        aria-current={isActive ? 'page' : undefined}
        {...props}
      >
        {typeof children === 'function' ? children({isActive, isPending}) : children}
      </a>
    );
  },
);

// Mock useFetcher hook
interface MockFetcherState {
  state: 'idle' | 'submitting' | 'loading';
  data: unknown;
  formData?: FormData;
}

const createMockFetcher = (
  initialData?: unknown,
): MockFetcherState & {
  load: ReturnType<typeof vi.fn>;
  submit: ReturnType<typeof vi.fn>;
  Form: (props: {children: ReactNode; method?: string; action?: string}) => ReactNode;
} => ({
  state: 'idle',
  data: initialData ?? null,
  formData: undefined,
  load: vi.fn(),
  submit: vi.fn(),
  Form: ({children, method, action}: {children: ReactNode; method?: string; action?: string}) => (
    <form method={method} action={action}>
      {children}
    </form>
  ),
});

export const useFetcher = vi.fn(({key}: {key?: string} = {}) => createMockFetcher());

// Mock useLoaderData hook
let mockLoaderData: unknown = null;
export const useLoaderData = vi.fn(() => mockLoaderData);
export const setMockLoaderData = (data: unknown) => {
  mockLoaderData = data;
};

// Mock useRouteLoaderData hook
const mockRouteLoaderData: Record<string, unknown> = {};
export const useRouteLoaderData = vi.fn((routeId: string) => mockRouteLoaderData[routeId]);
export const setMockRouteLoaderData = (routeId: string, data: unknown) => {
  mockRouteLoaderData[routeId] = data;
};

// Mock useLocation hook
export const useLocation = vi.fn(() => mockLocation);
export const setMockLocation = (location: Partial<typeof mockLocation>) => {
  mockLocation = {...mockLocation, ...location};
};

// Mock useNavigate hook
export const useNavigate = vi.fn(() => vi.fn());

// Mock useNavigation hook
interface NavigationState {
  state: 'idle' | 'submitting' | 'loading';
  location?: {pathname: string; search: string; hash: string};
  formMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  formAction?: string;
  formData?: FormData;
  formEncType?: string;
}

let mockNavigationState: NavigationState = {state: 'idle'};

export const useNavigation = vi.fn(() => mockNavigationState);
export const setMockNavigationState = (state: Partial<NavigationState>) => {
  mockNavigationState = {...mockNavigationState, ...state};
};

// Mock useParams hook
let mockParams: Record<string, string> = {};
export const useParams = vi.fn(() => mockParams);
export const setMockParams = (params: Record<string, string>) => {
  mockParams = params;
};

// Mock useSearchParams hook
let mockSearchParams = new URLSearchParams();
export const useSearchParams = vi.fn(() => [
  mockSearchParams,
  vi.fn((params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => {
    if (typeof params === 'function') {
      mockSearchParams = params(mockSearchParams);
    } else {
      mockSearchParams = params;
    }
  }),
]);
export const setMockSearchParams = (params: URLSearchParams | string) => {
  mockSearchParams = typeof params === 'string' ? new URLSearchParams(params) : params;
};

// Mock useActionData hook
let mockActionData: unknown = null;
export const useActionData = vi.fn(() => mockActionData);
export const setMockActionData = (data: unknown) => {
  mockActionData = data;
};

// Mock data function (for action responses)
export const data = vi.fn((body: unknown, init?: {status?: number; headers?: Headers}) => ({
  body,
  ...init,
}));

// Mock redirect function
export const redirect = vi.fn((url: string, init?: {status?: number; headers?: Headers}) => ({
  url,
  ...init,
}));

// Mock Form component
export const Form = vi.fn(
  ({
    children,
    method,
    action,
    onSubmit,
    ...props
  }: {
    children: ReactNode;
    method?: string;
    action?: string;
    onSubmit?: (e: React.FormEvent) => void;
    [key: string]: unknown;
  }) => (
    <form
      method={method}
      action={action}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      {...props}
    >
      {children}
    </form>
  ),
);

// Mock Await component
export const Await = vi.fn(
  ({
    resolve,
    children,
    errorElement,
  }: {
    resolve: Promise<unknown> | unknown;
    children: (data: unknown) => ReactNode;
    errorElement?: ReactNode;
  }) => {
    // For testing, we assume the promise resolves immediately
    if (resolve instanceof Promise) {
      return <>{errorElement || 'Loading...'}</>;
    }
    return <>{children(resolve)}</>;
  },
);

// Reset all router mocks
export const resetRouterMocks = () => {
  mockLocation = {pathname: '/', search: '', hash: '', state: null, key: 'default'};
  mockLoaderData = null;
  mockParams = {};
  mockSearchParams = new URLSearchParams();
  mockActionData = null;
  mockNavigationState = {state: 'idle'};
  Object.keys(mockRouteLoaderData).forEach((key) => delete mockRouteLoaderData[key]);
};

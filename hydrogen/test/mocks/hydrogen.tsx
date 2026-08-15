import {vi} from 'vitest';
import React, {type ReactNode} from 'react';

// Mock Money component
export const Money = vi.fn(
  ({data}: {data: {amount: string; currencyCode: string}}) => (
    <span data-testid="money">
      {data.currencyCode} {parseFloat(data.amount).toFixed(2)}
    </span>
  ),
);

// Mock Image component
export const Image = vi.fn(
  ({
    data,
    alt,
    className,
    loading,
    sizes,
    width,
    height,
  }: {
    data?: {url: string; altText?: string | null; width?: number; height?: number};
    alt?: string;
    className?: string;
    loading?: 'eager' | 'lazy';
    sizes?: string;
    width?: number | string;
    height?: number | string;
  }) => (
    <img
      data-testid="hydrogen-image"
      src={data?.url || ''}
      alt={alt || data?.altText || ''}
      className={className}
      loading={loading}
      sizes={sizes}
      width={width}
      height={height}
    />
  ),
);

// Mock CartForm component
type CartFormAction =
  | 'LinesAdd'
  | 'LinesUpdate'
  | 'LinesRemove'
  | 'DiscountCodesUpdate'
  | 'GiftCardCodesUpdate'
  | 'GiftCardCodesRemove'
  | 'BuyerIdentityUpdate';

interface CartFormProps {
  route?: string;
  action: CartFormAction;
  inputs: Record<string, unknown>;
  children: ReactNode | ((fetcher: MockFetcher) => ReactNode);
  fetcherKey?: string;
}

interface MockFetcher {
  state: 'idle' | 'submitting' | 'loading';
  data: unknown;
  formData?: FormData;
}

const CartFormComponent = vi.fn(
  ({children, action, inputs}: CartFormProps) => {
    const mockFetcher: MockFetcher = {
      state: 'idle',
      data: null,
      formData: undefined,
    };

    return (
      <form
        data-testid="cart-form"
        data-action={action}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input type="hidden" name="action" value={action} />
        <input type="hidden" name="inputs" value={JSON.stringify(inputs)} />
        {typeof children === 'function' ? children(mockFetcher) : children}
      </form>
    );
  },
);

export const CartForm = Object.assign(CartFormComponent, {
  ACTIONS: {
    LinesAdd: 'LinesAdd' as const,
    LinesUpdate: 'LinesUpdate' as const,
    LinesRemove: 'LinesRemove' as const,
    DiscountCodesUpdate: 'DiscountCodesUpdate' as const,
    GiftCardCodesUpdate: 'GiftCardCodesUpdate' as const,
    GiftCardCodesRemove: 'GiftCardCodesRemove' as const,
    BuyerIdentityUpdate: 'BuyerIdentityUpdate' as const,
  },
  getFormInput: vi.fn((formData: FormData) => ({
    action: formData.get('action') as CartFormAction,
    inputs: JSON.parse((formData.get('inputs') as string) || '{}'),
  })),
  INPUT_NAME: 'cartFormInput' as const,
});

// Mock useOptimisticCart hook
export const useOptimisticCart = vi.fn(<T,>(cart: T) => cart);

// Mock Analytics components
export const Analytics = {
  Provider: ({children}: {children: ReactNode}) => <>{children}</>,
  ProductView: vi.fn(() => null),
  CollectionView: vi.fn(() => null),
  CartView: vi.fn(() => null),
  SearchView: vi.fn(() => null),
  CustomView: vi.fn(() => null),
};

// Mock useAnalytics hook
export const useAnalytics = vi.fn(() => ({
  publish: vi.fn(),
  subscribe: vi.fn(),
  canTrack: vi.fn(() => true),
  cart: null,
  prevCart: null,
  shop: null,
  customData: {},
}));

// Mock getSeoMeta
export const getSeoMeta = vi.fn(() => ({}));

// Mock VariantSelector component
export const VariantSelector = vi.fn(
  ({
    handle,
    options,
    children,
  }: {
    handle: string;
    options: Array<{name: string; values: string[]}>;
    children: (props: {option: {name: string; value: string; values: Array<{value: string; isAvailable: boolean; isActive: boolean; to: string}>}}) => ReactNode;
  }) => (
    <div data-testid="variant-selector">
      {options.map((option) =>
        children({
          option: {
            name: option.name,
            value: option.values[0],
            values: option.values.map((value) => ({
              value,
              isAvailable: true,
              isActive: false,
              to: `?${option.name.toLowerCase()}=${value}`,
            })),
          },
        }),
      )}
    </div>
  ),
);

// Mock OptimisticInput
export const OptimisticInput = vi.fn(({id, data}: {id: string; data: unknown}) => (
  <input type="hidden" name={`optimistic-${id}`} value={JSON.stringify(data)} />
));

// Mock flattenConnection - utility to flatten Shopify connection nodes
export const flattenConnection = vi.fn(<T,>(connection: {edges?: Array<{node: T}> | null; nodes?: T[] | null} | null | undefined): T[] => {
  if (!connection) return [];
  if (connection.nodes) return connection.nodes;
  if (connection.edges) return connection.edges.map((edge) => edge.node);
  return [];
});

// Mock Pagination component
export const Pagination = vi.fn(
  ({
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
    }) => ReactNode;
    connection: any;
  }) => {
    const nodes = flattenConnection(connection);
    const pagination = {
      hasNextPage: false,
      hasPreviousPage: false,
      isLoading: false,
      nextPageUrl: '',
      previousPageUrl: '',
      state: {},
      nodes,
    };
    return <div data-testid="pagination">{children(pagination)}</div>;
  },
);

// Export types
export type {CartFormAction, CartFormProps, MockFetcher};

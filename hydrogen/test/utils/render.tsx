import {render, type RenderOptions} from '@testing-library/react';
import {type ReactElement, type ReactNode} from 'react';
import {I18nextProvider} from 'react-i18next';
import i18n from 'i18next';
import resources from '../../app/locales';
import {
  MockWishlistProvider,
  MockCompareProvider,
  MockQuickViewProvider,
  MockAsideProvider,
  MockRecentlyViewedProvider,
  type WishlistItem,
  type CompareProduct,
  type RecentlyViewedItem,
} from '../mocks/contexts';

// Initialize i18n for tests using actual translation resources
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: resources as any, // Use actual translation resources from locales
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

interface WrapperOptions {
  wishlistItems?: WishlistItem[];
  compareProducts?: CompareProduct[];
  recentlyViewedItems?: RecentlyViewedItem[];
  quickViewOpen?: boolean;
  asideType?: string | null;
}

function createWrapper(options: WrapperOptions = {}) {
  return function Wrapper({children}: {children: ReactNode}) {
    return (
      <I18nextProvider i18n={i18n}>
        <MockRecentlyViewedProvider initialItems={options.recentlyViewedItems ?? []}>
          <MockWishlistProvider initialItems={options.wishlistItems ?? []}>
            <MockCompareProvider initialProducts={options.compareProducts ?? []}>
              <MockQuickViewProvider initialOpen={options.quickViewOpen ?? false}>
                <MockAsideProvider initialType={options.asideType ?? null}>
                  {children}
                </MockAsideProvider>
              </MockQuickViewProvider>
            </MockCompareProvider>
          </MockWishlistProvider>
        </MockRecentlyViewedProvider>
      </I18nextProvider>
    );
  };
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapperOptions?: WrapperOptions;
}

export function renderWithProviders(ui: ReactElement, options: CustomRenderOptions = {}) {
  const {wrapperOptions, ...renderOptions} = options;
  const Wrapper = createWrapper(wrapperOptions);

  return {
    ...render(ui, {wrapper: Wrapper, ...renderOptions}),
    rerender: (rerenderUi: ReactElement) =>
      render(rerenderUi, {wrapper: Wrapper, ...renderOptions}),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export {renderWithProviders as render};

// Export wrapper options type
export type {WrapperOptions, CustomRenderOptions};

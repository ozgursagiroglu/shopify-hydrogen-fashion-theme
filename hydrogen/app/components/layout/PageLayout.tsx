import {LocaleLink as Link,LocaleNavLink as NavLink} from '~/components/shared/LocaleLink';
import {useId} from 'react';
import {useTranslation} from 'react-i18next';
import type {
  CartApiQueryFragment,
  FooterMenusQuery,
  HeaderQuery,
  ShopMetafieldsQuery,
} from 'storefrontapi.generated';
import {Aside, useAside} from '~/components/layout/Aside';
import {Footer} from '~/components/layout/Footer';
import {Header, HeaderMenu} from '~/components/layout/Header';
import {LocaleSelector} from '~/components/layout/LocaleSelector';
import {CartMain} from '~/components/cart/CartMain';
import {Spinner} from '~/components/ui/Spinner';
import {Input} from '~/components/ui/Input';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/search/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/search/SearchResultsPredictive';
import {QuickViewProvider} from '~/context/QuickViewContext';
import {CompareDrawer} from '~/components/product/CompareDrawer';
import {CompareProvider} from '~/context/CompareContext';
import {RecentlyViewedProvider} from '~/context/RecentlyViewedContext';
import {WishlistProvider} from '~/context/WishlistContext';
import {HydrationBoundary} from '~/context/HydrationBoundary';

interface PageLayoutProps {
  cart: CartApiQueryFragment | null;
  footerMenus: Promise<FooterMenusQuery | null>;
  shopMetafields: Promise<ShopMetafieldsQuery | null>;
  header: HeaderQuery;
  isLoggedIn: boolean;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

const Providers = ({children}: {children: React.ReactNode}) => {
  return (
    <WishlistProvider>
      <QuickViewProvider>
        <RecentlyViewedProvider>
          <CompareProvider>
            <HydrationBoundary />
            {children}
          </CompareProvider>
        </RecentlyViewedProvider>
      </QuickViewProvider>
    </WishlistProvider>
  );
};

export function PageLayout({
  cart,
  children = null,
  footerMenus,
  shopMetafields,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <Providers>
        <CartAside cart={cart} />
        <SearchAside
          menu={header.menu}
          publicStoreDomain={publicStoreDomain}
          primaryDomainUrl={header.shop.primaryDomain.url}
        />
        <MobileMenuAside
          header={header}
          publicStoreDomain={publicStoreDomain}
          isLoggedIn={isLoggedIn}
        />
        {header && (
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        )}
        <main id="main-content">{children}</main>
        <Footer
          footerMenus={footerMenus}
          shopMetafields={shopMetafields}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
        <CompareDrawer />
      </Providers>
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  const {t} = useTranslation();

  return (
    <Aside type="cart" heading={t('cart.title')}>
      <CartMain cart={cart} layout="aside" />
    </Aside>
  );
}

function SearchAside({
  menu,
  publicStoreDomain,
  primaryDomainUrl,
}: {
  menu: PageLayoutProps['header']['menu'];
  publicStoreDomain: string;
  primaryDomainUrl: string;
}) {
  const {t} = useTranslation();
  const queriesDatalistId = useId();

  // Get menu items for explore collections section (from Shopify API)
  const menuItems = menu?.items || [];
  const collectionLinks = menuItems
    .filter((item) => item.url)
    .slice(0, 4)
    .map((item) => {
      const url =
        item.url!.includes('myshopify.com') ||
        item.url!.includes(publicStoreDomain) ||
        item.url!.includes(primaryDomainUrl)
          ? new URL(item.url!).pathname
          : item.url!;
      return {to: url, name: item.title};
    });

  return (
    <Aside type="search" heading={t('search.title')}>
      <div className="flex flex-col h-full">
        <SearchFormPredictive>
          {({fetchResults, inputRef}) => (
            <div className="p-4 border-b border-border">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <Input
                  name="q"
                  onChange={fetchResults}
                  onFocus={fetchResults}
                  placeholder={t('search.placeholder')}
                  ref={inputRef}
                  type="search"
                  className="pl-12"
                  list={queriesDatalistId}
                />
              </div>
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            // Show trending searches when input is empty
            if (!term.current) {
              return (
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      {t('search.popularSearches')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {key: 'dresses', label: t('search.tags.dresses')},
                        {key: 'summer', label: t('search.tags.summer')},
                        {
                          key: 'newArrivals',
                          label: t('search.tags.newArrivals'),
                        },
                        {key: 'sale', label: t('search.tags.sale')},
                        {
                          key: 'accessories',
                          label: t('search.tags.accessories'),
                        },
                      ].map((tag) => (
                        <Link
                          key={tag.key}
                          to={`${SEARCH_ENDPOINT}?q=${String(tag.label)}`}
                          onClick={closeSearch}
                          className="px-4 py-2 text-sm bg-surface-hover text-text rounded-full hover:bg-primary hover:text-white transition-all duration-300"
                        >
                          {tag.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {collectionLinks.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        {t('search.exploreCollections')}
                      </h4>
                      <div className="space-y-2">
                        {collectionLinks.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={closeSearch}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover transition-all duration-300 group"
                          >
                            <span className="text-sm font-medium text-text">
                              {item.name}
                            </span>
                            <svg
                              className="text-text-muted group-hover:text-text transition-colors"
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Loading state
            if (state === 'loading' && term.current) {
              return (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-text-muted">
                  <Spinner size="lg" />
                  <span className="text-sm">{t('search.searching')}</span>
                </div>
              );
            }

            // No results
            if (!total) {
              return (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <svg
                    className="text-text-muted"
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <p className="text-lg font-medium text-text">
                    {t('search.noResults')}
                  </p>
                  <p className="text-sm text-text-muted">
                    {t('search.noResultsDescriptionShort', {
                      term: term.current,
                    })}
                  </p>
                </div>
              );
            }

            // Results
            return (
              <div className="flex-1 overflow-y-auto">
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                    className="flex items-center justify-center gap-2 m-4 p-4 bg-primary text-white rounded-md hover:bg-primary-light transition-all duration-300"
                  >
                    <span>
                      {t('search.viewAllResults', {term: term.current})}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : null}
              </div>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
  isLoggedIn: boolean;
}) {
  const {t} = useTranslation();
  const {close} = useAside();

  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading={t('a11y.menu')}>
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
        {/* Account & Wishlist Links for Mobile */}
        <div className="-mt-3.5">
          <NavLink
            to="/wishlist"
            onClick={close}
            prefetch="intent"
            className={({isActive}) =>
              `flex items-center gap-3 py-4 px-6 text-lg font-medium border-b border-border transition-colors duration-200 ${
                isActive
                  ? 'text-primary font-semibold bg-surface-alt'
                  : 'text-text hover:bg-surface-alt'
              }`
            }
          >
            {t('header.actions.wishlist')}
          </NavLink>
          <NavLink
            to="/account"
            onClick={close}
            prefetch="intent"
            className={({isActive}) =>
              `flex items-center gap-3 py-4 px-6 text-lg font-medium border-b border-border transition-colors duration-200 ${
                isActive
                  ? 'text-primary font-semibold bg-surface-alt'
                  : 'text-text hover:bg-surface-alt'
              }`
            }
          >
            {t('header.actions.account')}
          </NavLink>
        </div>
        {/* Language/Region Selector */}
        <div className="px-6 py-4 border-t border-border mt-auto">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
            {t('layout.regionLanguage')}
          </p>
          <LocaleSelector />
        </div>
      </Aside>
    )
  );
}

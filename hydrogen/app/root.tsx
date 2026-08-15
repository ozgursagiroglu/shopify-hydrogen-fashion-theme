import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import {getLocaleFromStorefront} from '~/middleware/i18next';
import {
  FOOTER_MENUS_QUERY,
  HEADER_QUERY,
  LOCALIZATION_QUERY,
  SHOP_METAFIELDS_QUERY,
} from '~/graphql/storefront/fragments';
import {MENU_HANDLES} from '~/lib/constants';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/layout/PageLayout';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    // Google Fonts - ada ÉLAN Design System
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous' as const,
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

/**
 * Generate hreflang meta tags for SEO
 * These tags help search engines understand which language/region versions of pages exist
 */
export const meta: Route.MetaFunction = ({data, location}) => {
  const metaTags: Array<{
    tagName: string;
    rel: string;
    hrefLang: string;
    href: string;
  }> = [];

  if (
    !data?.localization?.localization ||
    !data?.header?.shop?.primaryDomain?.url
  ) {
    return metaTags;
  }

  const baseUrl = data.header.shop.primaryDomain.url.replace(/\/$/, '');
  const localization = data.localization.localization;
  const pathname = location.pathname;

  // Build available locale combinations from Shopify's data
  interface LocaleInfo {
    language: string;
    country: string;
  }
  const availableLocales: LocaleInfo[] = [];

  localization.availableCountries.forEach(
    (country: {
      isoCode: string;
      availableLanguages: Array<{isoCode: string}>;
    }) => {
      country.availableLanguages.forEach((language: {isoCode: string}) => {
        availableLocales.push({
          language: language.isoCode,
          country: country.isoCode,
        });
      });
    },
  );

  if (availableLocales.length === 0) return metaTags;

  // Use the first locale as default
  const defaultLocale = availableLocales[0];

  // Helper to get locale path
  const getLocalePath = (locale: LocaleInfo): string => {
    // Remove any existing locale prefix
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}-[a-z]{2}/i, '');
    const cleanPath = pathWithoutLocale || '/';

    // Default locale doesn't need a prefix
    if (
      locale.language === defaultLocale.language &&
      locale.country === defaultLocale.country
    ) {
      return cleanPath;
    }

    return `/${locale.language.toLowerCase()}-${locale.country.toLowerCase()}${cleanPath}`;
  };

  // Add hreflang for each available locale
  availableLocales.forEach((locale) => {
    const hrefLang = `${locale.language.toLowerCase()}-${locale.country.toLowerCase()}`;
    metaTags.push({
      tagName: 'link',
      rel: 'alternate',
      hrefLang,
      href: `${baseUrl}${getLocalePath(locale)}`,
    });
  });

  // Add x-default hreflang
  metaTags.push({
    tagName: 'link',
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${baseUrl}${getLocalePath(defaultLocale)}`,
  });

  return metaTags;
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  // Get locale from Hydrogen's storefront context (URL-based detection)
  const locale = getLocaleFromStorefront(storefront);

  return {
    ...deferredData,
    ...criticalData,
    locale,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN || env.PUBLIC_STORE_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: true,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront, cart, customerAccount} = context;

  const [header, localization, cartData, isLoggedIn] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: MENU_HANDLES.header,
      },
    }),
    storefront.query(LOCALIZATION_QUERY, {
      cache: storefront.CacheLong(),
    }),
    cart.get(),
    customerAccount.isLoggedIn(),
  ]);

  return {header, localization, cart: cartData, isLoggedIn};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  // defer the footer menus query (below the fold)
  const footerMenus = storefront
    .query(FOOTER_MENUS_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        shopMenuHandle: MENU_HANDLES.footerShop,
        helpMenuHandle: MENU_HANDLES.footerHelp,
        aboutMenuHandle: MENU_HANDLES.footerAbout,
        legalMenuHandle: MENU_HANDLES.footerLegal,
      },
    })
    .catch(() => {
      // Footer menus might not exist in Shopify - this is expected
      // The Footer component will show fallback content
      // Error logging removed for production - implement proper logging service if needed
      return null;
    });

  // defer the shop metafields query for social media links
  const shopMetafields = storefront
    .query(SHOP_METAFIELDS_QUERY, {
      cache: storefront.CacheLong(),
    })
    .catch(() => {
      // Shop metafields might not be configured - fallback to constants
      return null;
    });

  return {
    footerMenus,
    shopMetafields,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const loaderData = useRouteLoaderData<RootLoader>('root');

  // Get language from loader data (Hydrogen's URL-based detection)
  const lang = loaderData?.locale || 'en';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {/* Skip Navigation Link for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Skip to main content
        </a>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const loaderData = useRouteLoaderData<RootLoader>('root');

  if (!loaderData) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={loaderData.cart}
      shop={loaderData.shop}
      consent={loaderData.consent}
    >
      <PageLayout {...loaderData}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Something went wrong';
  let errorStatus = 500;
  let errorTitle = 'Unexpected Error';

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;

    if (errorStatus === 404) {
      errorTitle = 'Page Not Found';
      errorMessage =
        "The page you're looking for doesn't exist or has been moved.";
    } else if (errorStatus === 403) {
      errorTitle = 'Access Denied';
      errorMessage = "You don't have permission to access this page.";
    } else if (errorStatus >= 500) {
      errorTitle = 'Server Error';
      errorMessage = 'Something went wrong on our end. Please try again later.';
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{`${errorStatus} - ${errorTitle}`}</title>
        <Links />
      </head>
      <body className="bg-background text-text min-h-screen flex items-center justify-center">
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          {/* Error Status */}
          <p className="text-8xl font-display font-light text-text-muted mb-4">
            {errorStatus}
          </p>

          {/* Error Title */}
          <h1 className="font-display text-3xl md:text-4xl tracking-tight text-text mb-4">
            {errorTitle}
          </h1>

          {/* Error Message */}
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            {errorMessage}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-text-inverse font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Return Home
            </Link>
            <button
              onClick={() => window.history.back()}
              type="button"
              className="inline-flex items-center justify-center px-6 py-3 border border-border text-text font-medium rounded-md hover:bg-surface-alt transition-colors"
            >
              Go Back
            </button>
          </div>

          {/* Help Link */}
          <p className="mt-12 text-sm text-text-muted">
            Need help?{' '}
            <Link to="/contact" className="text-accent hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

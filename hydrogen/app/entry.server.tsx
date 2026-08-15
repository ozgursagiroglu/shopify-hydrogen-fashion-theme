import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';
import {I18nextProvider} from 'react-i18next';
import {
  createServerI18n,
  getLocaleFromStorefront,
} from '~/middleware/i18next';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain:
        context.env.PUBLIC_CHECKOUT_DOMAIN || context.env.PUBLIC_STORE_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Allow Google Fonts for typography
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for inline styles
      'https://cdn.shopify.com',
      'https://fonts.googleapis.com',
    ],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    // Core image sources - add additional CDNs as needed for your store
    imgSrc: "'self' https://cdn.shopify.com https://shopify.com data:",
    // Allow embedding in iframes from these domains
    frameAncestors: ["'self'", 'https://adastack.diojen.tech', 'https://*.diojen.tech'],
  });

  // Get locale from Hydrogen's storefront context and create i18n instance
  const locale = getLocaleFromStorefront(context.storefront);
  const i18n = await createServerI18n(locale);

  const body = await renderToReadableStream(
    <I18nextProvider i18n={i18n}>
      <NonceProvider>
        <ServerRouter
          context={reactRouterContext}
          url={request.url}
          nonce={nonce}
        />
      </NonceProvider>
    </I18nextProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

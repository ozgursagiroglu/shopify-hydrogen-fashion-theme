import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/graphql/storefront/fragments';
import {getLocaleFromRequest} from '~/lib/locale';
import {createAdminAPI} from '~/lib/admin';

/**
 * Creates additional context objects for the Hydrogen app
 */
async function createAdditionalContext(env: Env) {
  return {
    // Admin API for server-side operations (metaobject creation, etc.)
    admin: createAdminAPI(env),
  } as const;
}

// Automatically augment HydrogenAdditionalContext with the additional context type
type AdditionalContextType = Awaited<ReturnType<typeof createAdditionalContext>>;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}
}

/**
 * Creates Hydrogen context for React Router 7.9.x
 * Returns HydrogenRouterContextProvider with hybrid access patterns
 * */
export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  /**
   * Open a cache instance in the worker and a custom session instance.
   */
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session, additionalContext] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
    createAdditionalContext(env),
  ]);

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      // Or detect from URL path based on locale subpath, cookies, or any other strategy
      i18n: getLocaleFromRequest(request),
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    additionalContext,
  );

  return hydrogenContext;
}

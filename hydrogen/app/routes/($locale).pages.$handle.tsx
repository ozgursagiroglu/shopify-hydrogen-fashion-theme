import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {buildPageTitleWithFallback} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data, matches}) => {
  return [{title: buildPageTitleWithFallback(data?.page.title, 'Page', matches)}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(); // args

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData() {
  // {context}: Route.LoaderArgs
  return {};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-surface-alt py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight text-text text-center">
            {page.title}
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div
          className="prose prose-slate max-w-none
            prose-headings:font-display prose-headings:tracking-tight prose-headings:text-text
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-text-secondary prose-p:leading-relaxed
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text prose-strong:font-medium
            prose-ul:text-text-secondary prose-ol:text-text-secondary
            prose-li:marker:text-text-muted
            prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{__html: page.body}}
        />
      </div>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;

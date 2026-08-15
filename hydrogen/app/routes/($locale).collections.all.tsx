import type {Route} from './+types/($locale).collections.all';
import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/shared/PaginatedResourceSection';
import {ProductCard} from '~/components/product/ProductCard';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {LIMITS} from '~/lib/constants';
import {buildPageTitle} from '~/lib/seo';
import {PRODUCT_CARD_FRAGMENT} from '~/graphql/storefront/fragments';

export const meta: Route.MetaFunction = ({matches}) => {
  return [
    {title: buildPageTitle('All Products', matches)},
    {name: 'description', content: 'Explore our complete collection of premium fashion pieces'},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(); // args
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: LIMITS.PRODUCTS_PER_PAGE,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
  ]);
  return {products};
}

function loadDeferredData() {
  // {context}: Route.LoaderArgs
  return {};
}

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-surface-alt py-12 md:py-16 lg:py-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-text mb-4">
            All Products
          </h1>
          <p className="text-base md:text-lg text-text-muted max-w-2xl mx-auto">
            Discover our complete collection of timeless pieces crafted for the modern wardrobe
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-16">
        {/* Results Count & Sort */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <p className="text-sm text-text-muted">
            {products.nodes.length} products
          </p>
          {/* Sort dropdown can be added here */}
        </div>

        <PaginatedResourceSection<ProductCardFragment>
          connection={products}
          resourcesClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
        >
          {({node: product, index}) => (
            <ProductCard
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : 'lazy'}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

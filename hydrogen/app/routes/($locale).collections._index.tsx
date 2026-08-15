import {useLoaderData} from 'react-router';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import type {Route} from './+types/($locale).collections._index';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/shared/PaginatedResourceSection';
import {CollectionIcon} from '~/components/icons';
import {LIMITS} from '~/lib/constants';
import {buildPageTitle} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches}) => {
  return [
    {title: buildPageTitle('Collections', matches)},
    {name: 'description', content: 'Explore our curated collections'},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(); // args
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: LIMITS.COLLECTIONS_PER_PAGE,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
  ]);

  return {collections};
}

function loadDeferredData() {
  // {context}: Route.LoaderArgs
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-surface-alt py-12 md:py-16 lg:py-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-text mb-4">
            Collections
          </h1>
          <p className="text-base md:text-lg text-text-muted max-w-2xl mx-auto">
            Discover our carefully curated collections, each designed to complement your unique style
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-16">
        <PaginatedResourceSection<CollectionFragment>
          connection={collections}
          resourcesClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        >
          {({node: collection, index}) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={index}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function CollectionCard({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <Link
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className="group block"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-alt">
        {collection.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            data={collection.image}
            loading={index < 4 ? 'eager' : 'lazy'}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CollectionIcon className="w-16 h-16 text-text-muted" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Title Overlay */}
        <div className="absolute inset-0 flex items-end p-6">
          <h2 className="font-display text-xl md:text-2xl text-white tracking-tight">
            {collection.title}
          </h2>
        </div>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    description
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;

import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).lookbook';
import {useTranslation} from 'react-i18next';
import {
  parseLookbookCollections,
  parseLookbookItems,
} from '~/graphql/storefront/MetaobjectQueries';
import {buildPageTitleWithFallback} from '~/lib/seo';
import {CollectionSection} from '~/components/lookbook/CollectionSection';
import {LookbookItemCard} from '~/components/lookbook/LookbookItemCard';

export const meta: Route.MetaFunction = ({matches}) => {
  return [
    {
      title: buildPageTitleWithFallback(null, 'Lookbook', matches),
    },
    {
      name: 'description',
      content:
        'Explore our latest collections and editorial stories. Discover the ada ÉLAN lookbook.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const variables = {
    country: context.storefront.i18n.country,
    language: context.storefront.i18n.language,
  };

  try {
    const [
      {metaobjects: lookbookCollectionsData},
      {metaobjects: lookbookItemsData},
    ] = await Promise.all([
      context.storefront.query(LOOKBOOK_COLLECTIONS_QUERY, {variables}),
      context.storefront.query(LOOKBOOK_ITEMS_QUERY, {variables}),
    ]);

    const lookbookCollections = parseLookbookCollections(
      lookbookCollectionsData,
    );
    const lookbookItems = parseLookbookItems(lookbookItemsData);

    return {
      lookbookCollections,
      lookbookItems,
    };
  } catch (error) {
    console.error('Error loading lookbook:', error);
    throw new Response('Failed to load lookbook', {status: 500});
  }
}

export default function LookbookPage() {
  const {lookbookCollections, lookbookItems} = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-surface-alt py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-text mb-4">
            {t('pages.lookbook.title')}
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            {t('pages.lookbook.subtitle')}
          </p>
        </div>
      </div>

      {/* Lookbook Collections */}
      {lookbookCollections.length > 0 && (
        <section className="py-12 md:py-16 lg:py-20">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="font-display text-2xl md:text-3xl text-text mb-8 md:mb-12">
              {t('pages.lookbook.collections')}
            </h2>

            <div className="space-y-16 md:space-y-24">
              {lookbookCollections.map((collection) => (
                <CollectionSection
                  key={collection.id}
                  collection={collection}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Lookbook Items (if no collections or as additional section) */}
      {lookbookItems.length > 0 && lookbookCollections.length === 0 && (
        <section className="py-12 md:py-16">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {lookbookItems.map((item) => (
                <LookbookItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {lookbookCollections.length === 0 && lookbookItems.length === 0 && (
        <section className="py-20 md:py-32">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-text-secondary text-lg">
              {t('pages.lookbook.noCollections')}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

const LOOKBOOK_COLLECTIONS_QUERY = `#graphql
  query LookbookCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "lookbook_collection", first: 10) {
      nodes {
        id
        fields {
          key
          value
          reference {
            ... on MediaImage {
              __typename
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
` as const;

const LOOKBOOK_ITEMS_QUERY = `#graphql
  query LookbookPageItems($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "lookbook_item", first: 20) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              __typename
              image {
                url
                altText
              }
            }
            ... on Collection {
              __typename
              id
              handle
              title
            }
          }
        }
      }
    }
  }
` as const;

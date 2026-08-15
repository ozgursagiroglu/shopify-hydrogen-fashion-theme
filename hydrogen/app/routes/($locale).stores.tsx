import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).stores';
import {useTranslation} from 'react-i18next';
import {parseStoreLocations} from '~/graphql/storefront/MetaobjectQueries';
import {buildPageTitleWithFallback} from '~/lib/seo';
import {StoreCard} from '~/components/stores/StoreCard';

export const meta: Route.MetaFunction = ({matches}) => {
  return [
    {
      title: buildPageTitleWithFallback(null, 'Our Stores', matches),
    },
    {
      name: 'description',
      content:
        'Visit us in store for a personalized shopping experience. Find your nearest ada ÉLAN location.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const variables = {
    country: context.storefront.i18n.country,
    language: context.storefront.i18n.language,
  };

  try {
    const {metaobjects: storeLocationsData} = await context.storefront.query(
      STORE_LOCATIONS_QUERY,
      {variables},
    );

    const storeLocations = parseStoreLocations(storeLocationsData);

    return {
      storeLocations,
    };
  } catch (error) {
    console.error('Error loading store locations:', error);
    throw new Response('Failed to load store locations', {status: 500});
  }
}

export default function StoresPage() {
  const {storeLocations} = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-surface-alt py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-text mb-4">
            {t('pages.stores.title')}
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            {t('pages.stores.subtitle')}
          </p>
        </div>
      </div>

      {/* Store Locations */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {storeLocations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">
                No store locations available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {storeLocations.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const STORE_LOCATIONS_QUERY = `#graphql
  query StoreLocations($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "store_location", first: 20) {
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

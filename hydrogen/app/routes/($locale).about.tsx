import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).about';
import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {
  parseAboutPage,
  parseBrandValues,
} from '~/graphql/storefront/MetaobjectQueries';
import {buildPageTitleWithFallback} from '~/lib/seo';
import {ValueCard} from '~/components/about/ValueCard';

export const meta: Route.MetaFunction = ({data, matches}) => {
  const title = buildPageTitleWithFallback(
    data?.aboutPage?.title,
    'About Us',
    matches,
  );
  const description =
    data?.aboutPage?.subtitle ||
    'Discover the story behind our brand and what drives us.';
  const image = data?.aboutPage?.heroImage?.url ?? '';

  return [
    {title},
    {name: 'description', content: description},
    // Open Graph
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:image', content: image},
    // Twitter Card
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: image},
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const variables = {
    country: context.storefront.i18n.country,
    language: context.storefront.i18n.language,
  };

  try {
    const [{metaobjects: aboutPageData}, {metaobjects: brandValuesData}] =
      await Promise.all([
        context.storefront.query(ABOUT_PAGE_QUERY, {variables}),
        context.storefront.query(BRAND_VALUES_QUERY, {variables}),
      ]);

    const aboutPage = parseAboutPage(aboutPageData);
    const brandValues = parseBrandValues(brandValuesData);

    if (!aboutPage) {
      throw new Response('About page content not found', {status: 404});
    }

    return {
      aboutPage,
      brandValues,
    };
  } catch (error) {
    console.error('Error loading about page:', error);
    throw new Response('Failed to load about page', {status: 500});
  }
}

export default function AboutPage() {
  const {aboutPage, brandValues} = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      {aboutPage.heroImage && (
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px]">
          <Image
            data={{
              url: aboutPage.heroImage.url,
              altText: aboutPage.heroImage.altText || aboutPage.title,
            }}
            sizes="100vw"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-text-inverse mb-4">
                {aboutPage.title}
              </h1>
              {aboutPage.subtitle && (
                <p className="text-lg md:text-xl text-text-inverse/90 max-w-2xl mx-auto">
                  {aboutPage.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mission Section */}
      {aboutPage.missionText && (
        <section className="py-16 md:py-20 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              {aboutPage.missionTitle && (
                <h2 className="font-display text-3xl md:text-4xl text-text mb-6">
                  {aboutPage.missionTitle}
                </h2>
              )}
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
                {aboutPage.missionText}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Story Section */}
      {aboutPage.storyText && (
        <section className="py-16 md:py-20 bg-surface-alt">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Story Image */}
              {aboutPage.storyImage && (
                <div className="order-2 lg:order-1">
                  <div className="aspect-[4/5] rounded-lg overflow-hidden">
                    <Image
                      data={{
                        url: aboutPage.storyImage.url,
                        altText:
                          aboutPage.storyImage.altText ||
                          aboutPage.storyTitle ||
                          t('pages.about.story'),
                      }}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Story Text */}
              <div className="order-1 lg:order-2">
                {aboutPage.storyTitle && (
                  <h2 className="font-display text-3xl md:text-4xl text-text mb-6">
                    {aboutPage.storyTitle}
                  </h2>
                )}
                <div className="space-y-4 text-text-secondary leading-relaxed">
                  {aboutPage.storyText.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      {brandValues.length > 0 && (
        <section className="py-16 md:py-20 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            {aboutPage.valuesTitle && (
              <h2 className="font-display text-3xl md:text-4xl text-text text-center mb-12 md:mb-16">
                {aboutPage.valuesTitle}
              </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {brandValues.map((value) => (
                <ValueCard key={value.id} value={value} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

const ABOUT_PAGE_QUERY = `#graphql
  query AboutPage($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "about_page", first: 1) {
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

const BRAND_VALUES_QUERY = `#graphql
  query BrandValues($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    metaobjects(type: "brand_value", first: 10) {
      nodes {
        id
        fields {
          key
          value
        }
      }
    }
  }
` as const;

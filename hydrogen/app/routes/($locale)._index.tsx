import {Await, useLoaderData, useRouteLoaderData} from 'react-router';
import type {Route} from './+types/($locale)._index';
import type {RootLoader} from '~/root';
import {SiteJsonLd} from '~/components/shared';
import {Suspense} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Hero,
  SplitHero,
  CategoryGrid,
  ProductCarousel,
  Lookbook,
  FeatureStrip,
  InstagramFeed,
  Testimonials,
  Newsletter,
  PressLogos,
} from '~/components/home';
import {ProductGrid} from '~/components/product';
import {SectionHeader} from '~/components/ui';
import {RevealOnScroll} from '~/components/motion';
import {
  parseTestimonials,
  parseInstagramPosts,
  parseHomepageHero,
  parseFeatureBanner,
  parsePressFeatures,
  parseLookbookItems,
  parseSplitHeroPanels,
  parseNewsletterSection,
  type HomepageHero,
  type FeatureBanner,
  type PressFeature,
  type LookbookItemData,
  type SplitHeroPanel,
  type NewsletterSection,
} from '~/graphql/storefront/MetaobjectQueries';
import {
  FEATURED_COLLECTIONS_QUERY,
  NEW_ARRIVALS_QUERY,
  RECOMMENDED_PRODUCTS_QUERY,
} from '~/graphql/storefront';
import {getShopName} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches}) => {
  const shopName = getShopName(matches);
  const title = `${shopName} | Premium Fashion`;
  const description = 'Discover curated fashion for the modern wardrobe.';

  return [
    {title},
    {name: 'description', content: description},
    // Open Graph
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    // Twitter Card
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const variables = {
    country: context.storefront.i18n.country,
    language: context.storefront.i18n.language,
  };

  const [
    {collections},
    {products: newArrivals},
    heroResult,
    featureBannerResult,
  ] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTIONS_QUERY, {variables}),
    context.storefront.query(NEW_ARRIVALS_QUERY, {variables}),
    context.storefront
      .query(HOMEPAGE_HERO_QUERY, {variables})
      .catch(() => null),
    context.storefront
      .query(FEATURE_BANNER_QUERY, {variables})
      .catch(() => null),
  ]);

  return {
    featuredCollection: collections.nodes[0],
    collections: collections.nodes,
    newArrivals: newArrivals.nodes,
    hero: heroResult ? parseHomepageHero(heroResult.metaobjects) : null,
    featureBanner: featureBannerResult
      ? parseFeatureBanner(featureBannerResult.metaobjects)
      : null,
  };
}

// Fetch metaobject content - deferred for performance
async function loadMetaobjectContent({context}: Route.LoaderArgs) {
  const variables = {
    country: context.storefront.i18n.country,
    language: context.storefront.i18n.language,
  };

  try {
    const [
      {metaobjects: testimonialObjects},
      {metaobjects: instagramObjects},
      {metaobjects: pressObjects},
      {metaobjects: lookbookObjects},
      {metaobjects: splitHeroObjects},
      {metaobjects: newsletterObjects},
    ] = await Promise.all([
      context.storefront.query(TESTIMONIALS_QUERY, {variables}),
      context.storefront.query(INSTAGRAM_POSTS_QUERY, {variables}),
      context.storefront.query(PRESS_FEATURES_QUERY, {variables}),
      context.storefront.query(LOOKBOOK_ITEMS_QUERY, {variables}),
      context.storefront.query(SPLIT_HERO_QUERY, {variables}),
      context.storefront.query(NEWSLETTER_SECTION_QUERY, {variables}),
    ]);

    return {
      testimonials: parseTestimonials(testimonialObjects),
      instagramPosts: parseInstagramPosts(instagramObjects),
      pressFeatures: parsePressFeatures(pressObjects),
      lookbookItems: parseLookbookItems(lookbookObjects),
      splitHeroPanels: parseSplitHeroPanels(splitHeroObjects),
      newsletterSection: parseNewsletterSection(newsletterObjects),
    };
  } catch {
    // Silent fail - return empty data if metaobjects don't exist
    return {
      testimonials: [],
      instagramPosts: [],
      pressFeatures: [],
      lookbookItems: [],
      splitHeroPanels: {left: null, right: null},
      newsletterSection: null,
    };
  }
}

function loadDeferredData(args: Route.LoaderArgs) {
  const {context} = args;

  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: {
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    })
    .catch(() => {
      // Silent fail - recommended products are non-critical
      return null;
    });

  // Load metaobject content - deferred
  const metaobjectContent = loadMetaobjectContent(args);

  return {
    recommendedProducts,
    metaobjectContent,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<RootLoader>('root');
  const {t} = useTranslation();
  const shop = rootData?.header?.shop;

  return (
    <div className="flex flex-col">
      {/* Organization + WebSite structured data — homepage only, so the entity is declared once */}
      {shop && <SiteJsonLd shop={shop} />}

      {/* Hero Section — no RevealOnScroll (above fold) */}
      <DynamicHero hero={data.hero} />

      {/* New Arrivals */}
      <RevealOnScroll>
        <ProductCarousel
          title={t('home.newArrivals')}
          subtitle={t('home.newArrivalsSubtitle')}
          products={data.newArrivals}
          viewAllHref="/collections/new-in"
        />
      </RevealOnScroll>

      {/* Shop by Category */}
      <RevealOnScroll delay={0.05}>
        <div className="bg-surface-alt">
          <DynamicCategoryGrid collections={data.collections} />
        </div>
      </RevealOnScroll>

      {/* Feature Strip */}
      <RevealOnScroll>
        <DynamicFeatureStrip featureBanner={data.featureBanner} />
      </RevealOnScroll>

      {/* Press Logos / As Featured In */}
      <Suspense fallback={null}>
        <Await resolve={data.metaobjectContent}>
          {(content) => (
            <RevealOnScroll>
              <DynamicPressLogos pressFeatures={content?.pressFeatures} />
            </RevealOnScroll>
          )}
        </Await>
      </Suspense>

      {/* Recommended Products */}
      <RevealOnScroll>
        <section className="py-16 md:py-20">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <SectionHeader
              title={t('home.recommendedForYou')}
              subtitle={t('home.recommendedSubtitle')}
              action={{label: t('common.viewAll'), href: '/collections/all'}}
              className="mb-8 md:mb-12"
            />
            <Suspense fallback={<ProductGridSkeleton />}>
              <Await resolve={data.recommendedProducts}>
                {(response) =>
                  response ? (
                    <ProductGrid
                      products={response.products.nodes}
                      columns={4}
                    />
                  ) : null
                }
              </Await>
            </Suspense>
          </div>
        </section>
      </RevealOnScroll>

      {/* Lookbook */}
      <Suspense fallback={null}>
        <Await resolve={data.metaobjectContent}>
          {(content) => (
            <RevealOnScroll>
              <DynamicLookbook items={content?.lookbookItems} />
            </RevealOnScroll>
          )}
        </Await>
      </Suspense>

      {/* Customer Testimonials */}
      <Suspense fallback={<TestimonialsSkeleton />}>
        <Await resolve={data.metaobjectContent}>
          {(content) => (
            <RevealOnScroll>
              <Testimonials testimonials={content?.testimonials} />
            </RevealOnScroll>
          )}
        </Await>
      </Suspense>

      {/* Newsletter Signup */}
      <Suspense fallback={null}>
        <Await resolve={data.metaobjectContent}>
          {(content) => (
            <RevealOnScroll>
              <DynamicNewsletter section={content?.newsletterSection} />
            </RevealOnScroll>
          )}
        </Await>
      </Suspense>

      {/* Split Hero for Gender */}
      <Suspense fallback={null}>
        <Await resolve={data.metaobjectContent}>
          {(content) => (
            <RevealOnScroll>
              <DynamicSplitHero panels={content?.splitHeroPanels} />
            </RevealOnScroll>
          )}
        </Await>
      </Suspense>

      {/* Instagram Feed */}
      <Suspense fallback={<InstagramFeedSkeleton />}>
        <Await resolve={data.metaobjectContent}>
          {(content) => (
            <RevealOnScroll>
              <InstagramFeed posts={content?.instagramPosts} />
            </RevealOnScroll>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

// ============================================================================
// Dynamic Section Components
// ============================================================================

function DynamicHero({hero}: {hero: HomepageHero | null}) {
  // If no hero metaobject, don't render
  if (!hero || !hero.backgroundImage) return null;

  return (
    <Hero
      title={hero.title}
      subtitle={hero.subtitle || undefined}
      primaryCta={hero.primaryCta || undefined}
      secondaryCta={hero.secondaryCta || undefined}
      backgroundImage={hero.backgroundImage}
      height={hero.height}
    />
  );
}

function DynamicCategoryGrid({
  collections,
}: {
  collections: Array<{
    title: string;
    handle: string;
    image?: {url: string; altText?: string | null} | null;
  }>;
}) {
  const {t} = useTranslation();

  // Filter collections that have images and take first 4
  const categoriesWithImages = collections
    .filter((c) => c.image?.url)
    .slice(0, 4)
    .map((c) => ({
      title: c.title,
      href: `/collections/${c.handle}`,
      image: {
        url: c.image!.url,
        altText: c.image!.altText || c.title,
      },
    }));

  if (categoriesWithImages.length === 0) return null;

  return (
    <CategoryGrid
      title={t('home.shopByCategory')}
      subtitle={t('home.shopByCategorySubtitle')}
      categories={categoriesWithImages}
    />
  );
}

function DynamicFeatureStrip({
  featureBanner,
}: {
  featureBanner: FeatureBanner | null;
}) {
  const {t} = useTranslation();

  if (!featureBanner || !featureBanner.image) return null;

  return (
    <FeatureStrip
      image={featureBanner.image}
      title={featureBanner.title}
      subtitle={featureBanner.subtitle || undefined}
      cta={
        featureBanner.cta || {
          label: t('common.learnMore'),
          href: '/about',
        }
      }
      align={featureBanner.alignment}
    />
  );
}

function DynamicPressLogos({
  pressFeatures,
}: {
  pressFeatures: PressFeature[] | undefined;
}) {
  if (!pressFeatures || pressFeatures.length === 0) return null;

  return <PressLogos features={pressFeatures} />;
}

function DynamicLookbook({items}: {items: LookbookItemData[] | undefined}) {
  const {t} = useTranslation();

  if (!items || items.length === 0) return null;

  // Convert to Lookbook component format
  const lookbookItems = items
    .filter((item) => item.image)
    .map((item) => ({
      image: item.image!,
      title: item.title,
      href: item.collection
        ? `/collections/${item.collection.handle}`
        : item.url || '#',
    }));

  if (lookbookItems.length === 0) return null;

  return (
    <Lookbook
      title={t('home.theLookbook')}
      subtitle={t('home.lookbookSubtitle')}
      items={lookbookItems}
    />
  );
}

function DynamicSplitHero({
  panels,
}: {
  panels:
    | {left: SplitHeroPanel | null; right: SplitHeroPanel | null}
    | undefined;
}) {
  const {t} = useTranslation();

  if (!panels?.left || !panels?.right) return null;
  if (!panels.left.image || !panels.right.image) return null;

  return (
    <SplitHero
      leftPanel={{
        title: panels.left.title,
        cta: panels.left.cta || {label: t('common.shopNow'), href: '#'},
        image: panels.left.image,
      }}
      rightPanel={{
        title: panels.right.title,
        cta: panels.right.cta || {label: t('common.shopNow'), href: '#'},
        image: panels.right.image,
      }}
    />
  );
}

function DynamicNewsletter({
  section,
}: {
  section: NewsletterSection | null | undefined;
}) {
  if (!section) return <Newsletter />;

  return (
    <Newsletter
      overline={section.overline}
      title={section.title}
      description={section.description}
      backgroundImage={section.backgroundImage}
      benefits={section.benefits}
      privacyNotice={section.privacyNotice}
    />
  );
}

// ============================================================================
// Skeleton Components
// ============================================================================

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
      {Array.from({length: 4}, (_, i) => `product-skeleton-${i}`).map((key) => (
        <div key={key} className="space-y-4">
          <div className="aspect-3/4 bg-surface-alt rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-16 bg-surface-alt rounded animate-pulse" />
            <div className="h-4 w-32 bg-surface-alt rounded animate-pulse" />
            <div className="h-3 w-20 bg-surface-alt rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-surface-1">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-4 w-32 bg-surface-alt rounded animate-pulse mx-auto mb-3" />
          <div className="h-10 w-64 bg-surface-alt rounded animate-pulse mx-auto" />
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-0 rounded-2xl shadow-card p-8 md:p-12">
            <div className="flex gap-1 mb-6 justify-center">
              {Array.from({length: 5}, (_, i) => `star-${i}`).map((key) => (
                <div
                  key={key}
                  className="w-5 h-5 bg-surface-alt rounded animate-pulse"
                />
              ))}
            </div>
            <div className="h-24 bg-surface-alt rounded animate-pulse mb-8 max-w-2xl mx-auto" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-surface-alt animate-pulse mb-4" />
              <div className="h-4 w-32 bg-surface-alt rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-surface-alt rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstagramFeedSkeleton() {
  return (
    <section className="py-16 md:py-24 bg-surface-0">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-3 w-24 bg-surface-alt rounded animate-pulse mx-auto mb-3" />
          <div className="h-10 w-48 bg-surface-alt rounded animate-pulse mx-auto mb-4" />
          <div className="h-4 w-72 bg-surface-alt rounded animate-pulse mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {Array.from({length: 6}, (_, i) => `instagram-${i}`).map((key) => (
            <div
              key={key}
              className="aspect-square bg-surface-alt rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="text-center mt-10">
          <div className="h-12 w-48 bg-surface-alt rounded-md animate-pulse mx-auto" />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Metaobject Queries (page-specific, kept inline for codegen)
// ============================================================================

const HOMEPAGE_HERO_QUERY = `#graphql
  query HomepageHero($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobjects(type: "homepage_hero", first: 1) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;

const FEATURE_BANNER_QUERY = `#graphql
  query FeatureBanner($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobjects(type: "feature_banner", first: 1) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;

const PRESS_FEATURES_QUERY = `#graphql
  query PressFeatures($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobjects(type: "press_feature", first: 10) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;

const LOOKBOOK_ITEMS_QUERY = `#graphql
  query LookbookItems($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobjects(type: "lookbook_item", first: 6) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
            ... on Collection {
              id
              title
              handle
            }
          }
        }
      }
    }
  }
` as const;

const SPLIT_HERO_QUERY = `#graphql
  query SplitHero($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobjects(type: "split_hero", first: 2) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;

const TESTIMONIALS_QUERY = `#graphql
  query Testimonials($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobjects(type: "testimonial", first: 10) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on Product {
              id
              title
              handle
            }
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;

const INSTAGRAM_POSTS_QUERY = `#graphql
  query InstagramPosts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobjects(type: "instagram_post", first: 6) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;

const NEWSLETTER_SECTION_QUERY = `#graphql
  query NewsletterSection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobjects(type: "newsletter_section", first: 1) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;

import type {ShopFragment} from 'storefrontapi.generated';

interface SiteJsonLdProps {
  shop: ShopFragment;
  /**
   * Absolute URLs of the brand's official profiles (Instagram, TikTok, …).
   * Emitted as schema.org `sameAs`, which search engines use to connect the
   * storefront to the brand's other verified presences.
   */
  sameAs?: string[];
}

/**
 * Site-wide structured data for the homepage.
 *
 * Emits an Organization node and a WebSite node in a single `@graph`, linked by `@id` so search
 * engines treat them as one entity rather than two unrelated ones. The WebSite node carries a
 * SearchAction, which is what enables the sitelinks search box in Google results.
 *
 * Product and breadcrumb structured data are emitted by their own components on the relevant
 * routes; this one belongs on the homepage only, so the entity is declared exactly once.
 */
export function SiteJsonLd({shop, sameAs}: SiteJsonLdProps) {
  // Shopify returns the primary domain with no trailing slash, but normalise defensively so the
  // generated @id values stay stable if that ever changes.
  const siteUrl = shop.primaryDomain.url.replace(/\/+$/, '');
  const logoUrl = shop.brand?.logo?.image?.url;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: shop.name,
        url: siteUrl,
        description: shop.description || undefined,
        logo: logoUrl
          ? {
              '@type': 'ImageObject',
              url: logoUrl,
            }
          : undefined,
        sameAs: sameAs && sameAs.length > 0 ? sameAs : undefined,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: shop.name,
        url: siteUrl,
        publisher: {'@id': `${siteUrl}/#organization`},
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  // Drop undefined values so the emitted JSON stays free of empty properties.
  const cleanedJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(cleanedJsonLd)}}
    />
  );
}

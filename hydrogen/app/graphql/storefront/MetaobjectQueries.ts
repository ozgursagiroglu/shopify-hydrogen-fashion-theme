/**
 * =============================================================================
 * METAOBJECT PARSER UTILITIES
 * =============================================================================
 *
 * This file contains parser functions that transform raw Shopify Metaobject
 * GraphQL responses into strongly-typed, usable data structures.
 *
 * ## Why Manual Parsing is Required
 *
 * Shopify's Metaobject API returns data in a generic `field { key, value, type }`
 * format instead of a structured object. For example:
 *
 * ```typescript
 * // RAW GRAPHQL RESPONSE (what Shopify returns):
 * {
 *   metaobject: {
 *     fields: [
 *       { key: "title", value: "Welcome", type: "single_line_text_field" },
 *       { key: "subtitle", value: "Shop Now", type: "single_line_text_field" },
 *       { key: "image", value: "{\"url\":\"...\", \"altText\":\"...\"}", type: "file_reference" }
 *     ]
 *   }
 * }
 *
 * // PARSED OUTPUT (what we need):
 * {
 *   title: "Welcome",
 *   subtitle: "Shop Now",
 *   image: { url: "...", altText: "..." }
 * }
 * ```
 *
 * ## Parsing Challenges
 *
 * 1. **Field Array Format**: Fields are in an array, not a structured object
 * 2. **Type Information**: Values are strings that may need type conversion
 * 3. **Nested References**: Some fields reference other metaobjects
 * 4. **JSON Strings**: File references and complex data are JSON strings
 * 5. **Null Handling**: Missing or empty fields need safe defaults
 *
 * ## How This Works
 *
 * Each parser function:
 * 1. Takes a raw GraphQL response (typed via codegen)
 * 2. Extracts fields from the generic array structure
 * 3. Converts values to appropriate types
 * 4. Handles nested references (e.g., collections, products)
 * 5. Returns a strongly-typed, usable object
 *
 * ## Architecture Pattern
 *
 * ```
 * Route Loader
 *     ↓ (GraphQL query)
 * Shopify Storefront API
 *     ↓ (raw metaobject response)
 * Parser Function (this file)
 *     ↓ (typed data structure)
 * React Component
 * ```
 *
 * ## Adding New Parsers
 *
 * When creating a new metaobject type:
 *
 * 1. **Define GraphQL Query** (in route file):
 *    ```graphql
 *    query MyMetaobject {
 *      metaobject(handle: {type: "my_type", handle: "my-handle"}) {
 *        id
 *        fields { key value type }
 *      }
 *    }
 *    ```
 *
 * 2. **Define Output Type** (in this file):
 *    ```typescript
 *    export interface MyMetaobject {
 *      id: string;
 *      title: string;
 *      // ... other fields
 *    }
 *    ```
 *
 * 3. **Create Parser Function** (in this file):
 *    ```typescript
 *    export function parseMyMetaobject(data: MyMetaobjectQuery): MyMetaobject | null {
 *      if (!data?.metaobject) return null;
 *
 *      const fields = data.metaobject.fields.reduce((acc, field) => {
 *        acc[field.key] = field.value;
 *        return acc;
 *      }, {} as Record<string, string>);
 *
 *      return {
 *        id: data.metaobject.id,
 *        title: fields.title || '',
 *        // ... parse other fields
 *      };
 *    }
 *    ```
 *
 * ## Best Practices
 *
 * - **Type Safety**: Always use codegen types for input
 * - **Null Handling**: Return null if data is missing, provide defaults for fields
 * - **Validation**: Check required fields exist before returning
 * - **JSON Parsing**: Safely parse JSON strings with try-catch
 * - **Documentation**: Comment complex parsing logic
 *
 * ## Related Files
 *
 * - Route loaders query metaobjects (e.g., `_index.tsx`, `about.tsx`)
 * - `storefrontapi.generated.ts` provides input types via codegen
 * - `SHOPIFY_METAOBJECTS.md` documents metaobject structure
 *
 * @see SHOPIFY_METAOBJECTS.md for metaobject definitions
 */

import type {
  HomepageHeroQuery,
  FeatureBannerQuery,
  PressFeaturesQuery,
  LookbookItemsQuery,
  SplitHeroQuery,
  TestimonialsQuery,
  InstagramPostsQuery,
  NewsletterSectionQuery,
  AboutPageQuery,
  BrandValuesQuery,
  StoreLocationsQuery,
  LookbookCollectionsQuery,
} from 'storefrontapi.generated';

// Types for parsed metaobject data (output types - transformed from raw GraphQL)

export interface HomepageHero {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage: {
    url: string;
    altText: string;
  } | null;
  primaryCta: {
    label: string;
    href: string;
  } | null;
  secondaryCta: {
    label: string;
    href: string;
  } | null;
  height: 'full' | 'large' | 'medium';
}

export interface FeatureBanner {
  id: string;
  title: string;
  subtitle: string;
  image: {
    url: string;
    altText: string;
  } | null;
  cta: {
    label: string;
    href: string;
  } | null;
  alignment: 'left' | 'center' | 'right';
}

export interface PressFeature {
  id: string;
  name: string;
  logoText: string;
  logoImage: {
    url: string;
    altText: string;
  } | null;
  quote: string;
  isFeatured: boolean;
}

export interface LookbookItemData {
  id: string;
  title: string;
  image: {
    url: string;
    altText: string;
  } | null;
  collection: {
    handle: string;
    title: string;
  } | null;
  url: string;
  order: number;
}

export interface SplitHeroPanel {
  id: string;
  title: string;
  image: {
    url: string;
    altText: string;
  } | null;
  cta: {
    label: string;
    href: string;
  } | null;
  position: 'left' | 'right';
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: {
    url: string;
    altText: string;
  } | null;
  rating: number;
  text: string;
  product: {
    title: string;
    handle: string;
  } | null;
  verified: boolean;
}

export interface InstagramPost {
  id: string;
  image: {
    url: string;
    altText: string;
  };
  likes: number;
  comments: number;
  url: string;
}

export interface NewsletterSection {
  id: string;
  overline: string;
  title: string;
  description: string;
  backgroundImage: {
    url: string;
    altText: string;
  } | null;
  benefits: [string, string, string];
  privacyNotice: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface FAQCategory {
  key: string;
  name: string;
  items: FAQItem[];
}

export interface AboutPage {
  id: string;
  title: string;
  subtitle: string;
  heroImage: {
    url: string;
    altText: string;
  } | null;
  missionTitle: string;
  missionText: string;
  storyTitle: string;
  storyText: string;
  storyImage: {
    url: string;
    altText: string;
  } | null;
  valuesTitle: string;
}

export interface BrandValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface StoreLocation {
  id: string;
  name: string;
  image: {
    url: string;
    altText: string;
  } | null;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  hours: string;
  latitude: string;
  longitude: string;
  features: string[];
  order: number;
}

export interface LookbookCollection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage: {
    url: string;
    altText: string;
  } | null;
  season: string;
  year: number;
  featured: boolean;
  order: number;
}

// ============================================================================
// Homepage Hero Parser
// ============================================================================

export function parseHomepageHero(
  metaobjects: HomepageHeroQuery['metaobjects'] | null | undefined,
): HomepageHero | null {
  if (!metaobjects?.nodes?.length) return null;

  const node = metaobjects.nodes[0]; // Only use first entry
  const fields = new Map(node.fields.map((f) => [f.key, f]));

  const primaryCtaText = fields.get('primary_cta_text')?.value;
  const primaryCtaUrl = fields.get('primary_cta_url')?.value;
  const secondaryCtaText = fields.get('secondary_cta_text')?.value;
  const secondaryCtaUrl = fields.get('secondary_cta_url')?.value;

  return {
    id: node.id,
    title: fields.get('title')?.value || '',
    subtitle: fields.get('subtitle')?.value || '',
    backgroundImage: parseImageReference(fields.get('background_image')?.reference),
    primaryCta:
      primaryCtaText && primaryCtaUrl
        ? {label: primaryCtaText, href: primaryCtaUrl}
        : null,
    secondaryCta:
      secondaryCtaText && secondaryCtaUrl
        ? {label: secondaryCtaText, href: secondaryCtaUrl}
        : null,
    height: parseHeight(fields.get('height')?.value) as HomepageHero['height'],
  };
}

// ============================================================================
// Feature Banner Parser
// ============================================================================

export function parseFeatureBanner(
  metaobjects: FeatureBannerQuery['metaobjects'] | null | undefined,
): FeatureBanner | null {
  if (!metaobjects?.nodes?.length) return null;

  const node = metaobjects.nodes[0]; // Only use first entry
  const fields = new Map(node.fields.map((f) => [f.key, f]));

  const ctaText = fields.get('cta_text')?.value;
  const ctaUrl = fields.get('cta_url')?.value;

  return {
    id: node.id,
    title: fields.get('title')?.value || '',
    subtitle: fields.get('subtitle')?.value || '',
    image: parseImageReference(fields.get('image')?.reference),
    cta: ctaText && ctaUrl ? {label: ctaText, href: ctaUrl} : null,
    alignment: parseAlignment(fields.get('alignment')?.value),
  };
}

// ============================================================================
// Press Features Parser
// ============================================================================

export function parsePressFeatures(
  metaobjects: PressFeaturesQuery['metaobjects'] | null | undefined,
): PressFeature[] {
  if (!metaobjects?.nodes) return [];

  return metaobjects.nodes.map((node) => {
    const fields = new Map(node.fields.map((f) => [f.key, f]));

    return {
      id: node.id,
      name: fields.get('name')?.value || '',
      logoText: fields.get('logo_text')?.value || '',
      logoImage: parseImageReference(fields.get('logo_image')?.reference),
      quote: fields.get('quote')?.value || '',
      isFeatured: fields.get('is_featured')?.value === 'true',
    };
  });
}

// ============================================================================
// Lookbook Items Parser
// ============================================================================

export function parseLookbookItems(
  metaobjects: LookbookItemsQuery['metaobjects'] | null | undefined,
): LookbookItemData[] {
  if (!metaobjects?.nodes) return [];

  const items = metaobjects.nodes.map((node) => {
    const fields = new Map(node.fields.map((f) => [f.key, f]));

    return {
      id: node.id,
      title: fields.get('title')?.value || '',
      image: parseImageReference(fields.get('image')?.reference),
      collection: parseCollectionReference(fields.get('collection')?.reference),
      url: fields.get('url')?.value || '',
      order: parseInt(fields.get('order')?.value || '0', 10),
    };
  });

  // Sort by order
  return items.sort((a, b) => a.order - b.order);
}

// ============================================================================
// Split Hero Parser
// ============================================================================

export function parseSplitHeroPanels(
  metaobjects: SplitHeroQuery['metaobjects'] | null | undefined,
): {left: SplitHeroPanel | null; right: SplitHeroPanel | null} {
  if (!metaobjects?.nodes) return {left: null, right: null};

  const panels = metaobjects.nodes.map((node) => {
    const fields = new Map(node.fields.map((f) => [f.key, f]));

    const ctaText = fields.get('cta_text')?.value;
    const ctaUrl = fields.get('cta_url')?.value;

    return {
      id: node.id,
      title: fields.get('title')?.value || '',
      image: parseImageReference(fields.get('image')?.reference),
      cta: ctaText && ctaUrl ? {label: ctaText, href: ctaUrl} : null,
      position: (fields.get('position')?.value === 'right' ? 'right' : 'left') as
        | 'left'
        | 'right',
    };
  });

  const leftPanel = panels.find((p) => p.position === 'left') || null;
  const rightPanel = panels.find((p) => p.position === 'right') || null;

  return {left: leftPanel, right: rightPanel};
}

// ============================================================================
// Testimonials Parser
// ============================================================================

export function parseTestimonials(
  metaobjects: TestimonialsQuery['metaobjects'] | null | undefined,
): Testimonial[] {
  if (!metaobjects?.nodes) return [];

  return metaobjects.nodes.map((node) => {
    const fields = new Map(node.fields.map((f) => [f.key, f]));

    return {
      id: node.id,
      name: fields.get('name')?.value || 'Anonymous',
      location: fields.get('location')?.value || '',
      avatar: parseImageReference(fields.get('avatar')?.reference),
      rating: parseInt(fields.get('rating')?.value || '5', 10),
      text: fields.get('text')?.value || '',
      product: parseProductReference(fields.get('product')?.reference),
      verified: fields.get('verified')?.value === 'true',
    };
  });
}

// ============================================================================
// Instagram Posts Parser
// ============================================================================

export function parseInstagramPosts(
  metaobjects: InstagramPostsQuery['metaobjects'] | null | undefined,
): InstagramPost[] {
  if (!metaobjects?.nodes) return [];

  return metaobjects.nodes.map((node) => {
    const fields = new Map(node.fields.map((f) => [f.key, f]));

    return {
      id: node.id,
      image: parseImageReference(fields.get('image')?.reference) || {
        url: '',
        altText: 'Instagram post',
      },
      likes: parseInt(fields.get('likes')?.value || '0', 10),
      comments: parseInt(fields.get('comments')?.value || '0', 10),
      url: fields.get('url')?.value || 'https://instagram.com',
    };
  });
}

// ============================================================================
// Newsletter Section Parser
// ============================================================================

export function parseNewsletterSection(
  metaobjects: NewsletterSectionQuery['metaobjects'] | null | undefined,
): NewsletterSection | null {
  if (!metaobjects?.nodes?.length) return null;

  const node = metaobjects.nodes[0];
  const fields = new Map(node.fields.map((f) => [f.key, f]));

  return {
    id: node.id,
    overline: fields.get('overline')?.value || '',
    title: fields.get('title')?.value || '',
    description: fields.get('description')?.value || '',
    backgroundImage: parseImageReference(fields.get('background_image')?.reference),
    benefits: [
      fields.get('benefit_1')?.value || '',
      fields.get('benefit_2')?.value || '',
      fields.get('benefit_3')?.value || '',
    ],
    privacyNotice: fields.get('privacy_notice')?.value || '',
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

// Helper to parse image reference from MediaImage
function parseImageReference(
  reference: unknown,
): {url: string; altText: string} | null {
  if (!reference || typeof reference !== 'object') return null;

  const ref = reference as {image?: {url?: string; altText?: string}};
  if (ref.image?.url) {
    return {
      url: ref.image.url,
      altText: ref.image.altText || '',
    };
  }
  return null;
}

// Helper to parse product reference
function parseProductReference(
  reference: unknown,
): {title: string; handle: string} | null {
  if (!reference || typeof reference !== 'object') return null;

  const ref = reference as {title?: string; handle?: string};
  if (ref.title && ref.handle) {
    return {
      title: ref.title,
      handle: ref.handle,
    };
  }
  return null;
}

// Helper to parse collection reference
function parseCollectionReference(
  reference: unknown,
): {handle: string; title: string} | null {
  if (!reference || typeof reference !== 'object') return null;

  const ref = reference as {handle?: string; title?: string};
  if (ref.handle) {
    return {
      handle: ref.handle,
      title: ref.title || '',
    };
  }
  return null;
}

// Helper to parse height value
function parseHeight(value: string | null | undefined): 'full' | 'large' | 'medium' {
  if (value === 'full' || value === 'medium') return value;
  return 'large'; // default
}

// Helper to parse alignment value
function parseAlignment(
  value: string | null | undefined,
): 'left' | 'center' | 'right' {
  if (value === 'left' || value === 'right') return value;
  return 'center'; // default
}

// ============================================================================
// FAQ Items Parser
// ============================================================================

interface FAQMetaobjectNode {
  id: string;
  fields: Array<{key: string; value: string | null}>;
}

interface FAQMetaobjects {
  nodes: FAQMetaobjectNode[];
}

export function parseFAQItems(
  metaobjects: FAQMetaobjects | null | undefined,
): FAQItem[] {
  if (!metaobjects?.nodes) return [];

  const items = metaobjects.nodes.map((node) => {
    const fields = new Map(node.fields.map((f) => [f.key, f.value]));

    return {
      id: node.id,
      question: fields.get('question') || '',
      answer: fields.get('answer') || '',
      category: fields.get('category') || 'general',
      order: parseInt(fields.get('order') || '0', 10),
    };
  });

  // Sort by category and then by order
  return items.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.order - b.order;
  });
}

export function groupFAQsByCategory(items: FAQItem[]): FAQCategory[] {
  const categoryMap = new Map<string, FAQItem[]>();

  for (const item of items) {
    const categoryKey = item.category.toLowerCase();
    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, []);
    }
    categoryMap.get(categoryKey)!.push(item);
  }

  // Convert to array and sort items within each category
  const categories: FAQCategory[] = [];
  for (const [key, categoryItems] of categoryMap) {
    categories.push({
      key,
      name: key, // Will be translated in component
      items: categoryItems.sort((a, b) => a.order - b.order),
    });
  }

  // Sort categories by predefined order
  const categoryOrder = ['shipping', 'returns', 'orders', 'products', 'account'];
  return categories.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.key);
    const bIndex = categoryOrder.indexOf(b.key);
    if (aIndex === -1 && bIndex === -1) return a.key.localeCompare(b.key);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

// Note: Contact info is stored in Shop metafields (namespace: "contact", keys: "email", "phone", "hours", "address", "address_url", "title")
// and parsed directly in the contact route using shop.metafields query
// See: hydrogen/app/routes/($locale).contact.tsx

// ============================================================================
// About Page Parser
// ============================================================================

type FieldValue = {value: string | null; reference: any};

export function parseAboutPage(
  metaobjects: AboutPageQuery['metaobjects'] | null | undefined,
): AboutPage | null {
  if (!metaobjects?.nodes?.length) return null;

  const node = metaobjects.nodes[0]; // Only use first entry
  const fields = new Map<string, FieldValue>(
    node.fields.map((f) => [
      f.key,
      {value: f.value ?? null, reference: f.reference ?? null},
    ]),
  );

  return {
    id: node.id,
    title: fields.get('title')?.value || '',
    subtitle: fields.get('subtitle')?.value || '',
    heroImage: parseImageReference(fields.get('hero_image')?.reference),
    missionTitle: fields.get('mission_title')?.value || '',
    missionText: fields.get('mission_text')?.value || '',
    storyTitle: fields.get('story_title')?.value || '',
    storyText: fields.get('story_text')?.value || '',
    storyImage: parseImageReference(fields.get('story_image')?.reference),
    valuesTitle: fields.get('values_title')?.value || '',
  };
}

// ============================================================================
// Brand Values Parser
// ============================================================================

export function parseBrandValues(
  metaobjects: BrandValuesQuery['metaobjects'] | null | undefined,
): BrandValue[] {
  if (!metaobjects?.nodes?.length) return [];

  return metaobjects.nodes
    .map((node) => {
      const fields = new Map(node.fields.map((f) => [f.key, f.value]));

      return {
        id: node.id,
        title: fields.get('title') || '',
        description: fields.get('description') || '',
        icon: fields.get('icon') || '',
        order: parseInt(fields.get('order') || '0', 10),
      };
    })
    .sort((a: BrandValue, b: BrandValue) => a.order - b.order);
}

// ============================================================================
// Store Locations Parser
// ============================================================================

export function parseStoreLocations(
  metaobjects: StoreLocationsQuery['metaobjects'] | null | undefined,
): StoreLocation[] {
  if (!metaobjects?.nodes?.length) return [];

  return metaobjects.nodes
    .map((node) => {
      const fields = new Map<string, FieldValue>(
        node.fields.map((f) => [
          f.key,
          {value: f.value ?? null, reference: f.reference ?? null},
        ]),
      );

      return {
        id: node.id,
        name: fields.get('name')?.value || '',
        image: parseImageReference(fields.get('image')?.reference),
        addressLine1: fields.get('address_line1')?.value || '',
        addressLine2: fields.get('address_line2')?.value || '',
        city: fields.get('city')?.value || '',
        postalCode: fields.get('postal_code')?.value || '',
        country: fields.get('postal_code')?.value || '',
        phone: fields.get('phone')?.value || '',
        email: fields.get('email')?.value || '',
        hours: fields.get('hours')?.value || '',
        latitude: fields.get('latitude')?.value || '',
        longitude: fields.get('longitude')?.value || '',
        features: (fields.get('features')?.value || '')
          .split('\n')
          .filter((f: string) => f.trim()),
        order: parseInt(fields.get('order')?.value || '0', 10),
      };
    })
    .sort((a: StoreLocation, b: StoreLocation) => a.order - b.order);
}

// ============================================================================
// Lookbook Collections Parser
// ============================================================================

export function parseLookbookCollections(
  metaobjects: LookbookCollectionsQuery['metaobjects'] | null | undefined,
): LookbookCollection[] {
  if (!metaobjects?.nodes?.length) return [];

  return metaobjects.nodes
    .map((node) => {
      const fields = new Map<string, FieldValue>(
        node.fields.map((f) => [
          f.key,
          {value: f.value ?? null, reference: f.reference ?? null},
        ]),
      );

      return {
        id: node.id,
        title: fields.get('title')?.value || '',
        subtitle: fields.get('subtitle')?.value || '',
        description: fields.get('description')?.value || '',
        heroImage: parseImageReference(fields.get('hero_image')?.reference),
        season: fields.get('season')?.value || '',
        year: parseInt(fields.get('year')?.value || '0', 10),
        featured: fields.get('featured')?.value === 'true',
        order: parseInt(fields.get('order')?.value || '0', 10),
      };
    })
    .sort((a: LookbookCollection, b: LookbookCollection) => a.order - b.order);
}

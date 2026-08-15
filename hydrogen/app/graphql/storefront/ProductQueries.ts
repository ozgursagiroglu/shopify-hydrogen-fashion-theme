/**
 * Product GraphQL Queries for Storefront API
 *
 * Includes:
 * - PDP (Product Detail Page) queries
 * - API product query (for QuickView modal)
 * - Related products query
 */

import {PRODUCT_CARD_FRAGMENT} from './fragments';

// ============================================================================
// PDP Fragments
// ============================================================================

export const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

export const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    featuredImage {
      url
      altText
    }
    media(first: 10) {
      nodes {
        __typename
        ... on MediaImage {
          id
          image {
            id
            url
            altText
            width
            height
          }
        }
        ... on Video {
          id
          sources {
            url
            mimeType
          }
          previewImage {
            url
            altText
          }
        }
        ... on ExternalVideo {
          id
          embedUrl
          host
          previewImage {
            url
            altText
          }
        }
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    collections(first: 1) {
      nodes {
        title
        handle
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

// ============================================================================
// PDP Query
// ============================================================================

export const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

// ============================================================================
// QuickView Product Query (optimized for modal - client-side variant switching)
// ============================================================================

export const QUICKVIEW_PRODUCT_QUERY = `#graphql
  fragment QuickViewProduct on Product {
    id
    title
    handle
    vendor
    description
    options {
      name
      values
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 100) {
      nodes {
        ...ProductVariant
      }
    }
  }

  query QuickViewProductByHandle($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...QuickViewProduct
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

// ============================================================================
// Related Products Query
// ============================================================================

export const RELATED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query RelatedProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
` as const;

// ============================================================================
// Variants to Products Mapping Query
// ============================================================================

/**
 * Maps variant IDs to product IDs
 * Used to convert purchased variant IDs from Customer Account API to product IDs
 */
export const VARIANTS_TO_PRODUCTS_QUERY = `#graphql
  query VariantsToProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        product {
          id
        }
      }
    }
  }
` as const;

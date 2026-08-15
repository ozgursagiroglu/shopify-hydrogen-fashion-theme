/**
 * Storefront API GraphQL - Centralized Exports
 *
 * Usage:
 * import { PRODUCT_QUERY, COLLECTION_QUERY } from '~/graphql/storefront';
 */

// Shared Fragments
export {PRODUCT_CARD_FRAGMENT, PAGE_INFO_FRAGMENT} from './fragments';

// Product Queries
export {
  PRODUCT_VARIANT_FRAGMENT,
  PRODUCT_FRAGMENT,
  PRODUCT_QUERY,
  QUICKVIEW_PRODUCT_QUERY,
  RELATED_PRODUCTS_QUERY,
  VARIANTS_TO_PRODUCTS_QUERY,
} from './ProductQueries';

// Collection Queries
export {
  COLLECTION_QUERY,
  FEATURED_COLLECTIONS_QUERY,
  NEW_ARRIVALS_QUERY,
  RECOMMENDED_PRODUCTS_QUERY,
} from './CollectionQueries';

// Metaobject Parsers (not queries - queries stay in routes for codegen)
export * from './MetaobjectQueries';

// Review Parsers
export * from './ReviewQueries';

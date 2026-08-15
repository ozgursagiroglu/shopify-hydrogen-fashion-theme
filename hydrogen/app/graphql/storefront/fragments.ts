/**
 * Shared GraphQL Fragments for Storefront API
 *
 * These fragments are used across multiple routes and components.
 * Import them to avoid duplication and ensure consistency.
 */

/**
 * Product Card Fragment - Core fields for product listings
 *
 * Used in:
 * - Collection pages (product grid)
 * - Search results
 * - Homepage new arrivals
 * - Homepage recommended products
 * - Related products on PDP
 */
export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    handle
    vendor
    tags
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
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
    media(first: 2) {
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
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
  }
` as const;

/**
 * Page Info Fragment - For paginated queries
 */
export const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFields on PageInfo {
    hasPreviousPage
    hasNextPage
    startCursor
    endCursor
  }
` as const;

/**
 * Layout & Shop Fragments
 */

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/cart
export const CART_QUERY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
  fragment CartLine on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height

        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
  fragment CartLineComponent on ComponentizableCartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height
        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
  fragment CartApiQuery on Cart {
    updatedAt
    id
    appliedGiftCards {
      id
      lastCharacters
      amountUsed {
        ...Money
      }
    }
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: $numCartLines) {
      nodes {
        ...CartLine
      }
      nodes {
        ...CartLineComponent
      }
    }
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
      totalDutyAmount {
        ...Money
      }
      totalTaxAmount {
        ...Money
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
  }
` as const;

const MENU_FRAGMENT = `#graphql
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
` as const;

export const HEADER_QUERY = `#graphql
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
  }
  query Header(
    $country: CountryCode
    $headerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    shop {
      ...Shop
    }
    menu(handle: $headerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
` as const;

export const FOOTER_QUERY = `#graphql
  query Footer(
    $country: CountryCode
    $footerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
` as const;

export const FOOTER_MENUS_QUERY = `#graphql
  query FooterMenus(
    $country: CountryCode
    $language: LanguageCode
    $shopMenuHandle: String!
    $helpMenuHandle: String!
    $aboutMenuHandle: String!
    $legalMenuHandle: String!
  ) @inContext(language: $language, country: $country) {
    shopMenu: menu(handle: $shopMenuHandle) {
      ...Menu
    }
    helpMenu: menu(handle: $helpMenuHandle) {
      ...Menu
    }
    aboutMenu: menu(handle: $aboutMenuHandle) {
      ...Menu
    }
    legalMenu: menu(handle: $legalMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
` as const;

export const LOCALIZATION_QUERY = `#graphql
  query Localization(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    localization {
      country {
        name
        isoCode
      }
      language {
        name
        isoCode
      },
      availableCountries {
        isoCode
        name
        currency {
          isoCode
          name
          symbol
        }
        availableLanguages {
          isoCode
          name
        }
      }
      availableLanguages {
        isoCode
        name
      }
    }
  }
` as const;

export const SHOP_METAFIELDS_QUERY = `#graphql
  query ShopMetafields(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    shop {
      social_instagram: metafield(namespace: "social", key: "instagram") {
        value
      }
      social_facebook: metafield(namespace: "social", key: "facebook") {
        value
      }
      social_twitter: metafield(namespace: "social", key: "twitter") {
        value
      }
      social_pinterest: metafield(namespace: "social", key: "pinterest") {
        value
      }
      social_tiktok: metafield(namespace: "social", key: "tiktok") {
        value
      }
      social_youtube: metafield(namespace: "social", key: "youtube") {
        value
      }
    }
  }
` as const;

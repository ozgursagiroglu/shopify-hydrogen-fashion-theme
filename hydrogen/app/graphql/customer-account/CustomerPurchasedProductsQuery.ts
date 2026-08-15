// Query to fetch customer orders with variant IDs
// We fetch variant IDs from fulfilled and paid orders,
// then query Storefront API to map variants to products
// NOTE: https://shopify.dev/docs/api/customer/latest/objects/Order

export const CUSTOMER_PURCHASED_PRODUCTS_QUERY = `#graphql
  query CustomerPurchasedProducts($language: LanguageCode) @inContext(language: $language) {
    customer {
      orders(
        first: 250,
        query: "financial_status:paid OR financial_status:partially_paid"
      ) {
        nodes {
          id
          fulfillmentStatus
          lineItems(first: 250) {
            nodes {
              variantId
            }
          }
        }
      }
    }
  }
` as const;

/**
 * Extract variant IDs from fulfilled orders
 * @param data - CustomerPurchasedProductsQuery result
 * @returns Set of variant IDs that customer has purchased
 */
export function extractPurchasedVariantIds(
  data: any, // Will be typed by codegen as CustomerPurchasedProductsQuery
): Set<string> {
  const variantIds = new Set<string>();

  if (!data?.customer?.orders?.nodes) {
    return variantIds;
  }

  data.customer.orders.nodes.forEach((order: any) => {
    // Only include fulfilled or delivered orders
    if (
      order.fulfillmentStatus === 'FULFILLED' ||
      order.fulfillmentStatus === 'DELIVERED'
    ) {
      order.lineItems?.nodes?.forEach((item: any) => {
        if (item.variantId) {
          variantIds.add(item.variantId);
        }
      });
    }
  });

  return variantIds;
}


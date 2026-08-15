import {useLoaderData, useLocation, useRouteLoaderData} from 'react-router';
import {useTranslation} from 'react-i18next';
import type {Route} from './+types/($locale).products.$handle';
import type {RootLoader} from '~/root';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {
  ProductGallery,
  ProductInfo,
  RecentlyViewed,
  RelatedProducts,
  ProductReviews,
} from '~/components/product';
import {ProductJsonLd} from '~/components/shared';
import {Breadcrumb, buildProductBreadcrumbs} from '~/components/ui';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {useRecentlyViewed} from '~/context/RecentlyViewedContext';
import {buildPageTitleWithFallback} from '~/lib/seo';
import {
  PRODUCT_QUERY,
  RELATED_PRODUCTS_QUERY,
  parseProductReviews,
  VARIANTS_TO_PRODUCTS_QUERY,
} from '~/graphql/storefront';
import {
  CUSTOMER_PURCHASED_PRODUCTS_QUERY,
  extractPurchasedVariantIds,
} from '~/graphql/customer-account/CustomerPurchasedProductsQuery';
import {startTransition, useEffect} from 'react';

export const meta: Route.MetaFunction = ({data, matches}) => {
  const title = buildPageTitleWithFallback(
    data?.product.title,
    'Product',
    matches,
  );
  const description = data?.product.description?.slice(0, 160) || '';

  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:image', content: data?.product.featuredImage?.url ?? ''},
    {rel: 'canonical', href: `/products/${data?.product.handle}`},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  // Fetch reviews synchronously (non-blocking with try-catch)
  let reviewsMetaobjects = null;
  try {
    const result = await storefront.query(PRODUCT_REVIEWS_QUERY);
    reviewsMetaobjects = result?.metaobjects;
  } catch {
    // Silent fail - reviews are non-critical
  }

  // Check customer purchase synchronously
  let purchaseCheck = {
    purchasedProductIds: new Set<string>(),
    isAuthenticated: false,
  };
  try {
    purchaseCheck = await checkCustomerPurchase(context);
  } catch {
    // Silent fail - purchase check is non-critical
  }

  return {product, reviewsMetaobjects, purchaseCheck};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  // Fetch related products asynchronously
  const relatedProducts = context.storefront
    .query(RELATED_PRODUCTS_QUERY, {
      variables: {first: 8},
    })
    .catch(() => {
      // Silent fail - related products are non-critical
      return null;
    });

  return {relatedProducts};
}

/**
 * Check if authenticated customer has purchased products
 * Returns set of purchased product IDs and authentication state
 */
async function checkCustomerPurchase(
  context: Route.LoaderArgs['context'],
): Promise<{
  purchasedProductIds: Set<string>;
  isAuthenticated: boolean;
}> {
  const {customerAccount, storefront} = context;

  try {
    // Check if user is logged in
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return {purchasedProductIds: new Set(), isAuthenticated: false};
    }

    // 1. Query customer's orders to get variant IDs
    const {data} = await customerAccount.query(
      CUSTOMER_PURCHASED_PRODUCTS_QUERY,
    );
    const purchasedVariantIds = extractPurchasedVariantIds(data);

    // If no variants purchased, return empty set
    if (purchasedVariantIds.size === 0) {
      return {purchasedProductIds: new Set(), isAuthenticated: true};
    }

    // 2. Map variant IDs to product IDs using Storefront API
    const variantIdsArray = Array.from(purchasedVariantIds);
    const {nodes} = await storefront.query(VARIANTS_TO_PRODUCTS_QUERY, {
      variables: {ids: variantIdsArray},
    });

    // 3. Extract product IDs from variants
    const productIds = new Set<string>();
    nodes?.forEach((node: any) => {
      if (node?.product?.id) {
        productIds.add(node.product.id);
      }
    });

    return {
      purchasedProductIds: productIds,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Purchase check error:', error);
    return {purchasedProductIds: new Set(), isAuthenticated: false};
  }
}

export default function Product() {
  const {t} = useTranslation();
  const {product, relatedProducts, reviewsMetaobjects, purchaseCheck} =
    useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<RootLoader>('root');
  const {addItem} = useRecentlyViewed();
  const location = useLocation();

  // Get shop's primary domain URL from root data
  const shopDomain = rootData?.header?.shop?.primaryDomain?.url || '';

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, vendor} = product;

  // Track product view in recently viewed
  useEffect(() => {
    startTransition(() => {
      addItem({
        id: product.id,
        handle: product.handle,
        title: product.title,
        vendor: product.vendor || undefined,
        price: product.selectedOrFirstAvailableVariant?.price || {
          amount: '0',
          currencyCode: 'USD',
        },
        compareAtPrice:
          product.selectedOrFirstAvailableVariant?.compareAtPrice || undefined,
        image: product.featuredImage
          ? {
              url: product.featuredImage.url,
              altText: product.featuredImage.altText || undefined,
            }
          : undefined,
      });
    });
    // Only track when product.id changes (not the entire product object)
    // This prevents infinite re-renders caused by product object recreation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // Build breadcrumbs - get first collection from product if available
  const firstCollection = product.collections?.nodes?.[0];
  const breadcrumbs = buildProductBreadcrumbs(
    t,
    {title: product.title, handle: product.handle},
    firstCollection
      ? {title: firstCollection.title, handle: firstCollection.handle}
      : null,
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbs} />
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
        {/* Gallery - Sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery
            media={product.media.nodes}
            productTitle={product.title}
          />
        </div>

        {/* Product Info */}
        <ProductInfo
          title={title}
          vendor={vendor}
          descriptionHtml={descriptionHtml}
          productOptions={productOptions}
          selectedVariant={selectedVariant}
          productTitle={product.title}
          productHandle={product.handle}
          productId={product.id}
          featuredImage={product.featuredImage}
        />
      </div>

      {/* JSON-LD Structured Data */}
      <ProductJsonLd
        product={product}
        selectedVariant={selectedVariant}
        url={`${shopDomain}${location.pathname}`}
      />

      {/* Analytics */}
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />

      {/* Product Reviews */}
      <ProductReviews
        productId={product.id}
        productTitle={product.title}
        reviewsData={parseProductReviews(reviewsMetaobjects, product.id)}
        canReview={purchaseCheck.purchasedProductIds.has(product.id)}
        isAuthenticated={purchaseCheck.isAuthenticated}
        className="mt-16 md:mt-24 border-t border-border"
      />

      {/* Related Products */}
      <RelatedProducts
        products={relatedProducts}
        currentProductId={product.id}
        className="mt-16 md:mt-24 border-t border-border"
      />

      {/* Recently Viewed Products */}
      <RecentlyViewed
        excludeHandle={product.handle}
        maxItems={6}
        className="mt-8 md:mt-12 pt-12 border-t border-border"
      />
    </div>
  );
}

const PRODUCT_REVIEWS_QUERY = `#graphql
  query ProductReviews(
    $language: LanguageCode,
    $country: CountryCode
  ) @inContext(language: $language, country: $country) {
    metaobjects(type: "customer_review", first: 100) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on Product {
              id
            }
          }
        }
      }
    }
  }
` as const;

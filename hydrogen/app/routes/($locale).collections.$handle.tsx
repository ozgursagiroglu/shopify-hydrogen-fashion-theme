import {useCallback} from 'react';
import {redirect, useLoaderData, useSearchParams} from 'react-router';
import {useTranslation} from 'react-i18next';
import type {Route} from './+types/($locale).collections.$handle';
import {getPaginationVariables, Analytics, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/shared/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductCard} from '~/components/product/ProductCard';
import {Select, Breadcrumb, buildCollectionBreadcrumbs} from '~/components/ui';
import {FilterDrawer, AppliedFilters} from '~/components/collection';
import type {Filter, AppliedFilter} from '~/components/collection';
import type {ProductCardFragment} from 'storefrontapi.generated';
import type {
  ProductFilter,
  ProductCollectionSortKeys,
} from '@shopify/hydrogen/storefront-api-types';
import {LIMITS} from '~/lib/constants';
import {getShopName} from '~/lib/seo';
import {COLLECTION_QUERY} from '~/graphql/storefront';
import {cn} from '~/lib/cn';

export const meta: Route.MetaFunction = ({data, matches}) => {
  const title = data?.collection?.title
    ? `${data.collection.title} | ${getShopName(matches)}`
    : getShopName(matches);
  const description = data?.collection?.description?.slice(0, 160) || '';
  const image = data?.collection?.image?.url ?? '';

  return [
    {title},
    {name: 'description', content: description},
    // Open Graph
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    ...(image ? [{property: 'og:image', content: image}] : []),
    // Twitter Card
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    ...(image ? [{name: 'twitter:image', content: image}] : []),
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(); // args
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

function parseFiltersFromUrl(searchParams: URLSearchParams): ProductFilter[] {
  const filtersParam = searchParams.get('filters');
  if (!filtersParam) return [];
  try {
    const filterStrings = JSON.parse(filtersParam) as string[];
    return filterStrings.map((f) => JSON.parse(f) as ProductFilter);
  } catch {
    return [];
  }
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const sortKey = url.searchParams.get('sort') || 'COLLECTION_DEFAULT';
  const reverse = url.searchParams.get('reverse') === 'true';
  const filters = parseFiltersFromUrl(url.searchParams);

  const paginationVariables = getPaginationVariables(request, {
    pageBy: LIMITS.PRODUCTS_PER_PAGE,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        sortKey: sortKey as ProductCollectionSortKeys,
        reverse,
        filters: filters.length > 0 ? filters : undefined,
        ...paginationVariables,
      },
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  // Transform Shopify filters to our Filter type
  const availableFilters: Filter[] = (collection.products.filters || []).map(
    (filter: any) => ({
      id: filter.id,
      label: filter.label,
      type: filter.type,
      values: filter.values.map((value: any) => ({
        id: value.id,
        label: value.label,
        count: value.count,
        input: value.input,
      })),
    }),
  );

  // Get applied filters for display
  const appliedFilters: AppliedFilter[] = filters.map((filter) => {
    // Extract label from filter
    let label = 'Filter';
    if ('price' in filter) {
      const price = filter.price as {min?: number; max?: number};
      label = `$${price.min || 0} - $${price.max || '∞'}`;
    } else if ('productVendor' in filter) {
      label = filter.productVendor as string;
    } else if ('productType' in filter) {
      label = filter.productType as string;
    } else if ('variantOption' in filter) {
      const opt = filter.variantOption as {name: string; value: string};
      label = `${opt.name}: ${opt.value}`;
    } else if ('available' in filter) {
      label = filter.available ? 'inStock' : 'outOfStock';
    }
    return {label, filter: JSON.stringify(filter)};
  });

  return {collection, availableFilters, appliedFilters};
}

function loadDeferredData() {
  // {context}: Route.LoaderArgs
  return {};
}

function getSortOptions(t: (...args: any[]) => string) {
  return [
    {
      label: t('collection.sortOptions.featured'),
      value: 'COLLECTION_DEFAULT-false',
    },
    {
      label: t('collection.sortOptions.bestSelling'),
      value: 'BEST_SELLING-false',
    },
    {label: t('collection.sortOptions.alphabeticalAZ'), value: 'TITLE-false'},
    {label: t('collection.sortOptions.alphabeticalZA'), value: 'TITLE-true'},
    {label: t('collection.sortOptions.priceLowHigh'), value: 'PRICE-false'},
    {label: t('collection.sortOptions.priceHighLow'), value: 'PRICE-true'},
    {label: t('collection.sortOptions.dateOldNew'), value: 'CREATED-false'},
    {label: t('collection.sortOptions.dateNewOld'), value: 'CREATED-true'},
  ];
}

export default function Collection() {
  const {t} = useTranslation();
  const {collection, availableFilters, appliedFilters} =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSort = searchParams.get('sort') || 'COLLECTION_DEFAULT';
  const currentReverse = searchParams.get('reverse') === 'true';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortKey, reverse] = e.target.value.split('-');
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortKey);
    newParams.set('reverse', reverse);
    setSearchParams(newParams);
  };

  const handleRemoveFilter = useCallback(
    (filterToRemove: string) => {
      const newParams = new URLSearchParams(searchParams);
      const filtersParam = newParams.get('filters');
      if (!filtersParam) return;

      try {
        let currentFilters = JSON.parse(filtersParam) as string[];
        currentFilters = currentFilters.filter((f) => f !== filterToRemove);

        if (currentFilters.length > 0) {
          newParams.set('filters', JSON.stringify(currentFilters));
        } else {
          newParams.delete('filters');
        }

        newParams.delete('cursor');
        newParams.delete('direction');
        setSearchParams(newParams);
      } catch {
        // Invalid filter format
      }
    },
    [searchParams, setSearchParams],
  );

  const handleClearAllFilters = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('filters');
    newParams.delete('cursor');
    newParams.delete('direction');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const productCount = collection.products.nodes.length;

  const breadcrumbs = buildCollectionBreadcrumbs(t, {title: collection.title});
  const hasImage = !!collection.image;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-4">
        <Breadcrumb items={breadcrumbs} />
      </div>

      {/* Collection Header */}
      <header className="relative h-64 md:h-80 lg:h-96">
        {hasImage ? (
          <div className="absolute inset-0">
            <Image
              data={collection.image || undefined}
              sizes="100vw"
              loading="eager"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-black/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-surface-alt" />
        )}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 md:px-8">
          <h1
            className={cn(
              'font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-white mb-3 md:mb-4',
              {
                'text-text': !hasImage,
              },
            )}
          >
            {collection.title}
          </h1>
          {collection.description && (
            <p
              className={cn(
                'text-base md:text-lg text-white/80 max-w-2xl leading-relaxed',
                {
                  'text-text-muted': !hasImage,
                },
              )}
            >
              {collection.description}
            </p>
          )}
        </div>
      </header>

      {/* Collection Toolbar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 md:py-8 border-b border-border">
          <div className="flex items-center gap-4">
            <FilterDrawer
              filters={availableFilters}
              appliedFilters={appliedFilters}
              mode="mobile"
            />
            <p className="text-sm text-text-muted">
              {t('collection.productCount', {count: productCount})}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted whitespace-nowrap">
              {t('collection.sortBy')}:
            </span>
            <Select
              options={getSortOptions(t)}
              value={`${currentSort}-${currentReverse}`}
              onChange={handleSortChange}
              size="sm"
              className="w-48"
            />
          </div>
        </div>
      </div>

      {/* Collection Content with Sidebar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        <div className="flex gap-8 lg:gap-12">
          {/* Desktop Filter Sidebar */}
          <FilterDrawer
            filters={availableFilters}
            appliedFilters={appliedFilters}
            mode="desktop"
          />

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Applied Filters */}
            <AppliedFilters
              filters={appliedFilters}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />

            <PaginatedResourceSection<ProductCardFragment>
              connection={collection.products}
              resourcesClassName="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
            >
              {({node: product, index}) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  loading={index < 8 ? 'eager' : undefined}
                />
              )}
            </PaginatedResourceSection>
          </div>
        </div>
      </div>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

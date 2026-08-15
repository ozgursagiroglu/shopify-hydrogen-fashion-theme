import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import {SearchIcon, ArticleIcon, PageIcon, ArrowUpIcon, ArrowDownIcon, ArrowRightIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';
import {ProductCard} from '~/components/product/ProductCard';
import type {ProductCardFragment} from 'storefrontapi.generated';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  const {t} = useTranslation();

  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="font-display text-xl md:text-2xl tracking-tight text-text mb-6">
        {t('search.articles')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <Link
              key={article.id}
              prefetch="intent"
              to={articleUrl}
              className="group p-4 bg-surface border border-border rounded-lg hover:border-text/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-alt">
                  <ArticleIcon className="w-5 h-5 text-text-muted" />
                </div>
                <div>
                  <h3 className="font-medium text-text group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-text-muted">{t('misc.article')}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  const {t} = useTranslation();

  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="font-display text-xl md:text-2xl tracking-tight text-text mb-6">
        {t('search.pages')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <Link
              key={page.id}
              prefetch="intent"
              to={pageUrl}
              className="group p-4 bg-surface border border-border rounded-lg hover:border-text/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-alt">
                  <PageIcon className="w-5 h-5 text-text-muted" />
                </div>
                <div>
                  <h3 className="font-medium text-text group-hover:text-accent transition-colors">
                    {page.title}
                  </h3>
                  <p className="text-sm text-text-muted">{t('misc.page')}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  const {t} = useTranslation();

  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="font-display text-xl md:text-2xl tracking-tight text-text mb-6">
        {t('search.products')}
      </h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          return (
            <div className="space-y-8">
              {/* Previous Button */}
              <PreviousLink className="flex justify-center">
                {isLoading ? (
                  <span className="px-6 py-3 text-text-muted">{t('common.loading')}</span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-md text-text hover:bg-surface-alt font-medium transition-colors">
                    <ArrowUpIcon className="w-4 h-4" />
                    {t('search.loadPrevious')}
                  </span>
                )}
              </PreviousLink>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {nodes.map((product, index) => {
                  const productUrl = urlWithTrackingParams({
                    baseUrl: `/products/${product.handle}`,
                    trackingParams: product.trackingParameters,
                    term,
                  });

                  return (
                    <ProductCard
                      key={product.id}
                      product={product as ProductCardFragment}
                      to={productUrl}
                      loading={index < 8 ? 'eager' : 'lazy'}
                    />
                  );
                })}
              </div>

              {/* Next Button */}
              <NextLink className="flex justify-center">
                {isLoading ? (
                  <span className="px-6 py-3 text-text-muted">{t('common.loading')}</span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-md text-text hover:bg-surface-alt font-medium transition-colors">
                    {t('search.loadMore')}
                    <ArrowDownIcon className="w-4 h-4" />
                  </span>
                )}
              </NextLink>
            </div>
          );
        }}
      </Pagination>
    </div>
  );
}

function SearchResultsEmpty({term}: {term?: string}) {
  const {t} = useTranslation();

  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center border border-border">
        <SearchIcon className="w-10 h-10 text-text-muted" />
      </div>
      <h2 className="text-xl font-medium text-text mb-3">{t('search.noResults')}</h2>
      <p className="text-text-muted mb-8 max-w-md mx-auto">
        {term
          ? t('search.noResultsDescription', {term})
          : t('search.enterSearchTerm')}
      </p>
      <Link
        to="/collections/all"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 font-medium transition-colors"
      >
        {t('search.browseCollections')}
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
    </div>
  );
}

import {useFetcher, type Fetcher} from 'react-router';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {Image, Money} from '@shopify/hydrogen';
import React, {useRef, useEffect} from 'react';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
  type PredictiveSearchReturn,
} from '~/lib/search';
import {useAside} from '~/components/layout/Aside';
import {useTranslation} from 'react-i18next';

type PredictiveSearchItems = PredictiveSearchReturn['result']['items'];

type UsePredictiveSearchReturn = {
  term: React.MutableRefObject<string>;
  total: number;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  items: PredictiveSearchItems;
  fetcher: Fetcher<PredictiveSearchReturn>;
};

type SearchResultsPredictiveArgs = Pick<
  UsePredictiveSearchReturn,
  'term' | 'total' | 'inputRef' | 'items'
> & {
  state: Fetcher['state'];
  closeSearch: () => void;
};

type PartialPredictiveSearchResult<
  ItemType extends keyof PredictiveSearchItems,
  ExtraProps extends keyof SearchResultsPredictiveArgs = 'term' | 'closeSearch',
> = Pick<PredictiveSearchItems, ItemType> &
  Pick<SearchResultsPredictiveArgs, ExtraProps>;

type SearchResultsPredictiveProps = {
  children: (args: SearchResultsPredictiveArgs) => React.ReactNode;
};

/**
 * Component that renders predictive search results
 */
export function SearchResultsPredictive({
  children,
}: SearchResultsPredictiveProps) {
  const aside = useAside();
  const {term, inputRef, fetcher, total, items} = usePredictiveSearch();

  /*
   * Utility that resets the search input
   */
  function resetInput() {
    if (inputRef.current) {
      inputRef.current.blur();
      inputRef.current.value = '';
    }
  }

  /**
   * Utility that resets the search input and closes the search aside
   */
  function closeSearch() {
    resetInput();
    aside.close();
  }

  // eslint-disable-next-line react-hooks/refs -- passing ref object to children render prop, not reading ref value
  return children({
    items,
    closeSearch,
    inputRef,
    state: fetcher.state,
    term,
    total,
  });
}

SearchResultsPredictive.Articles = SearchResultsPredictiveArticles;
SearchResultsPredictive.Collections = SearchResultsPredictiveCollections;
SearchResultsPredictive.Pages = SearchResultsPredictivePages;
SearchResultsPredictive.Products = SearchResultsPredictiveProducts;
SearchResultsPredictive.Queries = SearchResultsPredictiveQueries;
SearchResultsPredictive.Empty = SearchResultsPredictiveEmpty;

function SearchResultsPredictiveArticles({
  term,
  articles,
  closeSearch,
}: PartialPredictiveSearchResult<'articles'>) {
  const {t} = useTranslation();

  if (!articles.length) return null;

  return (
    <div className="py-4" key="articles">
      <h5 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3 px-6">
        {t('search.articles')}
      </h5>
      <ul className="space-y-1">
        {articles.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.blog.handle}/${article.handle}`,
            trackingParams: article.trackingParameters,
            term: term.current ?? '',
          });

          return (
            <li key={article.id}>
              <Link
                onClick={closeSearch}
                to={articleUrl}
                className="flex items-center gap-4 px-6 py-3 hover:bg-surface-alt transition-colors duration-200"
              >
                {article.image?.url && (
                  <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-surface-alt">
                    <Image
                      alt={article.image.altText ?? ''}
                      src={article.image.url}
                      width={50}
                      height={50}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="block text-sm font-medium text-text truncate">
                    {article.title}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveCollections({
  term,
  collections,
  closeSearch,
}: PartialPredictiveSearchResult<'collections'>) {
  const {t} = useTranslation();

  if (!collections.length) return null;

  return (
    <div className="py-4 border-t border-border" key="collections">
      <h5 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3 px-6">
        {t('search.collections')}
      </h5>
      <ul className="space-y-1">
        {collections.map((collection) => {
          const collectionUrl = urlWithTrackingParams({
            baseUrl: `/collections/${collection.handle}`,
            trackingParams: collection.trackingParameters,
            term: term.current,
          });

          return (
            <li key={collection.id}>
              <Link
                onClick={closeSearch}
                to={collectionUrl}
                className="flex items-center gap-4 px-6 py-3 hover:bg-surface-alt transition-colors duration-200"
              >
                {collection.image?.url && (
                  <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-surface-alt">
                    <Image
                      alt={collection.image.altText ?? ''}
                      src={collection.image.url}
                      width={50}
                      height={50}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="block text-sm font-medium text-text truncate">
                    {collection.title}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictivePages({
  term,
  pages,
  closeSearch,
}: PartialPredictiveSearchResult<'pages'>) {
  const {t} = useTranslation();

  if (!pages.length) return null;

  return (
    <div className="py-4 border-t border-border" key="pages">
      <h5 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3 px-6">
        {t('search.pages')}
      </h5>
      <ul className="space-y-1">
        {pages.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term: term.current,
          });

          return (
            <li key={page.id}>
              <Link
                onClick={closeSearch}
                to={pageUrl}
                className="flex items-center gap-4 px-6 py-3 hover:bg-surface-alt transition-colors duration-200"
              >
                <div className="min-w-0">
                  <span className="block text-sm font-medium text-text truncate">
                    {page.title}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveProducts({
  term,
  products,
  closeSearch,
}: PartialPredictiveSearchResult<'products'>) {
  const {t} = useTranslation();

  if (!products.length) return null;

  return (
    <div className="py-4 border-t border-border" key="products">
      <h5 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3 px-6">
        {t('search.products')}
      </h5>
      <ul className="space-y-1">
        {products.map((product) => {
          const productUrl = urlWithTrackingParams({
            baseUrl: `/products/${product.handle}`,
            trackingParams: product.trackingParameters,
            term: term.current,
          });

          const price = product?.selectedOrFirstAvailableVariant?.price;
          const image = product?.selectedOrFirstAvailableVariant?.image;
          return (
            <li key={product.id}>
              <Link
                to={productUrl}
                onClick={closeSearch}
                className="flex items-center gap-4 px-6 py-3 hover:bg-surface-alt transition-colors duration-200"
              >
                {image && (
                  <div className="shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-surface-alt">
                    <Image
                      alt={image.altText ?? ''}
                      src={image.url}
                      width={50}
                      height={67}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {product.title}
                  </p>
                  <small className="text-sm text-text-muted">
                    {price && <Money data={price} />}
                  </small>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveQueries({
  queries,
  queriesDatalistId,
}: PartialPredictiveSearchResult<'queries', never> & {
  queriesDatalistId: string;
}) {
  if (!queries.length) return null;

  return (
    <datalist id={queriesDatalistId}>
      {queries.map((suggestion) => {
        if (!suggestion) return null;

        return <option key={suggestion.text} value={suggestion.text} />;
      })}
    </datalist>
  );
}

function SearchResultsPredictiveEmpty({
  term,
}: {
  term: React.MutableRefObject<string>;
}) {
  const {t} = useTranslation();

  if (!term.current) {
    return null;
  }

  return (
    <div className="px-6 py-8 text-center">
      <p className="text-text-muted">
        {t('search.noResultsFor', {term: term.current})}
      </p>
    </div>
  );
}

/**
 * Hook that returns the predictive search results and fetcher and input ref.
 * @example
 * '''ts
 * const { items, total, inputRef, term, fetcher } = usePredictiveSearch();
 * '''
 **/
function usePredictiveSearch(): UsePredictiveSearchReturn {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const term = useRef<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Update term when loading starts - must be in effect to avoid modifying ref during render
  useEffect(() => {
    if (fetcher?.state === 'loading') {
      term.current = String(fetcher.formData?.get('q') || '');
    }
  }, [fetcher?.state, fetcher?.formData]);

  // capture the search input element as a ref
  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector('input[type="search"]');
    }
  }, []);

  const {items, total} =
    fetcher?.data?.result ?? getEmptyPredictiveSearchResult();

  return {items, total, inputRef, term, fetcher};
}

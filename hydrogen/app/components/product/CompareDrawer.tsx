import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {useCompare, type CompareProduct} from '~/context/CompareContext';
import {cn} from '~/lib/cn';
import {CloseIcon, CompareIcon, ImageIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';

/**
 * CompareDrawer - Fixed bottom bar showing products being compared
 * Shows when at least 2 products are added for comparison
 */
export function CompareDrawer() {
  const {t} = useTranslation();
  const {products, removeProduct, clearAll} = useCompare();

  if (products.length < 2) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-4">
        <div className="flex items-center gap-4">
          {/* Product Thumbnails */}
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            {products.map((product) => (
              <CompareProductThumb
                key={product.id}
                product={product}
                onRemove={() => removeProduct(product.id)}
              />
            ))}
            {/* Empty slots */}
            {Array.from({length: 4 - products.length}, (_, i) => i + products.length).map((slotId) => (
              <div
                key={`empty-slot-${slotId}`}
                className="w-16 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center shrink-0"
              >
                <span className="text-text-muted text-xs">+</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-text-muted hidden sm:inline">
              {products.length} {t('product.compare.items')}
            </span>
            <button
              onClick={clearAll}
              className="text-sm text-text-muted hover:text-primary transition-colors"
            >
              {t('product.compare.clear')}
            </button>
            <Link
              to="/compare"
              className="px-6 py-2.5 bg-primary text-text-inverse rounded-md text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              {t('product.compare.compareNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareProductThumb({
  product,
  onRemove,
}: {
  product: CompareProduct;
  onRemove: () => void;
}) {
  const {t} = useTranslation();

  return (
    <div className="relative w-16 h-20 shrink-0 group">
      <div className="w-full h-full rounded-lg overflow-hidden border border-border bg-surface-alt">
        {product.featuredImage?.url ? (
          <Image
            data={{
              url: product.featuredImage.url,
              altText: product.featuredImage.altText || product.title,
            }}
            className="w-full h-full object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <button
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-text-inverse rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={t('product.compare.removeProductFromComparison', {productTitle: product.title})}
      >
        <CloseIcon className="w-3 h-3" strokeWidth={2} />
      </button>
    </div>
  );
}

/**
 * CompareButton - Add to compare button for product cards
 */
export function CompareButton({
  product,
  className,
  variant = 'icon',
}: {
  product: CompareProduct;
  className?: string;
  variant?: 'icon' | 'text';
}) {
  const {t} = useTranslation();
  const {addProduct, removeProduct, isInCompare, canAdd} = useCompare();
  const isComparing = isInCompare(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isComparing) {
      removeProduct(product.id);
    } else if (canAdd) {
      addProduct(product);
    }
  };

  if (variant === 'text') {
    return (
      <button
        onClick={handleClick}
        disabled={!isComparing && !canAdd}
        className={cn(
          'flex items-center gap-2 text-sm transition-colors',
          isComparing
            ? 'text-primary font-medium'
            : 'text-text-secondary hover:text-primary',
          !canAdd && !isComparing && 'opacity-50 cursor-not-allowed',
          className,
        )}
        aria-label={isComparing ? t('product.compare.removeFromComparison') : t('product.compare.addToComparison')}
      >
        <CompareIcon className="w-4 h-4" filled={isComparing} />
        {isComparing ? t('product.compare.inCompare') : t('product.compare.compare')}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isComparing && !canAdd}
      className={cn(
        'w-9 h-9 flex items-center justify-center rounded-full transition-all',
        isComparing
          ? 'bg-primary text-text-inverse'
          : 'bg-surface/80 backdrop-blur-sm text-text-secondary hover:bg-surface hover:text-primary',
        !canAdd && !isComparing && 'opacity-50 cursor-not-allowed',
        className,
      )}
      aria-label={isComparing ? t('product.compare.removeFromComparison') : t('product.compare.addToComparison')}
    >
      <CompareIcon className="w-4 h-4" filled={isComparing} />
    </button>
  );
}


/**
 * ComparePage - Full comparison view
 */
export function ComparePageContent() {
  const {t} = useTranslation();
  const {products, removeProduct, clearAll} = useCompare();

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-alt flex items-center justify-center">
          <CompareIcon className="w-10 h-10 text-text-muted" />
        </div>
        <h2 className="font-display text-2xl mb-3">{t('product.compare.emptyTitle')}</h2>
        <p className="text-text-secondary mb-6">
          {t('product.compare.emptyDescription')}
        </p>
        <Link
          to="/collections/all"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-text-inverse rounded-md font-medium hover:bg-primary-hover transition-colors"
        >
          {t('product.compare.browseProducts')}
        </Link>
      </div>
    );
  }

  // Get all unique attribute keys from all products
  const allOptions = new Set<string>();
  products.forEach((p) => {
    p.options?.forEach((opt) => allOptions.add(opt.name));
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-2">{t('product.compare.title')}</h1>
          <p className="text-text-secondary">
            {t('product.compare.comparing')} {products.length} {t('product.compare.products')}
          </p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-text-muted hover:text-primary transition-colors"
        >
          {t('product.compare.clearAll')}
        </button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="w-32 p-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                {t('product.compare.attribute')}
              </th>
              {products.map((product) => (
                <th key={product.id} className="p-4 text-center">
                  <CompareProductCard product={product} onRemove={() => removeProduct(product.id)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* Price Row */}
            <tr>
              <td className="p-4 text-sm font-medium text-text-muted">{t('product.compare.price')}</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <Money
                    data={product.priceRange.minVariantPrice as MoneyV2}
                    className="font-medium"
                  />
                  {product.compareAtPriceRange?.minVariantPrice &&
                    parseFloat(product.compareAtPriceRange.minVariantPrice.amount) >
                      parseFloat(product.priceRange.minVariantPrice.amount) && (
                      <Money
                        data={product.compareAtPriceRange.minVariantPrice as MoneyV2}
                        className="text-sm text-text-muted line-through ml-2"
                      />
                    )}
                </td>
              ))}
            </tr>

            {/* Vendor Row */}
            <tr>
              <td className="p-4 text-sm font-medium text-text-muted">{t('product.compare.brand')}</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center text-sm">
                  {product.vendor || '-'}
                </td>
              ))}
            </tr>

            {/* Option Rows */}
            {Array.from(allOptions).map((optionName) => (
              <tr key={optionName}>
                <td className="p-4 text-sm font-medium text-text-muted">{optionName}</td>
                {products.map((product) => {
                  const option = product.options?.find((o) => o.name === optionName);
                  return (
                    <td key={product.id} className="p-4 text-center text-sm">
                      {option?.values.join(', ') || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Description Row */}
            <tr>
              <td className="p-4 text-sm font-medium text-text-muted">{t('product.compare.description')}</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-sm text-text-secondary">
                  <p className="line-clamp-3">
                    {product.description || t('product.noDescriptionAvailable')}
                  </p>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompareProductCard({
  product,
  onRemove,
}: {
  product: CompareProduct;
  onRemove: () => void;
}) {
  const {t} = useTranslation();

  return (
    <div className="relative max-w-[200px] mx-auto">
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center hover:bg-surface-hover transition-colors z-10"
        aria-label={t('product.compare.removeProduct', {productTitle: product.title})}
      >
        <CloseIcon className="w-3.5 h-3.5" strokeWidth={2} />
      </button>

      <Link to={`/products/${product.handle}`} className="block group">
        <div className="aspect-3/4 mb-3 rounded-lg overflow-hidden bg-surface-alt">
          {product.featuredImage?.url ? (
            <Image
              data={{
                url: product.featuredImage.url,
                altText: product.featuredImage.altText || product.title,
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <ImageIcon className="w-12 h-12" strokeWidth={1.5} />
            </div>
          )}
        </div>
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
      </Link>
    </div>
  );
}

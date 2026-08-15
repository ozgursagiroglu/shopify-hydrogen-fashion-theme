import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {Badge} from '~/components/ui/Badge';
import {IconButton} from '~/components/ui/IconButton';
import {Money, Image} from '@shopify/hydrogen';
import type {Route} from './+types/($locale).wishlist';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {useWishlist} from '~/context/WishlistContext';
import {HeartIcon, CloseIcon, ArrowLeftIcon, ArrowRightIcon} from '~/components/icons';
import {buildPageTitle} from '~/lib/seo';
import {useTranslation} from 'react-i18next';

export const meta: Route.MetaFunction = ({matches}) => {
  return [
    {title: buildPageTitle('Wishlist', matches)},
    {name: 'description', content: 'Your saved items'},
  ];
};

export default function WishlistPage() {
  const {items, removeItem, clearWishlist} = useWishlist();
  const {t} = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-surface-alt py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight text-text text-center">
            {t('wishlist.title')}
          </h1>
          <p className="text-text-muted text-center mt-2">
            {t('wishlist.itemsSaved', {count: items.length})}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            {/* Actions Bar */}
            <div className="flex items-center justify-end mb-6">
              <button
                onClick={clearWishlist}
                className="text-sm text-text-muted hover:text-red-600 transition-colors"
              >
                {t('wishlist.clearAll')}
              </button>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((item) => (
                <WishlistItem
                  key={item.handle}
                  item={item}
                  onRemove={() => removeItem(item.handle)}
                />
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="text-center mt-12 pt-8 border-t border-border">
              <Link
                to="/collections/all"
                className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                {t('cart.continueShopping')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyWishlist() {
  const {t} = useTranslation();

  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center border border-border">
        <HeartIcon className="w-10 h-10 text-text-muted" />
      </div>
      <h2 className="text-xl font-medium text-text mb-3">
        {t('wishlist.emptyTitle')}
      </h2>
      <p className="text-text-muted mb-8 max-w-md mx-auto">
        {t('wishlist.emptyDescription')}
      </p>
      <Link
        to="/collections/all"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 font-medium transition-colors"
      >
        {t('cart.startShopping')}
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
    </div>
  );
}

interface WishlistItemProps {
  item: {
    handle: string;
    title: string;
    vendor?: string;
    image?: {
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    } | null;
    price: {
      amount: string;
      currencyCode: string;
    };
    compareAtPrice?: {
      amount: string;
      currencyCode: string;
    } | null;
  };
  onRemove: () => void;
}

function WishlistItem({item, onRemove}: WishlistItemProps) {
  const hasDiscount = item.compareAtPrice &&
    parseFloat(item.compareAtPrice.amount) > parseFloat(item.price.amount);
  const {t} = useTranslation();

  return (
    <div className="group relative bg-surface border border-border rounded-lg overflow-hidden hover:border-text/20 transition-colors">
      {/* Remove Button */}
      <IconButton
        onClick={onRemove}
        variant="ghost"
        size="md"
        label={t('wishlist.removeItem', {title: item.title})}
        className="absolute top-3 right-3 z-10 bg-surface/90 backdrop-blur-sm border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600"
      >
        <CloseIcon className="w-4 h-4" />
      </IconButton>

      {/* Sale Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="sale">{t('product.sale')}</Badge>
        </div>
      )}

      {/* Image */}
      <Link
        to={`/products/${item.handle}`}
        className="block aspect-3/4 relative bg-surface-alt overflow-hidden"
      >
        {item.image?.url ? (
          <Image
            data={{
              url: item.image.url,
              altText: item.image.altText || item.title,
              width: item.image.width,
              height: item.image.height,
            }}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-text-muted text-sm">{t('misc.noImage')}</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        {item.vendor && (
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
            {item.vendor}
          </p>
        )}
        <Link
          to={`/products/${item.handle}`}
          className="block font-medium text-text hover:text-accent transition-colors line-clamp-2 mb-2 min-h-10"
        >
          {item.title}
        </Link>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${hasDiscount ? 'text-red-600' : 'text-text'}`}>
            <Money
              data={{
                amount: item.price.amount,
                currencyCode: item.price.currencyCode as CurrencyCode,
              }}
            />
          </span>
          {hasDiscount && item.compareAtPrice && (
            <span className="text-sm text-text-muted line-through">
              <Money
                data={{
                  amount: item.compareAtPrice.amount,
                  currencyCode: item.compareAtPrice.currencyCode as CurrencyCode,
                }}
              />
            </span>
          )}
        </div>

        {/* View Product Button */}
        <Link
          to={`/products/${item.handle}`}
          className="mt-4 block w-full py-2.5 text-center text-sm font-medium border border-border rounded-md text-text hover:bg-surface-alt transition-colors"
        >
          {t('wishlist.viewProduct')}
        </Link>
      </div>
    </div>
  );
}

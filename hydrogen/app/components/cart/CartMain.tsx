import {useOptimisticCart} from '@shopify/hydrogen';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/layout/Aside';
import {CartLineItem} from '~/components/cart/CartLineItem';
import {CartSummary} from './CartSummary';
import {CartIcon, ArrowLeftIcon, ArrowRightIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const {t} = useTranslation();

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const isPage = layout === 'page';

  return (
    <div
      className={
        isPage
          ? 'max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'
          : 'flex flex-col h-full'
      }
    >
      <CartEmpty hidden={linesCount} layout={layout} />
      {cartHasItems && (
        <div
          className={
            isPage
              ? 'grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'
              : 'flex flex-col h-full'
          }
        >
          {/* Cart Items */}
          <div className={isPage ? 'lg:col-span-2' : 'flex-1 overflow-y-auto'}>
            {isPage && (
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <h2 className="font-medium text-text">{t('cart.yourBag')}</h2>
                <span className="text-sm text-text-muted">
                  {t('collection.productCount', {count: cart?.totalQuantity ?? 0})}
                </span>
              </div>
            )}
            <ul
              className={
                isPage
                  ? 'divide-y divide-border'
                  : 'divide-y divide-border px-6'
              }
            >
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>

            {/* Continue Shopping Link - Page Layout Only */}
            {isPage && (
              <div className="mt-8 pt-6 border-t border-border">
                <Link
                  to="/collections/all"
                  className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  {t('cart.continueShopping')}
                </Link>
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <CartSummary cart={cart} layout={layout} />
        </div>
      )}
    </div>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  const {t} = useTranslation();
  const isPage = layout === 'page';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${isPage ? 'py-16 px-4' : 'py-12 px-6'}`}
      hidden={hidden}
    >
      <div
        className={`rounded-full bg-surface flex items-center justify-center border border-border ${isPage ? 'w-20 h-20 mb-6' : 'w-16 h-16 mb-4'}`}
      >
        <CartIcon
          className={`text-text-muted ${isPage ? 'w-10 h-10' : 'w-8 h-8'}`}
        />
      </div>
      <h2
        className={`font-medium text-text ${isPage ? 'text-xl mb-3' : 'text-lg mb-2'}`}
      >
        {t('cart.empty')}
      </h2>
      <p
        className={`text-text-muted max-w-md mx-auto ${isPage ? 'mb-8' : 'text-sm mb-6 max-w-xs'}`}
      >
        {t('cart.emptyDescription')}
      </p>
      <Link
        to="/collections/all"
        onClick={close}
        prefetch="viewport"
        className={`inline-flex items-center justify-center gap-2 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors ${isPage ? 'px-6 py-3' : 'px-5 py-2.5 text-sm'}`}
      >
        {t('common.shopNow')}
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
    </div>
  );
}


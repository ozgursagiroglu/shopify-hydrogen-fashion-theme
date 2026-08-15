import {useState, useEffect, useRef} from 'react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/cart/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useFetcher, type FetcherWithComponents} from 'react-router';
import {cn} from '~/lib/cn';
import {
  LockClosedIcon,
  ArrowRightIcon,
  TagIcon,
  CloseIcon,
  ChevronDownIcon,
  GiftIcon,
} from '~/components/icons';
import {ScreenReaderAnnouncement} from '~/components/ui/ScreenReaderAnnouncement';
import {useTranslation} from 'react-i18next';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const {t} = useTranslation();
  const isPage = layout === 'page';

  return (
    <div
      aria-labelledby="cart-summary"
      className={cn(
        'bg-surface',
        isPage
          ? 'lg:sticky lg:top-24 p-6 rounded-lg border border-border'
          : 'mt-auto border-t border-border p-6'
      )}
    >
      {/* Promo Code Section */}
      <PromoCodeSection discountCodes={cart?.discountCodes} />

      {/* Gift Card Section */}
      <CartGiftCard giftCardCodes={cart?.appliedGiftCards} />

      {/* Order Summary */}
      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">{t('cart.subtotal')}</span>
          <span className="font-medium text-text">
            {cart?.cost?.subtotalAmount?.amount ? (
              <Money data={cart?.cost?.subtotalAmount} />
            ) : (
              '–'
            )}
          </span>
        </div>

        {cart?.cost?.totalTaxAmount?.amount && parseFloat(cart.cost.totalTaxAmount.amount) > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{t('cart.taxes')}</span>
            <span className="font-medium text-text">
              <Money data={cart.cost.totalTaxAmount} />
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">{t('cart.shipping')}</span>
          <span className="text-text-muted text-xs">{t('cart.calculatedAtCheckout')}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-base font-semibold text-text">{t('cart.total')}</span>
          <span className="text-lg font-semibold text-text">
            {cart?.cost?.totalAmount?.amount ? (
              <Money data={cart?.cost?.totalAmount} />
            ) : (
              '–'
            )}
          </span>
        </div>
      </div>

      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />

      <p className="flex items-center justify-center gap-2 mt-4 text-xs text-text-muted">
        <LockClosedIcon className="w-3.5 h-3.5" strokeWidth={2} />
        <span>{t('cart.secureCheckout')}</span>
      </p>
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  const {t} = useTranslation();
  if (!checkoutUrl) return null;

  return (
    <a
      href={checkoutUrl}
      target="_self"
      className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-semibold rounded-md hover:bg-primary-light transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <span>{t('cart.proceedToCheckout')}</span>
      <ArrowRightIcon className="w-4.5 h-4.5" strokeWidth={2} />
    </a>
  );
}

function PromoCodeSection({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const {t} = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  const hasAppliedCodes = codes.length > 0;

  return (
    <div className="space-y-3">
      {/* Applied Codes */}
      {hasAppliedCodes && (
        <div className="flex flex-wrap gap-2">
          {codes.map((code) => (
            <UpdateDiscountForm
              key={code}
              onUpdate={(removed) => {
                if (removed) {
                  setAnnouncement(t('cart.announcements.promoCodeRemoved', {code}));
                }
              }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm">
                <TagIcon className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="font-medium">{code}</span>
                <button
                  type="submit"
                  className="hover:text-accent-dark transition-colors duration-200"
                  aria-label="Remove code"
                >
                  <CloseIcon className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </UpdateDiscountForm>
          ))}
        </div>
      )}

      {/* Add Promo Code Toggle */}
      {!hasAppliedCodes && (
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span>{t('cart.addPromoCode')}</span>
          <ChevronDownIcon
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
            strokeWidth={2}
          />
        </button>
      )}

      {/* Promo Code Input */}
      {(isExpanded || hasAppliedCodes) && (
        <UpdateDiscountForm
          discountCodes={codes}
          onUpdate={(removed, newCode) => {
            if (!removed && newCode) {
              setAnnouncement(t('cart.announcements.promoCodeApplied', {code: newCode}));
            }
          }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              name="discountCode"
              placeholder={t('cart.enterCode')}
              className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-md text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-all duration-200"
            >
              {t('cart.applyPromo')}
            </button>
          </div>
        </UpdateDiscountForm>
      )}
      {announcement && (
        <ScreenReaderAnnouncement message={announcement} politeness="polite" />
      )}
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
  onUpdate,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
  onUpdate?: (removed: boolean, newCode?: string) => void;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => (
        <DiscountFormWrapper
          fetcher={fetcher}
          discountCodes={discountCodes}
          onUpdate={onUpdate}
        >
          {children}
        </DiscountFormWrapper>
      )}
    </CartForm>
  );
}

// Wrapper component to handle discount form state tracking
function DiscountFormWrapper({
  fetcher,
  discountCodes,
  onUpdate,
  children,
}: {
  fetcher: FetcherWithComponents<any>;
  discountCodes?: string[];
  onUpdate?: (removed: boolean, newCode?: string) => void;
  children: React.ReactNode;
}) {
  const prevCodesRef = useRef<string[]>(discountCodes || []);
  const prevStateRef = useRef(fetcher.state);

  useEffect(() => {
    const formDataCode = fetcher.formData?.get('discountCode') as string | null;

    // Track when form submission completes
    if (prevStateRef.current === 'submitting' && fetcher.state === 'idle' && onUpdate) {
      const currentCodes = discountCodes || [];
      const prevCodes = prevCodesRef.current;

      // Check if a code was removed
      if (prevCodes.length > currentCodes.length) {
        onUpdate(true);
      }
      // Check if a code was added
      else if (formDataCode && currentCodes.length > prevCodes.length) {
        onUpdate(false, formDataCode);
      }

      prevCodesRef.current = currentCodes;
    }

    prevStateRef.current = fetcher.state;
  }, [fetcher.state, fetcher.formData, discountCodes, onUpdate]);

  return <>{children}</>;
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const {t} = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [appliedGiftCardCodes, setAppliedGiftCardCodes] = useState<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});

  const hasAppliedGiftCards = giftCardCodes && giftCardCodes.length > 0;

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, '');
    setAppliedGiftCardCodes((prev) =>
      prev.includes(formattedCode) ? prev : [...prev, formattedCode]
    );
  }

  return (
    <div className="space-y-3 pt-4">
      {/* Applied Gift Cards */}
      {hasAppliedGiftCards && (
        <div className="flex flex-wrap gap-2">
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm
              key={giftCard.id}
              giftCardId={giftCard.id}
              onRemove={() => setAnnouncement(t('cart.announcements.giftCardRemoved', {lastCharacters: giftCard.lastCharacters}))}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm">
                <GiftIcon className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="font-medium">
                  ***{giftCard.lastCharacters} (−<Money data={giftCard.amountUsed} />)
                </span>
                <button
                  type="submit"
                  className="hover:text-accent-dark transition-colors duration-200"
                  aria-label="Remove gift card"
                >
                  <CloseIcon className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </RemoveGiftCardForm>
          ))}
        </div>
      )}

      {/* Add Gift Card Toggle */}
      {!hasAppliedGiftCards && (
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span>{t('cart.addGiftCard')}</span>
          <ChevronDownIcon
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
            strokeWidth={2}
          />
        </button>
      )}

      {/* Gift Card Input */}
      {(isExpanded || hasAppliedGiftCards) && (
        <UpdateGiftCardForm
          giftCardCodes={appliedGiftCardCodes}
          saveAppliedCode={saveAppliedCode}
          fetcherKey="gift-card-add"
          onUpdate={(code) => setAnnouncement(t('cart.announcements.giftCardApplied', {code}))}
        >
          <div className="flex gap-2">
            <input
              type="text"
              name="giftCardCode"
              placeholder={t('cart.enterGiftCardCode')}
              ref={giftCardCodeInput}
              className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-md text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
            <button
              type="submit"
              disabled={giftCardAddFetcher.state !== 'idle'}
              className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {t('cart.applyPromo')}
            </button>
          </div>
        </UpdateGiftCardForm>
      )}
      {announcement && (
        <ScreenReaderAnnouncement message={announcement} politeness="polite" />
      )}
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  fetcherKey,
  children,
  onUpdate,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  fetcherKey?: string;
  children: React.ReactNode;
  onUpdate?: (code: string) => void;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return (
          <GiftCardFormWrapper fetcher={fetcher} onUpdate={onUpdate}>
            {children}
          </GiftCardFormWrapper>
        );
      }}
    </CartForm>
  );
}

// Wrapper component to handle gift card form state tracking
function GiftCardFormWrapper({
  fetcher,
  onUpdate,
  children,
}: {
  fetcher: FetcherWithComponents<any>;
  onUpdate?: (code: string) => void;
  children: React.ReactNode;
}) {
  const prevStateRef = useRef(fetcher.state);

  useEffect(() => {
    const code = fetcher.formData?.get('giftCardCode') as string | null;

    // Announce when gift card is successfully applied
    if (prevStateRef.current === 'submitting' && fetcher.state === 'idle' && onUpdate && code) {
      onUpdate(code);
    }

    prevStateRef.current = fetcher.state;
  }, [fetcher.state, fetcher.formData, onUpdate]);

  return <>{children}</>;
}

function RemoveGiftCardForm({
  giftCardId,
  children,
  onRemove,
}: {
  giftCardId: string;
  children: React.ReactNode;
  onRemove?: () => void;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => (
        <GiftCardRemoveWrapper fetcher={fetcher} onRemove={onRemove}>
          {children}
        </GiftCardRemoveWrapper>
      )}
    </CartForm>
  );
}

// Wrapper component for gift card removal state tracking
function GiftCardRemoveWrapper({
  fetcher,
  onRemove,
  children,
}: {
  fetcher: FetcherWithComponents<any>;
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  const prevStateRef = useRef(fetcher.state);

  useEffect(() => {
    // Announce when removal completes successfully
    if (prevStateRef.current === 'submitting' && fetcher.state === 'idle' && onRemove) {
      onRemove();
    }

    prevStateRef.current = fetcher.state;
  }, [fetcher.state, onRemove]);

  return <>{children}</>;
}

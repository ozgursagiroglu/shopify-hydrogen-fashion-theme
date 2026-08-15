import {useState, useEffect} from 'react';
import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/cart/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {type FetcherWithComponents} from 'react-router';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {ProductPrice} from '~/components/product/ProductPrice';
import {useAside} from '~/components/layout/Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CloseIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';
import {ScreenReaderAnnouncement} from '~/components/ui/ScreenReaderAnnouncement';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  return (
    <li key={id} className="flex gap-4 py-4">
      {image && (
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => {
            if (layout === 'aside') {
              close();
            }
          }}
          className="shrink-0 rounded-lg overflow-hidden bg-surface-alt"
        >
          <Image
            alt={title}
            aspectRatio="3/4"
            data={image}
            height={120}
            loading="lazy"
            width={90}
          />
        </Link>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
            className="text-sm font-medium text-text hover:text-accent transition-colors duration-200 line-clamp-2"
          >
            {product.title}
          </Link>
          <CartLineRemoveButton lineIds={[id]} disabled={!!line.isOptimistic} />
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          {selectedOptions.map((option) => (
            <span key={option.name} className="text-xs text-text-muted">
              {option.name}: {option.value}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3">
          <CartLineQuantity line={line} />
          <ProductPrice price={line?.cost?.totalAmount} />
        </div>
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  const {t} = useTranslation();
  const [announcement, setAnnouncement] = useState('');

  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center border border-border rounded-md">
      <CartLineUpdateButton
        lines={[{id: lineId, quantity: prevQuantity}]}
        onUpdate={(newQuantity) => {
          if (newQuantity === 0) {
            setAnnouncement(t('cart.announcements.itemRemoved'));
          } else {
            setAnnouncement(t('cart.announcements.quantityUpdated', {quantity: newQuantity}));
          }
        }}
      >
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
          className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
        >
          −
        </button>
      </CartLineUpdateButton>
      <span className="w-8 text-center text-sm font-medium text-text">{quantity}</span>
      <CartLineUpdateButton
        lines={[{id: lineId, quantity: nextQuantity}]}
        onUpdate={(newQuantity) => setAnnouncement(t('cart.announcements.quantityUpdated', {quantity: newQuantity}))}
      >
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
          className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
        >
          +
        </button>
      </CartLineUpdateButton>
      {announcement && (
        <ScreenReaderAnnouncement message={announcement} politeness="polite" />
      )}
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  const {t} = useTranslation();
  const [announcement, setAnnouncement] = useState('');

  return (
    <>
      <CartForm
        fetcherKey={getUpdateKey(lineIds)}
        route="/cart"
        action={CartForm.ACTIONS.LinesRemove}
        inputs={{lineIds}}
      >
        {(fetcher: FetcherWithComponents<any>) => (
          <CartLineRemoveWrapper
            fetcher={fetcher}
            onRemove={() => setAnnouncement(t('cart.announcements.itemRemoved'))}
          >
            <button
              disabled={disabled}
              type="submit"
              className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Remove item"
            >
              <CloseIcon className="w-4 h-4" strokeWidth={2} />
            </button>
          </CartLineRemoveWrapper>
        )}
      </CartForm>
      {announcement && (
        <ScreenReaderAnnouncement message={announcement} politeness="polite" />
      )}
    </>
  );
}

// Wrapper component for remove button state tracking
function CartLineRemoveWrapper({
  fetcher,
  onRemove,
  children,
}: {
  fetcher: FetcherWithComponents<any>;
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  const prevState = usePrevious(fetcher.state);

  useEffect(() => {
    // Announce when removal completes successfully
    if (prevState === 'submitting' && fetcher.state === 'idle' && onRemove) {
      onRemove();
    }
  }, [fetcher.state, prevState, onRemove]);

  return <>{children}</>;
}

function CartLineUpdateButton({
  children,
  lines,
  onUpdate,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
  onUpdate?: (newQuantity: number) => void;
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {(fetcher: FetcherWithComponents<any>) => (
        <CartLineUpdateWrapper fetcher={fetcher} lines={lines} onUpdate={onUpdate}>
          {children}
        </CartLineUpdateWrapper>
      )}
    </CartForm>
  );
}

// Wrapper component to handle state tracking with hooks
function CartLineUpdateWrapper({
  fetcher,
  lines,
  onUpdate,
  children,
}: {
  fetcher: FetcherWithComponents<any>;
  lines: CartLineUpdateInput[];
  onUpdate?: (newQuantity: number) => void;
  children: React.ReactNode;
}) {
  const prevState = usePrevious(fetcher.state);

  useEffect(() => {
    // Announce when update completes successfully
    if (prevState === 'submitting' && fetcher.state === 'idle' && onUpdate) {
      const newQuantity = lines[0]?.quantity ?? 0;
      onUpdate(newQuantity);
    }
  }, [fetcher.state, prevState, lines, onUpdate]);

  return <>{children}</>;
}

// Hook to track previous value - uses state to avoid accessing refs during render
function usePrevious<T>(value: T): T | undefined {
  const [state, setState] = useState<{current: T; previous: T | undefined}>({
    current: value,
    previous: undefined,
  });

  // Update state synchronously during render when value changes
  // This is the recommended pattern for derived state from props
  if (state.current !== value) {
    setState({current: value, previous: state.current});
  }

  return state.previous;
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

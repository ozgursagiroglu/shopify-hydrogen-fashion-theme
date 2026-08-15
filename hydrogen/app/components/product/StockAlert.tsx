import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '~/components/ui/Button';
import {BellIcon} from '~/components/icons';
import {StockAlertModal} from './StockAlertModal';

export interface StockAlertProps {
  productTitle: string;
  variantTitle?: string;
  productHandle: string;
  variantId?: string;
  className?: string;
}

/**
 * StockAlert - Stock notification button with modal
 *
 * Premium fashion e-commerce pattern - clean, focused UX
 * Opens an elegant modal for email subscription to back-in-stock alerts
 *
 * @example
 * ```tsx
 * <StockAlert
 *   productTitle="Silk Midi Dress"
 *   variantTitle="Black / M"
 *   productHandle="silk-midi-dress"
 *   variantId="gid://shopify/ProductVariant/123"
 * />
 * ```
 */
export function StockAlert({
  productTitle,
  variantTitle,
  productHandle,
  variantId,
  className,
}: StockAlertProps) {
  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        variant="primary"
        leftIcon={<BellIcon className="w-5 h-5" strokeWidth={1.5} />}
        className={className}
      >
        {t('product.stockAlert.notifyWhenAvailable')}
      </Button>

      <StockAlertModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productTitle={productTitle}
        variantTitle={variantTitle}
        productHandle={productHandle}
        variantId={variantId}
      />
    </>
  );
}

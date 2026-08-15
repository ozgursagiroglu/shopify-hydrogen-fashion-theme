import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal} from '~/components/ui';
import {Input} from '~/components/ui/Input';
import {Button} from '~/components/ui/Button';
import {BellIcon, CheckIcon} from '~/components/icons';
import {useStockAlert} from '~/hooks/useStockAlert';
import {cn} from '~/lib/cn';
import {TIMING} from '~/lib/constants';

export interface StockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  variantTitle?: string;
  productHandle: string;
  variantId?: string;
}

/**
 * StockAlertModal - Premium stock notification modal
 *
 * ada ÉLAN Premium Fashion Design:
 * - Editorial typography with Cormorant Garamond display font
 * - Generous whitespace and breathing room
 * - Black & white button system (buttons are NEVER colored)
 * - Subtle success state with minimal green accent
 * - Magazine-quality layout, minimal UI
 */
export function StockAlertModal({
  isOpen,
  onClose,
  productTitle,
  variantTitle,
  productHandle,
  variantId,
}: StockAlertModalProps) {
  const {t} = useTranslation();
  const {email, setEmail, status, errorMessage, subscribe, reset, isLoading} =
    useStockAlert();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await subscribe({
      productTitle,
      variantTitle,
      productHandle,
      variantId,
    });
  };

  const handleClose = () => {
    onClose();
    // Reset state after modal transition completes
    setTimeout(() => {
      reset();
    }, TIMING.MODAL_TRANSITION_MS);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title={
        status === 'success'
          ? t('product.stockAlert.success')
          : t('product.stockAlert.getNotified')
      }
    >
      {status === 'success' ? (
        /* ============================================
           SUCCESS STATE - Editorial minimalism with warm tones
           ============================================ */
        <div className="text-center py-8">
          {/* Success Icon - Warm background */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-surface-alt border border-border flex items-center justify-center">
            <CheckIcon className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>

          {/* Success Message - Editorial Typography */}
          <p className="text-text-secondary text-base leading-relaxed mb-10 max-w-md mx-auto">
            {t('product.stockAlert.successMessage')}{' '}
            <span className="font-semibold text-primary">{productTitle}</span>
            {variantTitle && (
              <span className="text-text-muted"> ({variantTitle})</span>
            )}{' '}
            {t('product.stockAlert.backInStock')}
          </p>

          {/* Black button - ada ÉLAN style */}
          <Button
            type="button"
            onClick={handleClose}
            variant="primary"
            size="lg"
            className="min-w-[200px]"
          >
            {t('cart.continueShopping')}
          </Button>
        </div>
      ) : (
        /* ============================================
           FORM STATE - Editorial luxury with warm background
           ============================================ */
        <div className="space-y-8">
          {/* Subtitle */}
          <p className="text-text-secondary text-base leading-relaxed">
            {t('product.stockAlert.subtitle')}
          </p>

          {/* Product Info - Warm card */}
          <div className="p-5 rounded-lg bg-surface-alt border border-border">
            <p className="font-medium text-xs tracking-wider uppercase text-text-muted mb-2">
              Product
            </p>
            <p className="text-base font-medium text-primary">{productTitle}</p>
            {variantTitle && (
              <p className="text-sm text-text-muted mt-1">{variantTitle}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
            <div>
              <label
                htmlFor="stock-alert-email"
                className="block text-sm font-medium mb-3 text-primary"
              >
                {t('product.stockAlert.emailAddress')}
              </label>
              <Input
                id="stock-alert-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('product.stockAlert.emailPlaceholder')}
                className={cn(
                  'h-12 text-base w-full',
                  errorMessage && 'border-error focus:border-error',
                )}
                required
              />
              {errorMessage && (
                <p className="text-error text-sm mt-3">{errorMessage}</p>
              )}
            </div>

            {/* Black button - ada ÉLAN style */}
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              fullWidth
              size="lg"
              loading={isLoading}
              leftIcon={
                !isLoading ? (
                  <BellIcon className="w-5 h-5" strokeWidth={1.5} />
                ) : undefined
              }
            >
              {isLoading
                ? t('product.stockAlert.signingUp')
                : t('product.stockAlert.notifyMe')}
            </Button>

            {/* Privacy Notice */}
            <p className="text-xs text-text-muted text-center leading-relaxed">
              {t('product.stockAlert.privacyNotice')}
            </p>
          </form>
        </div>
      )}
    </Modal>
  );
}

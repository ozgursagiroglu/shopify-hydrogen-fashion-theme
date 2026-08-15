import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {useTranslation} from 'react-i18next';
import {PackageIcon, ArrowRightIcon} from '~/components/icons';
import {RTLIcon} from '~/components/icons/RTLIcon';
import {Button} from '~/components/ui/Button';

interface EmptyOrdersProps {
  hasFilters?: boolean;
}

export function EmptyOrders({hasFilters = false}: EmptyOrdersProps) {
  const {t} = useTranslation();

  return (
    <div className="text-center py-16 px-4 bg-surface-alt rounded-lg">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
        <PackageIcon className="w-8 h-8 text-text-muted" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="text-lg font-medium text-text mb-2">{t('account.noOrdersFound')}</h3>
          <p className="text-text-muted mb-4">
            {t('account.noOrdersMatchCriteria')}
          </p>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
          >
            {t('account.clearFilters')}
            <RTLIcon icon={ArrowRightIcon} className="w-4 h-4" />
          </Link>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-text mb-2">{t('account.noOrdersYet')}</h3>
          <p className="text-text-muted mb-4">
            {t('account.ordersWillAppearHere')}
          </p>
          <Button
            as="link"
            to="/collections/all"
            variant="primary"
            rightIcon={<RTLIcon icon={ArrowRightIcon} className="w-4 h-4" />}
          >
            {t('account.startShopping')}
          </Button>
        </>
      )}
    </div>
  );
}

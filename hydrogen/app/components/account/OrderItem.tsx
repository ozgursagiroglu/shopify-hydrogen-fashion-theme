import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {Money, flattenConnection} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import type {OrderItemFragment} from 'customer-accountapi.generated';
import {ArrowRightIcon} from '~/components/icons';
import {OrderStatusBadge} from './OrderStatusBadge';

interface OrderItemProps {
  order: OrderItemFragment;
}

export function OrderItem({order}: OrderItemProps) {
  const {t, i18n} = useTranslation();
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const orderDate = new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(order.processedAt));

  return (
    <div className="p-4 md:p-6 bg-surface border border-border rounded-lg hover:border-text/20 transition-colors mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Order Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              to={`/account/orders/${btoa(order.id)}`}
              className="text-lg font-medium text-text hover:text-accent transition-colors"
            >
              {t('account.orderNumber')}{order.number}
            </Link>
            <OrderStatusBadge status={order.financialStatus} />
          </div>
          <p className="text-sm text-text-muted">{orderDate}</p>
          {order.confirmationNumber && (
            <p className="text-sm text-text-muted">
              {t('account.confirmation')}: {order.confirmationNumber}
            </p>
          )}
        </div>

        {/* Order Total & Fulfillment */}
        <div className="flex items-center gap-6">
          {fulfillmentStatus && (
            <div className="text-sm">
              <span className="text-text-muted">{t('account.status')}: </span>
              <span className="text-text font-medium capitalize">
                {fulfillmentStatus.toLowerCase().replace(/_/g, ' ')}
              </span>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm text-text-muted">{t('account.total')}</p>
            <p className="text-lg font-medium text-text">
              <Money data={order.totalPrice} />
            </p>
          </div>
          <Link
            to={`/account/orders/${btoa(order.id)}`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            {t('account.view')}
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

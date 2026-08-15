import {redirect, useLoaderData} from 'react-router';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import type {Route} from './+types/($locale).account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {ArrowLeftIcon, MapPinIcon, ExternalLinkIcon} from '~/components/icons';
import {getShopName} from '~/lib/seo';
import {useTranslation} from 'react-i18next';

export const meta: Route.MetaFunction = ({data, matches}) => {
  const shopName = getShopName(matches);
  return [{title: `Order ${data?.order?.name} | ${shopName}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  const lineItems = order.lineItems.nodes;
  const discountApplications = order.discountApplications.nodes;
  const fulfillmentStatus = order.fulfillments?.nodes?.[0]?.status ?? null;
  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  const {t, i18n} = useTranslation();

  const orderDate = new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(order.processedAt!));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text mb-2 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {t('account.backToOrders')}
          </Link>
          <h2 className="font-display text-2xl md:text-3xl tracking-tight text-text">
            {t('account.orderNumber')}{order.name}
          </h2>
          <p className="text-text-muted mt-1">{t('account.placedOn', {date: orderDate})}</p>
          {order.confirmationNumber && (
            <p className="text-sm text-text-muted mt-1">
              {t('account.confirmation')}: {order.confirmationNumber}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.financialStatus} />
          <FulfillmentStatusBadge status={fulfillmentStatus} />
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border">
          <h3 className="font-medium text-text">{t('account.orderItems')}</h3>
        </div>
        <div className="divide-y divide-border">
          {lineItems.map((lineItem) => (
            <OrderLineRow key={lineItem.id} lineItem={lineItem} />
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Address */}
        <div className="bg-surface border border-border rounded-lg p-4 md:p-6">
          <h3 className="font-medium text-text mb-4 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-text-muted" />
            {t('account.shippingAddress')}
          </h3>
          {order?.shippingAddress ? (
            <address className="not-italic text-text-secondary space-y-1">
              <p className="font-medium text-text">{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted && (
                <p>{order.shippingAddress.formatted}</p>
              )}
              {order.shippingAddress.formattedArea && (
                <p>{order.shippingAddress.formattedArea}</p>
              )}
            </address>
          ) : (
            <p className="text-text-muted">{t('account.noShippingAddress')}</p>
          )}
        </div>

        {/* Order Totals */}
        <div className="bg-surface border border-border rounded-lg p-4 md:p-6">
          <h3 className="font-medium text-text mb-4">{t('account.orderSummary')}</h3>
          <div className="space-y-3">
            {((discountValue && discountValue.amount) || discountPercentage) && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{t('account.discounts')}</span>
                <span className="text-green-600 font-medium">
                  {discountPercentage ? (
                    `-${discountPercentage}%`
                  ) : (
                    discountValue && (
                      <>-<Money data={discountValue} /></>
                    )
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">{t('account.subtotal')}</span>
              <span className="text-text">
                <Money data={order.subtotal!} />
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">{t('account.tax')}</span>
              <span className="text-text">
                <Money data={order.totalTax!} />
              </span>
            </div>
            <div className="flex justify-between text-base font-medium pt-3 border-t border-border">
              <span className="text-text">{t('account.total')}</span>
              <span className="text-text">
                <Money data={order.totalPrice!} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View Status Page */}
      <div className="text-center">
        <a
          href={order.statusPageUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 font-medium transition-colors"
        >
          {t('account.viewOrderStatus')}
          <ExternalLinkIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  const {t} = useTranslation();

  return (
    <div className="p-4 md:p-6 flex gap-4">
      {lineItem?.image && (
        <div className="w-20 h-24 rounded-lg overflow-hidden bg-surface-alt flex-shrink-0">
          <Image
            data={lineItem.image}
            width={80}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-text truncate">{lineItem.title}</h4>
        {lineItem.variantTitle && (
          <p className="text-sm text-text-muted mt-0.5">{lineItem.variantTitle}</p>
        )}
        <p className="text-sm text-text-muted mt-1">{t('account.qty', {quantity: lineItem.quantity})}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-medium text-text">
          <Money data={lineItem.price!} />
        </p>
      </div>
    </div>
  );
}

function OrderStatusBadge({status}: {status?: string | null}) {
  if (!status) return null;

  const getStatusStyles = () => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyles()}`}>
      {status.toLowerCase()}
    </span>
  );
}

function FulfillmentStatusBadge({status}: {status?: string | null}) {
  if (!status) return null;

  const getStatusStyles = () => {
    switch (status.toUpperCase()) {
      case 'FULFILLED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyles()}`}>
      {status.toLowerCase().replace(/_/g, ' ')}
    </span>
  );
}


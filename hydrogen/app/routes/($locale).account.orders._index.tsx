import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).account.orders._index';
import {getPaginationVariables} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {CustomerOrdersFragment} from 'customer-accountapi.generated';
import {LIMITS} from '~/lib/constants';
import {buildPageTitle} from '~/lib/seo';
import {useTranslation} from 'react-i18next';
import {OrdersTable} from '~/components/account/OrdersTable';
import {OrderSearchForm} from '~/components/account/OrderSearchForm';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = ({matches}) => {
  return [{title: buildPageTitle('Orders', matches)}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: LIMITS.ORDERS_PER_PAGE,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;
  const {t} = useTranslation();

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl md:text-3xl tracking-tight text-text">
          {t('account.orderHistory')}
        </h2>
      </div>

      {/* Search Form */}
      <OrderSearchForm currentFilters={filters} />

      {/* Orders Table */}
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}


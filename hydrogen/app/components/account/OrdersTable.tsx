import type {CustomerOrdersFragment} from 'customer-accountapi.generated';
import type {OrderFilterParams} from '~/lib/orderFilters';
import {PaginatedResourceSection} from '~/components/shared/PaginatedResourceSection';
import {OrderItem} from './OrderItem';
import {EmptyOrders} from './EmptyOrders';

interface OrdersTableProps {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}

export function OrdersTable({orders, filters}: OrdersTableProps) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

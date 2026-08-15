interface OrderStatusBadgeProps {
  status?: string | null;
}

export function OrderStatusBadge({status}: OrderStatusBadgeProps) {
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
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyles()}`}>
      {status.toLowerCase()}
    </span>
  );
}

import type {CustomerFragment} from 'customer-accountapi.generated';
import {AddressCard} from './AddressCard';

interface ExistingAddressesProps {
  addresses: CustomerFragment['addresses'];
  defaultAddress: CustomerFragment['defaultAddress'];
}

export function ExistingAddresses({
  addresses,
  defaultAddress,
}: ExistingAddressesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.nodes.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          defaultAddress={defaultAddress}
        />
      ))}
    </div>
  );
}

import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import {useTranslation} from 'react-i18next';
import {Button} from '~/components/ui/Button';
import {AddressForm} from './AddressForm';

export function NewAddressForm() {
  const {t} = useTranslation();
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="flex justify-end pt-4 border-t border-border mt-6">
          <Button
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
            variant="primary"
          >
            {stateForMethod('POST') !== 'idle'
              ? t('account.creating')
              : t('account.createAddress')}
          </Button>
        </div>
      )}
    </AddressForm>
  );
}

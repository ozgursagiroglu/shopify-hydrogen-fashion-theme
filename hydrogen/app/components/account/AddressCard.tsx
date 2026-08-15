import {useState} from 'react';
import type {AddressFragment, CustomerFragment} from 'customer-accountapi.generated';
import {useTranslation} from 'react-i18next';
import {CloseIcon} from '~/components/icons';
import {IconButton} from '~/components/ui/IconButton';
import {Button} from '~/components/ui/Button';
import {AddressForm} from './AddressForm';

interface AddressCardProps {
  address: AddressFragment;
  defaultAddress: CustomerFragment['defaultAddress'];
}

export function AddressCard({address, defaultAddress}: AddressCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isDefaultAddress = defaultAddress?.id === address.id;
  const {t} = useTranslation();

  if (isEditing) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-text">{t('account.editAddress')}</h4>
          <IconButton
            type="button"
            onClick={() => setIsEditing(false)}
            variant="ghost"
            size="sm"
            label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </IconButton>
        </div>
        <AddressForm
          addressId={address.id}
          address={address}
          defaultAddress={defaultAddress}
        >
          {({stateForMethod}) => (
            <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
              <Button
                disabled={stateForMethod('DELETE') !== 'idle'}
                formMethod="DELETE"
                type="submit"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
              >
                {stateForMethod('DELETE') !== 'idle'
                  ? t('account.deleting')
                  : t('account.delete')}
              </Button>
              <Button
                disabled={stateForMethod('PUT') !== 'idle'}
                formMethod="PUT"
                type="submit"
                variant="primary"
              >
                {stateForMethod('PUT') !== 'idle'
                  ? t('account.saving')
                  : t('account.saveChanges')}
              </Button>
            </div>
          )}
        </AddressForm>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 md:p-6 relative">
      {isDefaultAddress && (
        <span className="absolute top-4 right-4 px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded">
          {t('account.default')}
        </span>
      )}
      <div className="space-y-1 pr-16">
        <p className="font-medium text-text">
          {address.firstName} {address.lastName}
        </p>
        {address.company && (
          <p className="text-sm text-text-muted">{address.company}</p>
        )}
        <p className="text-sm text-text-secondary">{address.address1}</p>
        {address.address2 && (
          <p className="text-sm text-text-secondary">{address.address2}</p>
        )}
        <p className="text-sm text-text-secondary">
          {address.city}, {address.zoneCode} {address.zip}
        </p>
        <p className="text-sm text-text-secondary">{address.territoryCode}</p>
        {address.phoneNumber && (
          <p className="text-sm text-text-muted mt-2">{address.phoneNumber}</p>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Button
          type="button"
          onClick={() => setIsEditing(true)}
          variant="ghost"
          size="sm"
          className="text-accent hover:text-accent/80"
        >
          {t('account.editAddress')}
        </Button>
      </div>
    </div>
  );
}

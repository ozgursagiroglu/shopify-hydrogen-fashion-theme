import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {AddressFragment, CustomerFragment} from 'customer-accountapi.generated';
import {Form, useActionData, useNavigation, type Fetcher} from 'react-router';
import {useTranslation} from 'react-i18next';
import type {ActionResponse} from '~/routes/($locale).account.addresses';
import {Input} from '~/components/ui/Input';

interface AddressFormProps {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: AddressFormProps) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  const {t} = useTranslation();

  return (
    <Form id={addressId}>
      <input type="hidden" name="addressId" defaultValue={addressId} />

      <div className="space-y-4">
        {/* Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`firstName-${addressId}`}
              className="block text-sm font-medium text-text mb-2"
            >
              {t('account.firstName')} <span className="text-red-500">*</span>
            </label>
            <Input
              aria-label={t('account.firstName')}
              autoComplete="given-name"
              defaultValue={address?.firstName ?? ''}
              id={`firstName-${addressId}`}
              name="firstName"
              placeholder={t('account.firstNamePlaceholder')}
              required
              type="text"
            />
          </div>
          <div>
            <label
              htmlFor={`lastName-${addressId}`}
              className="block text-sm font-medium text-text mb-2"
            >
              {t('account.lastName')} <span className="text-red-500">*</span>
            </label>
            <Input
              aria-label={t('account.lastName')}
              autoComplete="family-name"
              defaultValue={address?.lastName ?? ''}
              id={`lastName-${addressId}`}
              name="lastName"
              placeholder={t('account.lastNamePlaceholder')}
              required
              type="text"
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <label
            htmlFor={`company-${addressId}`}
            className="block text-sm font-medium text-text mb-2"
          >
            {t('account.company')}
          </label>
          <Input
            aria-label={t('account.company')}
            autoComplete="organization"
            defaultValue={address?.company ?? ''}
            id={`company-${addressId}`}
            name="company"
            placeholder={t('account.companyPlaceholder')}
            type="text"
          />
        </div>

        {/* Address Lines */}
        <div>
          <label
            htmlFor={`address1-${addressId}`}
            className="block text-sm font-medium text-text mb-2"
          >
            {t('account.address1')} <span className="text-red-500">*</span>
          </label>
          <Input
            aria-label={t('account.address1')}
            autoComplete="address-line1"
            defaultValue={address?.address1 ?? ''}
            id={`address1-${addressId}`}
            name="address1"
            placeholder={t('account.address1Placeholder')}
            required
            type="text"
          />
        </div>
        <div>
          <label
            htmlFor={`address2-${addressId}`}
            className="block text-sm font-medium text-text mb-2"
          >
            {t('account.address2')}
          </label>
          <Input
            aria-label={t('account.address2')}
            autoComplete="address-line2"
            defaultValue={address?.address2 ?? ''}
            id={`address2-${addressId}`}
            name="address2"
            placeholder={t('account.address2Placeholder')}
            type="text"
          />
        </div>

        {/* City, State, Zip Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor={`city-${addressId}`}
              className="block text-sm font-medium text-text mb-2"
            >
              {t('account.city')} <span className="text-red-500">*</span>
            </label>
            <Input
              aria-label={t('account.city')}
              autoComplete="address-level2"
              defaultValue={address?.city ?? ''}
              id={`city-${addressId}`}
              name="city"
              placeholder={t('account.cityPlaceholder')}
              required
              type="text"
            />
          </div>
          <div>
            <label
              htmlFor={`zoneCode-${addressId}`}
              className="block text-sm font-medium text-text mb-2"
            >
              {t('account.province')} <span className="text-red-500">*</span>
            </label>
            <Input
              aria-label={t('account.province')}
              autoComplete="address-level1"
              defaultValue={address?.zoneCode ?? ''}
              id={`zoneCode-${addressId}`}
              name="zoneCode"
              placeholder={t('account.provincePlaceholder')}
              required
              type="text"
            />
          </div>
          <div>
            <label
              htmlFor={`zip-${addressId}`}
              className="block text-sm font-medium text-text mb-2"
            >
              {t('account.zip')} <span className="text-red-500">*</span>
            </label>
            <Input
              aria-label={t('account.zip')}
              autoComplete="postal-code"
              defaultValue={address?.zip ?? ''}
              id={`zip-${addressId}`}
              name="zip"
              placeholder={t('account.zipPlaceholder')}
              required
              type="text"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label
            htmlFor={`territoryCode-${addressId}`}
            className="block text-sm font-medium text-text mb-2"
          >
            {t('account.country')} <span className="text-red-500">*</span>
          </label>
          <Input
            aria-label={t('account.country')}
            autoComplete="country"
            defaultValue={address?.territoryCode ?? ''}
            id={`territoryCode-${addressId}`}
            name="territoryCode"
            placeholder={t('account.countryPlaceholder')}
            required
            type="text"
            maxLength={2}
            className="uppercase"
          />
          <p className="text-xs text-text-muted mt-1">
            {t('account.countryCodeHint')}
          </p>
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor={`phoneNumber-${addressId}`}
            className="block text-sm font-medium text-text mb-2"
          >
            {t('account.phone')}
          </label>
          <Input
            aria-label={t('account.phone')}
            autoComplete="tel"
            defaultValue={address?.phoneNumber ?? ''}
            id={`phoneNumber-${addressId}`}
            name="phoneNumber"
            placeholder={t('account.phonePlaceholder')}
            pattern="^\+?[1-9]\d{3,14}$"
            type="tel"
          />
        </div>

        {/* Default Address Checkbox */}
        <div className="flex items-center gap-3">
          <input
            defaultChecked={isDefaultAddress}
            id={`defaultAddress-${addressId}`}
            name="defaultAddress"
            type="checkbox"
            className="w-5 h-5 rounded border-border text-accent focus:ring-accent focus:ring-offset-0"
          />
          <label
            htmlFor={`defaultAddress-${addressId}`}
            className="text-sm text-text"
          >
            {t('account.setAsDefault')}
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {children({
          stateForMethod: (method) => (formMethod === method ? state : 'idle'),
        })}
      </div>
    </Form>
  );
}

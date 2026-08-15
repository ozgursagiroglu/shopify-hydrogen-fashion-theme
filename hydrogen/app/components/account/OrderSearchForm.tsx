import {useSearchParams, useNavigation} from 'react-router';
import {useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {Input} from '~/components/ui/Input';
import {Button} from '~/components/ui/Button';

interface OrderSearchFormProps {
  currentFilters: OrderFilterParams;
}

export function OrderSearchForm({currentFilters}: OrderSearchFormProps) {
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const {t} = useTranslation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="p-4 md:p-6 bg-surface-alt rounded-lg"
      aria-label={t('account.orderHistory')}
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            id="orderName"
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder={t('account.orderNumberPlaceholder')}
            aria-label={t('account.orderNumber')}
            defaultValue={currentFilters.name || ''}
          />
        </div>
        <div className="flex-1">
          <Input
            id="confirmationNumber"
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder={t('account.confirmationNumberPlaceholder')}
            aria-label={t('account.confirmationNumber')}
            defaultValue={currentFilters.confirmationNumber || ''}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isSearching}
            variant="primary"
          >
            {isSearching ? t('account.searching') : t('account.search')}
          </Button>
          {hasFilters && (
            <Button
              type="button"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
              variant="secondary"
            >
              {t('account.clear')}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

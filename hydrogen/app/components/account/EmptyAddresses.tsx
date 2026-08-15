import {useTranslation} from 'react-i18next';
import {MapPinIcon, PlusIcon} from '~/components/icons';
import {Button} from '~/components/ui/Button';

interface EmptyAddressesProps {
  onAddClick: () => void;
}

export function EmptyAddresses({onAddClick}: EmptyAddressesProps) {
  const {t} = useTranslation();

  return (
    <div className="text-center py-16 px-4 bg-surface-alt rounded-lg">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
        <MapPinIcon className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-lg font-medium text-text mb-2">
        {t('account.noAddressesSaved')}
      </h3>
      <p className="text-text-muted mb-4">{t('account.addAddressHint')}</p>
      <Button
        type="button"
        onClick={onAddClick}
        variant="primary"
        leftIcon={<PlusIcon className="w-4 h-4" />}
      >
        {t('account.addAddress')}
      </Button>
    </div>
  );
}

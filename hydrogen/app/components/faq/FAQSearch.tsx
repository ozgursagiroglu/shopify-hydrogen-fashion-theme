import {useTranslation} from 'react-i18next';
import {SearchIcon} from '~/components/icons';
import {cn} from '~/lib/cn';

export interface FAQSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FAQSearch({value, onChange, className}: FAQSearchProps) {
  const {t} = useTranslation();

  return (
    <div className={cn('relative', className)}>
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('faq.searchPlaceholder')}
        className="input pl-12"
        aria-label={t('faq.searchPlaceholder')}
      />
    </div>
  );
}

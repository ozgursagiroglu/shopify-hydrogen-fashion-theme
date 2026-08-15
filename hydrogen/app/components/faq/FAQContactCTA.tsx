import {useTranslation} from 'react-i18next';
import {Button} from '~/components/ui';
import {cn} from '~/lib/cn';

export interface FAQContactCTAProps {
  className?: string;
}

export function FAQContactCTA({className}: FAQContactCTAProps) {
  const {t} = useTranslation();

  return (
    <div
      className={cn(
        'bg-surface-alt rounded-lg p-8 text-center',
        className,
      )}
    >
      <h3 className="font-display text-h4 text-primary mb-2">
        {t('faq.contactPrompt')}
      </h3>
      <p className="text-text-secondary mb-6">
        {t('faq.contactDescription')}
      </p>
      <Button as="link" to="/contact" variant="primary">
        {t('faq.contactCta')}
      </Button>
    </div>
  );
}

import {useState} from 'react';
import {useFetcher} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Button, Input, Select, Textarea} from '~/components/ui';
import {CheckCircleIcon} from '~/components/icons';
import {cn} from '~/lib/cn';

export interface ContactFormProps {
  className?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactForm({className}: ContactFormProps) {
  const {t} = useTranslation();
  const fetcher = useFetcher();
  const [errors, setErrors] = useState<FormErrors>({});

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success === true;

  const subjectOptions = [
    {value: '', label: t('contact.form.subjectPlaceholder')},
    {value: 'general', label: t('contact.subjects.general')},
    {value: 'order', label: t('contact.subjects.order')},
    {value: 'returns', label: t('contact.subjects.returns')},
    {value: 'sizing', label: t('contact.subjects.sizing')},
    {value: 'other', label: t('contact.subjects.other')},
  ];

  const validateForm = (formData: FormData): boolean => {
    const newErrors: FormErrors = {};
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name?.trim()) {
      newErrors.name = t('contact.errors.nameRequired');
    }

    if (!email?.trim()) {
      newErrors.email = t('contact.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('contact.errors.emailInvalid');
    }

    if (!subject?.trim()) {
      newErrors.subject = t('contact.errors.subjectRequired');
    }

    if (!message?.trim()) {
      newErrors.message = t('contact.errors.messageRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    if (!validateForm(formData)) {
      e.preventDefault();
    }
  };

  if (isSuccess) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-6">
          <CheckCircleIcon className="w-8 h-8" />
        </div>
        <h3 className="font-display text-h3 text-primary mb-2">
          {t('contact.success.title')}
        </h3>
        <p className="text-text-secondary">
          {t('contact.success.message')}
        </p>
      </div>
    );
  }

  return (
    <fetcher.Form
      method="POST"
      action="/api/contact"
      className={cn('space-y-6', className)}
      onSubmit={handleSubmit}
    >
      {/* Honeypot field for spam prevention */}
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <Input
        label={t('contact.form.name')}
        name="name"
        placeholder={t('contact.form.namePlaceholder')}
        error={errors.name}
        required
      />

      <Input
        label={t('contact.form.email')}
        name="email"
        type="email"
        placeholder={t('contact.form.emailPlaceholder')}
        error={errors.email}
        required
      />

      <Select
        label={t('contact.form.subject')}
        name="subject"
        options={subjectOptions}
        error={!!errors.subject}
        helperText={errors.subject}
        required
      />

      <Textarea
        label={t('contact.form.message')}
        name="message"
        placeholder={t('contact.form.messagePlaceholder')}
        rows={6}
        error={errors.message}
        required
      />

      {fetcher.data?.success === false && (
        <p className="text-sm text-error">{t('contact.errors.generic')}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isSubmitting}
      >
        {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
      </Button>
    </fetcher.Form>
  );
}

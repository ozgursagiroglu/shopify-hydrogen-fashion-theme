import {useEffect, useState, useRef} from 'react';
import {useFetcher} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Button} from '~/components/ui';
import {CheckIcon, GiftIcon, SparklesIcon, BellIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';

interface NewsletterResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface NewsletterProps {
  overline?: string;
  title?: string;
  description?: string;
  backgroundImage?: {
    url: string;
    altText: string;
  } | null;
  benefits?: [string, string, string];
  privacyNotice?: string;
}

export function Newsletter({
  overline,
  title,
  description,
  backgroundImage,
  benefits,
  privacyNotice,
}: NewsletterProps = {}) {
  const {t} = useTranslation();
  const [email, setEmail] = useState('');
  const fetcher = useFetcher<NewsletterResponse>();

  const isLoading = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success === true;
  const isError = fetcher.data?.success === false;

  // Clear email input on successful submission
  // Using form ref reset is cleaner than setState in effect
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (isSuccess && formRef.current) {
      formRef.current.reset();
      setEmail(''); // eslint-disable-line react-hooks/set-state-in-effect -- legitimate form reset on success
    }
  }, [isSuccess]);

  // Fallback to translations if no props provided
  const displayOverline = overline || t('newsletter.overline');
  const displayTitle = title || t('newsletter.title');
  const displayDescription = description || t('newsletter.description');
  const displayBenefits = benefits || [
    t('newsletter.benefits.welcomeDiscount'),
    t('newsletter.benefits.earlyAccess'),
    t('newsletter.benefits.newArrivals'),
  ];
  const displayPrivacyNotice = privacyNotice || t('newsletter.privacyNotice');

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-surface-dark">
      {/* Background Image with V3 gradient overlay */}
      <div className="absolute inset-0">
        <Image
          data={{
            url: backgroundImage?.url,
            altText: backgroundImage?.altText,
          }}
          sizes="100vw"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 overlay-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-text-on-dark-muted mb-4">
            {displayOverline}
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-text-on-dark tracking-tight mb-6">
            {displayTitle}
          </h2>
          <p className="text-lg text-text-on-dark-muted mb-10 max-w-lg mx-auto">
            {displayDescription}
          </p>

          {isSuccess ? (
            <div className="bg-surface-dark-alt/60 backdrop-blur-sm rounded-xl p-8 border border-border-on-dark/20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-dark-hover flex items-center justify-center">
                <CheckIcon className="w-8 h-8 text-text-on-dark" />
              </div>
              <h3 className="text-xl font-medium text-text-on-dark mb-2">
                {t('newsletter.successTitle')}
              </h3>
              <p className="text-text-on-dark-muted">{t('newsletter.successMessage')}</p>
            </div>
          ) : (
            <fetcher.Form
              ref={formRef}
              method="POST"
              action="/api/newsletter"
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <div className="flex-1">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletter.placeholder')}
                  className="w-full h-12 px-5 rounded-md bg-surface-dark-alt/60 backdrop-blur-sm border border-border-on-dark text-text-on-dark placeholder:text-text-on-dark-muted focus:outline-none focus:border-border-on-dark focus:ring-2 focus:ring-accent/30 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                variant="inverse"
                loading={isLoading}
                disabled={isLoading || !email}
              >
                {t('newsletter.subscribe')}
              </Button>
              {isError && (
                <p className="text-red-300 text-sm mt-2 sm:col-span-2">
                  {fetcher.data?.error || t('newsletter.error')}
                </p>
              )}
            </fetcher.Form>
          )}

          {/* Benefits */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-text-on-dark-muted text-sm">
            <div className="flex items-center justify-center gap-2">
              <GiftIcon className="w-5 h-5 text-text-on-dark-muted" />
              <span>{displayBenefits[0]}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <SparklesIcon className="w-5 h-5 text-text-on-dark-muted" />
              <span>{displayBenefits[1]}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <BellIcon className="w-5 h-5 text-text-on-dark-muted" />
              <span>{displayBenefits[2]}</span>
            </div>
          </div>

          <p className="mt-8 text-xs text-text-on-dark-muted/60">{displayPrivacyNotice}</p>
        </div>
      </div>
    </section>
  );
}

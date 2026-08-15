import {useTranslation} from 'react-i18next';
import {MailIcon, PhoneIcon, ClockIcon, MapPinIcon} from '~/components/icons';
import {cn} from '~/lib/cn';

export interface ContactInfoData {
  title?: string;
  email: string;
  phone?: string;
  hours?: string;
  address?: string;
  addressUrl?: string;
}

export interface ContactInfoProps {
  className?: string;
  /** Contact info data from metaobject. If not provided, falls back to i18n translations. */
  data?: ContactInfoData;
}

export function ContactInfo({className, data}: ContactInfoProps) {
  const {t} = useTranslation();

  const email = data?.email ?? undefined;
  const phone = data?.phone ?? undefined;
  const hours = data?.hours ?? undefined;
  const address = data?.address ?? undefined;
  const addressUrl = data?.addressUrl ?? undefined;

  const contactItems = [
    {
      icon: MailIcon,
      label: t('contact.info.email'),
      value: email,
      href: `mailto:${email}`,
    },
    ...(phone
      ? [
          {
            icon: PhoneIcon,
            label: t('contact.info.phone'),
            value: phone,
            href: `tel:${phone.replace(/\s/g, '')}`,
          },
        ]
      : []),
    ...(hours
      ? [
          {
            icon: ClockIcon,
            label: t('contact.info.hours'),
            value: hours,
          },
        ]
      : []),
    ...(address
      ? [
          {
            icon: MapPinIcon,
            label: t('contact.info.address'),
            value: address,
            href: addressUrl,
          },
        ]
      : []),
  ];

  const title = data?.title ?? t('contact.title');

  return (
    <div className={cn('bg-surface-alt rounded-lg p-8', className)}>
      <h3 className="font-display text-h4 text-primary mb-6">{title}</h3>
      <div className="space-y-5">
        {contactItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-muted mb-0.5">{item.label}</p>
                <p className="text-text font-medium">{item.value}</p>
              </div>
            </div>
          );

          if (item.href) {
            return (
              <a
                key={item.label}
                href={item.href}
                className="block hover:opacity-80 transition-opacity"
              >
                {content}
              </a>
            );
          }

          return <div key={item.label}>{content}</div>;
        })}
      </div>
    </div>
  );
}

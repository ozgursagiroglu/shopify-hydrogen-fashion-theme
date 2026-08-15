import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import type {StoreLocation} from '~/graphql/storefront/MetaobjectQueries';
import {PhoneIcon, MailIcon, ClockIcon, MapPinIcon} from '~/components/icons';

interface StoreCardProps {
  store: StoreLocation;
}

export function StoreCard({store}: StoreCardProps) {
  const {t} = useTranslation();

  // Format address
  const addressParts = [
    store.addressLine1,
    store.addressLine2,
    store.city,
    store.postalCode,
    store.country,
  ].filter(Boolean);

  const fullAddress = addressParts.join(', ');

  // Generate Google Maps URL
  const mapsUrl = store.latitude && store.longitude
    ? `https://www.google.com/maps?q=${store.latitude},${store.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="bg-surface rounded-lg overflow-hidden border border-border hover:border-border-strong transition-colors">
      {/* Store Image */}
      {store.image && (
        <div className="aspect-[16/9] overflow-hidden">
          <Image
            data={{
              url: store.image.url,
              altText: store.image.altText || store.name,
            }}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Store Info */}
      <div className="p-6 md:p-8">
        <h2 className="font-display text-2xl md:text-3xl text-text mb-6">
          {store.name}
        </h2>

        <div className="space-y-4">
          {/* Address */}
          <div className="flex gap-3">
            <MapPinIcon
              className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5"
              strokeWidth={1.5}
            />
            <div>
              <p className="font-medium text-text text-sm mb-1">
                {t('pages.stores.address')}
              </p>
              <p className="text-text-secondary text-sm leading-relaxed">
                {store.addressLine1}
                {store.addressLine2 && (
                  <>
                    <br />
                    {store.addressLine2}
                  </>
                )}
                <br />
                {store.city}
                {store.postalCode && `, ${store.postalCode}`}
                <br />
                {store.country}
              </p>
            </div>
          </div>

          {/* Phone */}
          {store.phone && (
            <div className="flex gap-3">
              <PhoneIcon
                className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5"
                strokeWidth={1.5}
              />
              <div>
                <p className="font-medium text-text text-sm mb-1">
                  {t('pages.stores.phone')}
                </p>
                <a
                  href={`tel:${store.phone}`}
                  className="text-text-secondary hover:text-accent text-sm transition-colors"
                >
                  {store.phone}
                </a>
              </div>
            </div>
          )}

          {/* Email */}
          {store.email && (
            <div className="flex gap-3">
              <MailIcon
                className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5"
                strokeWidth={1.5}
              />
              <div>
                <p className="font-medium text-text text-sm mb-1">
                  {t('pages.stores.email')}
                </p>
                <a
                  href={`mailto:${store.email}`}
                  className="text-text-secondary hover:text-accent text-sm transition-colors"
                >
                  {store.email}
                </a>
              </div>
            </div>
          )}

          {/* Hours */}
          {store.hours && (
            <div className="flex gap-3">
              <ClockIcon
                className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5"
                strokeWidth={1.5}
              />
              <div>
                <p className="font-medium text-text text-sm mb-1">
                  {t('pages.stores.openingHours')}
                </p>
                <div className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                  {store.hours}
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          {store.features.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="font-medium text-text text-sm mb-3">
                {t('pages.stores.features')}
              </p>
              <div className="flex flex-wrap gap-2">
                {store.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-surface-alt text-text-secondary text-xs rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Get Directions Button */}
          <div className="pt-4">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full h-12 px-6 bg-primary text-white font-medium rounded-md hover:bg-primary-light transition-colors"
            >
              {t('pages.stores.getDirections')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

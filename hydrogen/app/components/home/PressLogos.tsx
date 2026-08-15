import type {PressFeature} from '~/graphql/storefront/MetaobjectQueries';
import {useTranslation} from 'react-i18next';

interface PressLogosProps {
  features: PressFeature[];
}

export function PressLogos({features}: PressLogosProps) {
  const {t} = useTranslation();

  if (!features || features.length === 0) return null;

  // Find featured quote
  const featuredItem = features.find((f) => f.isFeatured) || features[0];

  return (
    <section className="py-16 md:py-20 bg-surface-0 border-y border-border-subtle">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="overline text-text-muted mb-2">{t('home.asFeaturedIn')}</p>
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12 items-center">
          {features.map((press) => (
            <div
              key={press.id}
              className="group flex flex-col items-center text-center"
            >
              {press.logoImage ? (
                <img
                  src={press.logoImage.url}
                  alt={press.name}
                  className="h-8 md:h-10 w-auto grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                />
              ) : (
                <span className="text-2xl md:text-3xl font-display text-text-muted/40 group-hover:text-primary tracking-widest transition-colors duration-300">
                  {press.logoText || press.name}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Featured Quote */}
        {featuredItem?.quote && (
          <div className="mt-16 text-center max-w-2xl mx-auto">
            <blockquote className="text-xl md:text-2xl font-display text-text-secondary italic">
              &quot;{featuredItem.quote}&quot;
            </blockquote>
            <cite className="block mt-4 text-sm text-text-muted not-italic">
              — {featuredItem.name}
            </cite>
          </div>
        )}
      </div>
    </section>
  );
}

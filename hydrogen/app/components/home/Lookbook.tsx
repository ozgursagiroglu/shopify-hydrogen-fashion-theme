import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {Image} from '@shopify/hydrogen';
import {cn} from '~/lib/cn';
import {ArrowRightIcon} from '~/components/icons';
import {RTLIcon} from '~/components/icons/RTLIcon';
import {useTranslation} from 'react-i18next';
import {RevealOnScroll, TextReveal} from '~/components/motion';
import {Button} from '~/components/ui/Button';

export interface LookbookItem {
  image: {
    url: string;
    altText?: string;
  };
  title?: string;
  href: string;
}

export interface LookbookProps {
  items: LookbookItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Lookbook Section (V3)
 * Dark background with header + asymmetric grid.
 * 2 items: side-by-side (60/40)
 * 3 items: 1 large left + 2 stacked right
 * 1 or 4+: equal grid
 */
export function Lookbook({items, title, subtitle, className}: LookbookProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className={cn('py-16 md:py-24 bg-surface-dark', className)}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section header */}
        {(title || subtitle) && (
          <div className="text-center mb-10 md:mb-14">
            {title && (
              <TextReveal
                text={title}
                className="font-display text-3xl md:text-4xl lg:text-5xl text-text-on-dark tracking-tight"
              />
            )}
            {subtitle && (
              <p className="mt-3 text-text-on-dark-muted text-lg">{subtitle}</p>
            )}
          </div>
        )}

        {/* Layout based on item count */}
        {items.length === 2 ? (
          // 2 items: asymmetric side-by-side
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
            <div className="md:col-span-3">
              <LookbookCard item={items[0]} tall />
            </div>
            <div className="md:col-span-2">
              <LookbookCard item={items[1]} tall />
            </div>
          </div>
        ) : items.length === 3 ? (
          // 3 items: 1 large left + 2 stacked right
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
            <div className="md:col-span-3 md:row-span-2">
              <LookbookCard item={items[0]} tall />
            </div>
            <div className="md:col-span-2">
              <LookbookCard item={items[1]} />
            </div>
            <div className="md:col-span-2">
              <LookbookCard item={items[2]} />
            </div>
          </div>
        ) : (
          // 1 or 4+ items: equal grid
          <div className={cn(
            'grid gap-4 md:gap-6',
            items.length === 1 ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3',
          )}>
            {items.map((item, index) => (
              <LookbookCard key={`${item.title}-${index + 1}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function LookbookCard({item, tall = false}: {item: LookbookItem; tall?: boolean}) {
  const {t} = useTranslation();

  return (
    <Link
      to={item.href}
      className={cn(
        'group relative overflow-hidden rounded-lg bg-surface-dark-alt block',
        tall ? 'aspect-3/4 md:aspect-auto md:h-full md:min-h-[400px]' : 'aspect-4/5',
      )}
    >
      <Image
        data={{
          url: item.image.url,
          altText: item.image.altText || item.title || t('home.lookbookImage'),
        }}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {item.title && (
        <>
          <div className="absolute inset-0 overlay-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <h3 className="font-display text-xl md:text-2xl text-text-on-dark">
              {item.title}
            </h3>
            <span className="inline-flex items-center mt-2 text-text-on-dark text-sm uppercase tracking-wider font-medium">
              {t('home.shopTheLook')}
              <RTLIcon
                icon={ArrowRightIcon}
                className="w-4 h-4 ms-2"
                strokeWidth={2}
              />
            </span>
          </div>
        </>
      )}
    </Link>
  );
}

// Full-width feature strip
export interface FeatureStripProps {
  image: {
    url: string;
    altText?: string;
  };
  title: string;
  subtitle?: string;
  cta: {
    label: string;
    href: string;
  };
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function FeatureStrip({
  image,
  title,
  subtitle,
  cta,
  align = 'center',
  className,
}: FeatureStripProps) {
  const alignClass =
    align === 'left'
      ? 'items-start text-left'
      : align === 'right'
        ? 'items-end text-right'
        : 'items-center text-center';

  return (
    <section
      className={cn(
        'relative py-20 md:py-32 overflow-hidden',
        className,
      )}
    >
      {/* Full-bleed background */}
      <Image
        data={{
          url: image.url,
          altText: image.altText || title,
        }}
        sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 overlay-hero" />

      {/* Inset content */}
      <div
        className={cn(
          'max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col',
          alignClass,
        )}
      >
        <RevealOnScroll>
          <p className="text-text-on-dark-muted uppercase tracking-widest text-sm mb-4">
            {subtitle || ''}
          </p>
          <TextReveal
            text={title}
            className="font-display text-3xl md:text-5xl text-text-on-dark max-w-2xl tracking-tight"
          />
          <Button
            as="link"
            to={cta.href}
            variant="inverse"
            size="lg"
            className="mt-8"
          >
            {cta.label}
          </Button>
        </RevealOnScroll>
      </div>
    </section>
  );
}

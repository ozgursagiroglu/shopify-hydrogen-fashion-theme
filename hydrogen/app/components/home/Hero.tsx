import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {Image} from '@shopify/hydrogen';
import {cn} from '~/lib/cn';
import {Button} from '~/components/ui/Button';
import {ArrowRightIcon} from '~/components/icons';
import {RTLIcon} from '~/components/icons/RTLIcon';
import {motion} from 'framer-motion';

export interface HeroProps {
  title: string;
  subtitle?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  backgroundImage?: {
    url: string;
    altText?: string;
  };
  overlay?: boolean;
  align?: 'left' | 'center' | 'right';
  height?: 'full' | 'large' | 'medium';
  className?: string;
}

const heightStyles = {
  full: 'min-h-screen',
  large: 'min-h-[85vh]',
  medium: 'min-h-[60vh]',
};

export function Hero({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  backgroundImage,
  overlay = true,
  align = 'center',
  height = 'large',
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        'relative flex flex-col justify-center',
        heightStyles[height],
        className,
      )}
    >
      {/* Background Image with Ken Burns effect */}
      {backgroundImage && (
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{scale: [1, 1.06]}}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          >
            <Image
              data={{
                url: backgroundImage.url,
                altText: backgroundImage.altText || title,
              }}
              sizes="100vw"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </motion.div>
          {overlay && (
            <div className="absolute inset-0 overlay-hero" />
          )}
        </div>
      )}

      {/* Content — bottom-aligned for editorial feel */}
      <div
        className={cn(
          'max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col flex-1 justify-end pb-16 md:pb-24',
          align === 'left' && 'items-start text-left',
          align === 'center' && 'items-center text-center',
          align === 'right' && 'items-end text-right',
        )}
      >
        <motion.div
          className={cn(
            'flex flex-col',
            align === 'left' && 'items-start',
            align === 'center' && 'items-center',
            align === 'right' && 'items-end',
          )}
          initial={{opacity: 0, y: 30}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1]}}
        >
          <h1
            className={cn(
              'font-display text-4xl md:text-6xl lg:text-7xl max-w-4xl tracking-tight',
              backgroundImage ? 'text-text-on-dark' : 'text-text',
            )}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className={cn(
                'mt-4 md:mt-6 text-lg md:text-xl max-w-2xl',
                backgroundImage ? 'text-text-on-dark-muted' : 'text-text-muted',
              )}
            >
              {subtitle}
            </p>
          )}

          {(primaryCta || secondaryCta) && (
            <div className="flex flex-wrap gap-4 mt-8 md:mt-10">
              {primaryCta && (
                <Button
                  as="link"
                  to={primaryCta.href}
                  variant={backgroundImage ? 'inverse' : 'primary'}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {primaryCta.label}
                </Button>
              )}
              {secondaryCta && (
                <Button
                  as="link"
                  to={secondaryCta.href}
                  variant={backgroundImage ? 'inverse-outline' : 'secondary'}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {secondaryCta.label}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// Split Hero for featuring two categories side by side
export interface SplitHeroProps {
  leftPanel: {
    title: string;
    cta: {
      label: string;
      href: string;
    };
    image: {
      url: string;
      altText?: string;
    };
  };
  rightPanel: {
    title: string;
    cta: {
      label: string;
      href: string;
    };
    image: {
      url: string;
      altText?: string;
    };
  };
  className?: string;
}

export function SplitHero({leftPanel, rightPanel, className}: SplitHeroProps) {
  return (
    <section className={cn('grid md:grid-cols-5', className)}>
      {/* Left panel — 60% (3 of 5 cols) with image */}
      <Link
        to={leftPanel.cta.href}
        className="relative group min-h-[50vh] md:min-h-[75vh] md:col-span-3 flex items-end p-8 md:p-12 overflow-hidden"
      >
        <Image
          data={{
            url: leftPanel.image.url,
            altText: leftPanel.image.altText || leftPanel.title,
          }}
          sizes="(min-width: 768px) 60vw, 100vw"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 overlay-card" />
        <div className="relative z-10 text-text-on-dark">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
            {leftPanel.title}
          </h2>
          <span className="inline-flex items-center text-sm uppercase tracking-wider font-medium group-hover:underline">
            {leftPanel.cta.label}
            <RTLIcon
              icon={ArrowRightIcon}
              className="w-4 h-4 ms-2 transition-transform group-hover:translate-x-1"
              strokeWidth={2}
            />
          </span>
        </div>
      </Link>

      {/* Right panel — 40% (2 of 5 cols) with dark bg + content centered */}
      <div className="md:col-span-2 bg-surface-dark flex items-center min-h-[50vh]">
        <Link
          to={rightPanel.cta.href}
          className="group relative w-full h-full flex items-center overflow-hidden"
        >
          {/* Subtle background image at low opacity */}
          <Image
            data={{
              url: rightPanel.image.url,
              altText: rightPanel.image.altText || rightPanel.title,
            }}
            sizes="(min-width: 768px) 40vw, 100vw"
            className="absolute inset-0 w-full h-full object-cover opacity-20 transition-opacity duration-700 group-hover:opacity-30"
          />
          <div className="relative z-10 p-8 md:p-12">
            <h2 className="font-display text-3xl md:text-4xl text-text-on-dark mb-4">
              {rightPanel.title}
            </h2>
            <Button
              variant="inverse-outline"
              className="group-hover:bg-white group-hover:text-primary transition-colors"
            >
              {rightPanel.cta.label}
              <RTLIcon
                icon={ArrowRightIcon}
                className="w-4 h-4 ms-2 transition-transform group-hover:translate-x-1"
                strokeWidth={2}
              />
            </Button>
          </div>
        </Link>
      </div>
    </section>
  );
}

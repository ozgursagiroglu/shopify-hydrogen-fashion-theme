import {useRef} from 'react';
import {cn} from '~/lib/cn';
import {ProductCard, type ProductCardProps} from '~/components/product';
import {SectionHeader, IconButton} from '~/components/ui';
import {ChevronLeftIcon, ChevronRightIcon} from '~/components/icons';
import {RTLIcon} from '~/components/icons/RTLIcon';
import {useTranslation} from 'react-i18next';
import {useIsRTL} from '~/lib/hooks/useIsRTL';

export interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: ProductCardProps['product'][];
  viewAllHref?: string;
  className?: string;
}

export function ProductCarousel({
  title,
  subtitle,
  products,
  viewAllHref,
  className,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation();
  const isRTL = useIsRTL();

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;

    // Invert scroll direction for RTL
    const effectiveDirection = isRTL
      ? (direction === 'left' ? 'right' : 'left')
      : direction;

    scrollRef.current.scrollBy({
      left: effectiveDirection === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-12 md:py-20', className)}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header with Navigation */}
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <SectionHeader
            title={title}
            subtitle={subtitle}
            action={viewAllHref ? {label: t('common.viewAll'), href: viewAllHref} : undefined}
          />

          {/* Navigation Arrows - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <IconButton
              label={t('a11y.scrollLeft')}
              variant="outline"
              size="md"
              onClick={() => scroll('left')}
            >
              <RTLIcon icon={ChevronLeftIcon} className="w-5 h-5 text-text" />
            </IconButton>
            <IconButton
              label={t('a11y.scrollRight')}
              variant="outline"
              size="md"
              onClick={() => scroll('right')}
            >
              <RTLIcon icon={ChevronRightIcon} className="w-5 h-5 text-text" />
            </IconButton>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
          style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className="shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start"
            >
              <ProductCard
                product={product}
                loading={index < 4 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex justify-center gap-1.5 mt-6 md:hidden">
          {products.slice(0, Math.min(5, products.length)).map((_, index) => (
            <div
              key={`${index + 1}`}
              className="w-1.5 h-1.5 rounded-full bg-border"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

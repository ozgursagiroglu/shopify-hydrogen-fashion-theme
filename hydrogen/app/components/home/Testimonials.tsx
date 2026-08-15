import {useRef} from 'react';
import {Image} from '@shopify/hydrogen';
import {
  QuoteIcon,
  StarIcon,
  VerifiedIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '~/components/icons';
import {useTranslation} from 'react-i18next';
import type {Testimonial} from '~/graphql/storefront/MetaobjectQueries';

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

/**
 * Peek Carousel (V3)
 * Cards are 85% width on mobile, ~33% on desktop.
 * Next/prev cards peek from the edges for visual depth.
 * Horizontal snap scroll — no JS carousel state needed.
 */
export function Testimonials({testimonials}: TestimonialsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation();

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector('[data-testimonial-card]');
    if (!card) return;
    const scrollAmount = card.clientWidth + 24; // card width + gap
    scrollRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-16 md:py-24 bg-surface-1">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12 px-4 sm:px-6 lg:px-12">
          <p className="text-xs uppercase tracking-widest text-text-muted mb-3">
            {t('home.testimonials')}
          </p>
          <h2 className="font-display text-display-sm md:text-display-md text-primary tracking-tight">
            {t('home.whatClientsSay')}
          </h2>
        </div>

        {/* Peek Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 lg:px-12 pb-4"
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index + 1}`}
                data-testimonial-card
                className="shrink-0 w-[85%] sm:w-[70%] md:w-[45%] lg:w-[33%] snap-center"
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center justify-center gap-4 mt-8 px-4">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-border-default hover:border-primary hover:bg-primary hover:text-white transition-all duration-300"
              aria-label={t('a11y.previousSlide')}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-border-default hover:border-primary hover:bg-primary hover:text-white transition-all duration-300"
              aria-label={t('a11y.nextSlide')}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({testimonial}: {testimonial: Testimonial}) {
  const {t} = useTranslation();

  return (
    <div className="bg-surface-0 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-8 h-full flex flex-col">
      {/* Quote Icon */}
      <div className="text-primary/10 mb-4">
        <QuoteIcon className="w-10 h-10" />
      </div>

      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={`${i + 1}`}
            className={`w-4 h-4 ${
              i < testimonial.rating
                ? 'text-primary fill-primary'
                : 'text-border-default'
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-base text-text-secondary leading-relaxed mb-6 flex-1">
        &quot;{testimonial.text}&quot;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        {testimonial.avatar && (
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-surface-2 shrink-0">
            <Image
              data={{
                url: testimonial.avatar.url,
                altText: testimonial.avatar.altText || testimonial.name,
              }}
              sizes="40px"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <p className="font-medium text-sm text-primary flex items-center gap-1.5">
            {testimonial.name}
            {testimonial.verified && (
              <VerifiedIcon className="w-3.5 h-3.5 text-success" />
            )}
          </p>
          <p className="text-xs text-text-muted">{testimonial.location}</p>
        </div>
        {testimonial.product && (
          <p className="text-xs text-text-muted ms-auto hidden sm:block">
            {t('misc.purchasedItem')}: {testimonial.product.title}
          </p>
        )}
      </div>
    </div>
  );
}

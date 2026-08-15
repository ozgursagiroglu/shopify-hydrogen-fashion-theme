import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {Image} from '@shopify/hydrogen';
import {cn} from '~/lib/cn';
import {SectionHeader} from '~/components/ui';
import {ArrowRightIcon} from '~/components/icons';
import {RTLIcon} from '~/components/icons/RTLIcon';
import {useTranslation} from 'react-i18next';
import {StaggerGrid, StaggerItem} from '~/components/motion';

export interface Category {
  title: string;
  href: string;
  image: {
    url: string;
    altText?: string;
  };
  description?: string;
}

export interface CategoryGridProps {
  title?: string;
  subtitle?: string;
  categories: Category[];
  className?: string;
}

export function CategoryGrid({
  title,
  subtitle,
  categories,
  className,
}: CategoryGridProps) {
  const hasBento = categories.length >= 3;

  return (
    <section className={cn('py-12 md:py-20', className)}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        {title && (
          <SectionHeader
            title={title}
            subtitle={subtitle}
            centered
            className="mb-8 md:mb-12"
          />
        )}

        {hasBento ? (
          <BentoLayout categories={categories} />
        ) : (
          <StaggerGrid className="grid grid-cols-2 gap-4 md:gap-6">
            {categories.map((category) => (
              <StaggerItem key={category.href}>
                <CategoryCard category={category} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </section>
  );
}

/**
 * Bento Grid Layout:
 * Desktop (3 cols): First item spans 2 cols + 2 rows, rest fill right column
 * Tablet (2 cols): First item full-width, rest 2-up
 * Mobile: Stack vertically, first item taller
 */
/**
 * Bento Grid — handles 3 or 4 items cleanly.
 *
 * 4 items (common):
 * ┌────────────┬──────┐
 * │  Featured  │ #2   │
 * │  (large)   ├──────┤
 * │            │ #3   │
 * ├────────────┴──────┤
 * │     #4 (wide)     │
 * └───────────────────┘
 *
 * 3 items:
 * ┌────────────┬──────┐
 * │  Featured  │ #2   │
 * │  (large)   ├──────┤
 * │            │ #3   │
 * └────────────┴──────┘
 */
function BentoLayout({categories}: {categories: Category[]}) {
  const [featured, ...rest] = categories;
  const sideItems = rest.slice(0, 2);
  const wideItem = rest[2]; // 4th item becomes wide banner

  return (
    <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      {/* Featured — 2 cols + 2 rows */}
      <StaggerItem className="col-span-2 md:col-span-2 md:row-span-2">
        <CategoryCard category={featured} featured />
      </StaggerItem>

      {/* Side cards */}
      {sideItems.map((category) => (
        <StaggerItem key={category.href}>
          <CategoryCard category={category} />
        </StaggerItem>
      ))}

      {/* 4th item as wide banner spanning full width */}
      {wideItem && (
        <StaggerItem className="col-span-2 md:col-span-3">
          <CategoryCard category={wideItem} wide />
        </StaggerItem>
      )}
    </StaggerGrid>
  );
}

function CategoryCard({
  category,
  featured = false,
  wide = false,
}: {
  category: Category;
  featured?: boolean;
  wide?: boolean;
}) {
  const {t} = useTranslation();

  return (
    <Link
      to={category.href}
      className={cn(
        'group relative overflow-hidden rounded-lg bg-surface-alt block h-full',
        featured && 'aspect-4/3 md:aspect-auto',
        wide && 'aspect-21/9',
        !featured && !wide && 'aspect-3/4',
      )}
    >
      <Image
        data={{
          url: category.image.url,
          altText: category.image.altText || category.title,
        }}
        sizes={
          featured || wide
            ? '(min-width: 1024px) 66vw, 100vw'
            : '(min-width: 1024px) 33vw, 50vw'
        }
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 overlay-card opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        <h3
          className={cn(
            'font-display text-text-on-dark mb-1',
            featured ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl',
          )}
        >
          {category.title}
        </h3>
        {category.description && (
          <p className="text-text-on-dark-muted text-sm line-clamp-2">
            {category.description}
          </p>
        )}
        <span className="inline-flex items-center mt-3 text-text-on-dark text-sm uppercase tracking-wider font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          {t('common.shopNow')}
          <RTLIcon
            icon={ArrowRightIcon}
            className="w-4 h-4 ms-2 transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

// Featured category with larger layout
export interface FeaturedCategoryProps {
  category: Category;
  reverse?: boolean;
  className?: string;
}

export function FeaturedCategory({
  category,
  reverse = false,
  className,
}: FeaturedCategoryProps) {
  const {t} = useTranslation();

  return (
    <section className={cn('py-12 md:py-20', className)}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div
          className={cn(
            'grid md:grid-cols-2 gap-8 md:gap-12 items-center',
          )}
        >
          <Link
            to={category.href}
            className={cn(
              'group relative aspect-square md:aspect-4/5 overflow-hidden rounded-lg bg-surface-alt',
              reverse && 'md:order-2',
            )}
          >
            <Image
              data={{
                url: category.image.url,
                altText: category.image.altText || category.title,
              }}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
          <div className={cn(
            'flex flex-col justify-center',
            reverse ? 'md:order-1 md:pe-8 lg:pe-16' : 'md:ps-8 lg:ps-16',
          )}>
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-text mb-4">
              {category.title}
            </h3>
            {category.description && (
              <p className="text-text-muted text-base md:text-lg mb-6 md:mb-8 max-w-md">
                {category.description}
              </p>
            )}
            <Link
              to={category.href}
              className="group/link inline-flex items-center text-sm uppercase tracking-wider font-medium text-text hover:text-text-muted transition-colors"
            >
              {t('collection.exploreCollection')}
              <RTLIcon icon={ArrowRightIcon} className="w-4 h-4 ms-2 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

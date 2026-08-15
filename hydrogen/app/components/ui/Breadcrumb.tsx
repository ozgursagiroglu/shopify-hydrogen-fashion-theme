import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {cn} from '~/lib/cn';
import {useTranslation} from 'react-i18next';
import {useIsRTL} from '~/lib/hooks/useIsRTL';

// Use permissive type to avoid deep type instantiation issues with i18next TFunction
 
type TranslationFunction = (...args: any[]) => string;

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation component with schema.org structured data
 * Provides hierarchical navigation and improves SEO
 */
export function Breadcrumb({items, className}: BreadcrumbProps) {
  const {t} = useTranslation();
  const isRTL = useIsRTL();
  if (items.length === 0) return null;

  return (
    <nav aria-label={t('a11y.breadcrumb')} className={cn('text-sm', className)}>
      {/* Schema.org BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.label,
              ...(item.href && {item: item.href}),
            })),
          }),
        }}
      />

      <ol className="flex items-center flex-wrap gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href || `breadcrumb-${item.label}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-text-muted hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast ? 'text-primary font-medium' : 'text-text-muted',
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span className="text-text-muted" aria-hidden="true">
                  {isRTL ? '\\' : '/'}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Helper function to build breadcrumb items for product pages
 */
export function buildProductBreadcrumbs(
  t: TranslationFunction,
  product: {title: string; handle: string},
  collection?: {title: string; handle: string} | null,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{label: t('header.navigation.home'), href: '/'}];

  if (collection) {
    items.push({
      label: collection.title,
      href: `/collections/${collection.handle}`,
    });
  }

  items.push({label: product.title});

  return items;
}

/**
 * Helper function to build breadcrumb items for collection pages
 */
export function buildCollectionBreadcrumbs(
  t: TranslationFunction,
  collection: {title: string},
): BreadcrumbItem[] {
  return [
    {label: t('header.navigation.home'), href: '/'},
    {label: t('search.collections'), href: '/collections'},
    {label: collection.title},
  ];
}

/**
 * Helper function to build breadcrumb items for search pages
 */
export function buildSearchBreadcrumbs(t: TranslationFunction, query?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {label: t('header.navigation.home'), href: '/'},
    {label: query ? t('search.titleWithTerm', {term: query}) : t('search.title')},
  ];

  return items;
}

/**
 * Helper function to build breadcrumb items for account pages
 */
export function buildAccountBreadcrumbs(
  t: TranslationFunction,
  pageName: string,
  parentPages?: Array<{label: string; href: string}>,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {label: t('header.navigation.home'), href: '/'},
    {label: t('header.actions.account'), href: '/account'},
  ];

  if (parentPages) {
    parentPages.forEach((page) => {
      items.push(page);
    });
  }

  items.push({label: pageName});

  return items;
}

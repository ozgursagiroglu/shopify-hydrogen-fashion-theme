import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import type {LookbookItemData} from '~/graphql/storefront/MetaobjectQueries';
import {ArrowRightIcon} from '~/components/icons';
import {RTLIcon} from '~/components/icons/RTLIcon';

interface LookbookItemCardProps {
  item: LookbookItemData;
}

export function LookbookItemCard({item}: LookbookItemCardProps) {
  const {t} = useTranslation();

  // Determine the href - prioritize collection, then custom URL
  const href = item.collection
    ? `/collections/${item.collection.handle}`
    : item.url || '#';

  return (
    <Link
      to={href}
      className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-alt"
    >
      {item.image && (
        <Image
          data={{
            url: item.image.url,
            altText: item.image.altText || item.title,
          }}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Title overlay */}
      {item.title && (
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="font-display text-xl md:text-2xl text-text-inverse mb-2">
            {item.title}
          </h3>
          <span className="inline-flex items-center text-text-inverse text-sm uppercase tracking-wider font-medium">
            {t('pages.lookbook.exploreCollection')}
            <RTLIcon icon={ArrowRightIcon} className="w-4 h-4 ms-2" strokeWidth={2} />
          </span>
        </div>
      )}
    </Link>
  );
}

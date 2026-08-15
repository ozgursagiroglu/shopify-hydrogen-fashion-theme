import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import type {LookbookCollection} from '~/graphql/storefront/MetaobjectQueries';

interface CollectionSectionProps {
  collection: LookbookCollection;
}

export function CollectionSection({collection}: CollectionSectionProps) {
  const {t} = useTranslation();

  return (
    <div>
      {/* Collection Header */}
      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-text">
            {collection.title}
          </h3>
          {collection.featured && (
            <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full uppercase tracking-wider">
              {t('pages.lookbook.featured')}
            </span>
          )}
        </div>

        {collection.subtitle && (
          <p className="text-lg md:text-xl text-text-muted mb-3">
            {collection.subtitle}
          </p>
        )}

        {collection.description && (
          <p className="text-text-secondary max-w-3xl leading-relaxed">
            {collection.description}
          </p>
        )}

        {collection.season && (
          <div className="mt-4 flex items-center gap-4 text-sm text-text-muted">
            <span>
              {t('pages.lookbook.season')}: {collection.season}
            </span>
            {collection.year > 0 && (
              <span>
                {t('pages.lookbook.year')}: {collection.year}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Collection Hero Image */}
      {collection.heroImage && (
        <div className="relative aspect-[21/9] rounded-lg overflow-hidden mb-8">
          <Image
            data={{
              url: collection.heroImage.url,
              altText: collection.heroImage.altText || collection.title,
            }}
            sizes="(min-width: 1600px) 1600px, 100vw"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        </div>
      )}
    </div>
  );
}

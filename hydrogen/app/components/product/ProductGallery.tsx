import {useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {cn} from '~/lib/cn';
import {ChevronLeftIcon, ChevronRightIcon, PlayIcon} from '~/components/icons';
import {RTLIcon} from '~/components/icons/RTLIcon';
import {useTranslation} from 'react-i18next';
import {useIsRTL} from '~/lib/hooks/useIsRTL';

// Match GraphQL __typename values (PascalCase)
type MediaType = 'MediaImage' | 'Video' | 'ExternalVideo' | 'Model3d';

interface MediaImage {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

interface MediaVideo {
  url: string;
  mimeType?: string;
}

export interface GalleryMedia {
  __typename?: MediaType;
  id?: string | null;
  image?: MediaImage | null;
  previewImage?: MediaImage | null;
  sources?: MediaVideo[];
  embedUrl?: string | null;
  host?: 'YOUTUBE' | 'VIMEO' | null;
  alt?: string | null;
}

export interface ProductGalleryProps {
  media: GalleryMedia[];
  productTitle: string;
  className?: string;
  // Legacy support for images-only
  images?: MediaImage[];
}

export function ProductGallery({
  media: mediaProp,
  images,
  productTitle,
  className,
}: ProductGalleryProps) {
  const {t} = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isRTL = useIsRTL();

  // Convert images to media format for backward compatibility
  const media: GalleryMedia[] = mediaProp || (images?.map((img) => ({
    __typename: 'MediaImage' as MediaType,
    id: img.id,
    image: img,
  })) ?? []);

  if (!media || media.length === 0) {
    return (
      <div className="aspect-product bg-surface-alt flex items-center justify-center">
        <span className="text-text-muted">{t('product.gallery.noMedia')}</span>
      </div>
    );
  }

  const selectedMedia = media[selectedIndex];

  const renderMediaContent = (item: GalleryMedia) => {
    // Handle MediaImage type
    if (!item.__typename || item.__typename === 'MediaImage') {
      return (
        <Image
          data={item.image!}
          alt={item.image?.altText || item.alt || productTitle}
          className="w-full h-full object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      );
    }

    // Handle Video type
    if (item.__typename === 'Video' && item.sources?.[0]) {
      return (
        <video
          src={item.sources[0].url}
          controls
          playsInline
          className="w-full h-full object-cover"
          poster={item.previewImage?.url}
        >
          <track kind="captions" />
          Your browser does not support the video tag.
        </video>
      );
    }

    // Handle ExternalVideo type (YouTube, Vimeo)
    if (item.__typename === 'ExternalVideo' && item.embedUrl) {
      return (
        <iframe
          src={item.embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`${productTitle} video`}
        />
      );
    }

    // Fallback for unsupported media types
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-alt">
        <span className="text-text-muted">{t('product.gallery.unsupportedMedia')}</span>
      </div>
    );
  };

  const isVideo = (item: GalleryMedia) => {
    return item.__typename === 'Video' || item.__typename === 'ExternalVideo';
  };

  return (
    <div className={cn('flex flex-col-reverse md:flex-row gap-4', className)}>
      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[600px] scrollbar-hide">
          {media.map((item, index) => (
            <button
              key={item.id || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'flex-shrink-0 w-16 h-20 md:w-20 md:h-24 rounded-md overflow-hidden border-2 transition-colors relative',
                selectedIndex === index
                  ? 'border-primary'
                  : 'border-transparent hover:border-border',
              )}
              aria-label={t('product.gallery.viewMedia', {productTitle, mediaType: isVideo(item) ? t('product.gallery.video') : t('product.gallery.image'), index: index + 1})}
              aria-current={selectedIndex === index ? 'true' : 'false'}
            >
              {(item.image || item.previewImage) ? (
                <Image
                  data={(item.image || item.previewImage)!}
                  alt={(item.image || item.previewImage)?.altText || t('product.gallery.thumbnail', {productTitle, index: index + 1})}
                  className="w-full h-full object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full bg-surface-alt" />
              )}

              {/* Video play icon overlay */}
              {isVideo(item) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                    <PlayIcon className="w-4 h-4 text-primary" filled />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Media Display */}
      <div className="flex-1 relative">
        <div className="aspect-product bg-surface-alt rounded-lg overflow-hidden">
          {renderMediaContent(selectedMedia)}
        </div>

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === 0 ? media.length - 1 : prev - 1,
                )
              }
              className={cn(
                'absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/90 rounded-full flex items-center justify-center shadow-md hover:bg-surface transition-colors',
                isRTL ? 'end-4' : 'start-4',
              )}
              aria-label={t('product.gallery.previousMedia')}
            >
              <RTLIcon icon={ChevronLeftIcon} className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === media.length - 1 ? 0 : prev + 1,
                )
              }
              className={cn(
                'absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/90 rounded-full flex items-center justify-center shadow-md hover:bg-surface transition-colors',
                isRTL ? 'start-4' : 'end-4',
              )}
              aria-label={t('product.gallery.nextMedia')}
            >
              <RTLIcon icon={ChevronRightIcon} className="h-5 w-5" strokeWidth={2} />
            </button>
          </>
        )}

        {/* Media Counter */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/90 px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {media.length}
          </div>
        )}
      </div>
    </div>
  );
}

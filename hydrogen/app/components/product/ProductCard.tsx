import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {Image, Money} from '@shopify/hydrogen';
import {cn} from '~/lib/cn';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {Badge, IconButton} from '~/components/ui';
import {useQuickView} from '~/context/QuickViewContext';
import {useWishlist} from '~/context/WishlistContext';
import {useCompare} from '~/context/CompareContext';
import {EyeIcon, HeartIcon, CompareIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';
import {ClientOnly} from '../shared';

// Use the centralized ProductCardFragment for all product card data
type ProductType = ProductCardFragment;

export interface ProductCardProps {
  product: ProductType;
  loading?: 'eager' | 'lazy';
  className?: string;
  showVendor?: boolean;
  showSecondImage?: boolean;
  /** Optional URL override (useful for search tracking URLs) */
  to?: string;
}

function getProductBadges(
  product: ProductType,
): Array<{
  type: 'new' | 'sale' | 'limited';
  labelKey: 'product.new' | 'product.sale' | 'product.limited';
}> {
  const badges: Array<{
    type: 'new' | 'sale' | 'limited';
    labelKey: 'product.new' | 'product.sale' | 'product.limited';
  }> = [];

  // Check for tags
  if ('tags' in product && Array.isArray(product.tags)) {
    if (product.tags.includes('new') || product.tags.includes('New')) {
      badges.push({type: 'new', labelKey: 'product.new'});
    }
    if (product.tags.includes('limited') || product.tags.includes('Limited')) {
      badges.push({type: 'limited', labelKey: 'product.limited'});
    }
  }

  // Check for sale (compare at price)
  if (
    'compareAtPriceRange' in product &&
    product.compareAtPriceRange?.minVariantPrice
  ) {
    const comparePrice = parseFloat(
      product.compareAtPriceRange.minVariantPrice.amount,
    );
    const currentPrice = parseFloat(product.priceRange.minVariantPrice.amount);
    if (comparePrice > currentPrice) {
      badges.push({type: 'sale', labelKey: 'product.sale'});
    }
  }

  return badges;
}

export function ProductCard({
  product,
  loading = 'lazy',
  className,
  showVendor = true,
  showSecondImage = true,
  to,
}: ProductCardProps) {
  const {t} = useTranslation();
  const variantUrl = useVariantUrl(product.handle);
  const productUrl = to || variantUrl;
  const {openQuickView} = useQuickView();
  const {toggleItem, isInWishlist} = useWishlist();
  const {addProduct, removeProduct, isInCompare, canAdd} = useCompare();
  const primaryImage = product.featuredImage;

  // Get secondary image from media nodes (for hover effect)
  let secondaryImage = null;
  if (product.media?.nodes?.[1]) {
    const secondMedia = product.media.nodes[1];
    if (secondMedia.__typename === 'MediaImage' && secondMedia.image) {
      secondaryImage = secondMedia.image;
    }
  }

  const badges = getProductBadges(product);
  const isWishlisted = isInWishlist(product.handle);
  const isComparing = isInCompare(product.id);

  const hasComparePrice =
    'compareAtPriceRange' in product &&
    product.compareAtPriceRange?.minVariantPrice &&
    parseFloat(product.compareAtPriceRange.minVariantPrice.amount) >
      parseFloat(product.priceRange.minVariantPrice.amount);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleItem({
      id: product.id,
      handle: product.handle,
      title: product.title,
      vendor: 'vendor' in product ? product.vendor : undefined,
      price: product.priceRange.minVariantPrice,
      compareAtPrice:
        'compareAtPriceRange' in product
          ? product.compareAtPriceRange?.minVariantPrice
          : undefined,
      image: product.featuredImage
        ? {
            url: product.featuredImage.url,
            altText: product.featuredImage.altText || undefined,
          }
        : undefined,
    });
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isComparing) {
      removeProduct(product.id);
    } else if (canAdd) {
      addProduct({
        id: product.id,
        handle: product.handle,
        title: product.title,
        vendor: 'vendor' in product ? product.vendor : undefined,
        featuredImage: product.featuredImage
          ? {
              url: product.featuredImage.url,
              altText: product.featuredImage.altText,
            }
          : null,
        priceRange: product.priceRange,
        compareAtPriceRange:
          'compareAtPriceRange' in product ? product.compareAtPriceRange : null,
      });
    }
  };

  return (
    <Link
      to={productUrl}
      prefetch="intent"
      className={cn('group block', className)}
    >
      {/* Image Container — V3: shadow lift + gradient overlay on hover */}
      <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-surface-alt shadow-card transition-shadow duration-300 group-hover:shadow-card-hover">
        {primaryImage && (
          <Image
            alt={primaryImage.altText || product.title}
            data={primaryImage}
            loading={loading}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={cn(
              'w-full h-full object-cover',
              showSecondImage &&
                secondaryImage &&
                'transition-opacity duration-300 group-hover:opacity-0',
            )}
          />
        )}

        {/* Secondary Image on Hover */}
        {showSecondImage && secondaryImage && (
          <Image
            alt={
              secondaryImage.altText ||
              t('product.alternateView', {productTitle: product.title})
            }
            data={secondaryImage}
            loading="lazy"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {badges.map((badge) => (
              <Badge key={badge.type} variant={badge.type}>
                {t(badge.labelKey)}
              </Badge>
            ))}
          </div>
        )}

        {/* Quick Actions (appears on hover) */}
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 overlay-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <ClientOnly>
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {/* Quick View Button */}
            <IconButton
              type="button"
              variant="ghost"
              size="md"
              label={t('product.quickView')}
              className="bg-surface shadow-md hover:bg-surface-hover opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
              onClick={(e) => {
                e.preventDefault();
                openQuickView(product.handle);
              }}
            >
              <EyeIcon className="h-5 w-5 text-text" strokeWidth={1.5} />
            </IconButton>

            {/* Wishlist Button — 50ms stagger delay */}
            <IconButton
              type="button"
              variant="ghost"
              size="md"
              label={
                isWishlisted
                  ? t('product.removeFromWishlist')
                  : t('product.addToWishlist')
              }
              className={cn(
                'shadow-md opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-50',
                isWishlisted
                  ? 'bg-primary text-white hover:bg-primary-light'
                  : 'bg-surface text-text hover:bg-surface-hover',
              )}
              onClick={handleWishlistToggle}
            >
              <HeartIcon
                className="h-5 w-5"
                filled={isWishlisted}
                strokeWidth={1.5}
              />
            </IconButton>

            {/* Compare Button — 100ms stagger delay */}
            <IconButton
              type="button"
              variant="ghost"
              size="md"
              label={
                isComparing
                  ? t('product.compare.removeFromComparison')
                  : t('product.compare.addToComparison')
              }
              className={cn(
                'shadow-md opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-100',
                isComparing
                  ? 'bg-primary text-white hover:bg-primary-light'
                  : 'bg-surface text-text hover:bg-surface-hover',
              )}
              onClick={handleCompareToggle}
              disabled={!canAdd && !isComparing}
            >
              <CompareIcon
                className="h-5 w-5"
                filled={isComparing}
                strokeWidth={1.5}
              />
            </IconButton>
          </div>
        </ClientOnly>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-1">
        {showVendor && 'vendor' in product && product.vendor && (
          <p className="text-xs uppercase tracking-wider text-text-muted">
            {product.vendor}
          </p>
        )}

        <h3 className="text-base font-medium text-text line-clamp-2 group-hover:underline transition-colors">
          {product.title}
        </h3>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              hasComparePrice ? 'text-error' : 'text-text',
            )}
          >
            <Money data={product.priceRange.minVariantPrice} />
          </span>

          {hasComparePrice &&
            'compareAtPriceRange' in product &&
            product.compareAtPriceRange?.minVariantPrice && (
              <span className="text-sm text-text-muted line-through">
                <Money data={product.compareAtPriceRange.minVariantPrice} />
              </span>
            )}
        </div>
      </div>
    </Link>
  );
}

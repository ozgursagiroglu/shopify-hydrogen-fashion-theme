import {useState, useMemo, useEffect} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import type {QuickViewProductFragment} from 'storefrontapi.generated';
import {cn} from '~/lib/cn';
import {Modal} from '~/components/ui/Modal';
import {
  Button,
  SizeSelector,
  ColorSelector,
  QuantitySelector,
  Badge,
} from '~/components/ui';
import {useWishlist} from '~/context/WishlistContext';
import {getColorHex, TIMING} from '~/lib/constants';
import {
  CloseIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  ShippingIcon,
  ReturnIcon,
} from '~/components/icons';
import {RTLIcon} from '~/components/icons/RTLIcon';
import {useTranslation} from 'react-i18next';
import {AddToCartButton} from '../cart';
import {useAside} from '../layout';

// Re-export the generated type for external use
export type QuickViewProduct = QuickViewProductFragment;

export interface QuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: QuickViewProduct | null;
}

export function QuickView({isOpen, onClose, product}: QuickViewProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const {toggleItem, isInWishlist} = useWishlist();
  const {t} = useTranslation();
  const {open} = useAside();
  const inWishlist = product?.handle ? isInWishlist(product.handle) : false;

  // Reset state when product changes - legitimate state reset for prop changes
  /* eslint-disable react-hooks/set-state-in-effect -- legitimate state reset when product prop changes */
  useEffect(() => {
    if (product) {
      const defaults: Record<string, string> = {};
      product.options?.forEach((option) => {
        if (option.values?.[0]) {
          defaults[option.name] = option.values[0];
        }
      });
      setSelectedOptions(defaults);
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [product]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Find selected variant
  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- dependencies intentionally narrowed for performance
  const selectedVariant = useMemo(() => {
    if (!product?.variants?.nodes) return null;

    return product.variants.nodes.find((variant) => {
      return variant.selectedOptions?.every(
        (option) => selectedOptions[option.name] === option.value,
      );
    });
  }, [product?.variants?.nodes, selectedOptions]);

  // Calculate discount percentage (must be before early return to maintain hooks order)
  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- dependencies intentionally narrowed for performance
  const discountPercentage = useMemo(() => {
    if (!selectedVariant?.compareAtPrice || !selectedVariant?.price) return 0;
    const original = parseFloat(selectedVariant.compareAtPrice.amount);
    const current = parseFloat(selectedVariant.price.amount);
    if (original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  }, [selectedVariant?.compareAtPrice, selectedVariant?.price]);

  // Early return after all hooks
  if (!product) return null;

  const images = product.images?.nodes || [];
  const currentImage = images[currentImageIndex] || product.featuredImage;

  const hasComparePrice =
    selectedVariant?.compareAtPrice &&
    parseFloat(selectedVariant.compareAtPrice.amount) >
      parseFloat(selectedVariant.price.amount);

  const isOnSale = hasComparePrice;
  const isOutOfStock = selectedVariant && !selectedVariant.availableForSale;

  // Get size and color options
  const sizeOption = product.options?.find(
    (opt) => opt.name.toLowerCase() === 'size',
  );
  const colorOption = product.options?.find(
    (opt) => opt.name.toLowerCase() === 'color',
  );

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    toggleItem({
      id: product.id,
      handle: product.handle,
      title: product.title,
      vendor: product.vendor || undefined,
      price: selectedVariant?.price ||
        product.priceRange?.minVariantPrice || {
          amount: '0',
          currencyCode: 'USD',
        },
      compareAtPrice: selectedVariant?.compareAtPrice || undefined,
      image: product.featuredImage
        ? {
            url: product.featuredImage.url,
            altText: product.featuredImage.altText || undefined,
          }
        : undefined,
    });
  };

  const handleImageChange = (index: number) => {
    if (index === currentImageIndex) return;
    setIsImageLoading(true);
    setCurrentImageIndex(index);
    setTimeout(() => setIsImageLoading(false), TIMING.IMAGE_LOAD_DELAY_MS);
  };

  const handlePrevImage = () => {
    const newIndex =
      currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    handleImageChange(newIndex);
  };

  const handleNextImage = () => {
    const newIndex =
      currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    handleImageChange(newIndex);
  };

  // Check if a size is available for the selected color
  const isSizeAvailable = (size: string): boolean => {
    const matchingVariants = product.variants?.nodes?.filter((variant) => {
      return variant.selectedOptions?.some(
        (opt) => opt.name.toLowerCase() === 'size' && opt.value === size,
      );
    });

    const colorValue = selectedOptions['Color'] || selectedOptions['color'];
    if (!colorValue) {
      return matchingVariants?.some((v) => v.availableForSale) ?? true;
    }

    return (
      matchingVariants?.some(
        (variant) =>
          variant.availableForSale &&
          variant.selectedOptions?.some(
            (opt) =>
              opt.name.toLowerCase() === 'color' && opt.value === colorValue,
          ),
      ) ?? true
    );
  };

  // Check if a color is available for the selected size
  const isColorAvailable = (color: string): boolean => {
    const matchingVariants = product.variants?.nodes?.filter((variant) => {
      return variant.selectedOptions?.some(
        (opt) => opt.name.toLowerCase() === 'color' && opt.value === color,
      );
    });

    const sizeValue = selectedOptions['Size'] || selectedOptions['size'];
    if (!sizeValue) {
      return matchingVariants?.some((v) => v.availableForSale) ?? true;
    }

    return (
      matchingVariants?.some(
        (variant) =>
          variant.availableForSale &&
          variant.selectedOptions?.some(
            (opt) =>
              opt.name.toLowerCase() === 'size' && opt.value === sizeValue,
          ),
      ) ?? true
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" showCloseButton={false}>
      <div className="grid md:grid-cols-2 gap-0 bg-background">
        {/* Image Gallery */}
        <div className="relative bg-surface-alt overflow-hidden">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-md group"
            aria-label={t('product.closeQuickView')}
          >
            <CloseIcon className="w-5 h-5 text-text-secondary group-hover:text-text transition-colors" />
          </button>

          {/* Badges */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            {isOnSale && discountPercentage > 0 && (
              <Badge variant="sale">-{discountPercentage}%</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="limited">{t('product.soldOut')}</Badge>
            )}
          </div>

          {/* Main Image */}
          <div className="aspect-[3/4] relative">
            {currentImage && (
              <div
                className={cn(
                  'w-full h-full transition-opacity duration-300',
                  isImageLoading ? 'opacity-50' : 'opacity-100',
                )}
              >
                <Image
                  data={currentImage}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-md opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                  style={{opacity: 1}}
                  aria-label={t('product.gallery.previousMedia')}
                >
                  <ChevronLeftIcon className="w-5 h-5 text-text" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-md"
                  aria-label={t('product.gallery.nextMedia')}
                >
                  <ChevronRightIcon className="w-5 h-5 text-text" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
              {images.slice(0, 5).map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => handleImageChange(index)}
                  className={cn(
                    'w-10 h-10 rounded-md overflow-hidden transition-all duration-300',
                    currentImageIndex === index
                      ? 'ring-2 ring-accent ring-offset-1'
                      : 'opacity-60 hover:opacity-100',
                  )}
                >
                  <Image
                    data={image}
                    sizes="40px"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {images.length > 5 && (
                <span className="w-10 h-10 flex items-center justify-center text-xs font-medium text-text-muted">
                  +{images.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 md:p-8 lg:p-10 flex flex-col max-h-[80vh] md:max-h-[85vh] overflow-y-auto bg-background">
          {/* Vendor */}
          {product.vendor && (
            <p className="text-xs uppercase tracking-[0.15em] text-accent font-medium mb-3">
              {product.vendor}
            </p>
          )}

          {/* Title */}
          <h2 className="font-display text-2xl md:text-3xl tracking-tight text-text mb-4 leading-tight">
            {product.title}
          </h2>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            {selectedVariant ? (
              <>
                <span
                  className={cn(
                    'text-xl md:text-2xl font-medium tracking-tight',
                    hasComparePrice ? 'text-error' : 'text-text',
                  )}
                >
                  <Money data={selectedVariant.price as MoneyV2} />
                </span>
                {hasComparePrice && selectedVariant.compareAtPrice && (
                  <span className="text-base text-text-muted line-through">
                    <Money data={selectedVariant.compareAtPrice as MoneyV2} />
                  </span>
                )}
              </>
            ) : product.priceRange?.minVariantPrice ? (
              <span className="text-xl md:text-2xl font-medium text-text">
                <Money data={product.priceRange.minVariantPrice as MoneyV2} />
              </span>
            ) : null}
          </div>

          {/* Description (short) */}
          {product.description && (
            <p className="text-text-secondary text-sm leading-relaxed mb-8 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Divider */}
          <div className="w-full h-px bg-border mb-6" />

          {/* Color Selector */}
          {colorOption &&
            colorOption.values &&
            colorOption.values.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-text">
                    {t('product.color')}:{' '}
                    <span className="font-normal text-text-secondary">
                      {selectedOptions[colorOption.name]}
                    </span>
                  </span>
                </div>
                <ColorSelector
                  colors={colorOption.values.map((value) => ({
                    value,
                    label: value,
                    hex: getColorHex(value),
                    available: isColorAvailable(value),
                  }))}
                  selectedColor={selectedOptions[colorOption.name] || null}
                  onSelect={(value) =>
                    handleOptionChange(colorOption.name, value)
                  }
                />
              </div>
            )}

          {/* Size Selector */}
          {sizeOption && sizeOption.values && sizeOption.values.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text">
                  {t('product.size')}:{' '}
                  <span className="font-normal text-text-secondary">
                    {selectedOptions[sizeOption.name]}
                  </span>
                </span>
                <button
                  type="button"
                  className="text-xs font-medium text-text-muted hover:text-accent underline underline-offset-2 transition-colors duration-300"
                >
                  {t('product.sizeGuide')}
                </button>
              </div>
              <SizeSelector
                sizes={sizeOption.values.map((value) => ({
                  value,
                  label: value,
                  available: isSizeAvailable(value),
                }))}
                selectedSize={selectedOptions[sizeOption.name] || null}
                onSelect={(value) => handleOptionChange(sizeOption.name, value)}
              />
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <span className="text-sm font-medium text-text mb-3 block">
              {t('product.quantity')}
            </span>
            <QuantitySelector
              value={quantity}
              min={1}
              max={10}
              onChange={setQuantity}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-border">
            <AddToCartButton
              disabled={isOutOfStock || !selectedVariant}
              lines={
                selectedVariant
                  ? [
                      {
                        merchandiseId: selectedVariant.id,
                        quantity,
                        selectedVariant,
                      },
                    ]
                  : []
              }
              className="w-full"
              onAddComplete={() => {
                onClose();
                open('cart');
              }}
            >
              {isOutOfStock
                ? t('product.soldOut')
                : selectedVariant
                  ? t('product.addToBag')
                  : t('product.selectOptions')}
            </AddToCartButton>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className={cn(
                  'flex-1 h-11 transition-all duration-300',
                  inWishlist &&
                    'border-accent text-accent hover:border-accent/80',
                )}
                onClick={handleWishlistToggle}
              >
                <HeartIcon
                  className="w-5 h-5 mr-2"
                  filled={inWishlist}
                />
                {inWishlist ? t('product.saved') : t('product.save')}
              </Button>

              <Button
                variant="ghost"
                className="w-full h-11"
                as="link"
                to={`/products/${product.handle}`}
                onClick={onClose}
              >
                {t('product.viewDetails')}
                <RTLIcon icon={ArrowRightIcon} className="w-4 h-4 ms-2" />
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-text-muted">
              <ShippingIcon className="w-4 h-4" />
              <span className="text-xs">{t('product.freeShipping')}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <ReturnIcon className="w-4 h-4" />
              <span className="text-xs">{t('product.freeReturns')}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

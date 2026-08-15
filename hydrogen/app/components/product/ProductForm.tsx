import {useNavigate} from 'react-router';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {Image} from '@shopify/hydrogen';
import {useState} from 'react';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from '~/components/cart/AddToCartButton';
import {useAside} from '~/components/layout/Aside';
import {IconButton} from '~/components/ui/IconButton';
import {StockAlert} from '~/components/product/StockAlert';
import {useWishlist} from '~/context/WishlistContext';
import {getColorFromName} from '~/lib/constants';
import {HeartIcon} from '~/components/icons';
import type {ProductFragment} from 'storefrontapi.generated';
import {useTranslation} from 'react-i18next';
import {cn} from '~/lib/cn';
import {SizeGuide} from './SizeGuide';

export function ProductForm({
  productOptions,
  selectedVariant,
  productTitle,
  productHandle,
  productId,
  vendor,
  featuredImage,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  productTitle?: string;
  productHandle?: string;
  productId: string;
  vendor?: string | null;
  featuredImage?: {
    url: string;
    altText?: string | null;
  } | null;
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const {toggleItem, isInWishlist} = useWishlist();
  const {t} = useTranslation();

  const inWishlist = productHandle ? isInWishlist(productHandle) : false;

  const handleWishlistToggle = () => {
    if (!productHandle || !productTitle) return;

    toggleItem({
      id: productId,
      handle: productHandle,
      title: productTitle,
      vendor: vendor || undefined,
      price: selectedVariant?.price || {amount: '0', currencyCode: 'USD'},
      compareAtPrice: selectedVariant?.compareAtPrice || undefined,
      image: featuredImage
        ? {
            url: featuredImage.url,
            altText: featuredImage.altText || undefined,
          }
        : undefined,
    });
  };

  // Get selected value for each option
  const getSelectedValue = (optionName: string) => {
    const option = productOptions.find((o) => o.name === optionName);
    return option?.optionValues.find((v) => v.selected)?.name || '';
  };

  return (
    <div className="space-y-6">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        const isColorOption = option.name.toLowerCase() === 'color';
        const isSizeOption = option.name.toLowerCase() === 'size';
        const selectedValue = getSelectedValue(option.name);

        return (
          <div className="space-y-3" key={option.name}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text">
                {option.name}
                {selectedValue && (
                  <span className="text-text-muted ml-1">
                    : {selectedValue}
                  </span>
                )}
              </span>
              {isSizeOption && (
                <button
                  type="button"
                  className="text-xs text-text-muted hover:text-text underline transition-colors duration-300"
                  onClick={() => setSizeGuideOpen(true)}
                >
                  {t('product.sizeGuide')}
                </button>
              )}
            </div>
            <div className={`flex flex-wrap gap-2`}>
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const commonProps = {
                  className: cn(
                    'relative inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                    {
                      'w-10 h-10 rounded-full border-2': isColorOption,
                      'min-w-12 px-4 py-2 text-sm rounded-md border-2':
                        !isColorOption,
                      'border-accent': selected,
                      'border-border hover:border-text': !selected,
                      'opacity-40 cursor-not-allowed': !available,
                      'cursor-pointer': available,
                    },
                  ),
                  title: name,
                  transition: 'all duration-300',
                };

                if (isDifferentProduct) {
                  return (
                    <Link
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      {...commonProps}
                    >
                      {isColorOption ? (
                        <ProductOptionSwatch swatch={swatch} name={name} />
                      ) : (
                        <span>{name}</span>
                      )}
                      {!available && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-px bg-text-muted -rotate-45" />
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    key={option.name + name}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected && exists) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                    {...commonProps}
                  >
                    {isColorOption ? (
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    ) : (
                      <span>{name}</span>
                    )}
                    {!available && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full h-px bg-text-muted -rotate-45" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex gap-3">
        {/* Add to Cart or Stock Alert */}
        {selectedVariant?.availableForSale ? (
          <AddToCartButton
            onAddComplete={() => {
              open('cart');
            }}
            lines={
              selectedVariant
                ? [
                    {
                      merchandiseId: selectedVariant.id,
                      quantity: 1,
                      selectedVariant,
                    },
                  ]
                : []
            }
          >
            {t('product.addToBag')}
          </AddToCartButton>
        ) : (
          /* Variant sold out - show Stock Alert */
          selectedVariant &&
          productTitle &&
          productHandle && (
            <StockAlert
              productTitle={productTitle}
              variantTitle={
                selectedVariant.title !== 'Default Title'
                  ? selectedVariant.title
                  : undefined
              }
              productHandle={productHandle}
              variantId={selectedVariant.id}
            />
          )
        )}

        <IconButton
          label={
            inWishlist
              ? t('product.removeFromWishlist')
              : t('product.addToWishlist')
          }
          variant="default"
          size="lg"
          className={`border transition-colors ${
            inWishlist
              ? 'border-accent text-accent hover:border-accent/80'
              : 'border-border hover:border-text'
          }`}
          onClick={handleWishlistToggle}
        >
          <HeartIcon
            className="w-[22px] h-[22px]"
            filled={inWishlist}
            strokeWidth={1.5}
          />
        </IconButton>
      </div>

      {/* Size Guide Modal */}
      <SizeGuide
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  // Try to get color from swatch, or derive from name
  const displayColor = color || getColorFromName(name);

  // If we have an image, show it
  if (image) {
    return (
      <span
        aria-label={name}
        className="block w-full h-full rounded-full"
        title={name}
      >
        <Image
          data={{url: image, altText: name}}
          sizes="40px"
          className="w-full h-full object-cover rounded-full"
        />
      </span>
    );
  }

  // If we have a color (from swatch or derived from name), show it
  if (displayColor) {
    return (
      <span
        aria-label={name}
        className="block w-full h-full rounded-full"
        style={{backgroundColor: displayColor}}
        title={name}
      />
    );
  }

  // Fallback: show a styled text badge
  return (
    <span
      aria-label={name}
      className="block w-full h-full rounded-full"
      title={name}
    >
      <span className="font-medium">
        {name.length <= 3 ? name.toUpperCase() : name.slice(0, 2).toUpperCase()}
      </span>
    </span>
  );
}

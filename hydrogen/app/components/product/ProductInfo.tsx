import type {MappedProductOptions} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';
import {ProductPrice} from './ProductPrice';
import {ProductForm} from './ProductForm';
import {Accordion} from '~/components/ui';
import {cn} from '~/lib/cn';
import {FabricIcon, CareIcon, ShippingIcon, ReturnIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';

export interface ProductInfoProps {
  title: string;
  vendor?: string | null;
  descriptionHtml: string;
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  productTitle: string;
  productHandle: string;
  productId: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
  } | null;
  className?: string;
}

export function ProductInfo({
  title,
  vendor,
  descriptionHtml,
  productOptions,
  selectedVariant,
  productTitle,
  productHandle,
  productId,
  featuredImage,
  className,
}: ProductInfoProps) {
  const {t} = useTranslation();

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Brand/Vendor */}
      {vendor && (
        <p className="text-xs uppercase tracking-widest text-text-muted mb-2">
          {vendor}
        </p>
      )}

      {/* Product Title */}
      <h1 className="font-display text-2xl md:text-3xl lg:text-4xl tracking-tight text-text mb-4">
        {title}
      </h1>

      {/* Price */}
      <div className="mb-6">
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
          size="lg"
        />
      </div>

      {/* Variant Selector & Add to Cart */}
      <ProductForm
        productOptions={productOptions}
        selectedVariant={selectedVariant}
        productTitle={productTitle}
        productHandle={productHandle}
        productId={productId}
        vendor={vendor}
        featuredImage={featuredImage}
      />

      {/* Product Details Accordion */}
      <div className="mt-8 border-t border-border">
        <Accordion.Root allowMultiple defaultOpen={['details']}>
          <Accordion.Item id="details">
            <Accordion.Trigger>{t('product.detailsFit')}</Accordion.Trigger>
            <Accordion.Content>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{__html: descriptionHtml}}
              />
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item id="composition">
            <Accordion.Trigger>{t('product.compositionCare')}</Accordion.Trigger>
            <Accordion.Content>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <FabricIcon className="w-4 h-4 mt-0.5 text-text-muted" />
                  <span>{t('product.compositionNote')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CareIcon className="w-4 h-4 mt-0.5 text-text-muted" />
                  <span>{t('product.careNote')}</span>
                </li>
              </ul>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item id="shipping">
            <Accordion.Trigger>{t('product.shippingReturns')}</Accordion.Trigger>
            <Accordion.Content>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <ShippingIcon className="w-4 h-4 mt-0.5 text-text-muted" />
                  <div>
                    <p className="font-medium text-text">{t('product.freeShipping')}</p>
                    <p className="text-text-muted">{t('product.ordersOver')}</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ReturnIcon className="w-4 h-4 mt-0.5 text-text-muted" />
                  <div>
                    <p className="font-medium text-text">{t('product.freeReturns')}</p>
                    <p className="text-text-muted">{t('product.within30Days')}</p>
                  </div>
                </li>
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    </div>
  );
}

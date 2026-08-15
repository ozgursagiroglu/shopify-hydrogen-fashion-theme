import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {cn} from '~/lib/cn';

export interface ProductPriceProps {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
} as const;

export function ProductPrice({
  price,
  compareAtPrice,
  size = 'md',
  className,
}: ProductPriceProps) {
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount || '0');

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isOnSale ? (
        <>
          <span className={cn(sizeStyles[size], 'font-medium text-error')}>
            {price ? <Money data={price} /> : null}
          </span>
          <span className={cn(
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-base',
            'text-text-muted line-through'
          )}>
            <Money data={compareAtPrice} />
          </span>
        </>
      ) : price ? (
        <span className={cn(sizeStyles[size], 'font-medium text-text')}>
          <Money data={price} />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}

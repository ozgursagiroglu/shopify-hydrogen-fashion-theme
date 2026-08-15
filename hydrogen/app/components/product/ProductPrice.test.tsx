/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ProductPrice} from './ProductPrice';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

describe('ProductPrice', () => {
  const mockPrice: MoneyV2 = {
    amount: '99.00',
    currencyCode: 'USD',
  };

  const mockCompareAtPrice: MoneyV2 = {
    amount: '129.00',
    currencyCode: 'USD',
  };

  describe('Rendering', () => {
    it('renders regular price', () => {
      render(<ProductPrice price={mockPrice} />);

      expect(screen.getByTestId('money')).toBeInTheDocument();
      expect(screen.getByText('$99.00')).toBeInTheDocument();
    });

    it('renders without price', () => {
      const {container} = render(<ProductPrice />);

      // Should render a span with non-breaking space when no price
      const emptySpan = container.querySelector('span');
      expect(emptySpan).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(
        <ProductPrice price={mockPrice} className="custom-class" />
      );

      const priceContainer = container.querySelector('.custom-class');
      expect(priceContainer).toBeInTheDocument();
    });
  });

  describe('Sale prices', () => {
    it('renders sale price when compareAtPrice is higher', () => {
      render(<ProductPrice price={mockPrice} compareAtPrice={mockCompareAtPrice} />);

      // Should render both prices
      const moneyElements = screen.getAllByTestId('money');
      expect(moneyElements).toHaveLength(2);
      expect(screen.getByText('$99.00')).toBeInTheDocument();
      expect(screen.getByText('$129.00')).toBeInTheDocument();
    });

    it('does not show sale price when compareAtPrice is lower or equal', () => {
      const lowerCompareAtPrice: MoneyV2 = {
        amount: '89.00',
        currencyCode: 'USD',
      };

      render(<ProductPrice price={mockPrice} compareAtPrice={lowerCompareAtPrice} />);

      // Should only render one price
      const moneyElements = screen.getAllByTestId('money');
      expect(moneyElements).toHaveLength(1);
    });

    it('does not show sale price when compareAtPrice is equal', () => {
      const equalCompareAtPrice: MoneyV2 = {
        amount: '99.00',
        currencyCode: 'USD',
      };

      render(<ProductPrice price={mockPrice} compareAtPrice={equalCompareAtPrice} />);

      // Should only render one price
      const moneyElements = screen.getAllByTestId('money');
      expect(moneyElements).toHaveLength(1);
    });
  });

  describe('Size variants', () => {
    it('renders small size correctly', () => {
      const {container} = render(<ProductPrice price={mockPrice} size="sm" />);

      const priceText = container.querySelector('.text-sm');
      expect(priceText).toBeInTheDocument();
    });

    it('renders medium size by default', () => {
      const {container} = render(<ProductPrice price={mockPrice} />);

      const priceText = container.querySelector('.text-lg');
      expect(priceText).toBeInTheDocument();
    });

    it('renders large size correctly', () => {
      const {container} = render(<ProductPrice price={mockPrice} size="lg" />);

      const priceText = container.querySelector('.text-2xl');
      expect(priceText).toBeInTheDocument();
    });

    it('applies correct size to compareAt price', () => {
      const {container} = render(
        <ProductPrice price={mockPrice} compareAtPrice={mockCompareAtPrice} size="sm" />
      );

      // Compare at price should be smaller than main price
      const compareAtText = container.querySelector('.text-xs');
      expect(compareAtText).toBeInTheDocument();
    });

    it('applies correct size to compareAt price for large variant', () => {
      const {container} = render(
        <ProductPrice price={mockPrice} compareAtPrice={mockCompareAtPrice} size="lg" />
      );

      // Compare at price should be text-lg for large variant
      const compareAtText = container.querySelector('.text-lg');
      expect(compareAtText).toBeInTheDocument();
    });
  });

  describe('Price styling', () => {
    it('applies error color to sale price', () => {
      const {container} = render(
        <ProductPrice price={mockPrice} compareAtPrice={mockCompareAtPrice} />
      );

      const salePrice = container.querySelector('.text-error');
      expect(salePrice).toBeInTheDocument();
    });

    it('applies line-through to compareAt price', () => {
      const {container} = render(
        <ProductPrice price={mockPrice} compareAtPrice={mockCompareAtPrice} />
      );

      const compareAtPrice = container.querySelector('.line-through');
      expect(compareAtPrice).toBeInTheDocument();
    });

    it('applies muted color to compareAt price', () => {
      const {container} = render(
        <ProductPrice price={mockPrice} compareAtPrice={mockCompareAtPrice} />
      );

      const compareAtPrice = container.querySelector('.text-text-muted');
      expect(compareAtPrice).toBeInTheDocument();
    });

    it('applies regular text color to non-sale price', () => {
      const {container} = render(<ProductPrice price={mockPrice} />);

      const regularPrice = container.querySelector('.text-text');
      expect(regularPrice).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles undefined price gracefully', () => {
      const {container} = render(<ProductPrice price={undefined} />);

      // Should render the container with empty span
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('handles null compareAtPrice', () => {
      render(<ProductPrice price={mockPrice} compareAtPrice={null} />);

      const moneyElements = screen.getAllByTestId('money');
      expect(moneyElements).toHaveLength(1);
    });

    it('handles zero price', () => {
      const zeroPrice: MoneyV2 = {
        amount: '0.00',
        currencyCode: 'USD',
      };

      render(<ProductPrice price={zeroPrice} />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('handles very high price', () => {
      const highPrice: MoneyV2 = {
        amount: '9999.99',
        currencyCode: 'USD',
      };

      render(<ProductPrice price={highPrice} />);

      expect(screen.getByText('$9999.99')).toBeInTheDocument();
    });

    it('handles compareAtPrice without price', () => {
      const {container} = render(<ProductPrice compareAtPrice={mockCompareAtPrice} />);

      // Should render container when price is undefined
      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('renders prices in flex layout', () => {
      const {container} = render(
        <ProductPrice price={mockPrice} compareAtPrice={mockCompareAtPrice} />
      );

      const flexContainer = container.querySelector('.flex.items-center.gap-2');
      expect(flexContainer).toBeInTheDocument();
    });

    it('applies gap between prices', () => {
      const {container} = render(
        <ProductPrice price={mockPrice} compareAtPrice={mockCompareAtPrice} />
      );

      const gapContainer = container.querySelector('.gap-2');
      expect(gapContainer).toBeInTheDocument();
    });
  });
});

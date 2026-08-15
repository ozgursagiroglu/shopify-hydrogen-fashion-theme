/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ProductInfo} from './ProductInfo';
import type {MappedProductOptions} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';

// Mock ProductPrice
vi.mock('./ProductPrice', () => ({
  ProductPrice: ({price, compareAtPrice, size}: any) => (
    <div data-testid="product-price" data-size={size}>
      {price?.amount && `$${price.amount}`}
      {compareAtPrice?.amount && ` (was $${compareAtPrice.amount})`}
    </div>
  ),
}));

// Mock ProductForm
vi.mock('./ProductForm', () => ({
  ProductForm: ({productTitle}: {productTitle: string}) => (
    <div data-testid="product-form">{productTitle}</div>
  ),
}));

// Mock Accordion
vi.mock('~/components/ui', () => ({
  Accordion: {
    Root: ({children}: {children: React.ReactNode}) => (
      <div data-testid="accordion-root">{children}</div>
    ),
    Item: ({id, children}: {id: string; children: React.ReactNode}) => (
      <div data-testid={`accordion-item-${id}`}>{children}</div>
    ),
    Trigger: ({children}: {children: React.ReactNode}) => (
      <button data-testid="accordion-trigger">{children}</button>
    ),
    Content: ({children}: {children: React.ReactNode}) => (
      <div data-testid="accordion-content">{children}</div>
    ),
  },
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  FabricIcon: ({className}: {className?: string}) => (
    <svg data-testid="fabric-icon" className={className} />
  ),
  CareIcon: ({className}: {className?: string}) => (
    <svg data-testid="care-icon" className={className} />
  ),
  ShippingIcon: ({className}: {className?: string}) => (
    <svg data-testid="shipping-icon" className={className} />
  ),
  ReturnIcon: ({className}: {className?: string}) => (
    <svg data-testid="return-icon" className={className} />
  ),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'product.detailsFit': 'Details & Fit',
        'product.compositionCare': 'Composition & Care',
        'product.shippingReturns': 'Shipping & Returns',
        'product.compositionNote': '100% Premium Cotton',
        'product.careNote': 'Machine wash cold, hang dry',
        'product.freeShipping': 'Free Shipping',
        'product.ordersOver': 'On orders over $100',
        'product.freeReturns': 'Free Returns',
        'product.within30Days': 'Within 30 days',
      };
      return translations[key] || key;
    },
  }),
}));

describe('ProductInfo', () => {
  const mockSelectedVariant: ProductFragment['selectedOrFirstAvailableVariant'] = {
    id: 'variant-123',
    title: 'Medium / Black',
    availableForSale: true,
    price: {
      amount: '99.00',
      currencyCode: 'USD',
    },
    compareAtPrice: null,
    selectedOptions: [
      {name: 'Size', value: 'Medium'},
      {name: 'Color', value: 'Black'},
    ],
  };

  const mockProductOptions: MappedProductOptions[] = [
    {
      name: 'Size',
      optionValues: [
        {
          name: 'Small',
          handle: '',
          variantUriQuery: 'Size=Small',
          selected: false,
          available: true,
          exists: true,
          isDifferentProduct: false,
          swatch: null,
        },
        {
          name: 'Medium',
          handle: '',
          variantUriQuery: 'Size=Medium',
          selected: true,
          available: true,
          exists: true,
          isDifferentProduct: false,
          swatch: null,
        },
      ],
    },
  ];

  const defaultProps = {
    title: 'Premium Wool Coat',
    vendor: 'ada ÉLAN',
    descriptionHtml: '<p>Luxurious wool coat for any occasion.</p>',
    productOptions: mockProductOptions,
    selectedVariant: mockSelectedVariant,
    productTitle: 'Premium Wool Coat',
    productHandle: 'premium-wool-coat',
    productId: 'product-123',
    featuredImage: {
      url: 'https://example.com/coat.jpg',
      altText: 'Wool coat',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders product title', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      // Check that title is in an h1 element
      const title = container.querySelector('h1');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Premium Wool Coat');
    });

    it('renders vendor when provided', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByText('ada ÉLAN')).toBeInTheDocument();
    });

    it('does not render vendor when null', () => {
      render(<ProductInfo {...defaultProps} vendor={null} />);

      expect(screen.queryByText('ada ÉLAN')).not.toBeInTheDocument();
    });

    it('renders product price', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByTestId('product-price')).toBeInTheDocument();
      expect(screen.getByText('$99.00')).toBeInTheDocument();
    });

    it('renders product form', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByTestId('product-form')).toBeInTheDocument();
    });
  });

  describe('Title styling', () => {
    it('applies display font to title', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      const title = container.querySelector('h1');
      expect(title).toHaveClass('font-display');
    });

    it('applies responsive text sizes to title', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      const title = container.querySelector('h1');
      expect(title).toHaveClass('text-2xl');
      expect(title).toHaveClass('md:text-3xl');
      expect(title).toHaveClass('lg:text-4xl');
    });
  });

  describe('Vendor styling', () => {
    it('applies uppercase to vendor', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      const vendor = container.querySelector('.uppercase');
      expect(vendor).toBeInTheDocument();
      expect(vendor).toHaveTextContent('ada ÉLAN');
    });

    it('applies tracking to vendor', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      const vendor = container.querySelector('.tracking-widest');
      expect(vendor).toBeInTheDocument();
    });
  });

  describe('Price display', () => {
    it('passes large size to ProductPrice', () => {
      render(<ProductInfo {...defaultProps} />);

      const price = screen.getByTestId('product-price');
      expect(price).toHaveAttribute('data-size', 'lg');
    });

    it('displays sale price when compareAtPrice exists', () => {
      const variantWithSale = {
        ...mockSelectedVariant,
        compareAtPrice: {
          amount: '129.00',
          currencyCode: 'USD',
        },
      };

      render(<ProductInfo {...defaultProps} selectedVariant={variantWithSale} />);

      expect(screen.getByText(/was \$129.00/)).toBeInTheDocument();
    });
  });

  describe('Accordion sections', () => {
    it('renders accordion root', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByTestId('accordion-root')).toBeInTheDocument();
    });

    it('renders Details & Fit section', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByTestId('accordion-item-details')).toBeInTheDocument();
      expect(screen.getByText('Details & Fit')).toBeInTheDocument();
    });

    it('renders Composition & Care section', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByTestId('accordion-item-composition')).toBeInTheDocument();
      expect(screen.getByText('Composition & Care')).toBeInTheDocument();
    });

    it('renders Shipping & Returns section', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByTestId('accordion-item-shipping')).toBeInTheDocument();
      expect(screen.getByText('Shipping & Returns')).toBeInTheDocument();
    });

    it('renders description HTML in details section', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      const prose = container.querySelector('.prose');
      expect(prose).toBeInTheDocument();
    });
  });

  describe('Composition & Care section', () => {
    it('renders fabric icon', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByTestId('fabric-icon')).toBeInTheDocument();
    });

    it('renders care icon', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByTestId('care-icon')).toBeInTheDocument();
    });

    it('displays composition note', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByText('100% Premium Cotton')).toBeInTheDocument();
    });

    it('displays care note', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByText('Machine wash cold, hang dry')).toBeInTheDocument();
    });
  });

  describe('Shipping & Returns section', () => {
    it('renders shipping icon', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByTestId('shipping-icon')).toBeInTheDocument();
    });

    it('renders return icon', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByTestId('return-icon')).toBeInTheDocument();
    });

    it('displays free shipping text', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByText('Free Shipping')).toBeInTheDocument();
      expect(screen.getByText('On orders over $100')).toBeInTheDocument();
    });

    it('displays free returns text', () => {
      render(<ProductInfo {...defaultProps} />);

      expect(screen.getByText('Free Returns')).toBeInTheDocument();
      expect(screen.getByText('Within 30 days')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const {container} = render(
        <ProductInfo {...defaultProps} className="custom-class" />
      );

      const root = container.querySelector('.custom-class');
      expect(root).toBeInTheDocument();
    });

    it('preserves default flex-col class', () => {
      const {container} = render(
        <ProductInfo {...defaultProps} className="custom-class" />
      );

      const root = container.querySelector('.flex.flex-col');
      expect(root).toBeInTheDocument();
    });
  });

  describe('Props passed to ProductForm', () => {
    it('passes all required props to ProductForm', () => {
      render(<ProductInfo {...defaultProps} />);

      const form = screen.getByTestId('product-form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveTextContent('Premium Wool Coat');
    });
  });

  describe('Layout and spacing', () => {
    it('applies correct margin to vendor', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      const vendor = container.querySelector('.mb-2');
      expect(vendor).toBeInTheDocument();
    });

    it('applies correct margin to title', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      const title = container.querySelector('h1');
      expect(title).toHaveClass('mb-4');
    });

    it('applies correct margin to price section', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      // Price is wrapped in a div with mb-6
      const priceSection = container.querySelector('.mb-6');
      expect(priceSection).toBeInTheDocument();
    });
  });

  describe('Description HTML', () => {
    it('renders HTML description safely', () => {
      render(<ProductInfo {...defaultProps} />);

      const {container} = render(<ProductInfo {...defaultProps} />);
      const prose = container.querySelector('.prose');
      expect(prose).toBeInTheDocument();
    });

    it('handles complex HTML in description', () => {
      const complexHTML = '<div><h2>Features</h2><ul><li>Item 1</li><li>Item 2</li></ul></div>';
      render(<ProductInfo {...defaultProps} descriptionHtml={complexHTML} />);

      // Should render without errors
      expect(screen.getByTestId('accordion-root')).toBeInTheDocument();
    });

    it('handles empty description', () => {
      render(<ProductInfo {...defaultProps} descriptionHtml="" />);

      expect(screen.getByTestId('accordion-root')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles undefined vendor', () => {
      const {container} = render(<ProductInfo {...defaultProps} vendor={undefined} />);

      // Check title is present (in h1)
      const title = container.querySelector('h1');
      expect(title).toHaveTextContent('Premium Wool Coat');
      expect(screen.queryByText('ada ÉLAN')).not.toBeInTheDocument();
    });

    it('handles variant without price', () => {
      const variantWithoutPrice = {
        ...mockSelectedVariant,
        price: undefined as any,
      };

      render(<ProductInfo {...defaultProps} selectedVariant={variantWithoutPrice} />);

      expect(screen.getByTestId('product-price')).toBeInTheDocument();
    });

    it('handles very long product title', () => {
      const longTitle = 'A'.repeat(200);
      render(<ProductInfo {...defaultProps} title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles special characters in title', () => {
      const specialTitle = 'Product & "Special" <Characters>';
      render(<ProductInfo {...defaultProps} title={specialTitle} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('handles empty product options', () => {
      render(<ProductInfo {...defaultProps} productOptions={[]} />);

      expect(screen.getByTestId('product-form')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic heading for title', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      const heading = container.querySelector('h1');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Premium Wool Coat');
    });

    it('has proper list structure for composition items', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      const lists = container.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(0);
    });
  });

  describe('Border styling', () => {
    it('applies border to accordion section', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      const border = container.querySelector('.border-t.border-border');
      expect(border).toBeInTheDocument();
    });

    it('applies correct margin to accordion', () => {
      const {container} = render(<ProductInfo {...defaultProps} />);

      const accordion = container.querySelector('.mt-8');
      expect(accordion).toBeInTheDocument();
    });
  });
});

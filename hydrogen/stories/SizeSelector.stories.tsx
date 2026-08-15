import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {SizeSelector} from '~/components/ui/SizeSelector';

const meta = {
  title: 'UI/SizeSelector',
  component: SizeSelector,
  parameters: {
    docs: {
      description: {
        component:
          'Size selector component for product variant selection. Supports keyboard navigation and shows unavailable sizes as disabled.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label for the size group',
    },
  },
} satisfies Meta<typeof SizeSelector>;

export default meta;
type Story = StoryObj<typeof SizeSelector>;

const clothingSizes = [
  {value: 'xs', label: 'XS', available: true},
  {value: 's', label: 'S', available: true},
  {value: 'm', label: 'M', available: true},
  {value: 'l', label: 'L', available: false},
  {value: 'xl', label: 'XL', available: true},
  {value: 'xxl', label: 'XXL', available: false},
];

const shoeSizes = [
  {value: '36', label: '36', available: true},
  {value: '37', label: '37', available: true},
  {value: '38', label: '38', available: false},
  {value: '39', label: '39', available: true},
  {value: '40', label: '40', available: true},
  {value: '41', label: '41', available: true},
  {value: '42', label: '42', available: false},
];

const oneSizeOnly = [{value: 'one', label: 'One Size', available: true}];

// Wrapper for interactive stories
const SizeSelectorWrapper = ({
  sizes,
  initialSelected = null,
  ...props
}: {
  sizes: typeof clothingSizes;
  initialSelected?: string | null;
  label?: string;
}) => {
  const [selected, setSelected] = useState<string | null>(initialSelected);
  return (
    <SizeSelector
      sizes={sizes}
      selectedSize={selected}
      onSelect={setSelected}
      {...props}
    />
  );
};

export const Default: Story = {
  render: () => <SizeSelectorWrapper sizes={clothingSizes} />,
};

export const WithSelection: Story = {
  render: () => <SizeSelectorWrapper sizes={clothingSizes} initialSelected="m" />,
};

export const ShoeSizes: Story = {
  render: () => <SizeSelectorWrapper sizes={shoeSizes} label="Shoe size" />,
};

export const OneSize: Story = {
  render: () => <SizeSelectorWrapper sizes={oneSizeOnly} />,
};

export const AllAvailable: Story = {
  render: () => (
    <SizeSelectorWrapper
      sizes={clothingSizes.map((s) => ({...s, available: true}))}
    />
  ),
};

export const MostlySoldOut: Story = {
  render: () => (
    <SizeSelectorWrapper
      sizes={clothingSizes.map((s, i) => ({...s, available: i === 2}))}
      initialSelected="m"
    />
  ),
};

// Product page example
export const ProductPageExample: Story = {
  render: () => {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [error, setError] = useState(false);

    const handleAddToCart = () => {
      if (!selectedSize) {
        setError(true);
        return;
      }
      setError(false);
      // Add to cart logic
    };

    return (
      <div className="space-y-4 max-w-md">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Size</span>
          <button className="text-sm text-text-muted underline">
            Size Guide
          </button>
        </div>
        <SizeSelector
          sizes={clothingSizes}
          selectedSize={selectedSize}
          onSelect={(size) => {
            setSelectedSize(size);
            setError(false);
          }}
        />
        {error && (
          <p className="text-sm text-error">Please select a size</p>
        )}
        <button
          onClick={handleAddToCart}
          className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
        >
          Add to Cart
        </button>
      </div>
    );
  },
};

// With custom label
export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <span className="text-sm font-medium block">Select your size:</span>
      <SizeSelectorWrapper sizes={clothingSizes} />
    </div>
  ),
};

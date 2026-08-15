import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {PriceRangeSlider} from '~/components/ui/PriceRangeSlider';

const meta = {
  title: 'UI/PriceRangeSlider',
  component: PriceRangeSlider,
  parameters: {
    docs: {
      description: {
        component:
          'Dual-thumb price range slider for filtering products by price. Supports custom min/max values, step increments, and currency display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    min: {
      control: 'number',
      description: 'Minimum value',
    },
    max: {
      control: 'number',
      description: 'Maximum value',
    },
    step: {
      control: 'number',
      description: 'Step increment',
    },
    currency: {
      control: 'text',
      description: 'Currency symbol',
    },
  },
} satisfies Meta<typeof PriceRangeSlider>;

export default meta;
type Story = StoryObj<typeof PriceRangeSlider>;

// Interactive wrapper
const PriceRangeWrapper = ({
  initialValue = [0, 500] as [number, number],
  ...props
}: Omit<React.ComponentProps<typeof PriceRangeSlider>, 'value' | 'onChange'> & {
  initialValue?: [number, number];
}) => {
  const [value, setValue] = useState<[number, number]>(initialValue);
  return (
    <div className="w-80">
      <PriceRangeSlider value={value} onChange={setValue} {...props} />
    </div>
  );
};

export const Default: Story = {
  render: () => <PriceRangeWrapper />,
};

export const CustomRange: Story = {
  render: () => (
    <PriceRangeWrapper min={50} max={2000} initialValue={[200, 1500]} />
  ),
};

export const SmallRange: Story = {
  render: () => (
    <PriceRangeWrapper min={0} max={100} initialValue={[25, 75]} step={5} />
  ),
};

export const LuxuryPriceRange: Story = {
  render: () => (
    <PriceRangeWrapper
      min={500}
      max={10000}
      initialValue={[1000, 5000]}
      step={100}
    />
  ),
};

export const EuroCurrency: Story = {
  render: () => (
    <PriceRangeWrapper
      min={0}
      max={1000}
      initialValue={[100, 500]}
      currency="€"
    />
  ),
};

export const PoundCurrency: Story = {
  render: () => (
    <PriceRangeWrapper
      min={0}
      max={800}
      initialValue={[50, 400]}
      currency="£"
    />
  ),
};

export const YenCurrency: Story = {
  render: () => (
    <PriceRangeWrapper
      min={1000}
      max={100000}
      initialValue={[10000, 50000]}
      step={1000}
      currency="¥"
    />
  ),
};

// Filter panel example
export const InFilterPanel: Story = {
  render: () => {
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

    return (
      <div className="w-72 p-4 border border-border rounded-lg">
        <h3 className="font-medium mb-4">Filters</h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Price Range</h4>
            <PriceRangeSlider
              min={0}
              max={1000}
              value={priceRange}
              onChange={setPriceRange}
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Category</h4>
            <div className="space-y-2">
              {['All', 'Dresses', 'Tops', 'Pants', 'Outerwear'].map((cat) => (
                <label key={cat} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    defaultChecked={cat === 'All'}
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="w-full py-2 bg-primary text-white rounded-md text-sm">
            Apply Filters
          </button>
        </div>
      </div>
    );
  },
};

// Collection sidebar example
export const CollectionSidebar: Story = {
  render: () => {
    const [priceRange, setPriceRange] = useState<[number, number]>([100, 800]);

    return (
      <div className="w-64 space-y-6">
        <div>
          <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
            Price
          </h4>
          <PriceRangeSlider
            min={0}
            max={1500}
            value={priceRange}
            onChange={setPriceRange}
            step={50}
          />
        </div>

        <div>
          <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
            Size
          </h4>
          <div className="flex flex-wrap gap-2">
            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
              <button
                key={size}
                className="px-3 py-1 text-sm border border-border rounded hover:border-text"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
            Color
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              '#1C1917',
              '#FFFFFF',
              '#1E3A5F',
              '#C19A6B',
              '#722F37',
            ].map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded-full border border-border"
                style={{backgroundColor: color}}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// With product count
export const WithProductCount: Story = {
  render: () => {
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
    const productCount = Math.floor(
      (1 - (priceRange[0] / 1000 + (1 - priceRange[1] / 1000))) * 156,
    );

    return (
      <div className="w-80 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">Price</h4>
          <span className="text-sm text-text-muted">
            {productCount} products
          </span>
        </div>
        <PriceRangeSlider
          min={0}
          max={1000}
          value={priceRange}
          onChange={setPriceRange}
          step={10}
        />
      </div>
    );
  },
};

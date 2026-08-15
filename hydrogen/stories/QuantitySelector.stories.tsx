import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {QuantitySelector} from '~/components/ui/QuantitySelector';

const meta = {
  title: 'UI/QuantitySelector',
  component: QuantitySelector,
  parameters: {
    docs: {
      description: {
        component:
          'Quantity selector component with increment/decrement buttons. Used in product pages and cart for adjusting item quantities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: {type: 'number', min: 1, max: 99},
      description: 'Current quantity value',
    },
    min: {
      control: 'number',
      description: 'Minimum allowed value',
    },
    max: {
      control: 'number',
      description: 'Maximum allowed value',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof QuantitySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories that compose their own example instead of driving the component through args.
type ComposedStory = StoryObj<typeof QuantitySelector>;

// Wrapper component for interactive stories
const QuantitySelectorWrapper = ({
  initialValue = 1,
  ...props
}: Omit<React.ComponentProps<typeof QuantitySelector>, 'value' | 'onChange'> & {
  initialValue?: number;
}) => {
  const [value, setValue] = useState(initialValue);
  return <QuantitySelector {...props} value={value} onChange={setValue} />;
};

export const Default: ComposedStory = {
  render: () => <QuantitySelectorWrapper />,
};

export const WithValue: ComposedStory = {
  render: () => <QuantitySelectorWrapper initialValue={5} />,
};

export const AtMinimum: ComposedStory = {
  render: () => <QuantitySelectorWrapper initialValue={1} min={1} />,
};

export const AtMaximum: ComposedStory = {
  render: () => <QuantitySelectorWrapper initialValue={10} max={10} />,
};

export const CustomRange: ComposedStory = {
  render: () => <QuantitySelectorWrapper initialValue={2} min={2} max={6} />,
};

export const Disabled: Story = {
  args: {
    value: 3,
    onChange: () => {},
    disabled: true,
  },
};

// Cart item example
export const CartItem: ComposedStory = {
  render: () => {
    const [quantity, setQuantity] = useState(2);
    const price = 89.0;
    return (
      <div className="flex items-center justify-between p-4 border border-border rounded-lg max-w-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-20 bg-surface-alt rounded" />
          <div>
            <p className="font-medium">Silk Blend Top</p>
            <p className="text-sm text-text-muted">Size: M / Color: Navy</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <QuantitySelector value={quantity} onChange={setQuantity} max={10} />
          <p className="font-medium">${(price * quantity).toFixed(2)}</p>
        </div>
      </div>
    );
  },
};

// Product page example
export const ProductPage: ComposedStory = {
  render: () => {
    const [quantity, setQuantity] = useState(1);
    return (
      <div className="space-y-4 max-w-xs">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Quantity:</span>
          <QuantitySelector value={quantity} onChange={setQuantity} max={5} />
        </div>
        <p className="text-xs text-text-muted">
          Only 5 items left in stock
        </p>
      </div>
    );
  },
};

// Limited stock example
export const LimitedStock: ComposedStory = {
  render: () => {
    const [quantity, setQuantity] = useState(1);
    return (
      <div className="space-y-2">
        <QuantitySelector value={quantity} onChange={setQuantity} max={3} />
        <p className="text-xs text-error">Only 3 left!</p>
      </div>
    );
  },
};

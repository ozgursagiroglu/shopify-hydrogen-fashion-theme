import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {ColorSelector} from '~/components/ui/ColorSelector';

const meta = {
  title: 'UI/ColorSelector',
  component: ColorSelector,
  parameters: {
    docs: {
      description: {
        component:
          'Color swatch selector for product variants. Displays color swatches with availability status and supports keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label for the color group',
    },
  },
} satisfies Meta<typeof ColorSelector>;

export default meta;
type Story = StoryObj<typeof ColorSelector>;

const fashionColors = [
  {value: 'black', label: 'Black', hex: '#1C1917', available: true},
  {value: 'white', label: 'White', hex: '#FFFFFF', available: true},
  {value: 'navy', label: 'Navy', hex: '#1E3A5F', available: true},
  {value: 'camel', label: 'Camel', hex: '#C19A6B', available: true},
  {value: 'burgundy', label: 'Burgundy', hex: '#722F37', available: false},
  {value: 'olive', label: 'Olive', hex: '#556B2F', available: true},
];

const metallicColors = [
  {value: 'gold', label: 'Gold', hex: '#D4AF37', available: true},
  {value: 'silver', label: 'Silver', hex: '#C0C0C0', available: true},
  {value: 'rose-gold', label: 'Rose Gold', hex: '#B76E79', available: false},
  {value: 'bronze', label: 'Bronze', hex: '#CD7F32', available: true},
];

const basicColors = [
  {value: 'black', label: 'Black', hex: '#000000', available: true},
  {value: 'white', label: 'White', hex: '#FFFFFF', available: true},
  {value: 'gray', label: 'Gray', hex: '#808080', available: true},
];

// Wrapper for interactive stories
const ColorSelectorWrapper = ({
  colors,
  initialSelected = null,
  ...props
}: {
  colors: typeof fashionColors;
  initialSelected?: string | null;
  label?: string;
}) => {
  const [selected, setSelected] = useState<string | null>(initialSelected);
  return (
    <div className="space-y-2">
      <ColorSelector
        colors={colors}
        selectedColor={selected}
        onSelect={setSelected}
        {...props}
      />
      {selected && (
        <p className="text-sm text-text-muted">
          Selected: {colors.find((c) => c.value === selected)?.label}
        </p>
      )}
    </div>
  );
};

export const Default: Story = {
  render: () => <ColorSelectorWrapper colors={fashionColors} />,
};

export const WithSelection: Story = {
  render: () => (
    <ColorSelectorWrapper colors={fashionColors} initialSelected="navy" />
  ),
};

export const MetallicColors: Story = {
  render: () => <ColorSelectorWrapper colors={metallicColors} />,
};

export const BasicColors: Story = {
  render: () => <ColorSelectorWrapper colors={basicColors} />,
};

export const AllAvailable: Story = {
  render: () => (
    <ColorSelectorWrapper
      colors={fashionColors.map((c) => ({...c, available: true}))}
    />
  ),
};

export const MostlyUnavailable: Story = {
  render: () => (
    <ColorSelectorWrapper
      colors={fashionColors.map((c, i) => ({...c, available: i === 0}))}
      initialSelected="black"
    />
  ),
};

// Product page example
export const ProductPageExample: Story = {
  render: () => {
    const [selectedColor, setSelectedColor] = useState<string | null>('black');

    return (
      <div className="space-y-4 max-w-md">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            Color:{' '}
            <span className="font-normal">
              {fashionColors.find((c) => c.value === selectedColor)?.label ||
                'Select a color'}
            </span>
          </span>
        </div>
        <ColorSelector
          colors={fashionColors}
          selectedColor={selectedColor}
          onSelect={setSelectedColor}
        />
      </div>
    );
  },
};

// With product images preview
export const ColorWithPreview: Story = {
  render: () => {
    const [selectedColor, setSelectedColor] = useState<string | null>('black');
    const selectedColorData = fashionColors.find(
      (c) => c.value === selectedColor,
    );

    return (
      <div className="space-y-4 max-w-xs">
        <div
          className="aspect-[3/4] rounded-lg transition-colors duration-300"
          style={{backgroundColor: selectedColorData?.hex || '#e5e5e5'}}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {selectedColorData?.label || 'Select a color'}
          </p>
          <ColorSelector
            colors={fashionColors}
            selectedColor={selectedColor}
            onSelect={setSelectedColor}
          />
        </div>
      </div>
    );
  },
};

// Jewelry example
export const JewelryColors: Story = {
  render: () => (
    <div className="space-y-2">
      <span className="text-sm font-medium">Metal</span>
      <ColorSelectorWrapper colors={metallicColors} initialSelected="gold" />
    </div>
  ),
};

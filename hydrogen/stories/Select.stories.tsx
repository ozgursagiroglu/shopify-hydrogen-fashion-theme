import type {Meta, StoryObj} from '@storybook/react-vite';
import {Select} from '~/components/ui/Select';

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          'Dropdown select component with custom styling and chevron icon. Supports label, placeholder, and error states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    label: {
      control: 'text',
      description: 'Label text',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    error: {
      control: 'boolean',
      description: 'Error state',
    },
    helperText: {
      control: 'text',
      description: 'Helper or error text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories that compose their own example instead of driving the component through args.
type ComposedStory = StoryObj<typeof Select>;

const countryOptions = [
  {label: 'United States', value: 'us'},
  {label: 'Canada', value: 'ca'},
  {label: 'United Kingdom', value: 'uk'},
  {label: 'Germany', value: 'de'},
  {label: 'France', value: 'fr'},
];

const sizeOptions = [
  {label: 'XS', value: 'xs'},
  {label: 'S', value: 's'},
  {label: 'M', value: 'm'},
  {label: 'L', value: 'l'},
  {label: 'XL', value: 'xl'},
  {label: 'XXL', value: 'xxl', disabled: true},
];

export const Default: Story = {
  args: {
    options: countryOptions,
    placeholder: 'Select a country',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    placeholder: 'Select your country',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Size',
    options: sizeOptions,
    placeholder: 'Select size',
    helperText: 'Refer to our size guide for measurements',
  },
};

export const WithError: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    placeholder: 'Select a country',
    error: true,
    helperText: 'Please select a country',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    defaultValue: 'us',
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    options: sizeOptions,
    placeholder: 'Size',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    options: sizeOptions,
    placeholder: 'Size',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    options: sizeOptions,
    placeholder: 'Size',
    size: 'lg',
  },
};

// Shipping form example
export const ShippingForm: ComposedStory = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Select
        label="Country"
        options={countryOptions}
        placeholder="Select country"
        required
      />
      <Select
        label="State/Province"
        options={[
          {label: 'California', value: 'ca'},
          {label: 'New York', value: 'ny'},
          {label: 'Texas', value: 'tx'},
        ]}
        placeholder="Select state"
        required
      />
    </div>
  ),
};

// All sizes showcase
export const AllSizes: ComposedStory = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-xs">
      <Select options={sizeOptions} placeholder="Small" size="sm" />
      <Select options={sizeOptions} placeholder="Medium" size="md" />
      <Select options={sizeOptions} placeholder="Large" size="lg" />
    </div>
  ),
};

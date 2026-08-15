import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from '~/components/ui/Button';
import {HeartIcon, CartIcon, ArrowRightIcon} from '~/components/icons';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Polymorphic button component following the ada ÉLAN monochromatic design system. Supports button, anchor, and React Router Link rendering modes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'inverse', 'inverse-outline', 'ghost', 'danger'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state with spinner',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Expand to full container width',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary variants
export const Primary: Story = {
  args: {
    children: 'Add to Cart',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'View Details',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Cancel',
    variant: 'ghost',
  },
};

export const Danger: Story = {
  args: {
    children: 'Remove Item',
    variant: 'danger',
  },
};

// Inverse variants (for dark backgrounds)
export const Inverse: Story = {
  args: {
    children: 'Shop Now',
    variant: 'inverse',
  },
  parameters: {
    backgrounds: {default: 'dark'},
  },
};

export const InverseOutline: Story = {
  args: {
    children: 'Learn More',
    variant: 'inverse-outline',
  },
  parameters: {
    backgrounds: {default: 'dark'},
  },
};

// Sizes
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// States
export const Loading: Story = {
  args: {
    children: 'Processing...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Unavailable',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Checkout',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{width: '320px'}}>
        <Story />
      </div>
    ),
  ],
};

// With icons
export const WithLeftIcon: Story = {
  args: {
    children: 'Add to Wishlist',
    leftIcon: <HeartIcon className="h-5 w-5" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Continue Shopping',
    rightIcon: <ArrowRightIcon className="h-5 w-5" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: 'Add to Cart',
    leftIcon: <CartIcon className="h-5 w-5" />,
    rightIcon: <ArrowRightIcon className="h-5 w-5" />,
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 p-4 bg-background rounded-lg">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <div className="flex flex-wrap gap-3 p-4 bg-primary rounded-lg">
        <Button variant="inverse">Inverse</Button>
        <Button variant="inverse-outline">Inverse Outline</Button>
      </div>
    </div>
  ),
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

import type {Meta, StoryObj} from '@storybook/react-vite';
import {Badge} from '~/components/ui/Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'Badge component for product labels and status indicators. Includes product variants (new, sale, limited, soldout) and status variants (success, warning, info, error).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['new', 'sale', 'limited', 'soldout', 'success', 'warning', 'info', 'error'],
      description: 'Badge variant',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories that compose their own example instead of driving the component through args.
type ComposedStory = StoryObj<typeof Badge>;

// Product badges
export const New: Story = {
  args: {
    variant: 'new',
    children: 'New',
  },
};

export const Sale: Story = {
  args: {
    variant: 'sale',
    children: 'Sale',
  },
};

export const Limited: Story = {
  args: {
    variant: 'limited',
    children: 'Limited',
  },
};

export const SoldOut: Story = {
  args: {
    variant: 'soldout',
    children: 'Sold Out',
  },
};

// Status badges
export const Success: Story = {
  args: {
    variant: 'success',
    children: 'In Stock',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Low Stock',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Pre-order',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Unavailable',
  },
};

// Product badge showcase
export const ProductBadges: ComposedStory = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="new">New</Badge>
      <Badge variant="sale">-30%</Badge>
      <Badge variant="limited">Limited Edition</Badge>
      <Badge variant="soldout">Sold Out</Badge>
    </div>
  ),
};

// Status badge showcase
export const StatusBadges: ComposedStory = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">Delivered</Badge>
      <Badge variant="warning">Processing</Badge>
      <Badge variant="info">Shipped</Badge>
      <Badge variant="error">Cancelled</Badge>
    </div>
  ),
};

// On product card example
export const OnProductCard: ComposedStory = {
  render: () => (
    <div className="relative w-64 bg-surface rounded-lg overflow-hidden">
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        <Badge variant="new">New</Badge>
        <Badge variant="sale">-20%</Badge>
      </div>
      <div className="aspect-[3/4] bg-surface-alt" />
      <div className="p-4">
        <p className="font-medium">Silk Blend Blazer</p>
        <p className="text-sm text-text-muted">$299.00</p>
      </div>
    </div>
  ),
};

import type {Meta, StoryObj} from '@storybook/react-vite';
import {Breadcrumb} from '~/components/ui/Breadcrumb';

const meta = {
  title: 'UI/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    docs: {
      description: {
        component:
          'Navigation breadcrumb component with schema.org structured data for SEO. Supports RTL layouts with automatic separator direction.',
      },
    },
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array of breadcrumb items with label and optional href',
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories that compose their own example instead of driving the component through args.
type ComposedStory = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: [
      {label: 'Home', href: '/'},
      {label: 'Women', href: '/collections/women'},
      {label: 'Dresses'},
    ],
  },
};

export const TwoLevels: Story = {
  args: {
    items: [
      {label: 'Home', href: '/'},
      {label: 'Contact Us'},
    ],
  },
};

export const DeepHierarchy: Story = {
  args: {
    items: [
      {label: 'Home', href: '/'},
      {label: 'Women', href: '/collections/women'},
      {label: 'Clothing', href: '/collections/women-clothing'},
      {label: 'Dresses', href: '/collections/women-dresses'},
      {label: 'Evening Dresses'},
    ],
  },
};

export const ProductPage: Story = {
  args: {
    items: [
      {label: 'Home', href: '/'},
      {label: 'Women', href: '/collections/women'},
      {label: 'Silk Blend Blazer'},
    ],
  },
};

export const CollectionPage: Story = {
  args: {
    items: [
      {label: 'Home', href: '/'},
      {label: 'Collections', href: '/collections'},
      {label: 'New Arrivals'},
    ],
  },
};

export const SearchResults: Story = {
  args: {
    items: [
      {label: 'Home', href: '/'},
      {label: 'Search: "silk blazer"'},
    ],
  },
};

export const AccountPage: Story = {
  args: {
    items: [
      {label: 'Home', href: '/'},
      {label: 'Account', href: '/account'},
      {label: 'Order History'},
    ],
  },
};

export const BlogPost: Story = {
  args: {
    items: [
      {label: 'Home', href: '/'},
      {label: 'Journal', href: '/blogs'},
      {label: 'Style Guide', href: '/blogs/style'},
      {label: 'How to Style a Blazer'},
    ],
  },
};

// With page context example
export const WithPageHeader: ComposedStory = {
  render: () => (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          {label: 'Home', href: '/'},
          {label: 'Women', href: '/collections/women'},
          {label: 'Outerwear'},
        ]}
      />
      <h1 className="text-3xl font-display">Outerwear</h1>
      <p className="text-text-muted">
        Discover our collection of luxurious coats and jackets.
      </p>
    </div>
  ),
};

// Product detail example
export const ProductDetailContext: ComposedStory = {
  render: () => (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          {label: 'Home', href: '/'},
          {label: 'Women', href: '/collections/women'},
          {label: 'Coats & Jackets', href: '/collections/women-coats'},
          {label: 'Wool Cashmere Coat'},
        ]}
      />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[3/4] bg-surface-alt rounded-lg" />
        <div className="space-y-4">
          <h1 className="text-2xl font-display">Wool Cashmere Coat</h1>
          <p className="text-lg">$899.00</p>
          <p className="text-text-secondary">
            A timeless piece crafted from the finest wool and cashmere blend.
          </p>
        </div>
      </div>
    </div>
  ),
};

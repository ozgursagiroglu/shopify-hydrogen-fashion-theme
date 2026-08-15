import type {Meta, StoryObj} from '@storybook/react-vite';
import {IconButton} from '~/components/ui/IconButton';
import {
  HeartIcon,
  CartIcon,
  SearchIcon,
  MenuIcon,
  CloseIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '~/components/icons';

const meta = {
  title: 'UI/IconButton',
  component: IconButton,
  parameters: {
    docs: {
      description: {
        component:
          'Circular icon button component for actions like close, menu toggle, favorites, etc. Requires an accessible label.',
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
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'outline'],
      description: 'Visual variant',
    },
    label: {
      control: 'text',
      description: 'Accessible label (required)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories that compose their own example instead of driving the component through args.
type ComposedStory = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    label: 'Add to wishlist',
    children: <HeartIcon className="h-5 w-5" />,
  },
};

export const Ghost: Story = {
  args: {
    label: 'Open menu',
    variant: 'ghost',
    children: <MenuIcon className="h-5 w-5" />,
  },
};

export const Outline: Story = {
  args: {
    label: 'Search',
    variant: 'outline',
    children: <SearchIcon className="h-5 w-5" />,
  },
};

export const Small: Story = {
  args: {
    label: 'Close',
    size: 'sm',
    children: <CloseIcon className="h-4 w-4" />,
  },
};

export const Medium: Story = {
  args: {
    label: 'Cart',
    size: 'md',
    children: <CartIcon className="h-5 w-5" />,
  },
};

export const Large: Story = {
  args: {
    label: 'Filter',
    size: 'lg',
    children: <FilterIcon className="h-6 w-6" />,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Unavailable action',
    disabled: true,
    children: <HeartIcon className="h-5 w-5" />,
  },
};

// All variants showcase
export const AllVariants: ComposedStory = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton label="Default" variant="default">
        <HeartIcon className="h-5 w-5" />
      </IconButton>
      <IconButton label="Ghost" variant="ghost">
        <SearchIcon className="h-5 w-5" />
      </IconButton>
      <IconButton label="Outline" variant="outline">
        <CartIcon className="h-5 w-5" />
      </IconButton>
    </div>
  ),
};

// All sizes showcase
export const AllSizes: ComposedStory = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton label="Small" size="sm">
        <CloseIcon className="h-4 w-4" />
      </IconButton>
      <IconButton label="Medium" size="md">
        <CloseIcon className="h-5 w-5" />
      </IconButton>
      <IconButton label="Large" size="lg">
        <CloseIcon className="h-6 w-6" />
      </IconButton>
    </div>
  ),
};

// Navigation example
export const NavigationArrows: ComposedStory = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton label="Previous" variant="outline">
        <ChevronLeftIcon className="h-5 w-5" />
      </IconButton>
      <IconButton label="Next" variant="outline">
        <ChevronRightIcon className="h-5 w-5" />
      </IconButton>
    </div>
  ),
};

// Header actions example
export const HeaderActions: ComposedStory = {
  render: () => (
    <div className="flex items-center gap-1">
      <IconButton label="Search" variant="ghost">
        <SearchIcon className="h-5 w-5" />
      </IconButton>
      <IconButton label="Wishlist" variant="ghost">
        <HeartIcon className="h-5 w-5" />
      </IconButton>
      <IconButton label="Cart" variant="ghost">
        <CartIcon className="h-5 w-5" />
      </IconButton>
    </div>
  ),
};

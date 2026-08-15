import type {Meta, StoryObj} from '@storybook/react-vite';
import {Spinner} from '~/components/ui/Spinner';

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          'Loading spinner component with three size variants. Uses CSS animation for smooth rotation.',
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
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="sm" />
        <span className="text-xs text-text-muted">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="md" />
        <span className="text-xs text-text-muted">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <span className="text-xs text-text-muted">Large</span>
      </div>
    </div>
  ),
};

// Loading state example
export const LoadingState: Story = {
  render: () => (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Spinner size="lg" />
      <p className="text-sm text-text-muted">Loading products...</p>
    </div>
  ),
};

// Button loading example
export const InlineLoading: Story = {
  render: () => (
    <button
      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-md"
      disabled
    >
      <Spinner size="sm" className="text-white" />
      Processing...
    </button>
  ),
};

// Full page loading
export const FullPageLoading: Story = {
  render: () => (
    <div className="flex items-center justify-center h-64 bg-surface rounded-lg">
      <Spinner size="lg" className="text-primary" />
    </div>
  ),
};

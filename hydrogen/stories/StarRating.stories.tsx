import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {StarRating} from '~/components/ui/StarRating';

const meta = {
  title: 'UI/StarRating',
  component: StarRating,
  parameters: {
    docs: {
      description: {
        component:
          'Star rating component for displaying and inputting ratings. Supports display mode and interactive mode with keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    rating: {
      control: {type: 'range', min: 0, max: 5, step: 0.5},
      description: 'Current rating value (0-5)',
    },
    maxRating: {
      control: {type: 'number', min: 1, max: 10},
      description: 'Maximum rating value',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable interactive rating input',
    },
    showValue: {
      control: 'boolean',
      description: 'Show numeric rating value',
    },
  },
} satisfies Meta<typeof StarRating>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories that compose their own example instead of driving the component through args.
type ComposedStory = StoryObj<typeof StarRating>;

export const Default: Story = {
  args: {
    rating: 4,
  },
};

export const WithValue: Story = {
  args: {
    rating: 4.5,
    showValue: true,
  },
};

export const Small: Story = {
  args: {
    rating: 5,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    rating: 4,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    rating: 3,
    size: 'lg',
  },
};

export const ZeroRating: Story = {
  args: {
    rating: 0,
  },
};

export const PartialRating: Story = {
  args: {
    rating: 3.5,
    showValue: true,
  },
};

// Interactive example with state
export const Interactive: ComposedStory = {
  render: () => {
    const [rating, setRating] = useState(0);
    return (
      <div className="flex flex-col items-center gap-4">
        <StarRating
          rating={rating}
          onChange={setRating}
          interactive
          size="lg"
        />
        <p className="text-sm text-text-muted">
          {rating === 0 ? 'Click to rate' : `You rated: ${rating} stars`}
        </p>
      </div>
    );
  },
};

// All sizes showcase
export const AllSizes: ComposedStory = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-16 text-sm text-text-muted">Small:</span>
        <StarRating rating={4} size="sm" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-16 text-sm text-text-muted">Medium:</span>
        <StarRating rating={4} size="md" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-16 text-sm text-text-muted">Large:</span>
        <StarRating rating={4} size="lg" />
      </div>
    </div>
  ),
};

// Product review example
export const ProductReview: ComposedStory = {
  render: () => (
    <div className="max-w-md p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <StarRating rating={5} size="sm" />
        <span className="text-xs text-text-muted">Verified Purchase</span>
      </div>
      <h4 className="font-medium mb-1">Excellent quality!</h4>
      <p className="text-sm text-text-secondary">
        The fabric is luxurious and the fit is perfect. Highly recommend!
      </p>
      <p className="text-xs text-text-muted mt-2">Sarah M. - Dec 10, 2024</p>
    </div>
  ),
};

// Review summary example
export const ReviewSummary: ComposedStory = {
  render: () => (
    <div className="flex items-center gap-3">
      <StarRating rating={4.5} showValue />
      <span className="text-sm text-text-muted">(128 reviews)</span>
    </div>
  ),
};

import type {Meta, StoryObj} from '@storybook/react-vite';
import {Textarea} from '~/components/ui/Textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          'Multi-line text input component with label, error state, and helper text support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed above the textarea',
    },
    error: {
      control: 'text',
      description: 'Error message displayed below the textarea',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the textarea',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text lines',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Message',
    placeholder: 'Write your message here...',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Description',
    placeholder: 'Describe the issue...',
    helperText: 'Maximum 500 characters',
  },
};

export const WithError: Story = {
  args: {
    label: 'Review',
    defaultValue: 'Bad',
    error: 'Review must be at least 20 characters',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Notes',
    defaultValue: 'This content cannot be edited.',
    disabled: true,
  },
};

export const CustomRows: Story = {
  args: {
    label: 'Long Description',
    placeholder: 'Enter a detailed description...',
    rows: 8,
  },
};

// Contact form example
export const ContactFormMessage: Story = {
  render: () => (
    <div className="max-w-md">
      <Textarea
        label="How can we help?"
        placeholder="Please describe your question or concern..."
        rows={6}
        helperText="Our team typically responds within 24 hours"
      />
    </div>
  ),
};

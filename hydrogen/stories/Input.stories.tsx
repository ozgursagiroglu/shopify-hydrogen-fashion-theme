import type {Meta, StoryObj} from '@storybook/react-vite';
import {Input} from '~/components/ui/Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          'Text input component with label, error state, and helper text support. Uses the ada ÉLAN design system input styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed above the input',
    },
    error: {
      control: 'text',
      description: 'Error message displayed below the input',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the input (hidden when error is present)',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Input type',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    helperText: 'Must be at least 8 characters',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    defaultValue: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Username',
    defaultValue: 'johndoe',
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'John Doe',
    required: true,
  },
};

// Form example
export const ContactForm: Story = {
  render: () => (
    <form className="space-y-4 max-w-md">
      <Input label="Full Name" placeholder="John Doe" required />
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        required
      />
      <Input
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 000-0000"
        helperText="Optional"
      />
    </form>
  ),
};

// All states showcase
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Input label="Default" placeholder="Enter text..." />
      <Input label="With Value" defaultValue="John Doe" />
      <Input
        label="With Error"
        defaultValue="invalid"
        error="This field is invalid"
      />
      <Input
        label="With Helper"
        helperText="This is a helper text"
        placeholder="Enter text..."
      />
      <Input label="Disabled" defaultValue="Cannot edit" disabled />
    </div>
  ),
};

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {Modal} from '~/components/ui/Modal';
import {Button} from '~/components/ui/Button';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    docs: {
      description: {
        component:
          'Accessible modal dialog component with focus trap, keyboard navigation, and portal rendering. Supports multiple sizes and customization options.',
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Modal size variant',
    },
    title: {
      control: 'text',
      description: 'Optional title displayed in header',
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Close modal when clicking overlay',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close modal when pressing Escape key',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button in header',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof Modal>;

// Interactive wrapper for modal stories
const ModalWrapper = ({
  children,
  buttonText = 'Open Modal',
  ...props
}: Omit<React.ComponentProps<typeof Modal>, 'isOpen' | 'onClose'> & {
  buttonText?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>{buttonText}</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} {...props}>
        {children}
      </Modal>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <ModalWrapper title="Modal Title">
      <p className="text-text-secondary">
        This is a basic modal with a title and close button. Click outside or
        press Escape to close.
      </p>
    </ModalWrapper>
  ),
};

export const Small: Story = {
  render: () => (
    <ModalWrapper title="Confirm Action" size="sm" buttonText="Small Modal">
      <p className="text-text-secondary mb-4">
        Are you sure you want to proceed with this action?
      </p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost">Cancel</Button>
        <Button>Confirm</Button>
      </div>
    </ModalWrapper>
  ),
};

export const Medium: Story = {
  render: () => (
    <ModalWrapper title="Product Details" size="md" buttonText="Medium Modal">
      <div className="space-y-4">
        <p className="text-text-secondary">
          The medium modal is the default size, suitable for most content.
        </p>
        <div className="aspect-video bg-surface-alt rounded-lg" />
      </div>
    </ModalWrapper>
  ),
};

export const Large: Story = {
  render: () => (
    <ModalWrapper title="Size Guide" size="lg" buttonText="Large Modal">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 text-left">Size</th>
              <th className="py-2 text-center">Chest (in)</th>
              <th className="py-2 text-center">Waist (in)</th>
              <th className="py-2 text-center">Hip (in)</th>
            </tr>
          </thead>
          <tbody className="text-text-secondary">
            <tr className="border-b border-border">
              <td className="py-2">XS</td>
              <td className="py-2 text-center">32-34</td>
              <td className="py-2 text-center">24-26</td>
              <td className="py-2 text-center">34-36</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2">S</td>
              <td className="py-2 text-center">34-36</td>
              <td className="py-2 text-center">26-28</td>
              <td className="py-2 text-center">36-38</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2">M</td>
              <td className="py-2 text-center">36-38</td>
              <td className="py-2 text-center">28-30</td>
              <td className="py-2 text-center">38-40</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2">L</td>
              <td className="py-2 text-center">38-40</td>
              <td className="py-2 text-center">30-32</td>
              <td className="py-2 text-center">40-42</td>
            </tr>
            <tr>
              <td className="py-2">XL</td>
              <td className="py-2 text-center">40-42</td>
              <td className="py-2 text-center">32-34</td>
              <td className="py-2 text-center">42-44</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ModalWrapper>
  ),
};

export const ExtraLarge: Story = {
  render: () => (
    <ModalWrapper title="Quick Shop" size="xl" buttonText="Extra Large Modal">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="aspect-[3/4] bg-surface-alt rounded-lg" />
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Silk Blend Blazer</h3>
          <p className="text-lg">$499.00</p>
          <p className="text-text-secondary">
            A refined take on the classic blazer, expertly tailored from a
            luxurious silk-wool blend.
          </p>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium block mb-2">Color</span>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1C1917] ring-2 ring-primary ring-offset-2" />
                <div className="w-8 h-8 rounded-full bg-[#1E3A5F]" />
                <div className="w-8 h-8 rounded-full bg-[#C19A6B]" />
              </div>
            </div>
            <div>
              <span className="text-sm font-medium block mb-2">Size</span>
              <div className="flex gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    className="min-w-[3rem] h-10 px-3 text-sm border border-border rounded-md hover:border-text"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button fullWidth>Add to Cart</Button>
        </div>
      </div>
    </ModalWrapper>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <ModalWrapper buttonText="Modal without title">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium">Added to Cart!</h3>
        <p className="text-text-secondary">
          Your item has been added to your shopping cart.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary">Continue Shopping</Button>
          <Button>View Cart</Button>
        </div>
      </div>
    </ModalWrapper>
  ),
};

export const DisableOverlayClose: Story = {
  render: () => (
    <ModalWrapper
      title="Important Notice"
      closeOnOverlayClick={false}
      buttonText="No overlay close"
    >
      <p className="text-text-secondary mb-4">
        This modal can only be closed by clicking the X button or pressing
        Escape. Clicking outside will not close it.
      </p>
      <Button>Acknowledge</Button>
    </ModalWrapper>
  ),
};

// Newsletter signup example
export const NewsletterSignup: Story = {
  render: () => (
    <ModalWrapper title="Stay in Touch" size="sm" buttonText="Newsletter Modal">
      <div className="space-y-4">
        <p className="text-text-secondary">
          Subscribe to receive updates on new arrivals and special offers.
        </p>
        <input
          type="email"
          placeholder="Enter your email"
          className="input w-full"
        />
        <Button fullWidth>Subscribe</Button>
        <p className="text-xs text-text-muted text-center">
          By subscribing, you agree to our Privacy Policy.
        </p>
      </div>
    </ModalWrapper>
  ),
};

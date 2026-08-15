import type {Meta, StoryObj} from '@storybook/react-vite';
import {Accordion} from '~/components/ui/Accordion';

const meta = {
  title: 'UI/Accordion',
  component: Accordion.Root,
  parameters: {
    docs: {
      description: {
        component:
          'Compound accordion component with keyboard navigation support. Uses Root, Item, Trigger, and Content subcomponents.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    allowMultiple: {
      control: 'boolean',
      description: 'Allow multiple items to be open simultaneously',
    },
    defaultOpen: {
      control: 'object',
      description: 'Array of item IDs to be open by default',
    },
  },
} satisfies Meta<typeof Accordion.Root>;

export default meta;
type Story = StoryObj<typeof Accordion.Root>;

export const Default: Story = {
  render: () => (
    <div className="max-w-md">
      <Accordion.Root>
        <Accordion.Item id="item-1">
          <Accordion.Trigger>What is your return policy?</Accordion.Trigger>
          <Accordion.Content>
            We offer free returns within 30 days of purchase. Items must be in
            original condition with tags attached. Simply initiate a return
            through your account or contact our customer service team.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="item-2">
          <Accordion.Trigger>How long does shipping take?</Accordion.Trigger>
          <Accordion.Content>
            Standard shipping takes 5-7 business days. Express shipping (2-3
            business days) is available for an additional fee. Free shipping on
            orders over $150.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="item-3">
          <Accordion.Trigger>Do you ship internationally?</Accordion.Trigger>
          <Accordion.Content>
            Yes! We ship to over 50 countries worldwide. International shipping
            times vary by destination. Customs fees may apply depending on your
            location.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  ),
};

export const WithDefaultOpen: Story = {
  render: () => (
    <div className="max-w-md">
      <Accordion.Root defaultOpen={['item-1']}>
        <Accordion.Item id="item-1">
          <Accordion.Trigger>Product Description</Accordion.Trigger>
          <Accordion.Content>
            Crafted from premium Italian leather, this timeless bag features
            hand-stitched details and antique brass hardware. The spacious
            interior includes a zipped pocket and two open compartments.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="item-2">
          <Accordion.Trigger>Materials & Care</Accordion.Trigger>
          <Accordion.Content>
            100% genuine leather. Clean with a soft, dry cloth. Store in the
            provided dust bag when not in use. Avoid exposure to direct sunlight
            or moisture.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="item-3">
          <Accordion.Trigger>Dimensions</Accordion.Trigger>
          <Accordion.Content>
            Width: 30cm / Height: 22cm / Depth: 12cm. Strap drop: 55cm
            (adjustable).
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  ),
};

export const AllowMultiple: Story = {
  render: () => (
    <div className="max-w-md">
      <Accordion.Root allowMultiple defaultOpen={['shipping', 'returns']}>
        <Accordion.Item id="shipping">
          <Accordion.Trigger>Shipping Information</Accordion.Trigger>
          <Accordion.Content>
            Free standard shipping on all orders over $150. Express delivery
            available for select locations.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="returns">
          <Accordion.Trigger>Returns & Exchanges</Accordion.Trigger>
          <Accordion.Content>
            30-day return policy on all unworn items. Free return shipping
            within the US.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="sizing">
          <Accordion.Trigger>Sizing Guide</Accordion.Trigger>
          <Accordion.Content>
            Refer to our detailed size chart. Model is 5&apos;10&quot; wearing size S. When
            in doubt, size up for a relaxed fit.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  ),
};

// Product page details example
export const ProductDetails: Story = {
  render: () => (
    <div className="max-w-md">
      <Accordion.Root defaultOpen={['description']}>
        <Accordion.Item id="description">
          <Accordion.Trigger>Description</Accordion.Trigger>
          <Accordion.Content>
            <p className="mb-3">
              A refined take on the classic blazer, expertly tailored from a
              luxurious silk-wool blend. Features a single-breasted silhouette
              with peak lapels and horn buttons.
            </p>
            <ul className="list-disc list-inside space-y-1 text-text-muted">
              <li>Fully lined</li>
              <li>Two front flap pockets</li>
              <li>Interior pocket</li>
              <li>Center back vent</li>
            </ul>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="composition">
          <Accordion.Trigger>Composition & Care</Accordion.Trigger>
          <Accordion.Content>
            <p className="mb-2">Shell: 70% Wool, 30% Silk</p>
            <p className="mb-2">Lining: 100% Cupro</p>
            <p className="text-text-muted">Dry clean only</p>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="fit">
          <Accordion.Trigger>Fit & Sizing</Accordion.Trigger>
          <Accordion.Content>
            <p className="mb-2">True to size with a tailored fit.</p>
            <p className="text-text-muted">
              Model is 6&apos;1&quot; (185cm) wearing size 40
            </p>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="shipping">
          <Accordion.Trigger>Shipping & Returns</Accordion.Trigger>
          <Accordion.Content>
            <p className="mb-2">Free shipping on orders over $250</p>
            <p className="text-text-muted">
              Complimentary returns within 14 days
            </p>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  ),
};

// FAQ section example
export const FAQSection: Story = {
  render: () => (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-display mb-6">Frequently Asked Questions</h2>
      <Accordion.Root>
        <Accordion.Item id="faq-1">
          <Accordion.Trigger>
            How do I track my order?
          </Accordion.Trigger>
          <Accordion.Content>
            Once your order ships, you&apos;ll receive an email with tracking
            information. You can also view your order status by logging into
            your account and visiting the Orders section.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="faq-2">
          <Accordion.Trigger>
            Can I modify my order after placing it?
          </Accordion.Trigger>
          <Accordion.Content>
            Orders can be modified within 1 hour of placement. After that,
            please contact our customer service team immediately. We&apos;ll do our
            best to accommodate changes before your order ships.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="faq-3">
          <Accordion.Trigger>
            Do you offer gift wrapping?
          </Accordion.Trigger>
          <Accordion.Content>
            Yes! Complimentary gift wrapping is available at checkout. Your item
            will arrive in our signature packaging with a personalized message
            card.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item id="faq-4">
          <Accordion.Trigger>
            What payment methods do you accept?
          </Accordion.Trigger>
          <Accordion.Content>
            We accept all major credit cards (Visa, Mastercard, American
            Express), PayPal, Apple Pay, and Shop Pay. Afterpay is also
            available for orders between $50-$1000.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  ),
};

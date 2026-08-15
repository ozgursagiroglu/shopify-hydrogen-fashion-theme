import type {Meta, StoryObj} from '@storybook/react-vite';
import {SectionHeader} from '~/components/ui/SectionHeader';

const meta = {
  title: 'UI/SectionHeader',
  component: SectionHeader,
  parameters: {
    docs: {
      description: {
        component:
          'Section header component with title, optional subtitle, and action link. Used for consistent section headings throughout the site.',
      },
    },
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Main heading text',
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle text',
    },
    centered: {
      control: 'boolean',
      description: 'Center align the header',
    },
    action: {
      description: 'Optional action link with label and href',
    },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories that compose their own example instead of driving the component through args.
type ComposedStory = StoryObj<typeof SectionHeader>;

export const Default: Story = {
  args: {
    title: 'New Arrivals',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'New Arrivals',
    subtitle: 'Discover our latest collection of timeless pieces',
  },
};

export const WithAction: Story = {
  args: {
    title: 'New Arrivals',
    action: {
      label: 'View All',
      href: '/collections/new-arrivals',
    },
  },
};

export const WithSubtitleAndAction: Story = {
  args: {
    title: 'New Arrivals',
    subtitle: 'Discover our latest collection of timeless pieces',
    action: {
      label: 'Shop Now',
      href: '/collections/new-arrivals',
    },
  },
};

export const Centered: Story = {
  args: {
    title: 'Why Choose Us',
    subtitle: 'Discover what makes ada ÉLAN different',
    centered: true,
  },
};

export const CenteredWithAction: Story = {
  args: {
    title: 'Customer Reviews',
    subtitle: 'See what our customers are saying',
    centered: true,
    action: {
      label: 'Read All Reviews',
      href: '/reviews',
    },
  },
};

// Homepage section examples
export const NewArrivalsSection: ComposedStory = {
  render: () => (
    <div className="space-y-8">
      <SectionHeader
        title="New Arrivals"
        subtitle="Fresh styles for the season"
        action={{label: 'View All', href: '/collections/new-arrivals'}}
      />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-[3/4] bg-surface-alt rounded-lg" />
            <p className="text-sm font-medium">Product {i}</p>
            <p className="text-sm text-text-muted">$199.00</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const FeaturedCollections: ComposedStory = {
  render: () => (
    <div className="space-y-8">
      <SectionHeader
        title="Shop by Category"
        subtitle="Explore our curated collections"
        centered
      />
      <div className="grid grid-cols-3 gap-6">
        {['Women', 'Men', 'Accessories'].map((cat) => (
          <div key={cat} className="relative group cursor-pointer">
            <div className="aspect-[4/5] bg-surface-alt rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-display text-white drop-shadow-md">
                {cat}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const TestimonialSection: ComposedStory = {
  render: () => (
    <div className="space-y-8 text-center">
      <SectionHeader
        title="What Our Customers Say"
        subtitle="Real reviews from real customers"
        centered
        action={{label: 'See All Reviews', href: '/reviews'}}
      />
      <div className="max-w-2xl mx-auto">
        <blockquote className="text-lg italic text-text-secondary">
          &quot;The quality is exceptional. I&apos;ve been shopping here for years and
          have never been disappointed. The attention to detail in every piece
          is remarkable.&quot;
        </blockquote>
        <p className="mt-4 font-medium">— Sarah M., Verified Buyer</p>
      </div>
    </div>
  ),
};

export const BlogSection: ComposedStory = {
  render: () => (
    <div className="space-y-8">
      <SectionHeader
        title="From the Journal"
        subtitle="Style tips, trends, and more"
        action={{label: 'Read More', href: '/blogs'}}
      />
      <div className="grid grid-cols-3 gap-6">
        {[
          'How to Style a Blazer',
          'Spring Color Trends',
          'Sustainable Fashion Guide',
        ].map((title) => (
          <div key={title} className="space-y-3">
            <div className="aspect-video bg-surface-alt rounded-lg" />
            <p className="text-xs text-text-muted uppercase tracking-wider">
              Style Guide
            </p>
            <p className="font-medium">{title}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

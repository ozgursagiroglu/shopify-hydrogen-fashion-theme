import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  // Navigation & UI Icons
  CloseIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
  // Cart & Shopping Icons
  CartIcon,
  // Heart / Wishlist Icons
  HeartIcon,
  // Compare Icon
  CompareIcon,
  // Chevron / Arrow Icons
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  // Plus / Minus Icons
  PlusIcon,
  MinusIcon,
  // Check / Status Icons
  CheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  // Eye / View Icons
  EyeIcon,
  // Shipping & Delivery Icons
  PackageIcon,
  ShippingIcon,
  ReturnIcon,
  // Globe / Locale Icons
  GlobeIcon,
  // Image / Gallery Icons
  ImageIcon,
  // Filter / Sort Icons
  FilterIcon,
  // Social Media Icons
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
  TikTokIcon,
  YouTubeIcon,
  // Misc Icons
  StarIcon,
  BellIcon,
  QuoteIcon,
  SparklesIcon,
  LeafIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  TagIcon,
  LockClosedIcon,
  PlayIcon,
  SpinnerIcon,
  GiftIcon,
  VerifiedIcon,
  CommentIcon,
  FabricIcon,
  CareIcon,
  TipIcon,
  ArticleIcon,
  PageIcon,
  LogoutIcon,
  ExternalLinkIcon,
  CollectionIcon,
} from '~/components/icons';

// Dummy component for Storybook
function IconShowcase() {
  return null;
}

const meta = {
  title: 'Foundation/Icons',
  component: IconShowcase,
  parameters: {
    docs: {
      description: {
        component:
          'Complete icon library for the ada ÉLAN starter kit. All icons accept `className`, `filled` (where applicable), and `strokeWidth` props.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof IconShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

interface IconItemProps {
  name: string;
  icon: React.ReactNode;
  hasFilled?: boolean;
}

function IconItem({name, icon, hasFilled}: IconItemProps) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-surface-hover transition-colors">
      <div className="w-6 h-6 text-primary">{icon}</div>
      <span className="text-xs text-text-muted text-center font-mono">{name}</span>
      {hasFilled && (
        <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">
          filled
        </span>
      )}
    </div>
  );
}

function IconSection({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 pb-2 border-b border-border">
        {title}
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">{children}</div>
    </div>
  );
}

export const AllIcons: Story = {
  render: () => (
    <div className="p-6 bg-background min-h-screen">
      <div className="mb-8">
        <h2 className="font-display text-2xl text-primary mb-2">Icon Library</h2>
        <p className="text-text-muted text-sm">
          All icons are 24x24 SVGs. Use <code className="bg-surface-alt px-1 rounded">className=&quot;w-5 h-5&quot;</code> or similar to size them.
        </p>
      </div>

      <IconSection title="Navigation & UI">
        <IconItem name="CloseIcon" icon={<CloseIcon className="w-6 h-6" />} />
        <IconItem name="MenuIcon" icon={<MenuIcon className="w-6 h-6" />} />
        <IconItem name="SearchIcon" icon={<SearchIcon className="w-6 h-6" />} />
        <IconItem name="UserIcon" icon={<UserIcon className="w-6 h-6" />} />
        <IconItem name="FilterIcon" icon={<FilterIcon className="w-6 h-6" />} />
        <IconItem name="EyeIcon" icon={<EyeIcon className="w-6 h-6" />} />
        <IconItem name="LogoutIcon" icon={<LogoutIcon className="w-6 h-6" />} />
        <IconItem name="ExternalLinkIcon" icon={<ExternalLinkIcon className="w-6 h-6" />} />
      </IconSection>

      <IconSection title="E-commerce">
        <IconItem name="CartIcon" icon={<CartIcon className="w-6 h-6" />} />
        <IconItem name="HeartIcon" icon={<HeartIcon className="w-6 h-6" />} hasFilled />
        <IconItem name="CompareIcon" icon={<CompareIcon className="w-6 h-6" />} />
        <IconItem name="TagIcon" icon={<TagIcon className="w-6 h-6" />} />
        <IconItem name="GiftIcon" icon={<GiftIcon className="w-6 h-6" />} />
        <IconItem name="CollectionIcon" icon={<CollectionIcon className="w-6 h-6" />} />
      </IconSection>

      <IconSection title="Arrows & Chevrons">
        <IconItem name="ChevronLeftIcon" icon={<ChevronLeftIcon className="w-6 h-6" />} />
        <IconItem name="ChevronRightIcon" icon={<ChevronRightIcon className="w-6 h-6" />} />
        <IconItem name="ChevronDownIcon" icon={<ChevronDownIcon className="w-6 h-6" />} />
        <IconItem name="ArrowLeftIcon" icon={<ArrowLeftIcon className="w-6 h-6" />} />
        <IconItem name="ArrowRightIcon" icon={<ArrowRightIcon className="w-6 h-6" />} />
        <IconItem name="ArrowUpIcon" icon={<ArrowUpIcon className="w-6 h-6" />} />
        <IconItem name="ArrowDownIcon" icon={<ArrowDownIcon className="w-6 h-6" />} />
      </IconSection>

      <IconSection title="Actions">
        <IconItem name="PlusIcon" icon={<PlusIcon className="w-6 h-6" />} />
        <IconItem name="MinusIcon" icon={<MinusIcon className="w-6 h-6" />} />
        <IconItem name="CheckIcon" icon={<CheckIcon className="w-6 h-6" />} />
        <IconItem name="PlayIcon" icon={<PlayIcon className="w-6 h-6" />} />
        <IconItem name="LockClosedIcon" icon={<LockClosedIcon className="w-6 h-6" />} />
      </IconSection>

      <IconSection title="Status & Feedback">
        <IconItem name="CheckCircleIcon" icon={<CheckCircleIcon className="w-6 h-6" />} />
        <IconItem name="ExclamationCircleIcon" icon={<ExclamationCircleIcon className="w-6 h-6" />} />
        <IconItem name="SpinnerIcon" icon={<SpinnerIcon className="w-6 h-6" />} />
        <IconItem name="BellIcon" icon={<BellIcon className="w-6 h-6" />} />
        <IconItem name="VerifiedIcon" icon={<VerifiedIcon className="w-6 h-6" />} />
      </IconSection>

      <IconSection title="Shipping & Delivery">
        <IconItem name="PackageIcon" icon={<PackageIcon className="w-6 h-6" />} />
        <IconItem name="ShippingIcon" icon={<ShippingIcon className="w-6 h-6" />} />
        <IconItem name="ReturnIcon" icon={<ReturnIcon className="w-6 h-6" />} />
      </IconSection>

      <IconSection title="Contact & Location">
        <IconItem name="MailIcon" icon={<MailIcon className="w-6 h-6" />} />
        <IconItem name="PhoneIcon" icon={<PhoneIcon className="w-6 h-6" />} />
        <IconItem name="MapPinIcon" icon={<MapPinIcon className="w-6 h-6" />} />
        <IconItem name="GlobeIcon" icon={<GlobeIcon className="w-6 h-6" />} />
        <IconItem name="ClockIcon" icon={<ClockIcon className="w-6 h-6" />} />
      </IconSection>

      <IconSection title="Content & Media">
        <IconItem name="ImageIcon" icon={<ImageIcon className="w-6 h-6" />} />
        <IconItem name="QuoteIcon" icon={<QuoteIcon className="w-6 h-6" />} />
        <IconItem name="CommentIcon" icon={<CommentIcon className="w-6 h-6" />} />
        <IconItem name="ArticleIcon" icon={<ArticleIcon className="w-6 h-6" />} />
        <IconItem name="PageIcon" icon={<PageIcon className="w-6 h-6" />} />
      </IconSection>

      <IconSection title="Product Features">
        <IconItem name="StarIcon" icon={<StarIcon className="w-6 h-6" />} hasFilled />
        <IconItem name="SparklesIcon" icon={<SparklesIcon className="w-6 h-6" />} />
        <IconItem name="LeafIcon" icon={<LeafIcon className="w-6 h-6" />} />
        <IconItem name="FabricIcon" icon={<FabricIcon className="w-6 h-6" />} />
        <IconItem name="CareIcon" icon={<CareIcon className="w-6 h-6" />} />
        <IconItem name="TipIcon" icon={<TipIcon className="w-6 h-6" />} />
      </IconSection>

      <IconSection title="Social Media">
        <IconItem name="InstagramIcon" icon={<InstagramIcon className="w-6 h-6" />} />
        <IconItem name="FacebookIcon" icon={<FacebookIcon className="w-6 h-6" />} />
        <IconItem name="TwitterIcon" icon={<TwitterIcon className="w-6 h-6" />} />
        <IconItem name="PinterestIcon" icon={<PinterestIcon className="w-6 h-6" />} />
        <IconItem name="TikTokIcon" icon={<TikTokIcon className="w-6 h-6" />} />
        <IconItem name="YouTubeIcon" icon={<YouTubeIcon className="w-6 h-6" />} />
      </IconSection>
    </div>
  ),
};

export const FilledVariants: Story = {
  render: () => (
    <div className="p-6 bg-background">
      <div className="mb-6">
        <h2 className="font-display text-xl text-primary mb-2">Filled Variants</h2>
        <p className="text-text-muted text-sm">
          Some icons support a <code className="bg-surface-alt px-1 rounded">filled</code> prop for solid variants.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="flex flex-col items-center gap-3 p-4 border border-border rounded-lg">
          <div className="flex gap-4">
            <HeartIcon className="w-8 h-8 text-primary" />
            <HeartIcon className="w-8 h-8 text-primary" filled />
          </div>
          <span className="text-xs text-text-muted">HeartIcon</span>
        </div>
        <div className="flex flex-col items-center gap-3 p-4 border border-border rounded-lg">
          <div className="flex gap-4">
            <StarIcon className="w-8 h-8 text-primary" />
            <StarIcon className="w-8 h-8 text-primary" filled />
          </div>
          <span className="text-xs text-text-muted">StarIcon</span>
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="p-6 bg-background">
      <div className="mb-6">
        <h2 className="font-display text-xl text-primary mb-2">Icon Sizes</h2>
        <p className="text-text-muted text-sm">
          Use Tailwind width/height classes to size icons.
        </p>
      </div>
      <div className="flex items-end gap-8">
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-4 h-4 text-primary" />
          <span className="text-xs text-text-muted">w-4 h-4</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-5 h-5 text-primary" />
          <span className="text-xs text-text-muted">w-5 h-5</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-6 h-6 text-primary" />
          <span className="text-xs text-text-muted">w-6 h-6</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-8 h-8 text-primary" />
          <span className="text-xs text-text-muted">w-8 h-8</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-10 h-10 text-primary" />
          <span className="text-xs text-text-muted">w-10 h-10</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-12 h-12 text-primary" />
          <span className="text-xs text-text-muted">w-12 h-12</span>
        </div>
      </div>
    </div>
  ),
};

export const StrokeWeights: Story = {
  render: () => (
    <div className="p-6 bg-background">
      <div className="mb-6">
        <h2 className="font-display text-xl text-primary mb-2">Stroke Weights</h2>
        <p className="text-text-muted text-sm">
          Use <code className="bg-surface-alt px-1 rounded">strokeWidth</code> prop to adjust line thickness.
        </p>
      </div>
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-8 h-8 text-primary" strokeWidth={1} />
          <span className="text-xs text-text-muted">strokeWidth=1</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-8 h-8 text-primary" strokeWidth={1.5} />
          <span className="text-xs text-text-muted">strokeWidth=1.5</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-8 h-8 text-primary" strokeWidth={2} />
          <span className="text-xs text-text-muted">strokeWidth=2</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-8 h-8 text-primary" strokeWidth={2.5} />
          <span className="text-xs text-text-muted">strokeWidth=2.5</span>
        </div>
      </div>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="p-6 bg-background">
      <div className="mb-6">
        <h2 className="font-display text-xl text-primary mb-2">Icon Colors</h2>
        <p className="text-text-muted text-sm">
          Icons inherit color from <code className="bg-surface-alt px-1 rounded">currentColor</code>. Use text color classes.
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-8 h-8 text-primary" />
          <span className="text-xs text-text-muted">text-primary</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-8 h-8 text-text-secondary" />
          <span className="text-xs text-text-muted">text-secondary</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-8 h-8 text-text-muted" />
          <span className="text-xs text-text-muted">text-muted</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <HeartIcon className="w-8 h-8 text-accent" />
          <span className="text-xs text-text-muted">text-accent</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 bg-primary rounded-lg">
          <HeartIcon className="w-8 h-8 text-white" />
          <span className="text-xs text-white/70">text-white</span>
        </div>
      </div>
    </div>
  ),
};

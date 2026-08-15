# ada ÉLAN Starter Kit - Customization Guide

This guide explains how to customize the ada ÉLAN Shopify Hydrogen starter kit to match your brand identity while maintaining the premium, editorial aesthetic.

---

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Color Customization](#color-customization)
3. [Typography Customization](#typography-customization)
4. [Layout & Spacing](#layout--spacing)
5. [Component Customization](#component-customization)
6. [Advanced Customizations](#advanced-customizations)
7. [Best Practices](#best-practices)

---

## Design System Overview

ada ÉLAN is built on a carefully crafted design system inspired by premium European fashion houses like COS, Totême, and Acne Studios. The starter kit follows these core principles:

### Brand Identity: Editorial Luxury

- **Monochromatic Elegance**: Black, white, and warm neutrals dominate
- **Editorial Aesthetic**: Magazine-quality layouts with generous whitespace
- **Typography First**: Headlines carry the visual weight
- **Understated Luxury**: No flashy colors, subtle refinements only

### Core Design Principles

| Principle        | Implementation                                |
| ---------------- | --------------------------------------------- |
| Less is More     | Minimal UI, maximum impact                    |
| Black & White    | Buttons are always black/white, never colored |
| Photography Hero | Full-bleed imagery, fashion-forward           |
| Subtle Motion    | Gentle reveals, smooth transitions            |
| TailwindCSS Only | No custom CSS files, design tokens only       |

### Key Design Files

All customizations are made through these files:

- **`hydrogen/app/styles/tailwind.css`** - Theme design tokens (colors, fonts, spacing)
- **`hydrogen/app/root.tsx`** - Font loading configuration
- **`hydrogen/app/lib/constants.ts`** - Application constants and color mappings

---

## Color Customization

### Current Color Palette

The ada ÉLAN starter kit uses a sophisticated, monochromatic palette with warm neutrals:

```css
/* Primary Brand Color (Rich Black/Espresso) */
--color-primary: #1C1917;
--color-primary-hover: #0C0A09;
--color-primary-light: #292524;

/* Accent Color (Warm Amber) - Subtle use only */
--color-accent: #D97706;
--color-accent-hover: #B45309;
--color-accent-light: #F59E0B;

/* Surface Colors */
--color-background: #FAF9F7;  /* Warm off-white */
--color-surface: #FFFFFF;     /* Pure white */
--color-surface-alt: #EFECE6; /* Alternative sections */
--color-surface-hover: #F5F4F1;

/* Text Colors */
--color-text: #1C1917;           /* Primary text */
--color-text-secondary: #44403C; /* Secondary text */
--color-text-muted: #78716C;     /* Muted text */
--color-text-inverse: #FAF9F7;   /* Text on dark backgrounds */

/* Border Colors */
--color-border: #E7E4DD;         /* Default borders */
--color-border-strong: #D6D3CC;  /* Emphasized borders */
```

### How to Change Colors

**Location:** `hydrogen/app/styles/tailwind.css`

1. Open the file in your editor
2. Locate the `@theme` block (starts around line 18)
3. Modify the color values you want to change
4. Save and restart your development server

#### Example: Change to a Blue Accent

```css
@theme {
  /* Change accent from warm amber to blue */
  --color-accent: #3b82f6;        /* Blue */
  --color-accent-hover: #2563eb;  /* Darker blue */
  --color-accent-light: #60a5fa;  /* Lighter blue */
}
```

### Color Usage Guidelines

⚠️ **Important Design Rules:**

1. **Primary Buttons**: Always use black (`bg-primary`) or white (`bg-white`), NEVER accent color
2. **Accent Color**: Only for:
   - Focus rings on form inputs
   - Link hover states
   - Badges (NEW, SALE, LIMITED)
   - Success states and notifications
3. **Background**: Keep warm and neutral for fashion aesthetic
4. **Contrast**: Maintain WCAG AA contrast ratio (4.5:1 minimum)

### Product Color Swatches

The starter kit includes 70+ pre-defined color mappings for product variants.

**Location:** `hydrogen/app/lib/constants.ts` (lines 97-173)

```typescript
export const COLOR_MAP: Record<string, string> = {
  // Neutrals
  'Black': 'bg-primary text-white',
  'White': 'bg-white text-primary border border-border',
  'Beige': 'bg-stone-200 text-primary',

  // Add your custom colors
  'Navy Blue': 'bg-blue-900 text-white',
  'Forest Green': 'bg-green-900 text-white',
  'Burgundy': 'bg-red-900 text-white',
  // ...
};
```

**To add new product colors:**

1. Open `hydrogen/app/lib/constants.ts`
2. Add new entries to the `COLOR_MAP` object
3. Use Tailwind color classes for consistent styling
4. Product variant swatches will automatically use these mappings

---

## Typography Customization

### Current Font Stack

ada ÉLAN uses two carefully selected Google Fonts:

```css
--font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
--font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
```

- **Display Font** (`font-display`): Cormorant Garamond - Used for headings, hero titles
- **Body Font** (`font-sans`): Plus Jakarta Sans - Used for body text, UI elements

### Changing Fonts

You'll need to update two files when changing fonts:

#### Option 1: Using Google Fonts (Recommended)

**Step 1:** Choose fonts from [Google Fonts](https://fonts.google.com/)

**Step 2:** Update `hydrogen/app/root.tsx` (around line 83):

```tsx
{
  rel: 'stylesheet',
  href: 'https://fonts.googleapis.com/css2?family=YourDisplayFont:wght@400;500;600;700&family=YourBodyFont:wght@400;500;600&display=swap',
},
```

**Step 3:** Update `hydrogen/app/styles/tailwind.css` (around line 110):

```css
@theme {
  --font-display: 'Your Display Font', Georgia, serif;
  --font-sans: 'Your Body Font', system-ui, sans-serif;
}
```

**Step 4:** Restart your development server

```bash
yarn dev
```

#### Option 2: Self-Hosted Fonts

For custom or self-hosted fonts:

**Step 1:** Add font files to `hydrogen/public/fonts/`

```
hydrogen/public/fonts/
├── YourFont-Regular.woff2
├── YourFont-Medium.woff2
└── YourFont-Bold.woff2
```

**Step 2:** Define `@font-face` in `hydrogen/app/styles/tailwind.css`:

```css
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/YourFont-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'YourFont';
  src: url('/fonts/YourFont-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@theme {
  --font-sans: 'YourFont', system-ui, sans-serif;
}
```

### Type Scale

The starter kit uses a carefully balanced type scale. To adjust font sizes:

**Location:** `hydrogen/app/styles/tailwind.css` (around line 115)

```css
@theme {
  /* Display Sizes (for hero sections and large headings) */
  --text-display-xl: 4.5rem;   /* 72px */
  --text-display-lg: 3.75rem;  /* 60px */
  --text-display-md: 3rem;     /* 48px */
  --text-display-sm: 2.25rem;  /* 36px */

  /* Standard Text Sizes */
  --text-5xl: 3rem;      /* 48px - h1 */
  --text-4xl: 2.25rem;   /* 36px - h2 */
  --text-3xl: 1.875rem;  /* 30px - h3 */
  --text-2xl: 1.5rem;    /* 24px - h4 */
  --text-xl: 1.25rem;    /* 20px - h5 */
  --text-lg: 1.125rem;   /* 18px - Large body */
  --text-base: 1rem;     /* 16px - Default body */
  --text-sm: 0.875rem;   /* 14px - Small text */
  --text-xs: 0.75rem;    /* 12px - Captions */
}
```

### Letter Spacing & Line Height

Fine-tune typography spacing:

```css
@theme {
  /* Letter Spacing */
  --tracking-display: -0.03em;  /* Display headings */
  --tracking-tight: -0.025em;   /* Headings */
  --tracking-normal: 0;         /* Body text */
  --tracking-wide: 0.025em;     /* Buttons */
  --tracking-wider: 0.05em;     /* Overlines */
  --tracking-widest: 0.1em;     /* All caps labels */

  /* Line Heights */
  --leading-display: 1.05;      /* Display headings */
  --leading-tight: 1.1;         /* Headings */
  --leading-snug: 1.25;         /* Subheadings */
  --leading-normal: 1.5;        /* Body text */
  --leading-relaxed: 1.625;     /* Large body */
}
```

---

## Layout & Spacing

### Container Width

Default maximum container width is **1600px** for an editorial, magazine-like feel.

**To change globally**, search and replace in your codebase:

```tsx
// Find:
className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12"

// Replace with your preferred width:
className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12"
```

**Common components using containers:**
- `hydrogen/app/components/layout/PageLayout.tsx`
- `hydrogen/app/components/home/*.tsx`
- `hydrogen/app/routes/*.tsx`

### Section Spacing

Standard vertical spacing patterns:

```css
/* Standard sections (e.g., product grids, text content) */
py-12 md:py-16

/* Featured sections (e.g., lookbook, brand story) */
py-16 md:py-20

/* Hero sections (e.g., homepage hero, page heroes) */
py-20 md:py-24
```

To adjust spacing scale, edit `hydrogen/app/styles/tailwind.css` (around line 158).

### Border Radius

ada ÉLAN uses thoughtful border radius values for a premium aesthetic:

```
none (0px)      → Sharp corners for editorial elements (images, cards)
sm (4px)        → Subtle rounding for chips and small badges
DEFAULT (6px)   → General purpose, slight softness
md (8px)        → Buttons, form inputs, interactive elements
lg (12px)       → Product images, cards, panels
xl (16px)       → Modals, drawers, overlays
2xl (24px)      → Large cards, hero sections
3xl (32px)      → Extra large containers
full (9999px)   → Pills, avatars, circular elements
```

**Location:** `hydrogen/app/styles/tailwind.css` (around line 210)

```css
@theme {
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-DEFAULT: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-3xl: 32px;
  --radius-full: 9999px;
}
```

### Component Gaps

Standard spacing between elements:

```
gap-2           → Form elements (label to input)
gap-4 md:gap-6  → Grid items (product cards, category tiles)
gap-8 md:gap-12 → Section content (between major elements)
```

---

## Component Customization

### Button Variants

Buttons are defined in `hydrogen/app/components/ui/Button.tsx`.

**Available Variants:**

```tsx
const variants = {
  // Black fill (for light backgrounds) - Primary CTA
  primary: 'bg-primary text-white hover:bg-primary-light',

  // Black outline (for light backgrounds) - Secondary action
  secondary: 'border border-primary text-primary hover:bg-primary hover:text-white',

  // White fill (for dark backgrounds) - Primary CTA on dark
  inverse: 'bg-white text-primary hover:bg-white/90',

  // White outline (for dark backgrounds) - Secondary action on dark
  'inverse-outline': 'border border-white text-white hover:bg-white hover:text-primary',

  // Transparent (tertiary actions)
  ghost: 'text-primary hover:bg-surface-hover',
};
```

**To add a custom variant:**

1. Open `hydrogen/app/components/ui/Button.tsx`
2. Add your variant to the `variants` object:

```tsx
const variants = {
  // ... existing variants
  custom: 'bg-accent text-white hover:bg-accent-hover',
};
```

3. Update the TypeScript type:

```tsx
variant?: 'primary' | 'secondary' | 'inverse' | 'inverse-outline' | 'ghost' | 'custom';
```

### Product Card Style

Customize product cards in `hydrogen/app/components/product/ProductCard.tsx`:

```tsx
// Change image aspect ratio
<div className="aspect-3/4">  {/* 3:4 is default fashion ratio */}
  {/* Change to: */}
  className="aspect-square"    {/* Square images */}
  className="aspect-4/5"       {/* Slightly taller */}
</div>

// Adjust hover zoom effect
className="group-hover:scale-105"  {/* Default: 5% zoom */}
className="group-hover:scale-110"  {/* More dramatic: 10% zoom */}
className="group-hover:scale-102"  {/* Subtle: 2% zoom */}

// Change border radius on product images
className="rounded-lg"             {/* Default: 12px */}
className="rounded-none"           {/* Sharp corners */}
className="rounded-2xl"            {/* More rounded: 24px */}
```

### Header Customization

Edit `hydrogen/app/components/layout/Header.tsx`:

```tsx
// Make header sticky
<header className="sticky top-0 z-50 bg-background">

// Add drop shadow on scroll (requires state management)
<header className={clsx(
  'sticky top-0 z-50 bg-background transition-shadow',
  isScrolled && 'shadow-md'
)}>

// Adjust header height
className="h-16"  {/* Default height */}
className="h-20"  {/* Taller header */}

// Remove bottom border
// Delete or comment out: border-b border-border
```

### Footer Customization

Edit `hydrogen/app/components/layout/Footer.tsx`:

```tsx
// Change background color
className="bg-primary text-text-inverse"  {/* Dark footer */}
className="bg-surface border-t border-border"  {/* Light footer */}

// Adjust spacing
className="py-12 md:py-16"  {/* Default spacing */}
className="py-16 md:py-20"  {/* More spacious */}
```

---

## Advanced Customizations

### Adding Custom Utility Classes

While ada ÉLAN uses TailwindCSS only, you can add custom utilities when needed.

**Location:** `hydrogen/app/styles/tailwind.css`

```css
@layer utilities {
  /* Text shadow for hero headings */
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Gradient overlays for image cards */
  .gradient-overlay {
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }

  /* Custom animation */
  .fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Customizing Homepage Section Order

Edit the homepage route: `hydrogen/app/routes/($locale)._index.tsx`

```tsx
export default function Homepage({loaderData}: Route.ComponentProps) {
  return (
    <>
      <Hero data={loaderData.hero} />

      {/* Rearrange sections as needed */}
      <CategoryGrid collections={loaderData.collections} />
      <ProductCarousel products={loaderData.newArrivals} title="New Arrivals" />
      <FeatureBanner data={loaderData.featureBanner} />
      <ProductGrid products={loaderData.featured} title="Featured Styles" />
      <Newsletter />

      {/* Add or remove sections */}
      {/* <Testimonials data={loaderData.testimonials} /> */}
    </>
  );
}
```

### Creating New Pages

1. **Create route file**: `hydrogen/app/routes/($locale).your-page.tsx`

```tsx
import type {Route} from './+types/($locale).your-page';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Your Page Title | ada ÉLAN'},
    {name: 'description', content: 'Page description for SEO'},
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  // Fetch data if needed
  return {};
}

export default function YourPage() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 py-16 md:py-20">
      <h1 className="font-display text-display-md tracking-tight mb-8">
        Your Page Title
      </h1>
      <div className="prose prose-lg">
        {/* Your content */}
      </div>
    </div>
  );
}
```

2. **Add link to navigation** in `hydrogen/app/components/layout/Header.tsx` or Shopify Admin menus

### Dark Mode (Future Enhancement)

The starter kit is prepared for dark mode. To implement:

**In `hydrogen/app/styles/tailwind.css`:**

```css
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: #1A1A1A;
    --color-surface: #2A2A2A;
    --color-text: #FAF9F7;
    --color-text-secondary: #D6D3CB;
    --color-border: #44403C;
    /* ... update all color tokens */
  }
}
```

**Or use class-based dark mode:**

```css
.dark {
  --color-background: #1A1A1A;
  --color-surface: #2A2A2A;
  /* ... */
}
```

---

## Best Practices

### Do's ✅

- **Use design tokens**: Always use CSS variables (`var(--color-primary)`) or Tailwind classes (`bg-primary`)
- **Maintain responsive design**: Test on mobile, tablet, and desktop
- **Follow the design system**: Keep the editorial, monochromatic aesthetic
- **Ensure accessibility**: Maintain color contrast, keyboard navigation, ARIA labels
- **Use semantic HTML**: Proper heading hierarchy, meaningful markup
- **Test thoroughly**: After customizations, test all user flows

### Don'ts ❌

- **Don't create custom CSS files**: Use Tailwind utilities or extend the theme
- **Don't use inline styles**: Except for unavoidable cases (scrollbar hiding)
- **Don't break from the color palette**: Maintain brand consistency
- **Don't use accent color for primary buttons**: Keep black/white button system
- **Don't remove ARIA labels**: Maintain accessibility features
- **Don't hardcode values**: Use design tokens for maintainability

### Testing Your Customizations

1. **Visual regression**: Check all pages after changes
2. **Responsive design**: Test mobile, tablet, desktop breakpoints
3. **Accessibility**: Run Lighthouse audit, test with screen readers
4. **Performance**: Check bundle size, image optimization
5. **Cross-browser**: Test in Chrome, Firefox, Safari, Edge

---

## Getting Help

### Resources

- **Design System Reference**: See `docs/CUSTOMIZATION.md` for complete styling guidelines
- **Component Source Code**: Browse `hydrogen/app/components/`
- **Tailwind Documentation**: https://tailwindcss.com/docs
- **Hydrogen Documentation**: https://shopify.dev/docs/storefronts/headless/hydrogen
- **Shopify Storefront API**: https://shopify.dev/docs/api/storefront

### Common Customization Requests

1. **Change brand colors** → Update `hydrogen/app/styles/tailwind.css` color tokens
2. **Use different fonts** → Update `hydrogen/app/root.tsx` and `tailwind.css`
3. **Adjust spacing** → Modify spacing scale in `tailwind.css`
4. **Customize product cards** → Edit `hydrogen/app/components/product/ProductCard.tsx`
5. **Reorder homepage sections** → Edit `hydrogen/app/routes/($locale)._index.tsx`
6. **Add new pages** → Create new route files in `hydrogen/app/routes/`
7. **Modify header/footer** → Edit components in `hydrogen/app/components/layout/`

---

**Ready to customize?** Start with colors and typography, then move to layout and components. Always test your changes across different devices and browsers.

For complete design system details, refer to the sections above in this document.

---

*ada ÉLAN Starter Kit Customization Guide - v1.0*
*Last updated: December 2024*

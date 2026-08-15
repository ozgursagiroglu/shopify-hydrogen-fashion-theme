# ada ÉLAN — Premium Fashion E-Commerce Starter Kit

> A 2026-grade, commercially-ready fashion e-commerce starter kit for Shopify Hydrogen.
> Inspired by COS, Totême, Acne Studios, and Massimo Dutti.
> **Design System V3** — Deep contrast, editorial layouts, motion layer.

---

## Quick Reference

| Item              | Value                                    |
| ----------------- | ---------------------------------------- |
| **Product Name**  | ada ÉLAN                                 |
| **Display Font**  | Cormorant Garamond                       |
| **Body Font**     | Plus Jakarta Sans                        |
| **Primary Color** | #0F0D0C (Deep Black)                     |
| **Background**    | #F7F5F0 (Warm Cream)                     |
| **Accent**        | #C2680A (Deep Gold) — subtle use only    |
| **Styling**       | TailwindCSS only (no custom CSS)         |
| **Motion**        | framer-motion (scroll reveal, parallax)  |

---

## 1. Design Philosophy

### Brand Identity: Editorial Luxury

ada ÉLAN embodies the sophistication of European fashion houses:

- **Monochromatic Elegance**: Black, white, and warm neutrals dominate
- **Editorial Aesthetic**: Magazine-quality layouts with generous whitespace
- **Understated Luxury**: No flashy colors, subtle refinements
- **Typography First**: Headlines carry the design

### Core Principles

| Principle        | Implementation                                |
| ---------------- | --------------------------------------------- |
| Less is More     | Minimal UI, maximum impact                    |
| Black & White    | Buttons are always black/white, never colored |
| Photography Hero | Full-bleed imagery, fashion-forward           |
| Subtle Motion    | Gentle reveals, smooth transitions            |

---

## 2. Color System

### Primary Palette (V3)

```
Primary (Deep Black)
├── primary         #0F0D0C    Text, buttons, UI
├── primary-light   #1C1917    Secondary text
└── primary-muted   #78716C    Muted text
```

### Surface Colors (V3)

```
Surfaces (Light)
├── background      #F7F5F0    Page background
├── surface         #FFFFFF    Cards, modals
├── surface-alt     #EDE8E0    Alternate sections
└── surface-hover   #E8E3DA    Hover states

Surfaces (Dark — for dark sections)
├── surface-dark       #0F0D0C    Dark section background
├── surface-dark-alt   #1A1714    Dark cards, inputs
├── surface-dark-hover #252220    Dark hover states
```

### Text Colors (V3)

```
Text (Light surfaces)
├── text            #0F0D0C    Primary text
├── text-secondary  #44403C    Secondary text
├── text-muted      #78716C    Muted/placeholder
└── text-inverse    #F7F5F0    On dark backgrounds

Text (Dark surfaces)
├── text-on-dark        #F7F5F0    Primary text on dark
└── text-on-dark-muted  #A8A29E    Muted text on dark
```

### Border Colors

```
Borders
├── border          #E7E4DD    Default
├── border-strong   #D6D3CC    Emphasized
└── border-on-dark  #2E2A26    On dark sections
```

### Accent Color (Subtle Use Only)

```
Accent (Deep Gold) — ONLY for:
├── Focus rings on form elements
├── Link hover underlines
├── Sale/New badges
├── Success states

accent              #C2680A
accent-hover        #A35708
accent-light        #E8940F
```

**CRITICAL**: Accent is NOT for primary buttons. Buttons are black/white only.

### Gradient Overlays (V3)

```css
.overlay-hero    — directional gradient for hero/feature sections
.overlay-card    — bottom gradient for cards with text
.overlay-subtle  — light bottom gradient for lookbook items
```

---

## 3. Button System

### Button Variants

| Variant           | Use Case                     | Style                  |
| ----------------- | ---------------------------- | ---------------------- |
| `primary`         | Main CTA on light bg         | Black fill, white text |
| `secondary`       | Secondary action on light bg | Black outline          |
| `inverse`         | Main CTA on dark bg          | White fill, black text |
| `inverse-outline` | Secondary on dark bg         | White outline          |
| `ghost`           | Tertiary actions             | Transparent, text only |

### Button Implementation

```tsx
// Primary — Black fill (light backgrounds)
className = "bg-primary text-white hover:bg-primary-light";

// Secondary — Black outline (light backgrounds)
className =
  "border border-primary text-primary hover:bg-primary hover:text-white";

// Inverse — White fill (dark backgrounds)
className = "bg-white text-primary hover:bg-white/90";

// Inverse Outline — White outline (dark backgrounds)
className = "border border-white text-white hover:bg-white hover:text-primary";

// Ghost — Transparent
className = "text-primary hover:bg-surface-hover";
```

### Button Sizes

```
sm    h-10 px-4 text-sm
md    h-12 px-6 text-base
lg    h-14 px-8 text-lg
```

---

## 4. Typography

### Font Stack

```
Display:  Cormorant Garamond (400, 500, 600, 700, 800)
Body:     Plus Jakarta Sans (400, 500, 600)
```

### Type Scale

```
Display
├── display-xl    72px   Hero headlines
├── display-lg    60px   Section heroes
├── display-md    48px   Page titles
└── display-sm    36px   Large headings

Headings (font-display)
├── h1    32px
├── h2    28px
├── h3    24px
├── h4    20px

Body (font-sans)
├── body-lg    18px
├── body       16px
├── body-sm    14px
└── caption    13px

UI
├── button     14px uppercase tracking-wider
└── overline   12px uppercase tracking-widest
```

---

## 5. Spacing & Layout

### Container Pattern

```tsx
// Standard container
className = "max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12";
```

### Section Spacing

```
py-12 md:py-16        Standard sections
py-16 md:py-20        Featured sections
py-20 md:py-24        Hero sections
```

### Component Gaps

```
gap-4 md:gap-6        Grid items
gap-2                 Form elements
gap-8 md:gap-12       Section content
```

### Border Radius

```
none      0px         Sharp corners, editorial elements
sm        4px         Chips, small badges, subtle rounding
DEFAULT   6px         General purpose, slight softness
md        8px         Buttons, inputs, form elements
lg        12px        Cards, panels, product images
xl        16px        Modals, sheets, drawers
2xl       24px        Large cards, hero sections
3xl       32px        Extra large containers
full      9999px      Pills, avatars, circular elements
```

---

## 6. Component Architecture

### Directory Structure

```
components/
├── ui/              Base UI (Button, Input, Modal, etc.)
├── motion/          V3 animation wrappers (RevealOnScroll, StaggerGrid, TextReveal, ParallaxImage)
├── layout/          Header, Footer, PageLayout
├── product/         ProductCard, ProductGrid, Gallery
├── cart/            CartDrawer, CartLine, CartSummary
├── home/            Hero, CategoryGrid, Newsletter, etc.
├── collection/      Filters, Sort, CollectionHeader
├── search/          SearchModal, SearchResults
└── account/         LoginForm, OrderCard, AddressCard
```

### UI Components

| Component     | Purpose                            |
| ------------- | ---------------------------------- |
| Button        | Polymorphic button (button/a/link) |
| IconButton    | Icon-only circular button          |
| Input         | Text input with label              |
| Select        | Dropdown select                    |
| Checkbox      | Checkbox with label                |
| Badge         | Status badges (NEW, SALE)          |
| Modal         | Dialog overlay                     |
| Drawer        | Slide-over panel                   |
| Accordion     | Collapsible sections               |
| Skeleton      | Loading placeholder                |
| SectionHeader | Title + subtitle + action          |

### Component Pattern

```tsx
import { clsx } from "clsx";

interface Props {
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
}

export function Component({ variant = "primary", className, children }: Props) {
  return (
    <div
      className={clsx(
        "base-classes",
        variant === "primary" && "primary-classes",
        variant === "secondary" && "secondary-classes",
        className
      )}
    >
      {children}
    </div>
  );
}
```

---

## 7. Page Templates

### Core Pages (Required)

| Route                     | Purpose            |
| ------------------------- | ------------------ |
| `_index.tsx`              | Homepage           |
| `collections.$handle.tsx` | Collection/PLP     |
| `products.$handle.tsx`    | Product Detail/PDP |
| `cart.tsx`                | Shopping cart      |
| `search.tsx`              | Search results     |
| `account._index.tsx`      | Account dashboard  |
| `account.login.tsx`       | Login              |
| `account.register.tsx`    | Register           |
| `account.orders.tsx`      | Order history      |
| `$.tsx`                   | 404 page           |

### Additional Pages (Starter Kit Differentiators)

| Route               | Purpose            |
| ------------------- | ------------------ |
| `about.tsx`         | About us           |
| `contact.tsx`       | Contact form       |
| `stores.tsx`        | Store locator      |
| `blogs._index.tsx`  | Journal/Blog       |
| `blogs.$handle.tsx` | Blog post          |
| `lookbook.tsx`      | Editorial lookbook |

---

## 8. Home Page Sections

| Section      | Component         | Purpose                   |
| ------------ | ----------------- | ------------------------- |
| Hero         | `Hero`            | Full-bleed hero with CTA  |
| New Arrivals | `ProductCarousel` | Horizontal product scroll |
| Categories   | `CategoryGrid`    | Category cards            |
| Feature      | `FeatureStrip`    | Brand story banner        |
| Press        | `PressLogos`      | As featured in            |
| Products     | `ProductGrid`     | Recommended products      |
| Lookbook     | `Lookbook`        | Editorial grid            |
| Shop Look    | `ShopTheLook`     | Interactive outfits       |
| Testimonials | `Testimonials`    | Customer reviews          |
| Split Hero   | `SplitHero`       | Men/Women panels          |
| Instagram    | `InstagramFeed`   | Social feed               |
| Newsletter   | `Newsletter`      | Email signup              |

---

## 9. Styling Rules

### DO

- Use TailwindCSS utility classes only
- Use `clsx` for conditional classes
- Use design tokens from Tailwind config
- Keep components self-contained
- Use semantic HTML

### DON'T

- Create custom CSS classes
- Use inline styles (except scrollbar hiding)
- Use CSS modules or styled-components
- Mix styling approaches
- Use accent color for buttons

### Standard Patterns

```tsx
// Aspect ratios
className = "aspect-3/4"; // Product images
className = "aspect-4/5"; // Category cards
className = "aspect-square"; // Square images

// Transitions
className = "transition-colors duration-200"; // Color changes
className = "transition-transform duration-300"; // Transforms
className = "transition-all duration-300"; // Multiple properties

// Hover effects
className = "group-hover:scale-105"; // Image zoom
className = "group-hover:opacity-100"; // Reveal
className = "hover:text-accent"; // Link hover
```

---

## 10. Accessibility

### Requirements

- Keyboard navigation on all interactive elements
- Visible focus states (accent ring)
- ARIA labels on icon buttons
- Color contrast 4.5:1 minimum
- Semantic HTML structure

### Focus Pattern

```tsx
className =
  "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2";
```

---

## Working in This Repository

Before opening a pull request, all four checks must pass from `hydrogen/`:

```bash
yarn lint
yarn typecheck
yarn test
yarn build
```

When adding or changing a component:

1. Use only Tailwind utilities and the design tokens above — no custom CSS, no raw hex values.
2. Keep buttons black and white; the accent color is for focus rings, link hovers, badges and
   success states only.
3. Co-locate the test with the component and cover new logic.
4. Give interactive elements keyboard support, a visible focus state, and an ARIA label when the
   control is icon-only.
5. Update the relevant guide under `docs/` when behavior or configuration changes.

Full contributor guidance lives in [CONTRIBUTING.md](CONTRIBUTING.md); the complete design
specification is in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

---

_ada ÉLAN Design System V3_

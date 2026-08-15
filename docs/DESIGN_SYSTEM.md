# ada ÉLAN — Design System V3 Specification

> The design specification behind ada ÉLAN V3 — color, motion, layout and component decisions.
> Goal: Transform from "flat 2022 template" to "2026-grade editorial luxury."

---

## Table of Contents

1. [Color System Overhaul](#1-color-system-overhaul)
2. [Dark/Light Section Rhythm](#2-darklight-section-rhythm)
3. [Motion & Animation Layer](#3-motion--animation-layer)
4. [Layout Variety & Section Patterns](#4-layout-variety--section-patterns)
5. [Visual Depth System](#5-visual-depth-system)
6. [Hero Section Redesign](#6-hero-section-redesign)
7. [Component-Level Changes](#7-component-level-changes)
8. [Platform-Specific Implementation](#8-platform-specific-implementation)
9. [New Dependencies](#9-new-dependencies)
10. [Migration Checklist](#10-migration-checklist)

---

## 1. Color System Overhaul

### Problem

Current palette is too pastel/washed out. Background (#FAF9F7), surface (#FFFFFF), and surface-alt (#F5F4F1) are nearly indistinguishable. The page reads as one flat beige sheet with no visual rhythm or contrast.

### Revised Color Tokens

#### Primary (Deeper, Richer)

```
BEFORE                          AFTER
─────────────────────────────── ───────────────────────────────
primary     #1C1917             primary     #0F0D0C  (deeper black)
primary-hover #0C0A09           primary-hover #000000
primary-light #292524           primary-light #1C1917
```

**Why**: The current "primary" reads as dark brown, not black. Deepening it creates real contrast against light backgrounds.

#### Background & Surfaces (More Separation)

```
BEFORE                          AFTER
─────────────────────────────── ───────────────────────────────
background   #FAF9F7            background   #F7F5F0  (warmer, more visible cream)
surface      #FFFFFF            surface      #FFFFFF  (keep — cards need true white)
surface-alt  #F5F4F1            surface-alt  #EDE8E0  (noticeably different from bg)
surface-hover #EFEDE8           surface-hover #E8E3DA
surface-0    #FFFFFF            surface-0    #FFFFFF
surface-1    #F5F4F1            surface-1    #F2EFE8
surface-2    #EFEDE8            surface-2    #EDE8E0
surface-3    #E7E4DD            surface-3    #DED8CE
```

**Why**: The delta between each surface level is now ~5-7 points instead of ~2-3. The eye can actually distinguish sections.

#### NEW: Dark Surface Tokens (for dark sections)

```
NEW TOKENS
───────────────────────────────
surface-dark         #0F0D0C   (deep charcoal-black)
surface-dark-alt     #1A1714   (slightly lighter)
surface-dark-hover   #252220
text-on-dark         #F7F5F0   (warm off-white, NOT pure white)
text-on-dark-muted   #A8A29E
border-on-dark       #2E2A26
```

**Why**: Dark sections need their own complete token set. Using `bg-primary text-white` is a hack — these are purpose-built.

#### Accent (Bolder, More Present)

```
BEFORE                          AFTER
─────────────────────────────── ───────────────────────────────
accent       #D97706            accent       #C2680A  (richer, less orange)
accent-hover #B45309            accent-hover #A35708
accent-light #F59E0B            accent-light #E8940F
```

**Why**: Current amber reads as "warning" not "luxury." Pulling it toward a deeper gold feels more premium. Still warm, but less traffic-cone.

#### NEW: Gradient Tokens

```
NEW TOKENS
───────────────────────────────
gradient-hero-dark     linear-gradient(180deg, rgba(15,13,12,0.7) 0%, rgba(15,13,12,0.3) 50%, transparent 100%)
gradient-hero-bottom   linear-gradient(0deg, rgba(15,13,12,0.8) 0%, transparent 60%)
gradient-card-hover    linear-gradient(180deg, transparent 40%, rgba(15,13,12,0.6) 100%)
gradient-section-fade  linear-gradient(180deg, var(--color-background) 0%, var(--color-surface-alt) 100%)
```

**Why**: Flat overlays feel cheap. Directional gradients create depth and guide the eye.

### Hydrogen Implementation

```css
/* tailwind.css @theme block — replace existing tokens */
--color-primary: #0F0D0C;
--color-primary-hover: #000000;
--color-primary-light: #1C1917;

--color-background: #F7F5F0;
--color-surface-alt: #EDE8E0;
--color-surface-hover: #E8E3DA;
--color-surface-1: #F2EFE8;
--color-surface-2: #EDE8E0;
--color-surface-3: #DED8CE;

/* New dark surface tokens */
--color-surface-dark: #0F0D0C;
--color-surface-dark-alt: #1A1714;
--color-surface-dark-hover: #252220;
--color-text-on-dark: #F7F5F0;
--color-text-on-dark-muted: #A8A29E;
--color-border-on-dark: #2E2A26;

--color-accent: #C2680A;
--color-accent-hover: #A35708;
--color-accent-light: #E8940F;
```

## 2. Dark/Light Section Rhythm

### Problem

The entire homepage is light. No visual rhythm. Luxury sites alternate dark/light sections to create breathing room and drama.

### Homepage Section Rhythm Map

```
Section              Background          Text
──────────────────── ─────────────────── ────────────────
Hero                 DARK (image+overlay) text-on-dark
New Arrivals         LIGHT (background)   text
Category Grid        LIGHT (surface-alt)  text
Feature Strip        DARK (surface-dark)  text-on-dark
Press Logos          LIGHT (background)   text-muted
Recommended          LIGHT (surface-alt)  text
Lookbook             DARK (surface-dark)  text-on-dark
Testimonials         LIGHT (background)   text
Newsletter           DARK (surface-dark)  text-on-dark
Split Hero           DARK (image+overlay) text-on-dark
Instagram Feed       LIGHT (background)   text
```

Pattern: **L → L → D → L → L → D → L → D → D → L** — never more than 2 light sections in a row.

### Hydrogen: Dark Section Utility Pattern

```tsx
// Dark section wrapper pattern
<section className="bg-surface-dark text-on-dark py-16 md:py-24">
  <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
    {/* Content with text-on-dark-muted for secondary text */}
    {/* Borders use border-on-dark */}
    {/* Buttons use inverse variant */}
  </div>
</section>
```

## 3. Motion & Animation Layer

### Problem

Zero scroll-triggered animations. Page renders statically top-to-bottom. All motion is limited to hover:scale-105. This is the #1 reason the site feels "flat."

### Animation Strategy

Three tiers of motion, progressive enhancement:

```
Tier 1: ENTRANCE ANIMATIONS (scroll-triggered)
  → Sections fade/slide in as user scrolls down
  → Staggered children (grid items appear one by one)
  → Headlines reveal with clip-path or translate

Tier 2: INTERACTION ANIMATIONS (user-triggered)
  → Enhanced hover states with spring physics
  → Button press micro-interactions
  → Image parallax on scroll
  → Cursor-responsive subtle effects

Tier 3: AMBIENT ANIMATIONS (always running)
  → Hero: subtle image zoom (Ken Burns)
  → Floating elements (decorative)
  → Gradient shifts on dark sections
```

### Hydrogen: Framer Motion Integration

**New dependency**: `framer-motion` (or `motion` — the lightweight fork)

#### Scroll-Triggered Section Reveal

```tsx
// components/motion/RevealOnScroll.tsx
import { motion } from 'framer-motion';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const directionVariants = {
  up:    { hidden: { opacity: 0, y: 40 },  visible: { opacity: 1, y: 0 } },
  down:  { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 40 },  visible: { opacity: 1, x: 0 } },
};

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  direction = 'up',
}: RevealOnScrollProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],  // custom ease-out
      }}
      variants={directionVariants[direction]}
    >
      {children}
    </motion.div>
  );
}
```

#### Staggered Grid Children

```tsx
// components/motion/StaggerGrid.tsx
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={container}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
```

#### Hero Ken Burns Effect

```tsx
// In Hero component
<motion.div
  className="absolute inset-0"
  animate={{
    scale: [1, 1.05],
  }}
  transition={{
    duration: 20,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'linear',
  }}
>
  <Image ... className="w-full h-full object-cover" />
</motion.div>
```

#### Headline Text Reveal

```tsx
// components/motion/TextReveal.tsx
import { motion } from 'framer-motion';

export function TextReveal({ text, className }: { text: string; className?: string }) {
  return (
    <motion.h2
      className={clsx('overflow-hidden', className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.span
        className="block"
        variants={{
          hidden: { y: '100%' },
          visible: {
            y: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      >
        {text}
      </motion.span>
    </motion.h2>
  );
}
```

#### Parallax Image

```tsx
// components/motion/ParallaxImage.tsx
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function ParallaxImage({
  src,
  alt,
  className,
  speed = 0.3,
}: {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}%`, `${speed * 100}%`]);

  return (
    <div ref={ref} className={clsx('overflow-hidden', className)}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y }}
        className="w-full h-full object-cover scale-110"
      />
    </div>
  );
}
```

## 4. Layout Variety & Section Patterns

### Problem

Every section follows the same grid: container → centered heading → even grid → items. No asymmetry, no overlap, no bento, no editorial surprise.

### New Layout Patterns

#### Pattern A: Bento Grid (Category Grid replacement)

```
┌──────────────────┬─────────┐
│                  │         │
│    LARGE CARD    │  SMALL  │
│    (span 2x2)   │  CARD   │
│                  │         │
│                  ├─────────┤
│                  │         │
│                  │  SMALL  │
│                  │  CARD   │
│                  │         │
├─────────┬───────┴─────────┤
│         │                  │
│  SMALL  │    LARGE CARD    │
│  CARD   │    (span 2x2)   │
│         │                  │
└─────────┴──────────────────┘
```

**Hydrogen**:
```tsx
<div className="grid grid-cols-3 grid-rows-2 gap-3 md:gap-4 aspect-[16/9]">
  <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-lg">
    {/* Large featured category */}
  </div>
  <div className="relative group overflow-hidden rounded-lg">
    {/* Small category 1 */}
  </div>
  <div className="relative group overflow-hidden rounded-lg">
    {/* Small category 2 */}
  </div>
</div>
```


#### Pattern B: Overlapping Editorial (Lookbook replacement)

```
         ┌──────────────────┐
         │                  │
         │    IMAGE 1       │
         │                  │
    ┌────┤                  │
    │    └──────────────────┘
    │  TEXT BLOCK
    │  "The Spring
    │   Collection"
    │
    │         ┌──────────────────┐
    └─────────│                  │
              │    IMAGE 2       │
              │                  │
              └──────────────────┘
```

**Hydrogen**:
```tsx
<div className="relative">
  {/* Image 1 — offset right */}
  <div className="w-[65%] ml-auto aspect-[4/5] rounded-lg overflow-hidden">
    <ParallaxImage src="..." alt="..." />
  </div>

  {/* Text block — overlapping, offset left */}
  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[40%] z-10">
    <TextReveal
      text="The Spring Collection"
      className="font-display text-display-lg tracking-display"
    />
    <p className="mt-4 text-text-secondary">Effortless refinement...</p>
    <Button variant="secondary" className="mt-6">Explore</Button>
  </div>

  {/* Image 2 — offset left, below */}
  <div className="w-[50%] mt-[-8%] aspect-[3/4] rounded-lg overflow-hidden">
    <ParallaxImage src="..." alt="..." />
  </div>
</div>
```


#### Pattern C: Full-Bleed with Inset Content (Feature Strip replacement)

```
┌─────────────────────────────────────────────┐
│  ████████████████████████████████████████    │
│  █                                      █   │
│  █  ┌──────────────────────────────┐    █   │
│  █  │    "Timeless craftsmanship   │    █   │
│  █  │     meets modern design"     │    █   │
│  █  │                              │    █   │
│  █  │    [ Discover More ]         │    █   │
│  █  └──────────────────────────────┘    █   │
│  █                                      █   │
│  ████████████████████████████████████████    │
│                                             │
└─────────────────────────────────────────────┘
```

**Hydrogen**:
```tsx
<section className="relative py-20 md:py-32 overflow-hidden">
  {/* Full-bleed background image with parallax */}
  <ParallaxImage
    src="..."
    alt=""
    className="absolute inset-0"
    speed={0.2}
  />

  {/* Dark gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,13,12,0.8)] via-[rgba(15,13,12,0.4)] to-[rgba(15,13,12,0.6)]" />

  {/* Inset content card */}
  <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
    <RevealOnScroll>
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-on-dark-muted uppercase tracking-widest text-sm mb-4">Our Philosophy</p>
        <h2 className="font-display text-display-lg text-on-dark tracking-display">
          Timeless craftsmanship meets modern design
        </h2>
        <Button variant="inverse" size="lg" className="mt-8">
          Discover More
        </Button>
      </div>
    </RevealOnScroll>
  </div>
</section>
```

#### Pattern D: Asymmetric Split (Split Hero replacement)

Instead of 50/50 even split:

```
┌────────────────────────┬──────────────┐
│                        │              │
│                        │    TEXT      │
│       IMAGE            │    BLOCK    │
│       (60%)            │    (40%)    │
│                        │              │
│                        │   [ CTA ]   │
│                        │              │
└────────────────────────┴──────────────┘
```

The 60/40 split with the image slightly larger creates tension and editorial feel.

#### Pattern E: Horizontal Scroll Cards (Testimonials replacement)

Instead of a basic carousel, use oversized cards that peek from the edge:

```
   ┌─────────┐  ┌─────────┐  ┌────
   │  ★★★★★  │  │  ★★★★★  │  │
   │         │  │         │  │
   │ "Quote" │  │ "Quote" │  │ "Qu
   │         │  │         │  │
   │ — Name  │  │ — Name  │  │ —
   └─────────┘  └─────────┘  └────
              ← swipe →
```

Cards are 85% width on mobile (showing next card peek), 30% on desktop.

---

## 5. Visual Depth System

### Problem

Everything is flat. No layering, no overlaps, no gradient depth. Page has zero z-axis perception.

### Enhanced Shadow System

#### Hydrogen

```css
/* Replace existing shadow tokens */
--shadow-card:     0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -4px rgba(0,0,0,0.08);
--shadow-card-hover: 0 4px 12px rgba(0,0,0,0.06), 0 16px 40px -8px rgba(0,0,0,0.12);
--shadow-product:  0 2px 8px rgba(0,0,0,0.06), 0 12px 32px -8px rgba(0,0,0,0.10);
--shadow-elevated: 0 8px 30px rgba(0,0,0,0.08), 0 24px 60px -12px rgba(0,0,0,0.15);
```

### Overlay & Gradient System

Every image-based section gets a gradient overlay — never raw image-to-text:

```css
/* Hydrogen gradient utilities */
.overlay-hero {
  background: linear-gradient(
    180deg,
    rgba(15, 13, 12, 0.5) 0%,
    rgba(15, 13, 12, 0.2) 40%,
    rgba(15, 13, 12, 0.6) 100%
  );
}

.overlay-card {
  background: linear-gradient(
    180deg,
    transparent 50%,
    rgba(15, 13, 12, 0.7) 100%
  );
}

.overlay-subtle {
  background: linear-gradient(
    180deg,
    transparent 70%,
    rgba(15, 13, 12, 0.4) 100%
  );
}
```

### Glassmorphism (Selective Use — Header, Modals)

```css
/* Hydrogen — sticky header on scroll */
.header-scrolled {
  background: rgba(247, 245, 240, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(231, 228, 221, 0.5);
}
```

---

## 6. Hero Section Redesign

### Problem

Generic full-bleed image + centered text + button. Every template has this.

### New Hero: Cinematic Editorial

#### Option A: Video Hero (Web)

```tsx
// Hydrogen Hero with video background
<section className="relative h-screen overflow-hidden">
  {/* Video background */}
  <video
    autoPlay
    muted
    loop
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src={heroVideo} type="video/mp4" />
  </video>

  {/* Ken Burns fallback for image */}
  <motion.div
    className="absolute inset-0 hidden"  // shown when no video
    animate={{ scale: [1, 1.06] }}
    transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse' }}
  >
    <Image src={heroImage} className="w-full h-full object-cover" />
  </motion.div>

  {/* Gradient overlay */}
  <div className="absolute inset-0 overlay-hero" />

  {/* Content — bottom-left aligned, not centered */}
  <div className="relative z-10 h-full flex items-end pb-16 md:pb-24">
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 w-full">
      <RevealOnScroll direction="up">
        <p className="text-on-dark-muted uppercase tracking-widest text-sm mb-4">
          Spring/Summer 2026
        </p>
        <h1 className="font-display text-display-xl text-on-dark tracking-display max-w-3xl">
          The Art of Understated Elegance
        </h1>
        <div className="flex gap-4 mt-8">
          <Button variant="inverse" size="lg">Shop Women</Button>
          <Button variant="inverse-outline" size="lg">Shop Men</Button>
        </div>
      </RevealOnScroll>
    </div>
  </div>

  {/* Scroll indicator */}
  <motion.div
    className="absolute bottom-6 left-1/2 -translate-x-1/2"
    animate={{ y: [0, 8, 0] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    <ChevronDownIcon className="w-6 h-6 text-on-dark-muted" />
  </motion.div>
</section>
```

#### Option B: Split Hero with Parallax (Web)

```tsx
<section className="h-screen flex">
  {/* Left: Image with parallax */}
  <div className="w-[55%] relative overflow-hidden">
    <ParallaxImage src="..." alt="..." className="absolute inset-0" speed={0.3} />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[rgba(15,13,12,0.3)]" />
  </div>

  {/* Right: Content on dark */}
  <div className="w-[45%] bg-surface-dark flex items-center px-12 lg:px-20">
    <div>
      <TextReveal
        text="New Season"
        className="font-display text-display-xl text-on-dark"
      />
      <p className="text-on-dark-muted mt-6 text-lg leading-relaxed max-w-md">
        Discover our curated selection of timeless pieces.
      </p>
      <Button variant="inverse" size="lg" className="mt-10">
        Explore Collection
      </Button>
    </div>
  </div>
</section>
```

## 7. Component-Level Changes

### ProductCard — Enhanced

**Before**: Simple image + title + price
**After**: Image with hover second-image + gradient overlay + staggered quick actions + shadow lift

```
Hydrogen additions:
- group-hover:shadow-card-hover transition
- Secondary image crossfade on hover
- Gradient overlay on hover (bottom 30%)
- Quick action buttons slide in from right with 50ms stagger
- Price with line-through for sale items
- Badge positioned top-left with slight offset (top-3 left-3)
```


### Newsletter — Dark Section

**Before**: Light background, basic form
**After**: Full dark section with split layout

```
Layout:
┌─────────────────────────────────────────┐
│  DARK BACKGROUND                        │
│                                         │
│  ┌──────────────┐  ┌────────────────┐  │
│  │  Headline     │  │  Email Input   │  │
│  │  + Subtitle   │  │  [ Subscribe ] │  │
│  │  + Benefits   │  │                │  │
│  └──────────────┘  └────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### SectionHeader — Text Reveal

**Before**: Static h2 + p
**After**: h2 with TextReveal animation, subtitle fades in after

### Button — Micro-interactions

**Hydrogen**:
```tsx
// Enhanced button hover
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
```


---

## 8. Platform-Specific Implementation

### Hydrogen (Web) Specifics

| Feature | Implementation |
|---------|---------------|
| Scroll animations | Framer Motion `whileInView` |
| Parallax | Framer Motion `useScroll` + `useTransform` |
| Video hero | Native `<video>` with autoPlay muted loop |
| Glassmorphism header | `backdrop-filter: blur(12px)` |
| Text reveal | Framer Motion clip-path / translateY |
| Gradient overlays | Tailwind arbitrary values or CSS custom properties |
| Dark sections | New Tailwind color tokens |
| Bento grid | CSS Grid with `grid-template-areas` |
| Staggered grid | Framer Motion `staggerChildren` |
| Ken Burns | Framer Motion infinite scale animation |
| Hover card lift | `transition-shadow` + `hover:shadow-card-hover` |

### Shared Patterns (Both Platforms)

| Pattern | Description |
|---------|-------------|
| Section rhythm | Dark/light alternation — same order on both |
| Color tokens | Identical hex values, platform-specific format |
| Typography | Same fonts, same hierarchy, same weights |
| Spacing | Same scale (4px base), same section padding ratios |
| Animation timing | Same durations (600ms reveal, 80ms stagger, 400ms item) |
| Easing | Same curve: cubic-bezier(0.22, 1, 0.36, 1) = Easing.out(Easing.cubic) |

---

## 9. New Dependencies

### Hydrogen

```json
{
  "dependencies": {
    "framer-motion": "^11.x"    // ~45KB gzipped, tree-shakeable
  }
}
```

Alternative: `motion` (Framer Motion's lightweight fork, ~18KB) if bundle size is critical.

## 10. Migration Checklist

### Phase 1: Foundation (Color + Dark Sections)

- [ ] Update Tailwind CSS tokens (color system overhaul)
- [ ] Add dark surface tokens to both platforms
- [ ] Add gradient tokens / utilities to Tailwind
- [ ] Convert Feature Strip to dark section
- [ ] Convert Newsletter to dark section
- [ ] Convert Lookbook to dark section
- [ ] Test all existing components against new colors

### Phase 2: Motion Layer

- [ ] Install framer-motion (Hydrogen)
- [ ] Create RevealOnScroll component (both)
- [ ] Create StaggerGrid / StaggerItem (both)
- [ ] Create TextReveal component (both)
- [ ] Create ParallaxImage component (Hydrogen)
- [ ] Wrap all homepage sections with RevealOnScroll
- [ ] Add stagger to ProductGrid, CategoryGrid
- [ ] Add Ken Burns to Hero
- [ ] Test reduced-motion accessibility

### Phase 3: Layout Variety

- [ ] Redesign CategoryGrid → Bento Grid (both)
- [ ] Redesign Lookbook → Overlapping Editorial (both)
- [ ] Redesign Feature Strip → Full-Bleed Inset (both)
- [ ] Redesign Split Hero → Asymmetric 60/40 (both)
- [ ] Redesign Testimonials → Peek Carousel (both)
- [ ] Test all layouts at every breakpoint

### Phase 4: Hero & Polish

- [ ] Build cinematic Hero (video support, Hydrogen)
- [ ] Add glassmorphism header on scroll (Hydrogen)
- [ ] Enhanced ProductCard hover states (Hydrogen)
- [ ] Button micro-interactions (both)
- [ ] Enhanced shadow system (both)
- [ ] Final cross-platform visual parity check

## Visual Summary: Before vs After

```
BEFORE                              AFTER
────────────────────────           ────────────────────────
Flat beige page                    Dark/light rhythm
No scroll animation                Every section animates in
Symmetric grids                    Bento + overlap + asymmetric
Generic hero                       Cinematic video/parallax hero
hover:scale-105 only               Spring physics, stagger, reveal
Same surface everywhere            Clear surface hierarchy
No gradients                       Directional gradient overlays
Static header                      Glassmorphism on scroll
Template feel                      Editorial luxury feel
```

---

_ada ÉLAN Design System V3 — April 2026_

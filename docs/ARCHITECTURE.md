# Architecture Guide

This document explains the architecture and code organization of the Fashion E-Commerce Starter Kit.

---

## Overview

The project is a web storefront built with Shopify Hydrogen:

```
ada-themes-fashion/
├── hydrogen/               # Hydrogen + React Router web storefront
├── scripts/                # Setup wizard and seed scripts
└── docs/                   # Documentation
```


---

## Web Storefront Architecture

### Technology Stack

- **Framework**: Shopify Hydrogen (built on React Router 7)
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **Data**: Shopify Storefront GraphQL API
- **Deployment**: Shopify Oxygen (recommended)

### Directory Structure

```
hydrogen/
├── app/
│   ├── components/
│   │   ├── ui/             # Base UI components (Button, Badge, etc.)
│   │   ├── product/        # Product-related components
│   │   ├── home/           # Homepage sections
│   │   ├── cart/           # Cart components
│   │   ├── Header.tsx      # Site header
│   │   ├── Footer.tsx      # Site footer
│   │   └── PageLayout.tsx  # Main layout wrapper
│   │
│   ├── routes/
│   │   ├── ($locale)._index.tsx       # Homepage
│   │   ├── ($locale).collections.$handle.tsx
│   │   ├── ($locale).products.$handle.tsx
│   │   ├── ($locale).cart.tsx
│   │   └── ($locale).account/         # Account routes
│   │
│   ├── graphql/            # GraphQL queries for customer account
│   ├── lib/                # Utilities and helpers
│   ├── styles/             # Global styles
│   │   └── tailwind.css    # Tailwind theme configuration
│   │
│   ├── entry.client.tsx    # Client-side entry
│   ├── entry.server.tsx    # Server-side entry
│   └── root.tsx            # Root component
│
├── public/                 # Static assets
├── server.ts               # Server configuration
├── vite.config.ts          # Build configuration
└── package.json
```

### Key Concepts

#### 1. Route-Based Data Loading

Each route file handles its own data fetching using the React Router loader pattern:

```tsx
// Critical data - blocks rendering
async function loadCriticalData({context}) {
  const data = await context.storefront.query(QUERY);
  return data;
}

// Deferred data - loads after initial render
function loadDeferredData({context}) {
  const promise = context.storefront.query(QUERY);
  return { promise };
}
```

#### 2. Component Organization

Components are organized by feature:

- **`ui/`**: Reusable, theme-aware base components
- **`product/`**: ProductCard, ProductGrid, ProductGallery
- **`home/`**: Hero, CategoryGrid, ProductCarousel
- **`cart/`**: CartLine, CartSummary

#### 3. Internationalization (i18n)

The `($locale)` route segment enables URL-based localization:

```
/en-US/collections/dresses  → English (US)
/de-DE/collections/dresses  → German
/tr-TR/collections/dresses  → Turkish
```

#### 4. Hydrogen Utilities

The project uses Hydrogen's built-in components and hooks:

```tsx
import { Image, Money, useOptimisticCart } from '@shopify/hydrogen';

// Image optimization
<Image data={product.featuredImage} />

// Currency formatting
<Money data={product.priceRange.minVariantPrice} />
```


---

## Shared Patterns

### 1. Component Props Interface

Both platforms use TypeScript interfaces for component props:

```typescript
interface ProductCardProps {
  product: Product;
  loading?: 'eager' | 'lazy';
  showVendor?: boolean;
  className?: string;  // Web only
}
```

### 2. GraphQL Fragments

Queries share similar fragment structures:

```graphql
fragment ProductFields on Product {
  id
  title
  handle
  vendor
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  featuredImage {
    url
    altText
  }
}
```

### 3. Theme Tokens

Both platforms use the same color palette and design tokens.

---

## Data Flow

### Web (Server-Rendered)

```
1. User navigates to /products/dress
2. Server executes loader() function
3. GraphQL query fetches product data
4. React component renders with data
5. Client hydrates for interactivity
```


---

## Performance Considerations

### Web

- **Code Splitting**: Routes are automatically split
- **Image Optimization**: Use Hydrogen's Image component
- **Caching**: Leverage Shopify CDN and cache headers
- **Prefetching**: Links prefetch on hover/focus


---

## Extending the Project

### Adding a New Page (Web)

1. Create route file: `app/routes/($locale).your-page.tsx`
2. Implement loader for data fetching
3. Export default component


### Adding a New Component

1. Create component in appropriate directory
2. Export from index.ts
3. Use theme tokens for styling
4. Add to storybook (if using)

---

## Best Practices

1. **Keep routes thin**: Move complex logic to utilities
2. **Colocate GraphQL**: Define queries near where they're used
3. **Type everything**: Leverage TypeScript for safety
4. **Test components**: Unit test UI components
5. **Document changes**: Update this architecture doc as needed

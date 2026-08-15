# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-08-16

Initial public release of ada ÉLAN — a Shopify Hydrogen storefront theme for premium fashion brands.

### Added

**Design system**

- Editorial luxury design language with a deep-contrast palette
- Cormorant Garamond (display) and Plus Jakarta Sans (body) type system
- Tailwind-only styling with documented design tokens — see [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)
- Motion layer built on Framer Motion: scroll reveals, staggered grids, text reveals, parallax
- Custom SVG icon library (58 icons)

**Storefront pages**

- Homepage with hero, category grid, product carousel, lookbook, shop-the-look, testimonials,
  press logos, Instagram feed, split hero and newsletter sections
- Collection pages with filtering and sorting
- Product detail pages with variant selection, image gallery and size guide
- Cart page and cart drawer with quantity management
- Predictive search with suggestions, collections and product previews
- Account: login, register, dashboard, order history, addresses, profile
- About, Contact, FAQ, Store locator, Journal/Blog, Lookbook, Policies
- 404 page

**Commerce features**

- Shopify Storefront API `2025-10` integration with generated GraphQL types
- Customer Account API authentication
- Wishlist, product comparison and quick view
- Product reviews backed by Shopify metaobjects
- Back-in-stock alert requests
- Recently viewed products
- Multi-currency and locale selection
- Newsletter signup and contact form APIs

**Internationalization**

- English, French and Arabic translations
- Full RTL layout support

**Developer experience**

- TypeScript 5.9 in strict mode throughout
- Unit tests with Vitest, enforcing 90% line/function/statement and 82% branch coverage
- E2E test suites with Playwright across 5 browser targets
- Storybook 10 component documentation
- ESLint 9 flat config and Prettier
- Interactive setup wizard plus Shopify seeding CLI in `scripts/`
- GitHub Actions CI running lint, typecheck, unit tests and build on Node 20 and 22

**Accessibility**

- WCAG AA contrast targets and extensive ARIA coverage
- ARIA live regions for cart and async state — see [docs/ACCESSIBILITY_ARIA_LIVE.md](docs/ACCESSIBILITY_ARIA_LIVE.md)
- Keyboard navigation and visible focus states on all interactive elements

**Performance and SEO**

- Responsive images with srcset and lazy loading
- Code splitting and route-level lazy loading
- Meta tags, Open Graph and Twitter cards on every route
- JSON-LD structured data: Organization and WebSite with a SearchAction on the homepage,
  Product with Offer and Brand on product pages, and BreadcrumbList on nested routes
- Content Security Policy configured in `hydrogen/app/entry.server.tsx`

### Tech stack

Shopify Hydrogen 2025.7 · React Router 7.9 · React 18.3 · Tailwind CSS 4.1 · TypeScript 5.9 ·
Vite 6 · Vitest 4 · Playwright 1.57 · Storybook 10

[Unreleased]: https://github.com/ozgursagiroglu/shopify-hydrogen-fashion-theme/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ozgursagiroglu/shopify-hydrogen-fashion-theme/releases/tag/v1.0.0

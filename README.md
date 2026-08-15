# ada ÉLAN — Shopify Hydrogen Fashion Theme

> A production-ready [Shopify Hydrogen](https://hydrogen.shopify.dev/) storefront theme for premium fashion brands — editorial design system, full i18n with RTL, and a one-command Shopify seeding CLI.

[![CI](https://github.com/ozgursagiroglu/shopify-hydrogen-fashion-theme/actions/workflows/ci.yml/badge.svg)](https://github.com/ozgursagiroglu/shopify-hydrogen-fashion-theme/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Hydrogen](https://img.shields.io/badge/Hydrogen-2025.7-5A31F4.svg)](https://hydrogen.shopify.dev/)
[![Node](https://img.shields.io/badge/Node-%3E%3D20.19-339933.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

![ada ÉLAN homepage hero](docs/images/section-hero.webp)

---

## Why this theme

Most Hydrogen starters give you a wired-up cart and stop there. ada ÉLAN ships the parts that
usually take the longest: a coherent editorial design system, the merchandising surfaces a fashion
store actually needs (lookbook, shop-the-look, compare, wishlist, quick view, reviews), and a
seeding CLI so your store isn't empty on first run.

- **Editorial design system** — deep-contrast palette, Cormorant Garamond + Plus Jakarta Sans, design tokens documented in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)
- **Real i18n** — English, French and Arabic with full RTL layout support
- **Accessible by default** — WCAG AA targets, keyboard navigation, extensive ARIA coverage
- **SEO-ready** — semantic markup, Open Graph and Twitter cards, and JSON-LD structured data (Organization, WebSite with SearchAction, Product, BreadcrumbList)
- **Tested** — unit tests (Vitest), E2E across 5 browsers (Playwright), Storybook component docs
- **Seeded, not empty** — an interactive wizard provisions metaobjects and demo products in your store

## Screenshots

| Homepage | Product |
| --- | --- |
| ![Homepage](docs/images/homepage.webp) | ![Product detail page](docs/images/product.webp) |

| Collection | Search |
| --- | --- |
| ![Collection page with filters](docs/images/collection.webp) | ![Search results](docs/images/search.webp) |

<details>
<summary><strong>More screenshots</strong> — homepage sections, cart, account, RTL, responsive</summary>

### Homepage sections

| | |
| --- | --- |
| ![Category grid](docs/images/section-category-grid.webp) | ![Product carousel](docs/images/section-product-carousel.webp) |
| ![Lookbook](docs/images/section-lookbook.webp) | ![Testimonials](docs/images/section-testimonials.webp) |
| ![Press logos](docs/images/section-press.webp) | ![Instagram feed](docs/images/section-instagram.webp) |
| ![Newsletter](docs/images/section-newsletter.webp) | ![Full homepage scroll](docs/images/homepage-full.webp) |

### Cart & merchandising

| Cart page | Cart drawer | Quick view |
| --- | --- | --- |
| ![Cart page](docs/images/cart.webp) | ![Cart drawer](docs/images/cart-drawer.webp) | ![Quick view modal](docs/images/quick-view.webp) |

| Wishlist | Compare |
| --- | --- |
| ![Wishlist](docs/images/wishlist.webp) | ![Product comparison](docs/images/compare.webp) |

### Content pages

| Lookbook | Journal | About |
| --- | --- | --- |
| ![Lookbook](docs/images/lookbook.webp) | ![Blog](docs/images/blog.webp) | ![About](docs/images/about.webp) |

| Stores | Contact | FAQ |
| --- | --- | --- |
| ![Store locator](docs/images/stores.webp) | ![Contact](docs/images/contact.webp) | ![FAQ](docs/images/faq.webp) |

### Account

| Orders | Addresses | Profile |
| --- | --- | --- |
| ![Order history](docs/images/account-orders.webp) | ![Addresses](docs/images/account-addresses.webp) | ![Profile](docs/images/account-profile.webp) |

### RTL (Arabic)

| Homepage | Product |
| --- | --- |
| ![RTL homepage](docs/images/rtl-homepage.webp) | ![RTL product page](docs/images/rtl-product.webp) |

### Responsive & developer experience

| Mobile | Tablet |
| --- | --- |
| ![Mobile homepage](docs/images/mobile-homepage.webp) | ![Tablet homepage](docs/images/tablet-homepage.webp) |

| Icon library | Storybook |
| --- | --- |
| ![Custom SVG icon set](docs/images/icons.webp) | ![Storybook](docs/images/storybook.webp) |

</details>

## Quick start

### Prerequisites

- Node.js **20.19+** (`.nvmrc` included — run `nvm use`)
- Yarn 1.x
- A Shopify store with Storefront API access

### 1. Clone and configure

```bash
git clone https://github.com/ozgursagiroglu/shopify-hydrogen-fashion-theme.git
cd shopify-hydrogen-fashion-theme
```

Run the interactive setup wizard. It walks you through creating the Shopify app, writes
`hydrogen/.env`, and offers to seed metaobject definitions, demo content and demo products:

```bash
cd scripts
yarn install
yarn setup
```

Prefer to configure by hand? Copy `hydrogen/.env.example` to `hydrogen/.env` and fill it in —
every variable is documented inline. See [docs/SETUP.md](docs/SETUP.md) for the full walkthrough.

> **Never commit your `.env`.** It holds your Storefront token, session secret and Admin API token.

### 2. Run the storefront

```bash
cd hydrogen
yarn install
yarn dev
```

Visit **http://localhost:3000**.

From the repository root you can also use the delegating scripts — `yarn dev`, `yarn build`,
`yarn lint`, `yarn typecheck`, `yarn test`.

## Scripts

Run these from `hydrogen/`, or from the repo root without the `--cwd` dance.

| Script | Description |
| --- | --- |
| `yarn dev` | Start the development server with codegen |
| `yarn build` | Production build |
| `yarn preview` | Preview the production build locally |
| `yarn typecheck` | TypeScript type checking |
| `yarn lint` | ESLint |
| `yarn test` | Unit tests (Vitest) |
| `yarn test:coverage` | Unit tests with coverage report |
| `yarn test:e2e` | E2E tests (Playwright, 5 browsers) |
| `yarn storybook` | Component explorer on port 6006 |

Seeding and validation live in `scripts/`: `yarn setup`, `yarn seed:all`, `yarn validate`.

## Project structure

```
shopify-hydrogen-fashion-theme/
├── hydrogen/               # The Hydrogen storefront
│   ├── app/
│   │   ├── components/     # UI, product, cart, account, home, layout, icons
│   │   ├── routes/         # File-based routes
│   │   ├── lib/            # Utilities, hooks, Shopify queries
│   │   ├── locales/        # i18n translations (EN, FR, AR)
│   │   └── styles/         # Tailwind theme and design tokens
│   ├── stories/            # Storybook stories
│   ├── e2e/                # Playwright E2E tests
│   └── test/               # Test utilities
│
├── scripts/                # Setup wizard + Shopify seeding CLI
│   ├── setup.js            # Interactive setup wizard
│   ├── lib/                # Seed and validation scripts
│   └── data/               # Demo content JSON
│
└── docs/                   # Guides, design system, screenshots
```

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Shopify Hydrogen](https://hydrogen.shopify.dev/) 2025.7 |
| Routing | [React Router](https://reactrouter.com/) 7 (file-based) |
| UI | [React](https://react.dev/) 18.3 + [TypeScript](https://www.typescriptlang.org/) 5.9 (strict) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) 4 |
| Motion | [Framer Motion](https://www.framer.com/motion/) 12 |
| State | [Zustand](https://zustand-demo.pmnd.rs/) 5 |
| i18n | [i18next](https://www.i18next.com/) + remix-i18next |
| Data | Shopify Storefront API `2025-10` (GraphQL, typed via codegen) |
| Testing | [Vitest](https://vitest.dev/) · [Playwright](https://playwright.dev/) · [Storybook](https://storybook.js.org/) 10 |
| Build | [Vite](https://vite.dev/) 6 |

## Documentation

| Guide | What it covers |
| --- | --- |
| [Setup](docs/SETUP.md) | Shopify app creation, environment variables, seeding |
| [Customization](docs/CUSTOMIZATION.md) | Colors, fonts, layout, components, rebranding |
| [Design system](docs/DESIGN_SYSTEM.md) | Tokens, type scale, spacing, component patterns |
| [Architecture](docs/ARCHITECTURE.md) | Code structure, data flow, conventions |
| [Deployment](docs/DEPLOYMENT.md) | Shopify Oxygen, Vercel, Netlify |
| [Metaobjects](docs/SHOPIFY_METAOBJECTS.md) | Dynamic homepage and CMS content |
| [Accessibility](docs/ACCESSIBILITY_ARIA_LIVE.md) | ARIA live regions and a11y patterns |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues and fixes |

## Maintaining the Shopify API version

The theme targets Storefront API `2025-10`, set in `hydrogen/app/lib/constants.ts`. When Shopify
ships a new stable version:

1. Review the [Storefront API release notes](https://shopify.dev/docs/api/release-notes/storefront-api) for breaking changes.
2. Update `STOREFRONT_API_VERSION` in `hydrogen/app/lib/constants.ts` and `PUBLIC_STOREFRONT_API_VERSION` in your `.env`.
3. Regenerate types: `yarn codegen`.
4. Re-run `yarn typecheck`, `yarn test` and `yarn test:e2e` before deploying.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the development
workflow and coding conventions, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening an
issue or pull request. Security issues should follow [SECURITY.md](SECURITY.md) rather than the
public issue tracker.

## License

[MIT](LICENSE) © Özgür Sağıroğlu

## Credits

Built on [Shopify Hydrogen](https://hydrogen.shopify.dev/).

**Demo content** — demo photography is sourced from [Unsplash](https://unsplash.com) under the
[Unsplash License](https://unsplash.com/license). All demo content (images, testimonials, press
mentions, store locations) is illustrative and should be replaced with your own branded content
before launching a production store.

**Fonts** — [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) and
[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans), both under the
[SIL Open Font License](https://openfontlicense.org/).

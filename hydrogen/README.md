# ada ÉLAN — Storefront

The Shopify Hydrogen application for the [ada ÉLAN theme](../README.md). Start at the
[repository README](../README.md) if you are setting the project up for the first time.

## Prerequisites

- Node.js **20.19+** (`nvm use` from the repository root)
- Yarn 1.x
- A configured `.env` — copy `.env.example` and fill it in, or run the setup wizard in
  [`../scripts`](../scripts/README.md)

## Development

```bash
yarn install
yarn dev
```

Visit **http://localhost:3000**.

## Scripts

| Script | Description |
| --- | --- |
| `yarn dev` | Development server with GraphQL codegen |
| `yarn build` | Production build |
| `yarn preview` | Preview the production build locally |
| `yarn codegen` | Regenerate Storefront API types and route types |
| `yarn typecheck` | TypeScript type checking |
| `yarn lint` | ESLint |
| `yarn test` | Unit tests (Vitest, watch mode) |
| `yarn test:ui` | Vitest UI |
| `yarn test:coverage` | Unit tests with coverage |
| `yarn test:typecheck` | Type check the test project |
| `yarn test:e2e` | Playwright E2E tests |
| `yarn test:e2e:ui` | Playwright UI mode |
| `yarn storybook` | Storybook on port 6006 |
| `yarn build-storybook` | Static Storybook build |

## Structure

```
hydrogen/
├── app/
│   ├── components/     # ui, product, cart, account, home, layout, motion, icons
│   ├── routes/         # File-based routes
│   ├── context/        # React contexts
│   ├── lib/            # Utilities, hooks, Shopify queries, constants
│   ├── locales/        # i18n translations (EN, FR, AR)
│   └── styles/         # Tailwind theme and design tokens
├── stories/            # Storybook stories
├── e2e/                # Playwright E2E tests
├── test/               # Test utilities and setup
├── guides/             # Hydrogen reference guides (search, predictive search)
└── public/             # Static assets
```

## Environment

Every variable is documented inline in [`.env.example`](.env.example). The required set:

| Variable | Purpose |
| --- | --- |
| `PUBLIC_STORE_DOMAIN` | Your `*.myshopify.com` domain |
| `SHOP_ID` | Store ID, used to build the Customer Account API URL |
| `PUBLIC_STOREFRONT_API_TOKEN` | Storefront API access token (public by design) |
| `PUBLIC_STOREFRONT_API_VERSION` | Storefront API version, currently `2025-10` |
| `SESSION_SECRET` | Cookie encryption secret — generate with `openssl rand -base64 32` |
| `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` | Customer Account API client ID |
| `PUBLIC_CUSTOMER_ACCOUNT_API_URL` | Customer Account API authorization URL |
| `ADMIN_API_ACCESS_TOKEN` | Admin API token for contact submissions and reviews — **server-side only** |
| `ADMIN_API_VERSION` | Admin API version, currently `2025-10` |

`.env` is gitignored. Never commit it, and never expose `ADMIN_API_ACCESS_TOKEN` to the browser.

## Further reading

- [Setup guide](../docs/SETUP.md)
- [Customization guide](../docs/CUSTOMIZATION.md)
- [Design system](../docs/DESIGN_SYSTEM.md)
- [Architecture](../docs/ARCHITECTURE.md)
- [Deployment](../docs/DEPLOYMENT.md)
- [Troubleshooting](../docs/TROUBLESHOOTING.md)

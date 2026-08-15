# Contributing

Thanks for taking the time to contribute. This document covers how to get the project running,
the conventions the codebase follows, and what a good pull request looks like.

## Code of Conduct

This project ships a [Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to uphold it.

## Reporting security issues

**Do not open a public issue for a security vulnerability.** Follow [SECURITY.md](SECURITY.md) instead.

## Getting set up

```bash
git clone https://github.com/<your-username>/shopify-hydrogen-fashion-theme.git
cd shopify-hydrogen-fashion-theme

nvm use                 # Node 20.19+
cd hydrogen
yarn install
cp .env.example .env    # fill in your own Shopify credentials
yarn dev
```

You need your own Shopify development store with Storefront API access. The
[setup guide](docs/SETUP.md) walks through creating one, and `scripts/` contains a wizard that
provisions demo content for you.

Never commit a real `.env`. The repository's `.gitignore` excludes it — please keep it that way.

## Before you open a pull request

All four of these must pass locally. CI runs the same checks on every pull request.

```bash
cd hydrogen
yarn lint
yarn typecheck
yarn test
yarn build
```

E2E tests require a configured storefront and are not run in CI:

```bash
yarn test:e2e
```

## Conventions

**Styling — Tailwind only.** No custom CSS files, no CSS modules, no styled-components, no inline
styles. Use the design tokens defined in the Tailwind theme rather than raw hex values, and `clsx`
for conditional classes. The full token reference is in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

**Buttons are black and white.** The accent color is reserved for focus rings, link hover
underlines, badges and success states — never for primary buttons.

**TypeScript strict mode.** No `any` escapes, no `@ts-ignore` without a comment explaining why.

**Components are self-contained.** Co-locate a component with its test. Follow the existing
directory layout under `hydrogen/app/components/`.

**Accessibility is not optional.** Interactive elements need keyboard support, visible focus
states, and ARIA labels on icon-only buttons. Keep color contrast at 4.5:1 or better.

**Tests.** New logic needs unit tests. Bug fixes should come with a regression test that fails
before the fix and passes after it.

## Commit messages

Write imperative, present-tense subjects that describe the change:

```
Add size guide modal to product detail page
Fix cart subtotal when a discount code is removed
```

Conventional Commit prefixes (`feat:`, `fix:`, `docs:`, `chore:`) are welcome but not required.

## Pull requests

1. Branch off `main`.
2. Keep the change focused — one concern per pull request.
3. Fill in the pull request template, including how you verified the change.
4. Add or update screenshots when the change is visual.
5. Update the relevant guide under `docs/` when you change behavior or configuration.

Draft pull requests are welcome if you want early feedback.

## Reporting bugs and requesting features

Use the issue templates. For bugs, the most useful thing you can include is a minimal set of
reproduction steps plus your Node version, package manager, and browser. For features, describe
the merchandising or storefront problem you are trying to solve — that shapes the design more than
a proposed API does.

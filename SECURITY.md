# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | ✅ |
| < 1.0 | ❌ |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull
requests.**

Report privately through either channel:

- **GitHub Security Advisories** (preferred) — open the repository's
  [Security tab](https://github.com/ozgursagiroglu/shopify-hydrogen-fashion-theme/security/advisories/new)
  and submit a private advisory.
- **Email** — ozgur@diojen.tech

Please include:

- The type of issue (XSS, SSRF, credential exposure, injection, broken access control, …)
- The affected file paths and, ideally, the commit or tag
- Step-by-step reproduction instructions
- Proof-of-concept code if you have it
- The impact you believe an attacker could achieve

You can expect an acknowledgement within 72 hours and a fuller assessment within 7 days. Once a fix
is ready we will coordinate a disclosure timeline with you and credit you in the advisory unless you
prefer to stay anonymous.

## Scope

In scope: the theme source in `hydrogen/`, the seeding and setup CLI in `scripts/`, and the shipped
configuration and documentation.

Out of scope: vulnerabilities in Shopify's platform or APIs — report those to
[Shopify's bug bounty program](https://hackerone.com/shopify). Vulnerabilities in third-party
dependencies should be reported upstream, though we appreciate a heads-up so we can pin or patch.

## Deploying this theme securely

This is a storefront template, and how you deploy it matters as much as the code:

- **Never commit `.env`.** It contains your Storefront API token, `SESSION_SECRET`, and Admin API
  token. Use your host's secret storage (Oxygen environment variables, Vercel/Netlify secrets).
- **Rotate `SESSION_SECRET`** per environment and generate it with `openssl rand -base64 32`.
- **Scope the Admin API token narrowly.** The theme only needs `read_metaobjects` and
  `write_metaobjects` for contact submissions and reviews. Do not grant product, order, or customer
  write scopes.
- **Treat the Storefront API token as public** — it is exposed to the browser by design. It should
  never be confused with the Admin API token, which must stay server-side.
- **Keep the Content Security Policy.** `hydrogen/app/entry.server.tsx` configures CSP; if you add a
  third-party script, widen the policy deliberately rather than disabling it.
- **Keep dependencies current.** Dependabot is enabled on this repository; run `yarn npm audit` (or
  `yarn audit` on Yarn 1) before shipping.

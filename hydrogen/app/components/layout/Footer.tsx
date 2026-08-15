import {Suspense} from 'react';
import {Await, useRouteLoaderData, useLocation} from 'react-router';
import {LocaleNavLink as NavLink} from '~/components/shared/LocaleLink';
import type {
  FooterMenusQuery,
  HeaderQuery,
  MenuFragment,
  ShopMetafieldsQuery,
} from 'storefrontapi.generated';
import type {RootLoader} from '~/root';
import {
  GlobeIcon,
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
  TikTokIcon,
  YouTubeIcon,
} from '~/components/icons';
import {useTranslation} from 'react-i18next';

interface FooterProps {
  footerMenus: Promise<FooterMenusQuery | null>;
  shopMetafields: Promise<ShopMetafieldsQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footerMenus,
  shopMetafields,
  header,
  publicStoreDomain,
}: FooterProps) {
  const {t} = useTranslation();
  const rootData = useRouteLoaderData<RootLoader>('root');
  const {pathname} = useLocation();

  // Get current locale from URL path
  const pathParts = pathname.split('/').filter(Boolean);
  const currentLocalePrefix = pathParts[0]?.match(/^[a-z]{2}-[a-z]{2}$/i)
    ? pathParts[0]
    : null;

  // Find current country from available countries
  // Shopify returns the primary market first in availableCountries
  const availableCountries =
    rootData?.localization?.localization?.availableCountries || [];
  const currentCountry = currentLocalePrefix
    ? availableCountries.find((country) =>
        country.availableLanguages.some(
          (lang) =>
            `${lang.isoCode}-${country.isoCode}`.toLowerCase() ===
            currentLocalePrefix.toLowerCase(),
        ),
      )
    : availableCountries[0]; // Use shop's primary market (first in list)

  const countryName = currentCountry?.name || '';
  const currencyCode = currentCountry?.currency?.isoCode || '';

  return (
    <footer className="bg-surface border-t border-border">
      {/* Main Footer Content */}
      <div className="bg-primary text-text-inverse py-16">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <NavLink
                to="/"
                className="font-display text-2xl font-medium tracking-wide text-text-inverse hover:opacity-80 transition-opacity duration-200"
              >
                {header.shop.name}
              </NavLink>
              <p className="mt-4 text-sm leading-relaxed opacity-70">
                {t('footer.brandDescription')}
              </p>
              {/* Social Links */}
              <Suspense fallback={<SocialLinksSkeleton />}>
                <Await resolve={shopMetafields}>
                  {(metafields) => <SocialLinks metafields={metafields} />}
                </Await>
              </Suspense>
            </div>

            {/* ============================================================
                 FOOTER MENUS - Configured in Shopify Admin
                 ============================================================

                 These footer menu sections pull links from Shopify Navigation:
                 Admin > Online Store > Navigation

                 REQUIRED MENUS (configure in Shopify Admin):
                 - shop-menu   → Shop section links
                 - help-menu   → Help/Support links
                 - about-menu  → About/Company links
                 - legal-menu  → Legal/Policy links (shown in bottom bar)

                 HOW IT WORKS:
                 1. Menus are loaded asynchronously in root.tsx loader
                 2. If menu exists, links are displayed
                 3. If menu doesn't exist, section is hidden (no fallback)

                 SETUP INSTRUCTIONS:
                 1. Go to Shopify Admin > Online Store > Navigation
                 2. Create each menu with the correct handle
                 3. Add links to each menu
                 4. Links will automatically appear in footer

                 EXAMPLE MENU STRUCTURE:

                 shop-menu:
                 - New Arrivals (/collections/new)
                 - Women (/collections/women)
                 - Men (/collections/men)
                 - Sale (/collections/sale)

                 help-menu:
                 - Contact Us (/contact)
                 - Shipping Info (/pages/shipping)
                 - Returns (/pages/returns)
                 - FAQ (/faq)

                 about-menu:
                 - Our Story (/about)
                 - Stores (/stores)
                 - Careers (/careers)

                 legal-menu:
                 - Privacy Policy (/policies/privacy-policy)
                 - Terms of Service (/policies/terms-of-service)
                 - Refund Policy (/policies/refund-policy)

                 @see SETUP.md for detailed menu configuration guide
            ============================================================ */}

            {/* Shop Column */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-text-inverse mb-6">
                {t('footer.sections.shop')}
              </h4>
              <Suspense fallback={<FooterMenuSkeleton />}>
                <Await resolve={footerMenus}>
                  {(menus) =>
                    menus?.shopMenu && (
                      <FooterMenu
                        menu={menus.shopMenu}
                        primaryDomainUrl={header.shop.primaryDomain.url}
                        publicStoreDomain={publicStoreDomain}
                      />
                    )
                  }
                </Await>
              </Suspense>
            </div>

            {/* Help Column */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-text-inverse mb-6">
                {t('footer.sections.help')}
              </h4>
              <Suspense fallback={<FooterMenuSkeleton />}>
                <Await resolve={footerMenus}>
                  {(menus) =>
                    menus?.helpMenu && (
                      <FooterMenu
                        menu={menus.helpMenu}
                        primaryDomainUrl={header.shop.primaryDomain.url}
                        publicStoreDomain={publicStoreDomain}
                      />
                    )
                  }
                </Await>
              </Suspense>
            </div>

            {/* About Column */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-text-inverse mb-6">
                {t('footer.sections.about')}
              </h4>
              <Suspense fallback={<FooterMenuSkeleton />}>
                <Await resolve={footerMenus}>
                  {(menus) =>
                    menus?.aboutMenu && (
                      <FooterMenu
                        menu={menus.aboutMenu}
                        primaryDomainUrl={header.shop.primaryDomain.url}
                        publicStoreDomain={publicStoreDomain}
                      />
                    )
                  }
                </Await>
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-primary border-t border-white/10 py-6">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-inverse/60">
            &copy; {new Date().getFullYear()} {header.shop.name}. All rights
            reserved.
          </p>
          <Suspense fallback={<LegalLinksSkeleton />}>
            <Await resolve={footerMenus}>
              {(menus) =>
                menus?.legalMenu && (
                  <LegalMenu
                    menu={menus.legalMenu}
                    primaryDomainUrl={header.shop.primaryDomain.url}
                    publicStoreDomain={publicStoreDomain}
                  />
                )
              }
            </Await>
          </Suspense>
          <div className="flex items-center gap-2 text-xs text-text-inverse/60">
            <GlobeIcon className="w-4 h-4" strokeWidth={1.5} />
            <span>
              {countryName} / {currencyCode}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-text-inverse/70 hover:text-text-inverse transition-colors duration-200"
      aria-label={label}
    >
      {children}
    </a>
  );
}

function SocialLinks({metafields}: {metafields: ShopMetafieldsQuery | null}) {
  // Extract social media URLs from metafields or use fallback constants
  const links = [
    {
      href: metafields?.shop?.social_instagram?.value,
      label: 'Instagram',
      icon: InstagramIcon,
    },
    {
      href: metafields?.shop?.social_facebook?.value,
      label: 'Facebook',
      icon: FacebookIcon,
    },
    {
      href: metafields?.shop?.social_twitter?.value,
      label: 'Twitter',
      icon: TwitterIcon,
    },
    {
      href: metafields?.shop?.social_pinterest?.value,
      label: 'Pinterest',
      icon: PinterestIcon,
    },
    {
      href: metafields?.shop?.social_tiktok?.value,
      label: 'TikTok',
      icon: TikTokIcon,
    },
    {
      href: metafields?.shop?.social_youtube?.value,
      label: 'YouTube',
      icon: YouTubeIcon,
    },
  ];

  return (
    <div className="flex items-center gap-4 mt-6">
      {links.map(
        (link) =>
          link.href && (
            <SocialLink key={link.label} href={link.href} label={link.label}>
              <link.icon className="w-5 h-5" />
            </SocialLink>
          ),
      )}
    </div>
  );
}

function SocialLinksSkeleton() {
  return (
    <div className="flex items-center gap-4 mt-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={`social-skeleton-${i + 1}`}
          className="w-5 h-5 bg-text-inverse/10 rounded animate-pulse"
        />
      ))}
    </div>
  );
}

function FooterMenuSkeleton() {
  return (
    <ul className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <li
          key={`skeleton-${i + 1}`}
          className="h-4 w-24 bg-text-inverse/10 rounded animate-pulse"
        />
      ))}
    </ul>
  );
}

function LegalLinksSkeleton() {
  return (
    <div className="flex items-center gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={`legal-skeleton-${i + 1}`}
          className="h-3 w-20 bg-text-inverse/10 rounded animate-pulse"
        />
      ))}
    </div>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: MenuFragment;
  primaryDomainUrl: string;
  publicStoreDomain: string;
}) {
  return (
    <ul className="space-y-3">
      {menu.items.map((item) => {
        if (!item.url) return null;
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');

        return (
          <li key={`${item.id}-${item.title}`}>
            {isExternal ? (
              <a
                href={url}
                rel="noopener noreferrer"
                target="_blank"
                className="text-sm text-text-inverse/70 hover:text-text-inverse transition-colors duration-200"
              >
                {item.title}
              </a>
            ) : (
              <NavLink
                to={url}
                prefetch="intent"
                className="text-sm text-text-inverse/70 hover:text-text-inverse transition-colors duration-200"
              >
                {item.title}
              </NavLink>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function LegalMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: MenuFragment;
  primaryDomainUrl: string;
  publicStoreDomain: string;
}) {
  return (
    <div className="flex items-center gap-4 text-xs">
      {menu.items.map((item, index) => {
        if (!item.url) return null;
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');

        return (
          <span
            key={`${item.id}-${item.title}`}
            className="flex items-center gap-4"
          >
            {index > 0 && <span className="text-text-inverse/30">·</span>}
            {isExternal ? (
              <a
                href={url}
                rel="noopener noreferrer"
                target="_blank"
                className="text-text-inverse/60 hover:text-text-inverse transition-colors duration-200"
              >
                {item.title}
              </a>
            ) : (
              <NavLink
                to={url}
                prefetch="intent"
                className="text-text-inverse/60 hover:text-text-inverse transition-colors duration-200"
              >
                {item.title}
              </NavLink>
            )}
          </span>
        );
      })}
    </div>
  );
}

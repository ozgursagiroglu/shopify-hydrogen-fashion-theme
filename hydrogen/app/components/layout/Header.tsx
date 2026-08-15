import {useState, useRef, useCallback, useEffect} from 'react';
import {LocaleNavLink as NavLink} from '~/components/shared/LocaleLink';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
  Image,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/layout/Aside';
import {LocaleSelector} from '~/components/layout/LocaleSelector';
import {cn} from '~/lib/cn';
import {TIMING} from '~/lib/constants';
import {useTranslation} from 'react-i18next';
import {
  MenuIcon,
  SearchIcon,
  HeartIcon,
  UserIcon,
  CartIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from '~/components/icons';
import {RTLIcon} from '~/components/icons/RTLIcon';

interface HeaderProps {
  header: HeaderQuery;
  cart: CartApiQueryFragment | null;
  isLoggedIn: boolean;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

// Type for menu items from Shopify GraphQL API
type MenuItem = NonNullable<HeaderProps['header']['menu']>['items'][number];

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const {t} = useTranslation();
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItem | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuOpen = useCallback((item: MenuItem) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveMenuItem(item);
  }, []);

  const handleMenuClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenuItem(null);
    }, TIMING.MENU_CLOSE_DELAY_MS); // Small delay to allow moving to the menu
  }, []);

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      isScrolled
        ? 'bg-background/85 backdrop-blur-xl shadow-sm'
        : 'bg-surface',
    )}>
      {/* Announcement Bar */}
      <div className="bg-primary text-text-inverse py-2.5 px-5 text-center text-xs tracking-wide">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span>{t('header.announcement.freeShipping')}</span>
          <span className="opacity-50 hidden sm:inline">•</span>
          <span className="hidden sm:inline">{t('header.announcement.newArrivals')}</span>
          <span className="opacity-50 hidden md:inline">•</span>
          <span className="hidden md:inline">{t('header.announcement.freeReturns')}</span>
        </div>
      </div>

      {/* Main Header */}
      <div className={cn(
        'relative border-b transition-colors duration-300',
        isScrolled ? 'border-border/50 bg-transparent' : 'border-border bg-surface',
      )}>
        <div className="max-w-[1600px] mx-auto h-[72px] flex items-center justify-between px-6 lg:px-12">
          {/* Left: Mobile Menu Toggle & Desktop Navigation */}
          <div className="flex items-center gap-8 flex-1">
            <HeaderMenuMobileToggle />
            <nav className="hidden lg:block" role="navigation">
              <HeaderMenu
                menu={menu}
                viewport="desktop"
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
                activeMenuItem={activeMenuItem}
                onMenuOpen={handleMenuOpen}
                onMenuClose={handleMenuClose}
              />
            </nav>
          </div>

          {/* Center: Logo */}
          <NavLink
            prefetch="intent"
            to="/"
            className="absolute left-1/2 -translate-x-1/2"
          >
            {shop.brand?.logo?.image ? (
              <Image
                data={shop.brand.logo.image}
                sizes="200px"
                className="h-8 md:h-10 w-auto"
              />
            ) : (
              <span className="font-display text-2xl md:text-[1.75rem] font-medium tracking-wide text-text">
                {shop.name}
              </span>
            )}
          </NavLink>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
            <LocaleSelector className="hidden md:block me-2" />
            <SearchToggle />
            <WishlistLink />
            <AccountLink isLoggedIn={isLoggedIn} />
            <CartToggle cart={cart} />
          </div>
        </div>

        {/* Mega Menu - Full Width */}
        <MegaMenu
          isOpen={activeMenuItem !== null && activeMenuItem.items.length > 0}
          onOpen={() => activeMenuItem && handleMenuOpen(activeMenuItem)}
          onClose={handleMenuClose}
          menuItems={activeMenuItem?.items || []}
          publicStoreDomain={publicStoreDomain}
          primaryDomainUrl={header.shop.primaryDomain.url}
        />
      </div>
    </header>
  );
}

interface MegaMenuProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  menuItems: MenuItem['items'];
  publicStoreDomain: string;
  primaryDomainUrl: string;
}

function MegaMenu({
  isOpen,
  onOpen,
  onClose,
  menuItems,
  publicStoreDomain,
  primaryDomainUrl,
}: MegaMenuProps) {
  const {t} = useTranslation();

  // Helper function to convert Shopify URLs to relative paths
  const getRelativeUrl = (url: string) => {
    if (
      url.includes('myshopify.com') ||
      url.includes(publicStoreDomain) ||
      url.includes(primaryDomainUrl)
    ) {
      return new URL(url).pathname;
    }
    return url;
  };

  // If no menu items, don't render mega menu
  if (!menuItems || menuItems.length === 0) {
    return null;
  }

  // Calculate grid columns based on number of items (max 6 for single-level display)
  const columnCount = Math.min(menuItems.length, 6);
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  }[columnCount] || 'grid-cols-4';

  return (
    <div
      className={cn(
        'absolute top-full left-0 right-0 bg-surface border-b border-border shadow-dropdown transition-all duration-200 ease-out z-50',
        isOpen
          ? 'opacity-100 visible translate-y-0'
          : 'opacity-0 invisible -translate-y-2 pointer-events-none'
      )}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        <div className={`grid ${gridColsClass} gap-6`}>
          {/* Links from Shopify API - direct child items */}
          {menuItems.map((item, itemIndex) => {
            if (!item.url) return null;
            const itemUrl = getRelativeUrl(item.url);

            return (
              <NavLink
                key={item.id}
                to={itemUrl}
                prefetch="intent"
                onClick={onClose}
                style={{
                  animationDelay: isOpen ? `${itemIndex * 40}ms` : '0ms',
                }}
                className={cn(
                  'group block p-4 rounded-lg hover:bg-surface-alt transition-all duration-200',
                  isOpen && 'animate-fade-in-up'
                )}
              >
                <span className="block text-sm font-medium text-text group-hover:text-primary transition-colors duration-200">
                  {item.title}
                </span>
              </NavLink>
            );
          })}
        </div>
        {/* View All Link */}
        <div className="mt-6 pt-4 border-t border-border">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-text-muted">
            {t('header.megaMenu.viewAll')}
            <RTLIcon icon={ArrowRightIcon} className="w-4 h-4" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  activeMenuItem,
  onMenuOpen,
  onMenuClose,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
  activeMenuItem?: MenuItem | null;
  onMenuOpen?: (item: MenuItem) => void;
  onMenuClose?: () => void;
}) {
  const {close} = useAside();
  const {t} = useTranslation();
  const isMobile = viewport === 'mobile';

  // If no menu from Shopify, don't render navigation
  if (!menu) {
    return null;
  }

  return (
    <nav
      className={isMobile
        ? 'flex flex-col py-4'
        : 'flex items-center gap-8'
      }
      role="navigation"
    >
      {isMobile && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          to="/"
          className={({isActive}) =>
            `block py-4 px-6 text-lg font-medium border-b border-border transition-colors duration-200 ${
              isActive ? 'text-primary font-semibold bg-surface-alt' : 'text-text hover:bg-surface-alt'
            }`
          }
        >
          {t('header.navigation.home')}
        </NavLink>
      )}
      {menu.items.map((item) => {
        if (!item.url) return null;

        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        // Show mega menu for items that have sub-items
        const hasSubItems = item.items && item.items.length > 0;
        const isActiveItem = activeMenuItem?.id === item.id;

        if (!isMobile && hasSubItems && onMenuOpen && onMenuClose) {
          return (
            <div
              key={item.id}
              onMouseEnter={() => onMenuOpen(item)}
              onMouseLeave={onMenuClose}
            >
              <NavLink
                end
                prefetch="intent"
                to={url}
                className={({isActive}) =>
                  `relative flex items-center gap-1 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 py-1 ${
                    isActive
                      ? 'text-text after:absolute after:bottom-0 after:start-0 after:end-0 after:h-0.5 after:bg-primary'
                      : 'text-text hover:text-text-muted'
                  }`
                }
              >
                {item.title}
                <ChevronDownIcon
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-200',
                    isActiveItem && 'rotate-180'
                  )}
                  strokeWidth={2}
                />
              </NavLink>
            </div>
          );
        }

        return (
          <NavLink
            key={item.id}
            end
            onClick={close}
            prefetch="intent"
            to={url}
            className={({isActive}) =>
              isMobile
                ? `block py-4 px-6 text-lg font-medium border-b border-border transition-colors duration-200 ${
                    isActive ? 'text-primary font-semibold bg-surface-alt' : 'text-text hover:bg-surface-alt'
                  }`
                : `relative text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 py-1 ${
                    isActive
                      ? 'text-text after:absolute after:bottom-0 after:start-0 after:end-0 after:h-0.5 after:bg-primary'
                      : 'text-text hover:text-text-muted'
                  }`
            }
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  const {t} = useTranslation();
  return (
    <button
      className="lg:hidden w-10 h-10 flex items-center justify-center text-text hover:text-text transition-colors duration-200 rounded-lg hover:bg-surface-alt -ms-2"
      onClick={() => open('mobile')}
      aria-label={t('header.actions.openMenu')}
    >
      <MenuIcon className="w-[22px] h-[22px]" strokeWidth={1.5} />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  const {t} = useTranslation();
  return (
    <button
      className="w-10 h-10 flex items-center justify-center text-text hover:text-text transition-colors duration-200 rounded-lg hover:bg-surface-alt"
      onClick={() => open('search')}
      aria-label={t('header.actions.search')}
    >
      <SearchIcon className="w-5 h-5" strokeWidth={1.5} />
    </button>
  );
}

function WishlistLink() {
  const {t} = useTranslation();
  return (
    <NavLink
      prefetch="intent"
      to="/wishlist"
      className="hidden sm:flex w-10 h-10 items-center justify-center text-text hover:text-text transition-colors duration-200 rounded-lg hover:bg-surface-alt"
      aria-label={t('header.actions.wishlist')}
    >
      <HeartIcon className="w-5 h-5" strokeWidth={1.5} />
    </NavLink>
  );
}

function AccountLink({isLoggedIn}: {isLoggedIn: boolean}) {
  const {t} = useTranslation();
  return (
    <NavLink
      prefetch="intent"
      to="/account"
      className="hidden sm:flex w-10 h-10 items-center justify-center text-text hover:text-text transition-colors duration-200 rounded-lg hover:bg-surface-alt"
      aria-label={t('header.actions.account')}
    >
      <AccountIcon isLoggedIn={isLoggedIn} />
    </NavLink>
  );
}

function AccountIcon({isLoggedIn}: {isLoggedIn?: boolean}) {
  return (
    <UserIcon
      className={cn('w-5 h-5', isLoggedIn && 'text-primary')}
      filled={isLoggedIn}
      strokeWidth={1.5}
    />
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const {t} = useTranslation();

  const ariaLabel = count
    ? t('header.actions.cartWithCount', {count})
    : t('header.actions.cart');

  return (
    <button
      className="relative w-10 h-10 flex items-center justify-center text-text hover:text-text transition-colors duration-200 rounded-lg hover:bg-surface-alt"
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      aria-label={ariaLabel}
    >
      <CartIcon className="w-5 h-5" strokeWidth={1.5} />
      {count !== null && count > 0 && (
        <span className="absolute top-1 end-1 min-w-[16px] h-4 flex items-center justify-center px-1 text-[10px] font-bold bg-primary text-white rounded-full">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return <CartBanner cart={cart} />;
}

function CartBanner({cart: originalCart}: {cart: CartApiQueryFragment | null}) {
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

import {NavLink, Link} from 'react-router';
import type {NavLinkProps, LinkProps} from 'react-router';
import {useLocalePrefix, getLocalePath, isExternalUrl} from '~/lib/locale';

type LocaleNavLinkProps = Omit<NavLinkProps, 'to'> & {
  to: string;
};

type LocaleLinkProps = Omit<LinkProps, 'to'> & {
  to: string;
};

/**
 * NavLink wrapper that automatically prepends the current locale prefix
 * Use this instead of NavLink for internal navigation to preserve locale
 * External URLs are rendered as regular anchor tags
 */
export function LocaleNavLink({to, children, ...props}: LocaleNavLinkProps) {
  const localePrefix = useLocalePrefix();
  const localizedTo = getLocalePath(to, localePrefix);

  // Render external URLs as regular anchor tags
  if (isExternalUrl(to)) {
    const {className, ...anchorProps} = props as any;
    return (
      <a href={to} className={className} {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <NavLink to={localizedTo} {...props}>
      {children}
    </NavLink>
  );
}

/**
 * Link wrapper that automatically prepends the current locale prefix
 * Use this instead of Link for internal navigation to preserve locale
 * External URLs are rendered as regular anchor tags
 */
export function LocaleLink({to, children, ...props}: LocaleLinkProps) {
  const localePrefix = useLocalePrefix();
  const localizedTo = getLocalePath(to, localePrefix);

  // Render external URLs as regular anchor tags
  if (isExternalUrl(to)) {
    const {className, ...anchorProps} = props as any;
    return (
      <a href={to} className={className} {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <Link to={localizedTo} {...props}>
      {children}
    </Link>
  );
}

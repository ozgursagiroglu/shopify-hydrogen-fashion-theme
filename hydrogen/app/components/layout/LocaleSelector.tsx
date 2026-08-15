import {useState, useRef, useEffect} from 'react';
import {Link, useLocation, useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
import {cn} from '~/lib/cn';
import {GlobeIcon, ChevronDownIcon} from '~/components/icons';
import {API} from '~/lib/constants';

interface Country {
  isoCode: string;
  name: string;
  currency: {
    isoCode: string;
    name: string;
    symbol: string;
  };
  availableLanguages: Array<{
    isoCode: string;
    name: string;
  }>;
}

/**
 * Build locale URL for a given country and language
 */
function buildLocaleUrl(
  countryCode: string,
  languageCode: string,
  pathname: string,
  search: string,
): string {
  // Remove existing locale prefix from path
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}-[a-z]{2}/i, '');
  const cleanPath = pathWithoutLocale === '/' ? '' : pathWithoutLocale;

  // Check if this is the default locale
  const isDefault =
    countryCode === API.DEFAULT_COUNTRY &&
    languageCode === API.DEFAULT_LANGUAGE;

  if (isDefault) {
    return (cleanPath || '/') + search;
  }

  const localePrefix = `/${languageCode.toLowerCase()}-${countryCode.toLowerCase()}`;
  return (cleanPath ? `${localePrefix}${cleanPath}` : localePrefix) + search;
}

/**
 * LocaleSelector - Dropdown to change language and country/currency
 * Uses Shopify's localization data from root loader
 * Uses Link elements for proper navigation and SEO
 */
export function LocaleSelector({className}: {className?: string}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const localization = rootData?.localization?.localization;

  const currentCountry = localization?.country?.isoCode || API.DEFAULT_COUNTRY;
  const currentLanguage = localization?.language?.isoCode || API.DEFAULT_LANGUAGE;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!localization || localization.availableCountries.length === 0) {
    return null;
  }

  const currentCountryData = localization.availableCountries.find(
    (c: Country) => c.isoCode === currentCountry,
  );

  if (!currentCountryData) {
    return null;
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select region and language"
      >
        <GlobeIcon className="w-4 h-4" />
        <span className="hidden sm:inline">
          {currentCountryData?.name || 'Select Region'}
        </span>
        <span className="sm:hidden">{currentCountry}</span>
        <span className="text-text-muted">
          ({currentCountryData?.currency?.isoCode || 'USD'})
        </span>
        <ChevronDownIcon
          className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-72 max-h-96 overflow-y-auto bg-surface rounded-lg shadow-xl border border-border z-50"
          role="listbox"
          aria-label="Available regions and languages"
        >
          <div className="p-3 border-b border-border">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Select your region
            </p>
          </div>
          <div className="py-2">
            {localization.availableCountries.map((country: Country) => (
              <div key={country.isoCode} className="px-3 py-2">
                <p className="text-sm font-medium text-text mb-1 flex items-center gap-2">
                  {country.name}
                  <span className="text-xs text-text-muted">
                    ({country.currency.symbol} {country.currency.isoCode})
                  </span>
                </p>
                <div className="flex flex-wrap gap-1 ml-2">
                  {country.availableLanguages.map((language) => {
                    const isActive =
                      country.isoCode === currentCountry &&
                      language.isoCode === currentLanguage;

                    const localeUrl = buildLocaleUrl(
                      country.isoCode,
                      language.isoCode,
                      location.pathname,
                      location.search,
                    );

                    return (
                      <Link
                        key={`${country.isoCode}-${language.isoCode}`}
                        to={localeUrl}
                        reloadDocument
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'px-2 py-1 text-xs rounded transition-colors',
                          isActive
                            ? 'bg-primary text-white pointer-events-none'
                            : 'bg-surface-alt text-text-secondary hover:bg-surface-hover hover:text-text',
                        )}
                        role="option"
                        aria-selected={isActive}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        {language.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import i18next, {type i18n} from 'i18next';
import {initReactI18next} from 'react-i18next';
import resources from '~/locales';

const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
const FALLBACK_LANGUAGE = 'en';

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Create a server-side i18next instance for a given locale
 * Uses Hydrogen's storefront.i18n.language for locale detection
 */
export async function createServerI18n(locale: string): Promise<i18n> {
  const instance = i18next.createInstance();

  // Normalize locale (Hydrogen returns uppercase like 'AR', we need lowercase 'ar')
  const normalizedLocale = locale.toLowerCase();
  const lng = SUPPORTED_LANGUAGES.includes(normalizedLocale as SupportedLanguage)
    ? normalizedLocale
    : FALLBACK_LANGUAGE;

  await instance.use(initReactI18next).init({
    resources,
    lng,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: FALLBACK_LANGUAGE,
    defaultNS: 'translation',
    interpolation: {escapeValue: false},
    react: {
      useSuspense: false,
    },
  });

  return instance;
}

/**
 * Get locale from Hydrogen storefront context
 */
export function getLocaleFromStorefront(storefront: {
  i18n?: {language?: string};
}): string {
  return storefront?.i18n?.language?.toLowerCase() || FALLBACK_LANGUAGE;
}

// Type declarations for i18next
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: (typeof resources)['en'];
  }
}

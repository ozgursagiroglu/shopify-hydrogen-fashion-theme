import {HydratedRouter} from 'react-router/dom';
import {StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {NonceProvider} from '@shopify/hydrogen';
import i18next from 'i18next';
import {I18nextProvider, initReactI18next} from 'react-i18next';
import resources from '~/locales';

async function main() {
  // Extract nonce from existing script tags
  const existingNonce =
    document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce;

  // Get language directly from HTML tag (set by server)
  const htmlLang = document.documentElement.lang || 'en';

  await i18next.use(initReactI18next).init({
    resources,
    lng: htmlLang, // Use server-rendered language directly
    supportedLngs: ['en', 'ar'],
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: {escapeValue: false},
    react: {
      useSuspense: false,
    },
  });

  hydrateRoot(
    document,
    <StrictMode>
      <I18nextProvider i18n={i18next}>
        <NonceProvider value={existingNonce}>
          <HydratedRouter />
        </NonceProvider>
      </I18nextProvider>
    </StrictMode>,
  );
}

// Only hydrate if not in Google's web cache
if (!window.location.origin.includes('webcache.googleusercontent.com')) {
  void main();
}

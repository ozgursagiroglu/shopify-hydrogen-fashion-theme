import {useTranslation} from 'react-i18next';
import type {MetaFunction, LoaderFunctionArgs} from 'react-router';
import {useLoaderData} from 'react-router';
import {ContactForm, ContactInfo} from '~/components/contact';
import type {ContactInfoData} from '~/components/contact/ContactInfo';
import {SectionHeader} from '~/components/ui';
import {buildPageTitleWithFallback} from '~/lib/seo';
import type {ShopContactQuery} from 'storefrontapi.generated';

// GraphQL query for shop contact metafields
const SHOP_CONTACT_QUERY = `#graphql
  query ShopContact($language: LanguageCode, $country: CountryCode)
    @inContext(language: $language, country: $country) {
    shop {
      name
      metafields(identifiers: [
        {namespace: "contact", key: "title"},
        {namespace: "contact", key: "email"},
        {namespace: "contact", key: "phone"},
        {namespace: "contact", key: "hours"},
        {namespace: "contact", key: "address"},
        {namespace: "contact", key: "address_url"}
      ]) {
        key
        value
      }
    }
  }
` as const;

export const meta: MetaFunction = ({matches}) => {
  return [{title: buildPageTitleWithFallback('Contact Us', 'Contact', matches)}];
};

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(); // args
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

function parseShopContactInfo(
  metafields: ShopContactQuery['shop']['metafields'] | null | undefined,
): ContactInfoData | undefined {
  if (!metafields || metafields.length === 0) return undefined;

  const fieldMap = new Map(
    metafields
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .map((m) => [m.key, m.value]),
  );

  const email = fieldMap.get('email');
  if (!email) return undefined; // Email is required

  return {
    title: fieldMap.get('title') || undefined,
    email,
    phone: fieldMap.get('phone') || undefined,
    hours: fieldMap.get('hours') || undefined,
    address: fieldMap.get('address') || undefined,
    addressUrl: fieldMap.get('address_url') || undefined,
  };
}

async function loadCriticalData({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  // Fetch shop contact metafields
  const shopData = await storefront.query(SHOP_CONTACT_QUERY).catch(() => null);
  const contactInfo = parseShopContactInfo(shopData?.shop?.metafields);

  return {contactInfo};
}

function loadDeferredData() {
  // {context}: Route.LoaderArgs
  return {};
}

export default function ContactPage() {
  const {t} = useTranslation();
  const {contactInfo} = useLoaderData<{contactInfo: ContactInfoData | undefined}>();

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-surface-alt py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={t('contact.title')}
            subtitle={t('contact.subtitle')}
            centered
          />
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-5 gap-8 md:gap-12">
          {/* Contact Form - Takes more space */}
          <div className="md:col-span-3">
            <p className="text-text-secondary mb-8">
              {t('contact.description')}
            </p>
            <ContactForm />
          </div>

          {/* Contact Info */}
          <div className="md:col-span-2">
            <ContactInfo data={contactInfo} />
          </div>
        </div>
      </div>
    </div>
  );
}

import {useState} from 'react';
import {useLoaderData} from 'react-router';
import {useTranslation} from 'react-i18next';
import {FAQList, FAQSearch, FAQContactCTA} from '~/components/faq';
import {SectionHeader} from '~/components/ui';
import {parseFAQItems, groupFAQsByCategory, type FAQItem} from '~/graphql/storefront';
import {buildPageTitleWithFallback} from '~/lib/seo';
import type {MetaFunction, LoaderFunctionArgs} from 'react-router';

export const meta: MetaFunction = ({matches}) => {
  return [{title: buildPageTitleWithFallback('FAQ', 'FAQ', matches)}];
};

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(); // args
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: LoaderFunctionArgs) {
  // Load FAQ items from Shopify metaobjects
  let faqItems: FAQItem[];
  try {
    const {metaobjects} = await (context as any).storefront.query(FAQ_QUERY);
    faqItems = parseFAQItems(metaobjects);
  } catch {
    // Return empty if metaobject doesn't exist
    faqItems = [];
  }

  const categories = groupFAQsByCategory(faqItems);

  return {categories};
}

function loadDeferredData() {
  // {context}: Route.LoaderArgs
  return {};
}

export default function FAQPage() {
  const {categories} = useLoaderData<typeof loader>();
  const {t} = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-surface-alt py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={t('faq.title')}
            subtitle={t('faq.subtitle')}
            centered
          />
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Search */}
        <FAQSearch
          value={searchTerm}
          onChange={setSearchTerm}
          className="mb-10"
        />

        {/* FAQ List */}
        <FAQList categories={categories} searchTerm={searchTerm} />

        {/* Contact CTA */}
        <FAQContactCTA className="mt-12" />
      </div>
    </div>
  );
}

const FAQ_QUERY = `#graphql
  query FAQ(
    $language: LanguageCode,
    $country: CountryCode
  ) @inContext(language: $language, country: $country) {
    metaobjects(type: "faq", first: 50) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
` as const;

import {useLoaderData} from 'react-router';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import type {Route} from './+types/($locale).policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';
import {PageIcon, ChevronRightIcon} from '~/components/icons';
import {buildPageTitle} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches}) => {
  return [{title: buildPageTitle('Policies', matches)}];
};

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-surface-alt py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight text-text text-center">
            Policies
          </h1>
          <p className="text-text-muted text-center mt-2">
            Our store policies and legal information
          </p>
        </div>
      </div>

      {/* Policies List */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid gap-4">
          {policies.map((policy) => (
            <Link
              key={policy.id}
              to={`/policies/${policy.handle}`}
              className="group p-6 bg-surface border border-border rounded-lg hover:border-text/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-alt">
                    <PageIcon className="w-5 h-5 text-text-muted" />
                  </div>
                  <h2 className="font-medium text-text group-hover:text-accent transition-colors">
                    {policy.title}
                  </h2>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;

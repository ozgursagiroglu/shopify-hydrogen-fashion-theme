import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import type {Route} from './+types/($locale).account.profile';
import {buildPageTitle} from '~/lib/seo';
import {useTranslation} from 'react-i18next';
import {Input} from '~/components/ui/Input';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = ({matches}) => {
  return [{title: buildPageTitle('Profile', matches)}];
};

export async function loader({context}: Route.LoaderArgs) {
  context.customerAccount.handleAuthStatus();
  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return data(
      {error: message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;
  const isUpdating = state !== 'idle';
  const {t} = useTranslation();

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="font-display text-2xl md:text-3xl tracking-tight text-text">
          {t('account.profileTitle')}
        </h2>
        <p className="text-text-muted mt-1">
          {t('account.profileDescription')}
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-8">
        <Form method="PUT" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-text mb-2"
              >
                {t('account.firstName')}
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder={t('account.firstNamePlaceholder')}
                aria-label={t('account.firstName')}
                defaultValue={customer.firstName ?? ''}
                minLength={2}
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-text mb-2"
              >
                {t('account.lastName')}
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder={t('account.lastNamePlaceholder')}
                aria-label={t('account.lastName')}
                defaultValue={customer.lastName ?? ''}
                minLength={2}
              />
            </div>
          </div>

          {/* Success/Error Messages */}
          {action?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{action.error}</p>
            </div>
          )}

          {action?.customer && !action?.error && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{t('account.profileUpdated')}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 font-medium disabled:opacity-50 transition-colors"
            >
              {isUpdating ? t('account.saving') : t('account.saveChanges')}
            </button>
          </div>
        </Form>
      </div>

      {/* Email Section */}
      <div className="bg-surface border border-border rounded-lg p-6 md:p-8">
        <h3 className="font-medium text-text mb-4">{t('account.emailAddress')}</h3>
        <p className="text-text-secondary">
          {customer.emailAddress?.emailAddress || t('account.noEmailAddress')}
        </p>
        <p className="text-sm text-text-muted mt-2">
          {t('account.emailChangeNote')}
        </p>
      </div>
    </div>
  );
}

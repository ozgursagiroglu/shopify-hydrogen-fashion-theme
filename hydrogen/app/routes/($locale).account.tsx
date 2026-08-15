import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/($locale).account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {PackageIcon, UserIcon, MapPinIcon, LogoutIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  const heading = customer
    ? customer.firstName
      ? t('account.welcomeWithName', {name: customer.firstName})
      : t('account.welcomeGeneric')
    : t('account.welcome');

  return (
    <div className="min-h-screen bg-background">
      {/* Account Header */}
      <div className="bg-surface-alt py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight text-text text-center">
            {heading}
          </h1>
          {customer.emailAddress?.emailAddress && (
            <p className="mt-2 text-text-muted text-center">
              {customer.emailAddress.emailAddress}
            </p>
          )}
        </div>
      </div>

      {/* Account Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <AccountMenu />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Outlet context={{customer}} />
          </main>
        </div>
      </div>
    </div>
  );
}

function AccountMenu() {
  const {t} = useTranslation();

  return (
    <nav className="space-y-1">
      <NavLink
        to="/account/orders"
        className={({isActive}) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-primary text-white'
              : 'text-text hover:bg-surface-alt'
          }`
        }
      >
        <PackageIcon className="w-5 h-5" />
        {t('account.orders')}
      </NavLink>
      <NavLink
        to="/account/profile"
        className={({isActive}) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-primary text-white'
              : 'text-text hover:bg-surface-alt'
          }`
        }
      >
        <UserIcon className="w-5 h-5" />
        {t('account.profile')}
      </NavLink>
      <NavLink
        to="/account/addresses"
        className={({isActive}) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-primary text-white'
              : 'text-text hover:bg-surface-alt'
          }`
        }
      >
        <MapPinIcon className="w-5 h-5" />
        {t('account.addresses')}
      </NavLink>
      <div className="pt-4 mt-4 border-t border-border">
        <Form method="POST" action="/account/logout">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
          >
            <LogoutIcon className="w-5 h-5" />
            {t('account.signOut')}
          </button>
        </Form>
      </div>
    </nav>
  );
}

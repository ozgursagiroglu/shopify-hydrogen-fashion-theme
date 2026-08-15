import type {Preview,Decorator} from '@storybook/react-vite';
import {
  createMemoryRouter,
  RouterProvider,
  Outlet,
} from 'react-router';
import {I18nextProvider} from 'react-i18next';
import i18n from 'i18next';
import '../app/styles/tailwind.css';

// Initialize i18n for Storybook
void i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        common: {
          shopNow: 'Shop Now',
          viewAll: 'View All',
          learnMore: 'Learn More',
          close: 'Close',
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          cancel: 'Cancel',
          save: 'Save',
          delete: 'Delete',
          edit: 'Edit',
          add: 'Add',
          remove: 'Remove',
          search: 'Search',
          filter: 'Filter',
          sort: 'Sort',
          apply: 'Apply',
          clear: 'Clear',
          clearAll: 'Clear All',
        },
        header: {
          navigation: {
            home: 'Home',
          },
          actions: {
            account: 'Account',
          },
        },
        search: {
          title: 'Search',
          titleWithTerm: 'Search: {{term}}',
          collections: 'Collections',
        },
        a11y: {
          breadcrumb: 'Breadcrumb',
        },
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

// Root layout component that provides loader data
function RootLayout() {
  return <Outlet />;
}

// Story wrapper component
function StoryWrapper({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}

// Create router with data for useRouteLoaderData
const withRouter: Decorator = (Story) => {
  const router = createMemoryRouter(
    [
      {
        id: 'root',
        path: '/',
        element: <RootLayout />,
        loader: () => ({locale: 'en'}),
        children: [
          {
            index: true,
            element: (
              <StoryWrapper>
                <Story />
              </StoryWrapper>
            ),
          },
          {
            path: '*',
            element: (
              <StoryWrapper>
                <Story />
              </StoryWrapper>
            ),
          },
        ],
      },
    ],
    {
      initialEntries: ['/'],
    },
  );

  return (
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>
  );
};

const preview: Preview = {
  decorators: [withRouter],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FAF9F7',
        },
        {
          name: 'dark',
          value: '#1C1917',
        },
        {
          name: 'white',
          value: '#FFFFFF',
        },
      ],
    },
    layout: 'centered',
  },
};

export default preview;

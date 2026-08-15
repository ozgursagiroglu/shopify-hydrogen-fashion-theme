import type {IGraphQLConfig} from 'graphql-config';
import {getSchema} from '@shopify/hydrogen-codegen';

/**
 * GraphQL Config
 * @see https://the-guild.dev/graphql/config/docs/user/usage
 * @type {IGraphQLConfig}
 */
export default {
  projects: {
    default: {
      schema: getSchema('storefront'),
      documents: [
        './*.{ts,tsx,js,jsx}',
        './app/**/*.{ts,tsx,js,jsx}',
        // Include centralized storefront queries
        './app/graphql/storefront/**/*.{ts,tsx,js,jsx}',
        // Exclude customer-account (has separate schema)
        '!./app/graphql/customer-account/**/*.{ts,tsx,js,jsx}',
        // Exclude admin (has separate schema)
        '!./app/lib/admin.ts',
        '!./app/graphql/admin/**/*.{ts,tsx,js,jsx}',
      ],
    },

    customer: {
      schema: getSchema('customer-account'),
      documents: ['./app/graphql/customer-account/*.{ts,tsx,js,jsx}'],
    },

    admin: {
      schema: 'https://shopify.dev/admin-graphql-direct-proxy/2025-10',
      documents: [
        './app/lib/admin.ts',
        './app/graphql/admin/**/*.{ts,tsx,js,jsx}',
      ],
    },
  },
} as IGraphQLConfig;

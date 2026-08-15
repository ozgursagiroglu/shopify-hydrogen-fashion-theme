/**
 * Shopify Admin API Client
 * Used for server-side operations like creating metaobjects
 */

import {ADMIN_METAOBJECT_MUTATION} from '~/graphql/admin/AdminMetaobjectMutation';

interface AdminAPIConfig {
  storeDomain: string;
  accessToken: string;
  apiVersion: string;
}

export class AdminAPI {
  private storeDomain: string;
  private accessToken: string;
  private apiVersion: string;

  constructor(config: AdminAPIConfig) {
    this.storeDomain = config.storeDomain;
    this.accessToken = config.accessToken;
    this.apiVersion = config.apiVersion;
  }

  /**
   * Execute a GraphQL query/mutation against the Admin API
   */
  async query<T = any>(
    query: string,
    variables?: Record<string, any>,
  ): Promise<{data: T; errors?: any[]}> {
    const url = `https://${this.storeDomain}/admin/api/${this.apiVersion}/graphql.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Admin API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();

    if (
      result &&
      typeof result === 'object' &&
      'errors' in result &&
      result.errors
    ) {
      throw new Error(
        `GraphQL errors: ${(result.errors as any[]).map((e: any) => e.message).join(', ')}`,
      );
    }

    return result as {data: T; errors?: any[]};
  }

  /**
   * Create a metaobject
   */
  async createMetaobject(
    type: string,
    fields: Record<string, any>,
  ): Promise<any> {
    // Convert fields object to Shopify's expected format
    const fieldArray = Object.entries(fields).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }));

    const variables = {
      metaobject: {
        type,
        fields: fieldArray,
      },
    };

    const result = await this.query(ADMIN_METAOBJECT_MUTATION, variables);

    if (result.data?.metaobjectCreate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to create metaobject: ${result.data.metaobjectCreate.userErrors.map((e: any) => e.message).join(', ')}`,
      );
    }

    return result.data?.metaobjectCreate?.metaobject;
  }
}

/**
 * Create Admin API client from environment variables
 * Uses type-safe Env interface from env.d.ts
 *
 * @param env - Environment variables (typed via Env interface)
 * @returns AdminAPI instance or null if not configured
 */
export function createAdminAPI(env: Env): AdminAPI | null {
  if (!env.ADMIN_API_ACCESS_TOKEN) {
    // ADMIN_API_ACCESS_TOKEN not configured - Admin API features disabled
    // Implement proper logging service if needed
    return null;
  }

  if (!env.PUBLIC_STORE_DOMAIN) {
    throw new Error(
      'PUBLIC_STORE_DOMAIN is required for Admin API but was not found in environment variables',
    );
  }

  return new AdminAPI({
    storeDomain: env.PUBLIC_STORE_DOMAIN,
    accessToken: env.ADMIN_API_ACCESS_TOKEN,
    // Fallback to 2025-10 if ADMIN_API_VERSION is not set
    apiVersion: env.ADMIN_API_VERSION || '2025-10',
  });
}

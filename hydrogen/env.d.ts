/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />
/// <reference types="@testing-library/jest-dom/vitest" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

/**
 * Augment the Hydrogen Env interface with custom environment variables
 * These are available in context.env throughout the application
 */
declare global {
  interface Env {
    // Admin API Environment Variables (optional)
    ADMIN_API_ACCESS_TOKEN?: string;
    ADMIN_API_VERSION?: string;
  }
}

/**
 * ada ÉLAN Demo Store Seed Script
 *
 * This script creates metaobject definitions and demo entries
 * in your Shopify store via the Admin API.
 *
 * Prerequisites:
 * 1. Create a private app in Shopify Admin
 * 2. Grant these scopes: write_metaobjects, read_metaobjects, write_files, read_files
 * 3. Set environment variables (see .env.example)
 *
 * Usage:
 *   yarn seed              # Create definitions + entries
 *   yarn seed:definitions  # Create definitions only
 *   yarn seed:entries      # Create entries only (definitions must exist)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// Configuration
// ============================================================================

const config = {
  shopDomain: process.env.PUBLIC_STORE_DOMAIN || '',
  adminApiToken: process.env.ADMIN_API_ACCESS_TOKEN || '',
  apiVersion: '2025-10',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================================
// GraphQL Client
// ============================================================================

async function adminQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const url = `https://${config.shopDomain}/admin/api/${config.apiVersion}/graphql.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': config.adminApiToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Admin API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
    throw new Error(`GraphQL errors: ${result.errors.map((e: {message: string}) => e.message).join(', ')}`);
  }

  return result.data;
}

// ============================================================================
// Metaobject Definition Functions
// ============================================================================

interface FieldDefinition {
  key: string;
  name: string;
  type: string;
  required: boolean;
  validations: Array<{ name: string; value: string }>;
}

interface MetaobjectCapabilities {
  translatable?: {
    enabled: boolean;
  };
}

interface MetaobjectDefinition {
  name: string;
  type: string;
  displayNameKey: string;
  storefrontAccess: string;
  capabilities?: MetaobjectCapabilities;
  fieldDefinitions: FieldDefinition[];
}

async function getExistingDefinitions(): Promise<Set<string>> {
  const query = `
    query {
      metaobjectDefinitions(first: 50) {
        nodes {
          type
        }
      }
    }
  `;

  const data = await adminQuery<{
    metaobjectDefinitions: { nodes: Array<{ type: string }> } | null;
  }>(query);

  if (!data.metaobjectDefinitions || !data.metaobjectDefinitions.nodes) {
    return new Set();
  }

  return new Set(data.metaobjectDefinitions.nodes.map((d) => d.type));
}

async function createDefinition(definition: MetaobjectDefinition): Promise<void> {
  const mutation = `
    mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition {
          id
          type
          name
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    definition: {
      name: definition.name,
      type: definition.type,
      displayNameKey: definition.displayNameKey,
      access: {
        storefront: definition.storefrontAccess,
      },
      capabilities: definition.capabilities ? {
        translatable: definition.capabilities.translatable,
      } : undefined,
      fieldDefinitions: definition.fieldDefinitions.map((field) => ({
        key: field.key,
        name: field.name,
        type: field.type,
        required: field.required,
        validations: field.validations.map((v) => ({
          name: v.name,
          value: v.value,
        })),
      })),
    },
  };

  const data = await adminQuery<{
    metaobjectDefinitionCreate: {
      metaobjectDefinition: { id: string; type: string; name: string } | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, variables);

  if (data.metaobjectDefinitionCreate.userErrors.length > 0) {
    const errors = data.metaobjectDefinitionCreate.userErrors;
    throw new Error(`Failed to create definition ${definition.type}: ${errors.map((e) => e.message).join(', ')}`);
  }

  log(`  ✓ Created: ${definition.name} (${definition.type})`, 'green');
}

async function seedDefinitions(): Promise<void> {
  log('\n📋 Creating Metaobject Definitions...', 'cyan');

  const definitionsDir = path.join(__dirname, '..', 'data', 'definitions');
  const files = fs.readdirSync(definitionsDir).filter((f) => f.endsWith('.json') && !f.startsWith('shop-'));

  const existingTypes = await getExistingDefinitions();

  for (const file of files) {
    const filePath = path.join(definitionsDir, file);
    const definition: MetaobjectDefinition = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (existingTypes.has(definition.type)) {
      log(`  ⏭ Skipped: ${definition.name} (already exists)`, 'yellow');
      continue;
    }

    await createDefinition(definition);
  }

  log('✅ Definitions complete!', 'green');
}

// ============================================================================
// Image Upload Functions
// ============================================================================

interface StagedUpload {
  url: string;
  parameters: Array<{ name: string; value: string }>;
  resourceUrl: string;
}

async function stageUpload(filename: string, mimeType: string): Promise<StagedUpload> {
  const mutation = `
    mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          parameters {
            name
            value
          }
          resourceUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: [
      {
        filename,
        mimeType,
        resource: 'FILE',
        httpMethod: 'POST',
      },
    ],
  };

  const data = await adminQuery<{
    stagedUploadsCreate: {
      stagedTargets: StagedUpload[];
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, variables);

  if (data.stagedUploadsCreate.userErrors.length > 0) {
    throw new Error(`Stage upload failed: ${data.stagedUploadsCreate.userErrors.map((e) => e.message).join(', ')}`);
  }

  return data.stagedUploadsCreate.stagedTargets[0];
}

async function uploadImageFromUrl(imageUrl: string): Promise<string> {
  // Download image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageUrl}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
  const filename = `demo-${Date.now()}.jpg`;

  // Stage upload
  const staged = await stageUpload(filename, contentType);

  // Upload to staged URL
  const formData = new FormData();
  for (const param of staged.parameters) {
    formData.append(param.name, param.value);
  }
  formData.append('file', new Blob([imageBuffer], { type: contentType }), filename);

  const uploadResponse = await fetch(staged.url, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.status}`);
  }

  // Create file in Shopify
  const createFileMutation = `
    mutation FileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          ... on MediaImage {
            id
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const fileData = await adminQuery<{
    fileCreate: {
      files: Array<{ id: string }>;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(createFileMutation, {
    files: [
      {
        originalSource: staged.resourceUrl,
        contentType: 'IMAGE',
      },
    ],
  });

  if (fileData.fileCreate.userErrors.length > 0) {
    throw new Error(`File create failed: ${fileData.fileCreate.userErrors.map((e) => e.message).join(', ')}`);
  }

  // Return the file GID
  return fileData.fileCreate.files[0].id;
}

// Image cache to avoid re-uploading
const imageCache = new Map<string, string>();

async function getOrUploadImage(imageUrl: string): Promise<string> {
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl)!;
  }

  log(`    📤 Uploading image...`, 'dim');
  const fileId = await uploadImageFromUrl(imageUrl);
  imageCache.set(imageUrl, fileId);

  // Wait a bit for Shopify to process
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return fileId;
}

// ============================================================================
// Metaobject Entry Functions
// ============================================================================

interface EntryField {
  [key: string]: string | number | boolean;
}

interface MetaobjectEntry {
  handle: string;
  fields: EntryField;
}

async function getExistingEntries(type: string): Promise<Set<string>> {
  const query = `
    query GetEntries($type: String!) {
      metaobjects(type: $type, first: 100) {
        nodes {
          handle
        }
      }
    }
  `;

  const data = await adminQuery<{
    metaobjects: { nodes: Array<{ handle: string }> } | null;
  }>(query, { type });

  if (!data.metaobjects || !data.metaobjects.nodes) {
    return new Set();
  }

  return new Set(data.metaobjects.nodes.map((e) => e.handle));
}

async function getExistingEntriesWithIds(type: string): Promise<Map<string, string>> {
  const query = `
    query GetEntriesWithIds($type: String!) {
      metaobjects(type: $type, first: 100) {
        nodes {
          id
          handle
        }
      }
    }
  `;

  const data = await adminQuery<{
    metaobjects: { nodes: Array<{ id: string; handle: string }> } | null;
  }>(query, { type });

  if (!data.metaobjects || !data.metaobjects.nodes) {
    return new Map();
  }

  return new Map(data.metaobjects.nodes.map((e) => [e.handle, e.id]));
}

async function deleteMetaobjectEntry(id: string): Promise<void> {
  const mutation = `
    mutation DeleteMetaobject($id: ID!) {
      metaobjectDelete(id: $id) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }
  `;

  await adminQuery(mutation, { id });
  await new Promise((r) => setTimeout(r, 300));
}

async function createEntry(type: string, entry: MetaobjectEntry, imageFields: string[], urlFields: string[]): Promise<void> {
  // Process image and URL fields
  const processedFields: Array<{ key: string; value: string }> = [];

  for (const [key, value] of Object.entries(entry.fields)) {
    if (imageFields.includes(key) && typeof value === 'string' && value.startsWith('http')) {
      // Upload image and get file reference
      const fileId = await getOrUploadImage(value);
      processedFields.push({ key, value: fileId });
    } else if (urlFields.includes(key) && typeof value === 'string') {
      // Convert relative URLs to absolute URLs
      processedFields.push({ key, value: toAbsoluteUrl(value) });
    } else if (typeof value === 'boolean') {
      processedFields.push({ key, value: value.toString() });
    } else if (typeof value === 'number') {
      processedFields.push({ key, value: value.toString() });
    } else if (value !== undefined && value !== null) {
      processedFields.push({ key, value: String(value) });
    }
  }

  const mutation = `
    mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject {
          id
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    metaobject: {
      type,
      handle: entry.handle,
      fields: processedFields,
    },
  };

  const data = await adminQuery<{
    metaobjectCreate: {
      metaobject: { id: string; handle: string } | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, variables);

  if (data.metaobjectCreate.userErrors.length > 0) {
    throw new Error(`Failed to create entry ${entry.handle}: ${data.metaobjectCreate.userErrors.map((e) => e.message).join(', ')}`);
  }
}

// Map of metaobject types to their image field keys
const imageFieldsMap: Record<string, string[]> = {
  homepage_hero: ['background_image'],
  feature_banner: ['image'],
  press_feature: ['logo_image'],
  lookbook_item: ['image'],
  split_hero: ['image'],
  testimonial: ['avatar'],
  instagram_post: ['image'],
  newsletter_section: ['background_image'],
  about_page: ['hero_image', 'story_image'],
  store_location: ['image'],
  lookbook_collection: ['hero_image'],
};

// Map of metaobject types to their URL field keys (for converting relative to absolute URLs)
const urlFieldsMap: Record<string, string[]> = {
  homepage_hero: ['primary_cta_url', 'secondary_cta_url'],
  feature_banner: ['cta_url'],
  lookbook_item: ['url'],
  split_hero: ['cta_url'],
};

// Convert relative URL to absolute URL using store domain
function toAbsoluteUrl(value: string): string {
  if (value.startsWith('/')) {
    return `https://${config.shopDomain}${value}`;
  }
  return value;
}

async function seedEntries(forceEntries = false): Promise<void> {
  log('\n📝 Creating Metaobject Entries...', 'cyan');
  if (forceEntries) {
    log('  🔄 Force mode: Will delete and recreate existing entries', 'yellow');
  }

  const entriesPath = path.join(__dirname, '..', 'data', 'entries', 'demo-content.json');
  const allEntries: Record<string, MetaobjectEntry[]> = JSON.parse(fs.readFileSync(entriesPath, 'utf-8'));

  for (const [type, entries] of Object.entries(allEntries)) {
    log(`\n  ${type}:`, 'cyan');

    const imageFields = imageFieldsMap[type] || [];
    const urlFields = urlFieldsMap[type] || [];

    if (forceEntries) {
      // Delete existing entries that we're about to recreate
      const existingWithIds = await getExistingEntriesWithIds(type);
      for (const entry of entries) {
        const existingId = existingWithIds.get(entry.handle);
        if (existingId) {
          await deleteMetaobjectEntry(existingId);
          log(`    🗑 Deleted: ${entry.handle}`, 'dim');
        }
      }
    }

    const existingHandles = forceEntries ? new Set<string>() : await getExistingEntries(type);

    for (const entry of entries) {
      if (existingHandles.has(entry.handle)) {
        log(`    ⏭ ${entry.handle} (already exists)`, 'yellow');
        continue;
      }

      try {
        await createEntry(type, entry, imageFields, urlFields);
        log(`    ✓ ${entry.handle}`, 'green');
      } catch (error) {
        log(`    ✗ ${entry.handle}: ${(error as Error).message}`, 'red');
      }
    }
  }

  log('\n✅ Entries complete!', 'green');
}

// ============================================================================
// Menu Functions
// ============================================================================

interface MenuItem {
  title: string;
  url: string;
  items?: MenuItem[];
}

interface MenuDefinition {
  handle: string;
  title: string;
  items: MenuItem[];
}

async function getExistingMenus(): Promise<Map<string, string>> {
  const query = `
    query {
      menus(first: 50) {
        nodes {
          id
          handle
        }
      }
    }
  `;

  const data = await adminQuery<{
    menus: { nodes: Array<{ id: string; handle: string }> };
  }>(query);

  const menuMap = new Map<string, string>();
  for (const menu of data.menus.nodes) {
    menuMap.set(menu.handle, menu.id);
  }
  return menuMap;
}

async function createMenu(menu: MenuDefinition): Promise<void> {
  const mutation = `
    mutation MenuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
      menuCreate(title: $title, handle: $handle, items: $items) {
        menu {
          id
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // MenuItemCreateInput type definition
  interface MenuItemInput {
    title: string;
    type: 'HTTP';
    url: string;
    items?: MenuItemInput[];
  }

  // Convert items to the format expected by the API
  const formatItems = (items: MenuItem[]): MenuItemInput[] => {
    return items.map(item => ({
      title: item.title,
      type: 'HTTP' as const,
      url: item.url.startsWith('/') ? `https://${config.shopDomain}${item.url}` : item.url,
      ...(item.items && item.items.length > 0 ? { items: formatItems(item.items) } : {}),
    }));
  };

  const variables = {
    title: menu.title,
    handle: menu.handle,
    items: formatItems(menu.items),
  };

  const data = await adminQuery<{
    menuCreate: {
      menu: { id: string; handle: string } | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, variables);

  if (data.menuCreate.userErrors.length > 0) {
    throw new Error(`Failed to create menu ${menu.handle}: ${data.menuCreate.userErrors.map((e) => e.message).join(', ')}`);
  }
}

async function seedMenus(): Promise<void> {
  log('\n📋 Creating Menus...', 'cyan');

  const menusPath = path.join(__dirname, '..', 'data', 'entries', 'menus.json');

  if (!fs.existsSync(menusPath)) {
    log('  ⚠ No menus.json found, skipping menu creation', 'yellow');
    return;
  }

  const menus: MenuDefinition[] = JSON.parse(fs.readFileSync(menusPath, 'utf-8'));
  const existingMenus = await getExistingMenus();

  for (const menu of menus) {
    if (existingMenus.has(menu.handle)) {
      log(`  ⏭ ${menu.title} (${menu.handle}) - already exists`, 'yellow');
      continue;
    }

    try {
      await createMenu(menu);
      log(`  ✓ ${menu.title} (${menu.handle})`, 'green');
    } catch (error) {
      log(`  ✗ ${menu.handle}: ${(error as Error).message}`, 'red');
    }
  }

  log('\n✅ Menus complete!', 'green');
}

// ============================================================================
// Shop Metafield Definition Functions
// ============================================================================

interface ShopMetafieldFieldDefinition {
  key: string;
  name: string;
  type: string;
}

interface ShopMetafieldDefinition {
  namespace: string;
  name: string;
  description?: string;
  fieldDefinitions: ShopMetafieldFieldDefinition[];
}

async function getExistingShopMetafieldDefinitions(): Promise<Set<string>> {
  const query = `
    query {
      metafieldDefinitions(first: 100, ownerType: SHOP) {
        nodes {
          namespace
          key
        }
      }
    }
  `;

  const data = await adminQuery<{
    metafieldDefinitions: { nodes: Array<{ namespace: string; key: string }> } | null;
  }>(query);

  if (!data.metafieldDefinitions || !data.metafieldDefinitions.nodes) {
    return new Set();
  }

  return new Set(data.metafieldDefinitions.nodes.map((d) => `${d.namespace}.${d.key}`));
}

async function deleteShopMetafieldDefinition(definitionId: string): Promise<void> {
  const mutation = `
    mutation DeleteMetafieldDefinition($id: ID!) {
      metafieldDefinitionDelete(id: $id) {
        deletedDefinitionId
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminQuery<{
    metafieldDefinitionDelete: {
      deletedDefinitionId: string | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, {id: definitionId});

  if (data.metafieldDefinitionDelete.userErrors.length > 0) {
    throw new Error(
      `Failed to delete definition: ${data.metafieldDefinitionDelete.userErrors.map((e) => e.message).join(', ')}`,
    );
  }
}

async function getShopMetafieldDefinitionId(
  namespace: string,
  key: string,
): Promise<string | null> {
  const query = `
    query {
      metafieldDefinitions(first: 100, ownerType: SHOP) {
        nodes {
          id
          namespace
          key
        }
      }
    }
  `;

  const data = await adminQuery<{
    metafieldDefinitions: {
      nodes: Array<{id: string; namespace: string; key: string}>;
    } | null;
  }>(query);

  if (!data.metafieldDefinitions?.nodes) return null;

  const definition = data.metafieldDefinitions.nodes.find(
    (d) => d.namespace === namespace && d.key === key,
  );

  return definition?.id || null;
}

async function createShopMetafieldDefinition(
  namespace: string,
  field: ShopMetafieldFieldDefinition,
  recreate = false,
): Promise<void> {
  // If recreate flag is set, delete existing definition first
  if (recreate) {
    const existingId = await getShopMetafieldDefinitionId(namespace, field.key);
    if (existingId) {
      await deleteShopMetafieldDefinition(existingId);
      log(`    🗑 Deleted existing definition (${field.key})`, 'dim');
    }
  }

  const mutation = `
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          namespace
          key
          name
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    definition: {
      name: field.name,
      namespace,
      key: field.key,
      type: field.type,
      ownerType: 'SHOP',
      access: {
        storefront: 'PUBLIC_READ',
      },
      pin: false,
    },
  };

  const data = await adminQuery<{
    metafieldDefinitionCreate: {
      createdDefinition: { id: string; namespace: string; key: string; name: string } | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, variables);

  if (data.metafieldDefinitionCreate.userErrors.length > 0) {
    throw new Error(
      `Failed to create definition ${namespace}.${field.key}: ${data.metafieldDefinitionCreate.userErrors.map((e) => e.message).join(', ')}`,
    );
  }
}

async function seedShopMetafieldDefinitions(recreate = false): Promise<void> {
  log('\n📋 Creating Shop Metafield Definitions...', 'cyan');
  if (recreate) {
    log('  🔄 Recreate mode: Will delete and recreate existing definitions', 'yellow');
  }

  const definitionsDir = path.join(__dirname, '..', 'data', 'definitions');
  const files = fs.readdirSync(definitionsDir).filter((f: string) => f.startsWith('shop-') && f.endsWith('.json'));

  if (files.length === 0) {
    log('  ⚠ No shop metafield definitions found', 'yellow');
    return;
  }

  try {
    const existingDefs = await getExistingShopMetafieldDefinitions();

    for (const file of files) {
      const filePath = path.join(definitionsDir, file);
      const definition: ShopMetafieldDefinition = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      log(`\n  ${definition.name} (${definition.namespace}):`, 'cyan');

      for (const field of definition.fieldDefinitions) {
        const defKey = `${definition.namespace}.${field.key}`;

        if (existingDefs.has(defKey) && !recreate) {
          log(`    ⏭ ${field.name} (${field.key}) - already exists`, 'yellow');
          continue;
        }

        try {
          await createShopMetafieldDefinition(definition.namespace, field, recreate);
          log(`    ✓ ${field.name} (${field.key})`, 'green');
        } catch (error) {
          log(`    ✗ ${field.key}: ${(error as Error).message}`, 'red');
        }
      }
    }

    log('\n✅ Shop metafield definitions complete!', 'green');
  } catch (error) {
    log(`  ✗ Error: ${(error as Error).message}`, 'red');
    log(`  ⚠ Skipping shop metafield definitions`, 'yellow');
  }
}

// ============================================================================
// Blog & Article Functions
// ============================================================================
// IMPORTANT: Requires API scopes: read_content, write_content
// Add these scopes in Shopify Admin > Apps > Develop apps > Configure

interface ArticleMetafield {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

interface ArticleInput {
  title: string;
  handle: string;
  author: string;
  body_html: string;
  published_at: string;
  summary_html: string;
  tags: string;
  image?: {
    src: string;
    alt: string;
  };
  metafields: ArticleMetafield[];
}

interface ArticlesData {
  blog: string;
  articles: ArticleInput[];
}

async function getBlogId(blogHandle: string): Promise<string | null> {
  const query = `
    query GetBlogs {
      blogs(first: 250) {
        nodes {
          id
          handle
        }
      }
    }
  `;

  const data = await adminQuery<{
    blogs: {
      nodes: Array<{ id: string; handle: string }>;
    };
  }>(query);

  const blog = data.blogs.nodes.find((b) => b.handle === blogHandle);
  return blog?.id || null;
}

async function createBlog(handle: string, title: string): Promise<string> {
  const mutation = `
    mutation BlogCreate($title: String!, $handle: String!) {
      blogCreate(blog: { title: $title, handle: $handle }) {
        blog {
          id
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminQuery<{
    blogCreate: {
      blog: { id: string; handle: string } | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, { title, handle });

  if (data.blogCreate.userErrors.length > 0) {
    throw new Error(`Failed to create blog: ${data.blogCreate.userErrors.map((e) => e.message).join(', ')}`);
  }

  if (!data.blogCreate.blog) {
    throw new Error('Failed to create blog: No blog returned');
  }

  return data.blogCreate.blog.id;
}

async function getExistingArticles(blogId: string): Promise<Set<string>> {
  const query = `
    query GetArticles($blogId: ID!) {
      blog(id: $blogId) {
        articles(first: 250) {
          nodes {
            handle
          }
        }
      }
    }
  `;

  const data = await adminQuery<{
    blog: {
      articles: { nodes: Array<{ handle: string }> };
    } | null;
  }>(query, { blogId });

  if (!data.blog) {
    return new Set();
  }

  return new Set(data.blog.articles.nodes.map((a) => a.handle));
}

async function createArticle(blogId: string, article: ArticleInput): Promise<void> {
  const mutation = `
    mutation ArticleCreate($article: ArticleCreateInput!) {
      articleCreate(article: $article) {
        article {
          id
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables: {
    article: {
      blogId: string;
      title: string;
      handle: string;
      author: { name: string };
      body: string;
      tags: string[];
      image?: { altText: string; url: string };
      metafields?: Array<{ namespace: string; key: string; value: string; type: string }>;
    };
  } = {
    article: {
      blogId,
      title: article.title,
      handle: article.handle,
      author: { name: article.author || 'ada ÉLAN Editorial Team' },
      body: article.body_html,
      tags: article.tags.split(',').map((t) => t.trim()),
    },
  };

  // Add image if provided
  if (article.image) {
    variables.article.image = {
      url: article.image.src,
      altText: article.image.alt,
    };
  }

  // Add metafields if provided
  if (article.metafields && article.metafields.length > 0) {
    variables.article.metafields = article.metafields;
  }

  const data = await adminQuery<{
    articleCreate: {
      article: { id: string; handle: string } | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, variables);

  if (data.articleCreate.userErrors.length > 0) {
    throw new Error(
      `Failed to create article ${article.handle}: ${data.articleCreate.userErrors.map((e) => e.message).join(', ')}`,
    );
  }
}

async function seedBlogAndArticles(): Promise<void> {
  log('\n📝 Creating Blog & Articles...', 'cyan');

  const articlesPath = path.join(__dirname, '..', 'data', 'entries', 'demo-articles.json');

  if (!fs.existsSync(articlesPath)) {
    log('  ⚠ No demo-articles.json found, skipping', 'yellow');
    return;
  }

  const articlesData: ArticlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));

  // Create or get blog
  let blogId = await getBlogId(articlesData.blog);

  if (!blogId) {
    log(`\n  Creating blog: ${articlesData.blog}`, 'cyan');
    blogId = await createBlog(articlesData.blog, 'Journal');
    log(`    ✓ Blog created`, 'green');
  } else {
    log(`\n  Blog "${articlesData.blog}" already exists`, 'yellow');
  }

  // Get existing articles
  const existingArticles = await getExistingArticles(blogId);

  // Create articles
  log(`\n  Creating articles:`, 'cyan');
  for (const article of articlesData.articles) {
    if (existingArticles.has(article.handle)) {
      log(`    ⏭ ${article.handle} (already exists)`, 'yellow');
      continue;
    }

    try {
      await createArticle(blogId, article);
      log(`    ✓ ${article.handle}`, 'green');
    } catch (error) {
      log(`    ✗ ${article.handle}: ${(error as Error).message}`, 'red');
    }
  }

  log('\n✅ Blog & articles complete!', 'green');
}

// ============================================================================
// Pages Functions
// ============================================================================
// IMPORTANT: Requires API scopes: read_online_store_pages, write_online_store_pages
// Add these scopes in Shopify Admin > Apps > Develop apps > Configure

interface PageMetafield {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

interface PageInput {
  title: string;
  handle: string;
  body_html: string;
  metafields: PageMetafield[];
}

interface PagesData {
  pages: PageInput[];
}

async function getExistingPages(): Promise<Set<string>> {
  const query = `
    query GetPages {
      pages(first: 250) {
        nodes {
          handle
        }
      }
    }
  `;

  const data = await adminQuery<{
    pages: { nodes: Array<{ handle: string }> };
  }>(query);

  return new Set(data.pages.nodes.map((p) => p.handle));
}

async function createPage(page: PageInput): Promise<void> {
  const mutation = `
    mutation PageCreate($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page {
          id
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables: {
    page: {
      title: string;
      handle: string;
      body: string;
      metafields?: Array<{ namespace: string; key: string; value: string; type: string }>;
    };
  } = {
    page: {
      title: page.title,
      handle: page.handle,
      body: page.body_html,
    },
  };

  // Add metafields if provided
  if (page.metafields && page.metafields.length > 0) {
    variables.page.metafields = page.metafields;
  }

  const data = await adminQuery<{
    pageCreate: {
      page: { id: string; handle: string } | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, variables);

  if (data.pageCreate.userErrors.length > 0) {
    throw new Error(
      `Failed to create page ${page.handle}: ${data.pageCreate.userErrors.map((e) => e.message).join(', ')}`,
    );
  }
}

async function seedPages(): Promise<void> {
  log('\n📄 Creating Pages...', 'cyan');

  const pagesPath = path.join(__dirname, '..', 'data', 'entries', 'demo-pages.json');

  if (!fs.existsSync(pagesPath)) {
    log('  ⚠ No demo-pages.json found, skipping', 'yellow');
    return;
  }

  const pagesData: PagesData = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'));

  // Get existing pages
  const existingPages = await getExistingPages();

  // Create pages
  for (const page of pagesData.pages) {
    if (existingPages.has(page.handle)) {
      log(`  ⏭ ${page.handle} (already exists)`, 'yellow');
      continue;
    }

    try {
      await createPage(page);
      log(`  ✓ ${page.handle}`, 'green');
    } catch (error) {
      log(`  ✗ ${page.handle}: ${(error as Error).message}`, 'red');
    }
  }

  log('\n✅ Pages complete!', 'green');
}

// ============================================================================
// Policies Functions
// ============================================================================
// IMPORTANT: Requires API scopes: read_legal_policies, write_legal_policies
// Add these scopes in Shopify Admin > Apps > Develop apps > Configure
//
// ⚠️  WARNING: These are DEMO policies for development only!
// ⚠️  You MUST replace them with proper legal policies before going live.
// ⚠️  Using demo policies in production may create legal liability.

type PolicyType = 'SHIPPING_POLICY' | 'REFUND_POLICY' | 'PRIVACY_POLICY' | 'TERMS_OF_SERVICE';

interface PolicyInput {
  type: PolicyType;
  body: string;
}

async function updatePolicy(policy: PolicyInput): Promise<void> {
  const mutation = `
    mutation ShopPolicyUpdate($shopPolicy: ShopPolicyInput!) {
      shopPolicyUpdate(shopPolicy: $shopPolicy) {
        shopPolicy {
          id
          type
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    shopPolicy: {
      type: policy.type,
      body: policy.body,
    },
  };

  const data = await adminQuery<{
    shopPolicyUpdate: {
      shopPolicy: { id: string; type: string } | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, variables);

  if (data.shopPolicyUpdate.userErrors.length > 0) {
    throw new Error(
      `Failed to update policy: ${data.shopPolicyUpdate.userErrors.map((e) => e.message).join(', ')}`,
    );
  }
}

async function seedPolicies(): Promise<void> {
  log('\n📜 Updating Shop Policies...', 'cyan');

  const policiesPath = path.join(__dirname, '..', 'data', 'entries', 'demo-policies.json');

  if (!fs.existsSync(policiesPath)) {
    log('  ⚠ No demo-policies.json found, skipping', 'yellow');
    return;
  }

  const policiesData: { policies: PolicyInput[] } = JSON.parse(
    fs.readFileSync(policiesPath, 'utf-8'),
  );

  for (const policy of policiesData.policies) {
    try {
      await updatePolicy(policy);
      log(`  ✓ ${policy.type}`, 'green');
    } catch (error) {
      log(`  ✗ ${policy.type}: ${(error as Error).message}`, 'red');
    }
  }

  log('\n✅ Policies complete!', 'green');
}

// ============================================================================
// Shop Metafields Functions
// ============================================================================

interface ShopMetafieldInput {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

async function getShopId(): Promise<string> {
  const query = `
    query {
      shop {
        id
      }
    }
  `;

  const data = await adminQuery<{ shop: { id: string } }>(query);
  return data.shop.id;
}

async function setShopMetafields(metafields: ShopMetafieldInput[]): Promise<void> {
  const shopId = await getShopId();

  const mutation = `
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    metafields: metafields.map((mf) => ({
      ownerId: shopId,
      namespace: mf.namespace,
      key: mf.key,
      value: mf.value,
      type: mf.type,
    })),
  };

  const data = await adminQuery<{
    metafieldsSet: {
      metafields: Array<{ id: string; namespace: string; key: string }> | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, variables);

  if (data.metafieldsSet.userErrors.length > 0) {
    throw new Error(
      `Failed to set shop metafields: ${data.metafieldsSet.userErrors.map((e) => e.message).join(', ')}`,
    );
  }
}

async function seedShopMetafields(): Promise<void> {
  log('\n📧 Setting Shop Metafield Values (Contact Info)...', 'cyan');

  const metafieldsPath = path.join(__dirname, '..', 'data', 'entries', 'shop-metafields.json');

  if (!fs.existsSync(metafieldsPath)) {
    log('  ⚠ No shop-metafields.json found, skipping', 'yellow');
    return;
  }

  const allMetafields: Record<string, ShopMetafieldInput[]> = JSON.parse(
    fs.readFileSync(metafieldsPath, 'utf-8'),
  );

  for (const [namespace, metafields] of Object.entries(allMetafields)) {
    try {
      await setShopMetafields(metafields);
      log(`  ✓ Set ${metafields.length} values`, 'green');
    } catch (error) {
      log(`  ✗ ${namespace}: ${(error as Error).message}`, 'red');
    }
  }

  log('✅ Shop metafield values complete!', 'green');
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  log('\n🌱 ada ÉLAN Demo Store Seed Script\n', 'cyan');

  // Validate configuration
  if (!config.shopDomain || !config.adminApiToken) {
    log('❌ Error: Missing environment variables', 'red');
    log('\nRequired variables:', 'yellow');
    log('  PUBLIC_STORE_DOMAIN=your-store.myshopify.com');
    log('  ADMIN_API_ACCESS_TOKEN=your-admin-api-token');
    log('\nCreate a .env file or set these environment variables.', 'dim');
    process.exit(1);
  }

  log(`Store: ${config.shopDomain}`, 'dim');

  const args = process.argv.slice(2);
  const definitionsOnly = args.includes('--definitions-only');
  const entriesOnly = args.includes('--entries-only');
  const recreate = args.includes('--recreate');
  const forceEntries = args.includes('--force-entries');

  try {
    if (!entriesOnly) {
      await seedDefinitions();
      await seedShopMetafieldDefinitions(recreate);
    }

    if (!definitionsOnly) {
      await seedEntries(forceEntries);
      await seedMenus();
      await seedBlogAndArticles();
      await seedPages();
      await seedPolicies();
      await seedShopMetafields();
    }

    log('\n🎉 Seed complete!\n', 'green');
  } catch (error) {
    log(`\n❌ Error: ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}

main();

/**
 * ada ÉLAN Demo Products Seed Script
 *
 * This script creates demo collections and products in your Shopify store.
 *
 * Prerequisites:
 * 1. Create a private app in Shopify Admin
 * 2. Grant these scopes: write_products, read_products, write_files, read_files
 * 3. Set environment variables (see .env.example)
 *
 * Usage:
 *   yarn seed:products
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
  apiVersion: '2025-01',
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
    throw new Error(`GraphQL errors: ${result.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return result.data;
}

// Rate limiting helper
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  const data = await adminQuery<{
    stagedUploadsCreate: {
      stagedTargets: StagedUpload[];
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, {
    input: [{ filename, mimeType, resource: 'IMAGE', httpMethod: 'POST' }],
  });

  if (data.stagedUploadsCreate.userErrors.length > 0) {
    throw new Error(`Stage upload failed: ${data.stagedUploadsCreate.userErrors.map((e) => e.message).join(', ')}`);
  }

  return data.stagedUploadsCreate.stagedTargets[0];
}

const imageCache = new Map<string, string>();

async function uploadImageFromUrl(imageUrl: string): Promise<string> {
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl)!;
  }

  // Download image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageUrl}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
  const filename = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

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

  imageCache.set(imageUrl, staged.resourceUrl);
  return staged.resourceUrl;
}

// ============================================================================
// Collection Functions
// ============================================================================

interface CollectionDef {
  handle: string;
  title: string;
  description: string;
  image: string;
}

const collectionIdCache = new Map<string, string>();

async function getExistingCollections(): Promise<Map<string, string>> {
  const query = `
    query {
      collections(first: 50) {
        nodes {
          id
          handle
        }
      }
    }
  `;

  const data = await adminQuery<{
    collections: { nodes: Array<{ id: string; handle: string }> };
  }>(query);

  const map = new Map<string, string>();
  for (const c of data.collections.nodes) {
    map.set(c.handle, c.id);
  }
  return map;
}

async function createCollection(collection: CollectionDef): Promise<string> {
  log(`    📤 Uploading collection image...`, 'dim');
  const imageUrl = await uploadImageFromUrl(collection.image);

  const mutation = `
    mutation CollectionCreate($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
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
    collectionCreate: {
      collection: { id: string; handle: string } | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, {
    input: {
      handle: collection.handle,
      title: collection.title,
      descriptionHtml: collection.description,
      image: {
        src: imageUrl,
        altText: collection.title,
      },
    },
  });

  if (data.collectionCreate.userErrors.length > 0) {
    throw new Error(`Failed to create collection: ${data.collectionCreate.userErrors.map((e) => e.message).join(', ')}`);
  }

  const collectionId = data.collectionCreate.collection!.id;

  // Publish to all sales channels
  await publishToAllChannels(collectionId);

  return collectionId;
}

async function seedCollections(collections: CollectionDef[], force = false): Promise<void> {
  log('\n📁 Creating Collections...', 'cyan');

  if (force) {
    log('  🔄 Force mode: Deleting existing collections first...', 'yellow');
    const existingWithIds = await getExistingCollectionsWithIds();
    for (const collection of collections) {
      const existingId = existingWithIds.get(collection.handle);
      if (existingId) {
        await deleteCollection(existingId);
        log(`  🗑 Deleted: ${collection.handle}`, 'dim');
      }
    }
  }

  const existing = force ? new Map<string, string>() : await getExistingCollections();

  for (const collection of collections) {
    if (existing.has(collection.handle)) {
      log(`  ⏭ ${collection.title} (already exists)`, 'yellow');
      collectionIdCache.set(collection.handle, existing.get(collection.handle)!);
      continue;
    }

    try {
      const id = await createCollection(collection);
      collectionIdCache.set(collection.handle, id);
      log(`  ✓ ${collection.title}`, 'green');
      await delay(500); // Rate limiting
    } catch (error) {
      log(`  ✗ ${collection.title}: ${(error as Error).message}`, 'red');
    }
  }
}

// ============================================================================
// Product Functions
// ============================================================================

interface ProductVariants {
  size?: string[];
  color?: string[];
}

interface ProductDef {
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  collections: string[];
  price: string;
  compareAtPrice: string | null;
  images: string[];
  variants: ProductVariants;
}

async function getExistingProducts(): Promise<Set<string>> {
  const query = `
    query {
      products(first: 100) {
        nodes {
          handle
        }
      }
    }
  `;

  const data = await adminQuery<{
    products: { nodes: Array<{ handle: string }> };
  }>(query);

  return new Set(data.products.nodes.map((p) => p.handle));
}

async function getExistingProductsWithIds(): Promise<Map<string, string>> {
  const query = `
    query {
      products(first: 100) {
        nodes {
          id
          handle
        }
      }
    }
  `;

  const data = await adminQuery<{
    products: { nodes: Array<{ id: string; handle: string }> };
  }>(query);

  return new Map(data.products.nodes.map((p) => [p.handle, p.id]));
}

async function deleteProduct(id: string): Promise<void> {
  const mutation = `
    mutation ProductDelete($input: ProductDeleteInput!) {
      productDelete(input: $input) {
        deletedProductId
        userErrors {
          field
          message
        }
      }
    }
  `;

  await adminQuery(mutation, { input: { id } });
  await delay(500);
}

async function getExistingCollectionsWithIds(): Promise<Map<string, string>> {
  const query = `
    query {
      collections(first: 100) {
        nodes {
          id
          handle
        }
      }
    }
  `;

  const data = await adminQuery<{
    collections: { nodes: Array<{ id: string; handle: string }> };
  }>(query);

  return new Map(data.collections.nodes.map((c) => [c.handle, c.id]));
}

async function deleteCollection(id: string): Promise<void> {
  const mutation = `
    mutation CollectionDelete($input: CollectionDeleteInput!) {
      collectionDelete(input: $input) {
        deletedCollectionId
        userErrors {
          field
          message
        }
      }
    }
  `;

  await adminQuery(mutation, { input: { id } });
  await delay(500);
}

function generateVariants(variants: ProductVariants, price: string, compareAtPrice: string | null): Array<{
  price: string;
  compareAtPrice?: string;
  options: string[];
  inventoryQuantities: Array<{ availableQuantity: number; locationId: string }>;
}> {
  const result: Array<{
    price: string;
    compareAtPrice?: string;
    options: string[];
    inventoryQuantities: Array<{ availableQuantity: number; locationId: string }>;
  }> = [];

  const sizes = variants.size || ['One Size'];
  const colors = variants.color || ['Default'];

  for (const size of sizes) {
    for (const color of colors) {
      const options = variants.size && variants.color
        ? [size, color]
        : variants.size
          ? [size]
          : variants.color
            ? [color]
            : [];

      result.push({
        price,
        ...(compareAtPrice ? { compareAtPrice } : {}),
        options,
        inventoryQuantities: [], // Will be set after location is fetched
      });
    }
  }

  return result;
}

async function getDefaultLocationId(): Promise<string> {
  const query = `
    query {
      locations(first: 1) {
        nodes {
          id
        }
      }
    }
  `;

  const data = await adminQuery<{
    locations: { nodes: Array<{ id: string }> };
  }>(query);

  if (data.locations.nodes.length === 0) {
    throw new Error('No locations found');
  }

  return data.locations.nodes[0].id;
}

async function createProduct(product: ProductDef, locationId: string): Promise<void> {
  // Upload images
  log(`    📤 Uploading ${product.images.length} images...`, 'dim');
  const uploadedImages: Array<{ src: string; altText: string }> = [];

  for (const imageUrl of product.images) {
    try {
      const src = await uploadImageFromUrl(imageUrl);
      uploadedImages.push({ src, altText: product.title });
    } catch (error) {
      log(`    ⚠ Failed to upload image: ${(error as Error).message}`, 'yellow');
    }
  }

  // Generate product options for productSet mutation
  const productOptions: Array<{ name: string; values: Array<{ name: string }> }> = [];
  if (product.variants.size && product.variants.size.length > 0) {
    productOptions.push({
      name: 'Size',
      values: product.variants.size.map(s => ({ name: s })),
    });
  }
  if (product.variants.color && product.variants.color.length > 0) {
    productOptions.push({
      name: 'Color',
      values: product.variants.color.map(c => ({ name: c })),
    });
  }

  // Generate variants for productSet mutation
  const variants: Array<{
    optionValues: Array<{ optionName: string; name: string }>;
    price: string;
    compareAtPrice?: string;
  }> = [];

  const sizes = product.variants.size || [null];
  const colors = product.variants.color || [null];

  for (const size of sizes) {
    for (const color of colors) {
      const optionValues: Array<{ optionName: string; name: string }> = [];
      if (size) optionValues.push({ optionName: 'Size', name: size });
      if (color) optionValues.push({ optionName: 'Color', name: color });

      variants.push({
        optionValues,
        price: product.price,
        ...(product.compareAtPrice ? { compareAtPrice: product.compareAtPrice } : {}),
      });
    }
  }

  const mutation = `
    mutation ProductSet($input: ProductSetInput!, $synchronous: Boolean!) {
      productSet(input: $input, synchronous: $synchronous) {
        product {
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

  const input: Record<string, unknown> = {
    handle: product.handle,
    title: product.title,
    descriptionHtml: product.description.replace(/\n/g, '<br>'),
    vendor: product.vendor,
    productType: product.productType,
    tags: product.tags,
    status: 'ACTIVE',
  };

  if (productOptions.length > 0) {
    input.productOptions = productOptions;
  }

  if (variants.length > 0) {
    input.variants = variants;
  }

  // Add media files
  if (uploadedImages.length > 0) {
    input.files = uploadedImages.map((img) => ({
      originalSource: img.src,
      alt: img.altText,
      contentType: 'IMAGE',
    }));
  }

  const data = await adminQuery<{
    productSet: {
      product: { id: string; handle: string } | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, { input, synchronous: true });

  if (data.productSet.userErrors.length > 0) {
    throw new Error(`Failed to create product: ${data.productSet.userErrors.map((e) => e.message).join(', ')}`);
  }

  const productId = data.productSet.product!.id;

  // Publish to all sales channels
  await publishToAllChannels(productId);

  // Add to collections
  for (const collectionHandle of product.collections) {
    const collectionId = collectionIdCache.get(collectionHandle);
    if (collectionId) {
      await addProductToCollection(productId, collectionId);
    }
  }
}

async function addProductToCollection(productId: string, collectionId: string): Promise<void> {
  const mutation = `
    mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
      collectionAddProducts(id: $id, productIds: $productIds) {
        userErrors {
          field
          message
        }
      }
    }
  `;

  await adminQuery(mutation, {
    id: collectionId,
    productIds: [productId],
  });
}

// ============================================================================
// Publication Functions (Sales Channels)
// ============================================================================

let publicationIds: string[] = [];

async function getPublications(): Promise<string[]> {
  if (publicationIds.length > 0) {
    return publicationIds;
  }

  const query = `
    query {
      publications(first: 20) {
        nodes {
          id
          name
        }
      }
    }
  `;

  const data = await adminQuery<{
    publications: { nodes: Array<{ id: string; name: string }> };
  }>(query);

  publicationIds = data.publications.nodes.map((p) => p.id);
  log(`  Found ${publicationIds.length} sales channels`, 'dim');
  return publicationIds;
}

async function publishToAllChannels(resourceId: string): Promise<void> {
  const publications = await getPublications();

  if (publications.length === 0) {
    log(`    ⚠ No sales channels found to publish to`, 'yellow');
    return;
  }

  const mutation = `
    mutation PublishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input = publications.map((pubId) => ({
    publicationId: pubId,
  }));

  const data = await adminQuery<{
    publishablePublish: {
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, {
    id: resourceId,
    input,
  });

  if (data.publishablePublish.userErrors.length > 0) {
    log(
      `    ⚠ Publishing errors: ${data.publishablePublish.userErrors.map((e) => e.message).join(', ')}`,
      'yellow'
    );
  } else {
    log(`    ✓ Published to ${publications.length} sales channel(s)`, 'dim');
  }
}

async function seedProducts(products: ProductDef[], force = false): Promise<void> {
  log('\n🛍️  Creating Products...', 'cyan');

  if (force) {
    log('  🔄 Force mode: Deleting existing products first...', 'yellow');
    const existingWithIds = await getExistingProductsWithIds();
    for (const product of products) {
      const existingId = existingWithIds.get(product.handle);
      if (existingId) {
        await deleteProduct(existingId);
        log(`  🗑 Deleted: ${product.handle}`, 'dim');
      }
    }
  }

  const existing = force ? new Set<string>() : await getExistingProducts();
  const locationId = await getDefaultLocationId();

  for (const product of products) {
    if (existing.has(product.handle)) {
      log(`  ⏭ ${product.title} (already exists)`, 'yellow');
      continue;
    }

    try {
      log(`  → ${product.title}...`, 'dim');
      await createProduct(product, locationId);
      log(`  ✓ ${product.title}`, 'green');
      await delay(1000); // Rate limiting - products are expensive
    } catch (error) {
      log(`  ✗ ${product.title}: ${(error as Error).message}`, 'red');
    }
  }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  log('\n🛒 ada ÉLAN Demo Products Seed Script\n', 'cyan');

  // Validate configuration
  if (!config.shopDomain || !config.adminApiToken) {
    log('❌ Error: Missing environment variables', 'red');
    log('\nRequired variables:', 'yellow');
    log('  PUBLIC_STORE_DOMAIN=your-store.myshopify.com');
    log('  ADMIN_API_ACCESS_TOKEN=your-admin-api-token');
    process.exit(1);
  }

  log(`Store: ${config.shopDomain}`, 'dim');

  const args = process.argv.slice(2);
  const force = args.includes('--force');

  try {
    // Load product data
    const dataPath = path.join(__dirname, '..', 'data', 'entries', 'demo-products.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Create collections first
    await seedCollections(data.collections, force);

    // Create products
    await seedProducts(data.products, force);

    log('\n🎉 Products seed complete!\n', 'green');
    log('Summary:', 'cyan');
    log(`  Collections: ${data.collections.length}`, 'dim');
    log(`  Products: ${data.products.length}`, 'dim');
  } catch (error) {
    log(`\n❌ Error: ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}

main();

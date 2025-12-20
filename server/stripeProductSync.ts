import Stripe from "stripe";
import { PRODUCT_DEFINITIONS, ProductDefinition } from "./productDefinitions";
import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Stripe Product Sync System
 * 
 * This module handles creating and updating Stripe products programmatically.
 * It reads from productDefinitions.ts and syncs to Stripe, then updates the
 * products.ts file with the generated IDs.
 */

export interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ productId: string; error: string }>;
  products: Array<{
    id: string;
    name: string;
    stripeProductId: string;
    stripePriceId: string;
  }>;
}

/**
 * Initialize Stripe client with management API key
 */
export function getStripeClient(): Stripe {
  const apiKey = process.env.STRIPE_MANAGEMENT_API_KEY || process.env.STRIPE_SECRET_KEY;
  
  if (!apiKey) {
    throw new Error("STRIPE_MANAGEMENT_API_KEY or STRIPE_SECRET_KEY not found in environment");
  }
  
  return new Stripe(apiKey, {
    apiVersion: "2025-12-15.clover",
  });
}

/**
 * Check if a product already exists in Stripe by metadata
 */
async function findExistingProduct(
  stripe: Stripe,
  productId: string
): Promise<Stripe.Product | null> {
  try {
    // Search for product by metadata.internal_id
    const products = await stripe.products.search({
      query: `metadata['internal_id']:'${productId}'`,
      limit: 1,
    });
    
    return products.data.length > 0 ? products.data[0] : null;
  } catch (error) {
    console.error(`Error searching for product ${productId}:`, error);
    return null;
  }
}

/**
 * Create or update a single product in Stripe
 */
async function syncProduct(
  stripe: Stripe,
  definition: ProductDefinition
): Promise<{
  action: "created" | "updated" | "skipped";
  stripeProductId: string;
  stripePriceId: string;
  error?: string;
}> {
  try {
    // Check if product already exists
    const existing = await findExistingProduct(stripe, definition.id);
    
    if (existing) {
      // Update existing product
      await stripe.products.update(existing.id, {
        name: definition.name,
        description: definition.description,
        active: definition.active !== false,
        metadata: {
          ...definition.metadata,
          internal_id: definition.id,
          type: definition.type,
        },
      });
      
      // Get the existing price (we don't update prices, create new ones if needed)
      const prices = await stripe.prices.list({
        product: existing.id,
        active: true,
        limit: 1,
      });
      
      const priceId = prices.data[0]?.id || "";
      
      console.log(`✓ Updated product: ${definition.name} (${existing.id})`);
      
      return {
        action: "updated",
        stripeProductId: existing.id,
        stripePriceId: priceId,
      };
    }
    
    // Create new product
    const product = await stripe.products.create({
      name: definition.name,
      description: definition.description,
      active: definition.active !== false,
      metadata: {
        ...definition.metadata,
        internal_id: definition.id,
        type: definition.type,
      },
    });
    
    // Create price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: definition.price,
      currency: definition.currency,
      metadata: {
        internal_id: definition.id,
      },
    });
    
    console.log(`✓ Created product: ${definition.name} (${product.id})`);
    console.log(`  Price: ${price.id} (${definition.currency.toUpperCase()} ${definition.price / 100})`);
    
    return {
      action: "created",
      stripeProductId: product.id,
      stripePriceId: price.id,
    };
  } catch (error: any) {
    console.error(`✗ Error syncing product ${definition.id}:`, error.message);
    return {
      action: "skipped",
      stripeProductId: "",
      stripePriceId: "",
      error: error.message,
    };
  }
}

/**
 * Sync all products from definitions to Stripe
 */
export async function syncAllProducts(): Promise<SyncResult> {
  console.log("🔄 Starting Stripe product sync...\n");
  
  const stripe = getStripeClient();
  const result: SyncResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    products: [],
  };
  
  // Get only active products
  const activeDefinitions = PRODUCT_DEFINITIONS.filter((p) => p.active !== false);
  
  console.log(`Found ${activeDefinitions.length} active products to sync\n`);
  
  // Sync each product
  for (const definition of activeDefinitions) {
    const syncResult = await syncProduct(stripe, definition);
    
    if (syncResult.error) {
      result.errors.push({
        productId: definition.id,
        error: syncResult.error,
      });
      result.skipped++;
    } else {
      if (syncResult.action === "created") result.created++;
      if (syncResult.action === "updated") result.updated++;
      
      result.products.push({
        id: definition.id,
        name: definition.name,
        stripeProductId: syncResult.stripeProductId,
        stripePriceId: syncResult.stripePriceId,
      });
    }
  }
  
  console.log("\n✅ Sync complete!");
  console.log(`   Created: ${result.created}`);
  console.log(`   Updated: ${result.updated}`);
  console.log(`   Skipped: ${result.skipped}`);
  console.log(`   Errors: ${result.errors.length}`);
  
  if (result.errors.length > 0) {
    console.log("\n❌ Errors:");
    result.errors.forEach((e) => {
      console.log(`   ${e.productId}: ${e.error}`);
    });
  }
  
  return result;
}

/**
 * Update products.ts file with Stripe IDs
 */
export async function updateProductsFile(syncResult: SyncResult): Promise<void> {
  console.log("\n📝 Updating products.ts with Stripe IDs...");
  
  // Get the directory of this file
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const productsFilePath = join(currentDir, "products.ts");
  let fileContent = readFileSync(productsFilePath, "utf-8");
  
  // Update WORD_COUNT_PRODUCTS
  const wordCountProducts = syncResult.products.filter((p) => p.id.startsWith("words_"));
  for (const product of wordCountProducts) {
    const key = product.id; // words_300, words_600, words_900
    
    // Update stripeProductId
    fileContent = fileContent.replace(
      new RegExp(`(${key}:[^}]*stripeProductId:\\s*")[^"]*(")`),
      `$1${product.stripeProductId}$2`
    );
    
    // Update stripePriceId
    fileContent = fileContent.replace(
      new RegExp(`(${key}:[^}]*stripePriceId:\\s*")[^"]*(")`),
      `$1${product.stripePriceId}$2`
    );
    
    console.log(`✓ Updated ${key}`);
  }
  
  // Update IMAGE_PACK_PRODUCTS
  const imageProducts = syncResult.products.filter((p) => p.id.startsWith("image_"));
  for (const product of imageProducts) {
    // Map internal IDs to product keys
    const keyMap: Record<string, string> = {
      image_single: "single",
      image_pack_5: "pack_5",
      image_pack_10: "pack_10",
    };
    
    const key = keyMap[product.id];
    if (!key) continue;
    
    // Update stripeProductId
    fileContent = fileContent.replace(
      new RegExp(`(${key}:[^}]*stripeProductId:\\s*")[^"]*(")`),
      `$1${product.stripeProductId}$2`
    );
    
    // Update stripePriceId
    fileContent = fileContent.replace(
      new RegExp(`(${key}:[^}]*stripePriceId:\\s*")[^"]*(")`),
      `$1${product.stripePriceId}$2`
    );
    
    console.log(`✓ Updated ${key}`);
  }
  
  // Write updated content back to file
  writeFileSync(productsFilePath, fileContent, "utf-8");
  
  console.log("\n✅ products.ts updated successfully!");
}

/**
 * Full sync: Create/update products and update code
 */
export async function fullSync(): Promise<SyncResult> {
  const result = await syncAllProducts();
  
  if (result.products.length > 0) {
    await updateProductsFile(result);
  }
  
  return result;
}

/**
 * List all products currently in Stripe
 */
export async function listStripeProducts(): Promise<Stripe.Product[]> {
  const stripe = getStripeClient();
  const products = await stripe.products.list({ limit: 100 });
  return products.data;
}

/**
 * Delete a product from Stripe (archive it)
 */
export async function deleteStripeProduct(productId: string): Promise<void> {
  const stripe = getStripeClient();
  await stripe.products.update(productId, { active: false });
  console.log(`✓ Archived product: ${productId}`);
}

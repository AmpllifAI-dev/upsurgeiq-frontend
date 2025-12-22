#!/usr/bin/env node

/**
 * Stripe Product Sync CLI Script
 * 
 * This script syncs product definitions to Stripe and updates the code with IDs.
 * 
 * Usage:
 *   pnpm stripe:sync              # Full sync (create/update + update code)
 *   pnpm stripe:sync --dry-run    # Preview what would be synced
 *   pnpm stripe:sync --list       # List current Stripe products
 */

import { fullSync, syncAllProducts, listStripeProducts } from "../server/stripeProductSync.ts";
import { PRODUCT_DEFINITIONS } from "../server/productDefinitions.ts";

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isList = args.includes("--list");
const isHelp = args.includes("--help") || args.includes("-h");

// Show help
if (isHelp) {
  console.log(`
Stripe Product Sync CLI

Usage:
  pnpm stripe:sync              Full sync (create/update products + update code)
  pnpm stripe:sync --dry-run    Preview what would be synced without making changes
  pnpm stripe:sync --list       List all products currently in Stripe
  pnpm stripe:sync --help       Show this help message

Examples:
  pnpm stripe:sync              # Sync all products to Stripe
  pnpm stripe:sync --dry-run    # See what would change
  pnpm stripe:sync --list       # View current Stripe products

Environment Variables:
  STRIPE_MANAGEMENT_API_KEY     Stripe secret key (sk_test_... or sk_live_...)
  STRIPE_SECRET_KEY             Fallback if STRIPE_MANAGEMENT_API_KEY not set
`);
  process.exit(0);
}

// List products
if (isList) {
  console.log("📋 Listing Stripe products...\n");
  
  try {
    const products = await listStripeProducts();
    
    if (products.length === 0) {
      console.log("No products found in Stripe.");
      process.exit(0);
    }
    
    console.log(`Found ${products.length} products:\n`);
    
    products.forEach((product) => {
      console.log(`📦 ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Active: ${product.active ? "✓" : "✗"}`);
      console.log(`   Description: ${product.description || "N/A"}`);
      
      if (product.metadata?.internal_id) {
        console.log(`   Internal ID: ${product.metadata.internal_id}`);
      }
      
      console.log("");
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error listing products:", error.message);
    process.exit(1);
  }
}

// Dry run
if (isDryRun) {
  console.log("🔍 DRY RUN MODE - No changes will be made\n");
  console.log("Products that would be synced:\n");
  
  const activeProducts = PRODUCT_DEFINITIONS.filter((p) => p.active !== false);
  
  activeProducts.forEach((product) => {
    const hasIds = product.stripeProductId && product.stripePriceId;
    const action = hasIds ? "UPDATE" : "CREATE";
    const symbol = hasIds ? "🔄" : "✨";
    
    console.log(`${symbol} [${action}] ${product.name}`);
    console.log(`   Price: ${product.currency.toUpperCase()} ${product.price / 100}`);
    console.log(`   Type: ${product.type}`);
    
    if (hasIds) {
      console.log(`   Product ID: ${product.stripeProductId}`);
      console.log(`   Price ID: ${product.stripePriceId}`);
    }
    
    console.log("");
  });
  
  console.log(`Total: ${activeProducts.length} products`);
  console.log("\nRun without --dry-run to apply changes.");
  process.exit(0);
}

// Full sync
console.log("🚀 Starting full Stripe product sync...\n");

try {
  const result = await fullSync();
  
  console.log("\n" + "=".repeat(50));
  console.log("SYNC SUMMARY");
  console.log("=".repeat(50));
  console.log(`✨ Created:  ${result.created}`);
  console.log(`🔄 Updated:  ${result.updated}`);
  console.log(`⏭️  Skipped:  ${result.skipped}`);
  console.log(`❌ Errors:   ${result.errors.length}`);
  console.log("=".repeat(50));
  
  if (result.errors.length > 0) {
    console.log("\n❌ Errors encountered:");
    result.errors.forEach((error) => {
      console.log(`   ${error.productId}: ${error.error}`);
    });
    process.exit(1);
  }
  
  if (result.products.length > 0) {
    console.log("\n✅ Products synced successfully!");
    console.log("   products.ts has been updated with Stripe IDs");
    console.log("\n📋 Synced products:");
    
    result.products.forEach((product) => {
      console.log(`   • ${product.name}`);
      console.log(`     Product: ${product.stripeProductId}`);
      console.log(`     Price: ${product.stripePriceId}`);
    });
  }
  
  console.log("\n🎉 Sync complete! Your products are ready to use.");
  process.exit(0);
} catch (error) {
  console.error("\n❌ Fatal error during sync:", error.message);
  console.error(error.stack);
  process.exit(1);
}

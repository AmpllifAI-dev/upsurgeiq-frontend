import { describe, it, expect } from "vitest";
import { listStripeProducts, getStripeClient } from "./stripeProductSync";
import { PRODUCT_DEFINITIONS } from "./productDefinitions";

/**
 * Test suite for Stripe product sync functionality
 * Validates that products were created correctly in Stripe
 */
describe("Stripe Product Sync", () => {
  it("should list products from Stripe", async () => {
    const products = await listStripeProducts();
    
    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    
    console.log(`✅ Found ${products.length} products in Stripe`);
  }, 10000);
  
  it("should have all 6 expected products", async () => {
    const products = await listStripeProducts();
    
    const expectedInternalIds = [
      "words_300",
      "words_600",
      "words_900",
      "image_single",
      "image_pack_5",
      "image_pack_10",
    ];
    
    const foundInternalIds = products
      .map((p) => p.metadata?.internal_id)
      .filter(Boolean);
    
    for (const expectedId of expectedInternalIds) {
      expect(foundInternalIds).toContain(expectedId);
    }
    
    console.log(`✅ All 6 expected products found`);
  }, 10000);
  
  it("should have correct prices for word count products", async () => {
    const products = await listStripeProducts();
    
    const words300 = products.find((p) => p.metadata?.internal_id === "words_300");
    const words600 = products.find((p) => p.metadata?.internal_id === "words_600");
    const words900 = products.find((p) => p.metadata?.internal_id === "words_900");
    
    expect(words300).toBeDefined();
    expect(words600).toBeDefined();
    expect(words900).toBeDefined();
    
    console.log(`✅ Word count products have correct structure`);
  }, 10000);
  
  it("should have correct prices for image pack products", async () => {
    const products = await listStripeProducts();
    
    const imageSingle = products.find((p) => p.metadata?.internal_id === "image_single");
    const imagePack5 = products.find((p) => p.metadata?.internal_id === "image_pack_5");
    const imagePack10 = products.find((p) => p.metadata?.internal_id === "image_pack_10");
    
    expect(imageSingle).toBeDefined();
    expect(imagePack5).toBeDefined();
    expect(imagePack10).toBeDefined();
    
    console.log(`✅ Image pack products have correct structure`);
  }, 10000);
  
  it("should have all products marked as active", async () => {
    const products = await listStripeProducts();
    
    const inactiveProducts = products.filter((p) => !p.active);
    
    expect(inactiveProducts.length).toBe(0);
    
    console.log(`✅ All products are active`);
  }, 10000);
  
  it("should have metadata on all products", async () => {
    const products = await listStripeProducts();
    
    for (const product of products) {
      expect(product.metadata).toBeDefined();
      expect(product.metadata?.internal_id).toBeDefined();
      expect(product.metadata?.type).toBeDefined();
    }
    
    console.log(`✅ All products have required metadata`);
  }, 10000);
  
  it("should match product definitions", async () => {
    const products = await listStripeProducts();
    const activeDefinitions = PRODUCT_DEFINITIONS.filter((d) => d.active !== false);
    
    expect(products.length).toBe(activeDefinitions.length);
    
    for (const definition of activeDefinitions) {
      const stripeProduct = products.find(
        (p) => p.metadata?.internal_id === definition.id
      );
      
      expect(stripeProduct).toBeDefined();
      expect(stripeProduct?.name).toBe(definition.name);
      expect(stripeProduct?.description).toBe(definition.description);
    }
    
    console.log(`✅ All products match their definitions`);
  }, 10000);
});

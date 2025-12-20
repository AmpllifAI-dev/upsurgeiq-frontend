import { describe, it, expect } from "vitest";
import Stripe from "stripe";

/**
 * Test suite to validate Stripe API key
 * This ensures the STRIPE_MANAGEMENT_API_KEY is valid and can connect to Stripe
 */
describe("Stripe API Key Validation", () => {
  it("should successfully authenticate with Stripe API", async () => {
    const apiKey = process.env.STRIPE_MANAGEMENT_API_KEY;
    
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^sk_(test|live)_/);
    
    const stripe = new Stripe(apiKey!, {
      apiVersion: "2024-12-18.acacia",
    });
    
    // Make a lightweight API call to verify the key works
    const account = await stripe.accounts.retrieve();
    
    expect(account).toBeDefined();
    expect(account.id).toBeDefined();
    expect(account.object).toBe("account");
    
    console.log(`✅ Stripe API key validated successfully`);
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Mode: ${apiKey!.startsWith("sk_test_") ? "TEST" : "LIVE"}`);
  }, 10000); // 10 second timeout for API call
  
  it("should be able to list products", async () => {
    const apiKey = process.env.STRIPE_MANAGEMENT_API_KEY;
    const stripe = new Stripe(apiKey!, {
      apiVersion: "2024-12-18.acacia",
    });
    
    // List existing products (should not throw error)
    const products = await stripe.products.list({ limit: 5 });
    
    expect(products).toBeDefined();
    expect(products.object).toBe("list");
    expect(Array.isArray(products.data)).toBe(true);
    
    console.log(`✅ Can access Stripe products API`);
    console.log(`   Existing products: ${products.data.length}`);
  }, 10000);
});

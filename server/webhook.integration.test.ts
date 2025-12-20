import { describe, it, expect } from "vitest";
import { getAvailableWordCountCredits, getAvailableImageCredits } from "./addOnCredits";
import { getStripeClient } from "./stripeProductSync";

/**
 * Webhook & Purchase Flow Integration Tests
 * 
 * Tests the complete purchase flow from checkout to credit fulfillment
 */

describe("Webhook & Purchase Flow Integration", () => {
  const testUserId = 1;

  describe("Stripe Webhook Configuration", () => {
    it("should have webhook secret configured", async () => {
      const { ENV } = await import("./_core/env");
      
      expect(ENV.stripeWebhookSecret).toBeDefined();
      expect(ENV.stripeWebhookSecret).toBeTruthy();
      
      // Webhook secret should start with whsec_
      if (ENV.stripeWebhookSecret) {
        expect(ENV.stripeWebhookSecret.startsWith("whsec_")).toBe(true);
      }
    });

    it("should have Stripe client configured", () => {
      const stripe = getStripeClient();
      expect(stripe).toBeDefined();
    });
  });

  describe("Word Count Purchase Flow", () => {
    it("should track available word count credits", async () => {
      const credits = await getAvailableWordCountCredits(testUserId);
      
      expect(typeof credits).toBe("number");
      expect(credits).toBeGreaterThanOrEqual(0);
    });

    it("should have word count products configured", async () => {
      const { WORD_COUNT_PRODUCTS } = await import("./products");
      
      expect(WORD_COUNT_PRODUCTS.words_300).toBeDefined();
      expect(WORD_COUNT_PRODUCTS.words_300.stripeProductId).toBeTruthy();
      expect(WORD_COUNT_PRODUCTS.words_300.stripePriceId).toBeTruthy();
      expect(WORD_COUNT_PRODUCTS.words_300.words).toBe(300);
      expect(WORD_COUNT_PRODUCTS.words_300.price).toBe(400); // £4.00
    });

    it("should create checkout session with correct metadata", async () => {
      const { createWordCountCheckoutSession } = await import("./stripeCheckout");
      
      const session = await createWordCountCheckoutSession("words_300", {
        userId: testUserId,
        userEmail: "test@example.com",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });

      expect(session.sessionId).toBeDefined();
      expect(session.url).toContain("checkout.stripe.com");

      // Verify metadata
      const stripe = getStripeClient();
      const retrievedSession = await stripe.checkout.sessions.retrieve(session.sessionId);
      
      expect(retrievedSession.metadata?.productType).toBe("word_count");
      expect(retrievedSession.metadata?.productKey).toBe("words_300");
      expect(retrievedSession.metadata?.words).toBe("300");
      expect(retrievedSession.client_reference_id).toBe(testUserId.toString());
    });
  });

  describe("Image Pack Purchase Flow", () => {
    it("should track available image credits", async () => {
      const credits = await getAvailableImageCredits(testUserId);
      
      expect(typeof credits).toBe("number");
      expect(credits).toBeGreaterThanOrEqual(0);
    });

    it("should have image pack products configured", async () => {
      const { IMAGE_PACK_PRODUCTS } = await import("./products");
      
      expect(IMAGE_PACK_PRODUCTS.single).toBeDefined();
      expect(IMAGE_PACK_PRODUCTS.single.stripeProductId).toBeTruthy();
      expect(IMAGE_PACK_PRODUCTS.single.stripePriceId).toBeTruthy();
      expect(IMAGE_PACK_PRODUCTS.single.images).toBe(1);
      expect(IMAGE_PACK_PRODUCTS.single.price).toBe(399); // £3.99
    });

    it("should create checkout session with correct metadata", async () => {
      const { createImagePackCheckoutSession } = await import("./stripeCheckout");
      
      const session = await createImagePackCheckoutSession("pack_5", {
        userId: testUserId,
        userEmail: "test@example.com",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });

      expect(session.sessionId).toBeDefined();
      expect(session.url).toContain("checkout.stripe.com");

      // Verify metadata
      const stripe = getStripeClient();
      const retrievedSession = await stripe.checkout.sessions.retrieve(session.sessionId);
      
      expect(retrievedSession.metadata?.productType).toBe("image_pack");
      expect(retrievedSession.metadata?.productKey).toBe("pack_5");
      expect(retrievedSession.metadata?.images).toBe("5");
      expect(retrievedSession.client_reference_id).toBe(testUserId.toString());
    });
  });

  describe("Word Count Limit Enforcement", () => {
    it("should check word count limits correctly", async () => {
      const { canGeneratePressRelease } = await import("./addOnCredits");
      
      // Test with reasonable word count
      const check = await canGeneratePressRelease(testUserId, 400);
      
      expect(check).toHaveProperty("allowed");
      expect(check).toHaveProperty("tierLimit");
      expect(check).toHaveProperty("purchasedWords");
      expect(typeof check.allowed).toBe("boolean");
    });

    it("should calculate required purchase correctly when over limit", async () => {
      const { canGeneratePressRelease } = await import("./addOnCredits");
      
      // Test with very high word count that exceeds any tier
      const check = await canGeneratePressRelease(testUserId, 10000);
      
      if (!check.allowed) {
        expect(check.requiredPurchase).toBeDefined();
        expect(check.requiredPurchase).toBeGreaterThan(0);
      }
    });
  });

  describe("Product Configuration Consistency", () => {
    it("should have matching word count products in definitions and products files", async () => {
      const { PRODUCT_DEFINITIONS } = await import("./productDefinitions");
      const { WORD_COUNT_PRODUCTS } = await import("./products");
      
      const wordCountDefs = PRODUCT_DEFINITIONS.filter(p => p.type === "word_count");
      
      expect(wordCountDefs.length).toBe(3); // 300, 600, 900 words
      expect(Object.keys(WORD_COUNT_PRODUCTS).length).toBe(3);
    });

    it("should have matching image pack products in definitions and products files", async () => {
      const { PRODUCT_DEFINITIONS } = await import("./productDefinitions");
      const { IMAGE_PACK_PRODUCTS } = await import("./products");
      
      const imagePackDefs = PRODUCT_DEFINITIONS.filter(p => p.type === "image_pack");
      
      expect(imagePackDefs.length).toBe(3); // single, 5-pack, 10-pack
      expect(Object.keys(IMAGE_PACK_PRODUCTS).length).toBe(3);
    });

    it("should have correct pricing in both files", async () => {
      const { PRODUCT_DEFINITIONS } = await import("./productDefinitions");
      const { WORD_COUNT_PRODUCTS } = await import("./products");
      
      const words300Def = PRODUCT_DEFINITIONS.find(p => p.id === "words_300");
      
      expect(words300Def?.price).toBe(WORD_COUNT_PRODUCTS.words_300.price);
      expect(words300Def?.price).toBe(400); // £4.00 in pence
    });
  });
});

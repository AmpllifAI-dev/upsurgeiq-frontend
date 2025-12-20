import { describe, it, expect, beforeAll } from "vitest";
import { createWordCountCheckoutSession, createImagePackCheckoutSession } from "./stripeCheckout";
import { addWordCountCredits, addImageCredits, getAvailableWordCountCredits, getAvailableImageCredits } from "./addOnCredits";
import { getStripeClient } from "./stripeProductSync";

/**
 * Purchase Flow Tests
 * 
 * Tests Stripe checkout session creation and credit management
 */

describe("Purchase Flow Tests", () => {
  const testUserId = 1;
  const testUserEmail = "test@example.com";
  const testSuccessUrl = "https://example.com/success";
  const testCancelUrl = "https://example.com/cancel";

  beforeAll(() => {
    // Verify Stripe client is configured
    const stripe = getStripeClient();
    expect(stripe).toBeDefined();
  });

  describe("Stripe Checkout Session Creation", () => {
    it("should create word count checkout session", async () => {
      const session = await createWordCountCheckoutSession("words_300", {
        userId: testUserId,
        userEmail: testUserEmail,
        successUrl: testSuccessUrl,
        cancelUrl: testCancelUrl,
      });

      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();
      expect(session.url).toBeDefined();
      expect(session.url).toContain("checkout.stripe.com");
    });

    it("should create image pack checkout session", async () => {
      const session = await createImagePackCheckoutSession("single", {
        userId: testUserId,
        userEmail: testUserEmail,
        successUrl: testSuccessUrl,
        cancelUrl: testCancelUrl,
      });

      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();
      expect(session.url).toBeDefined();
      expect(session.url).toContain("checkout.stripe.com");
    });

    it("should include correct metadata in word count session", async () => {
      const session = await createWordCountCheckoutSession("words_600", {
        userId: testUserId,
        userEmail: testUserEmail,
        successUrl: testSuccessUrl,
        cancelUrl: testCancelUrl,
      });

      // Retrieve session to check metadata
      const stripe = getStripeClient();
      const retrievedSession = await stripe.checkout.sessions.retrieve(session.sessionId);

      expect(retrievedSession.metadata?.userId).toBe(testUserId.toString());
      expect(retrievedSession.metadata?.productType).toBe("word_count");
      expect(retrievedSession.metadata?.productKey).toBe("words_600");
      expect(retrievedSession.metadata?.words).toBe("600");
    });

    it("should include correct metadata in image pack session", async () => {
      const session = await createImagePackCheckoutSession("pack_5", {
        userId: testUserId,
        userEmail: testUserEmail,
        successUrl: testSuccessUrl,
        cancelUrl: testCancelUrl,
      });

      // Retrieve session to check metadata
      const stripe = getStripeClient();
      const retrievedSession = await stripe.checkout.sessions.retrieve(session.sessionId);

      expect(retrievedSession.metadata?.userId).toBe(testUserId.toString());
      expect(retrievedSession.metadata?.productType).toBe("image_pack");
      expect(retrievedSession.metadata?.productKey).toBe("pack_5");
      expect(retrievedSession.metadata?.images).toBe("5");
    });
  });

  describe("Credit Management", () => {
    it("should add word count credits to user account", async () => {
      const initialCredits = await getAvailableWordCountCredits(testUserId);

      await addWordCountCredits({
        userId: testUserId,
        words: 300,
        stripeSessionId: "test_session_123",
        stripePaymentIntentId: "test_pi_123",
        productKey: "words_300",
      });

      const newCredits = await getAvailableWordCountCredits(testUserId);
      expect(newCredits).toBeGreaterThanOrEqual(initialCredits + 300);
    });

    it("should add image credits to user account", async () => {
      const initialCredits = await getAvailableImageCredits(testUserId);

      await addImageCredits({
        userId: testUserId,
        images: 5,
        stripeSessionId: "test_session_456",
        stripePaymentIntentId: "test_pi_456",
        productKey: "pack_5",
      });

      const newCredits = await getAvailableImageCredits(testUserId);
      expect(newCredits).toBeGreaterThanOrEqual(initialCredits + 5);
    });

    it("should retrieve available word count credits", async () => {
      const credits = await getAvailableWordCountCredits(testUserId);
      expect(credits).toBeGreaterThanOrEqual(0);
      expect(typeof credits).toBe("number");
    });

    it("should retrieve available image credits", async () => {
      const credits = await getAvailableImageCredits(testUserId);
      expect(credits).toBeGreaterThanOrEqual(0);
      expect(typeof credits).toBe("number");
    });
  });

  describe("Product Configuration", () => {
    it("should have valid Stripe product IDs for word count products", async () => {
      const { WORD_COUNT_PRODUCTS } = await import("./products");

      expect(WORD_COUNT_PRODUCTS.words_300.stripeProductId).toBeDefined();
      expect(WORD_COUNT_PRODUCTS.words_300.stripePriceId).toBeDefined();
      expect(WORD_COUNT_PRODUCTS.words_600.stripeProductId).toBeDefined();
      expect(WORD_COUNT_PRODUCTS.words_600.stripePriceId).toBeDefined();
      expect(WORD_COUNT_PRODUCTS.words_900.stripeProductId).toBeDefined();
      expect(WORD_COUNT_PRODUCTS.words_900.stripePriceId).toBeDefined();
    });

    it("should have valid Stripe product IDs for image pack products", async () => {
      const { IMAGE_PACK_PRODUCTS } = await import("./products");

      expect(IMAGE_PACK_PRODUCTS.single.stripeProductId).toBeDefined();
      expect(IMAGE_PACK_PRODUCTS.single.stripePriceId).toBeDefined();
      expect(IMAGE_PACK_PRODUCTS.pack_5.stripeProductId).toBeDefined();
      expect(IMAGE_PACK_PRODUCTS.pack_5.stripePriceId).toBeDefined();
      expect(IMAGE_PACK_PRODUCTS.pack_10.stripeProductId).toBeDefined();
      expect(IMAGE_PACK_PRODUCTS.pack_10.stripePriceId).toBeDefined();
    });

    it("should have correct pricing for word count products", async () => {
      const { WORD_COUNT_PRODUCTS } = await import("./products");

      expect(WORD_COUNT_PRODUCTS.words_300.price).toBe(400); // £4.00 in pence
      expect(WORD_COUNT_PRODUCTS.words_600.price).toBe(800); // £8.00 in pence
      expect(WORD_COUNT_PRODUCTS.words_900.price).toBe(1200); // £12.00 in pence
    });

    it("should have correct pricing for image pack products", async () => {
      const { IMAGE_PACK_PRODUCTS } = await import("./products");

      expect(IMAGE_PACK_PRODUCTS.single.price).toBe(399); // £3.99 in pence
      expect(IMAGE_PACK_PRODUCTS.pack_5.price).toBe(1499); // £14.99 in pence
      expect(IMAGE_PACK_PRODUCTS.pack_10.price).toBe(2499); // £24.99 in pence
    });
  });
});

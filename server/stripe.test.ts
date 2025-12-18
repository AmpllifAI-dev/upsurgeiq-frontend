import { describe, expect, it } from "vitest";
import { PRODUCTS, ADDITIONAL_PRODUCTS, getProductByTier } from "./products";

describe("Stripe Product Configuration", () => {
  describe("Pricing Tiers", () => {
    it("should have all three pricing tiers configured", () => {
      expect(PRODUCTS.starter).toBeDefined();
      expect(PRODUCTS.pro).toBeDefined();
      expect(PRODUCTS.scale).toBeDefined();
    });

    it("should have correct pricing for each tier", () => {
      expect(PRODUCTS.starter.price).toBe(49);
      expect(PRODUCTS.pro.price).toBe(99);
      expect(PRODUCTS.scale.price).toBe(349);
    });

    it("should have GBP currency for all tiers", () => {
      expect(PRODUCTS.starter.currency).toBe("gbp");
      expect(PRODUCTS.pro.currency).toBe("gbp");
      expect(PRODUCTS.scale.currency).toBe("gbp");
    });

    it("should have monthly interval for all tiers", () => {
      expect(PRODUCTS.starter.interval).toBe("month");
      expect(PRODUCTS.pro.interval).toBe("month");
      expect(PRODUCTS.scale.interval).toBe("month");
    });
  });

  describe("Stripe Product IDs", () => {
    it("should have Stripe Product ID for Starter tier", () => {
      expect(PRODUCTS.starter.stripeProductId).toBe("prod_Td2pC4hUddBbAH");
    });

    it("should have Stripe Product ID for Pro tier", () => {
      expect(PRODUCTS.pro.stripeProductId).toBe("prod_Td2sl51moqbe4C");
    });

    it("should have Stripe Product ID for Scale tier", () => {
      expect(PRODUCTS.scale.stripeProductId).toBe("prod_Td2tuhKJPQ41d8");
    });
  });

  describe("Stripe Price IDs", () => {
    it("should have Stripe Price ID for Starter tier", () => {
      expect(PRODUCTS.starter.stripePriceId).toBe("price_1SfmjyAGfyqPBnQ9JPZoNoWl");
    });

    it("should have Stripe Price ID for Pro tier", () => {
      expect(PRODUCTS.pro.stripePriceId).toBe("price_1SfmmWAGfyqPBnQ9LeAJ711i");
    });

    it("should have Stripe Price ID for Scale tier", () => {
      expect(PRODUCTS.scale.stripePriceId).toBe("price_1SfmnuAGfyqPBnQ9U5P7KfF4");
    });

    it("should not have undefined or empty Price IDs", () => {
      expect(PRODUCTS.starter.stripePriceId).toBeTruthy();
      expect(PRODUCTS.pro.stripePriceId).toBeTruthy();
      expect(PRODUCTS.scale.stripePriceId).toBeTruthy();
    });
  });

  describe("Additional Products", () => {
    it("should have Additional Media List product configured", () => {
      expect(ADDITIONAL_PRODUCTS.additionalMediaList).toBeDefined();
      expect(ADDITIONAL_PRODUCTS.additionalMediaList.stripeProductId).toBe("prod_Td2wLpX1A6exs9");
      expect(ADDITIONAL_PRODUCTS.additionalMediaList.stripePriceId).toBe("price_1Sfmq8AGfyqPBnQ9JJ8tsFHt");
    });

    it("should have Intelligent Campaign Lab product configured", () => {
      expect(ADDITIONAL_PRODUCTS.intelligentCampaignLab).toBeDefined();
      expect(ADDITIONAL_PRODUCTS.intelligentCampaignLab.stripeProductId).toBe("prod_Td2yyQ1pFJWNoo");
      expect(ADDITIONAL_PRODUCTS.intelligentCampaignLab.stripePriceId).toBe("price_1SfmsDAGfyqPBnQ9DTkBb5vw");
    });
  });

  describe("Product Helper Functions", () => {
    it("should retrieve product by tier", () => {
      const starter = getProductByTier("starter");
      expect(starter.name).toBe("Starter");
      expect(starter.price).toBe(49);

      const pro = getProductByTier("pro");
      expect(pro.name).toBe("Pro");
      expect(pro.price).toBe(99);

      const scale = getProductByTier("scale");
      expect(scale.name).toBe("Scale");
      expect(scale.price).toBe(349);
    });
  });

  describe("Feature Lists", () => {
    it("should have features defined for each tier", () => {
      expect(PRODUCTS.starter.features.length).toBeGreaterThan(0);
      expect(PRODUCTS.pro.features.length).toBeGreaterThan(0);
      expect(PRODUCTS.scale.features.length).toBeGreaterThan(0);
    });

    it("should have more features in higher tiers", () => {
      expect(PRODUCTS.pro.features.length).toBeGreaterThanOrEqual(PRODUCTS.starter.features.length);
      expect(PRODUCTS.scale.features.length).toBeGreaterThanOrEqual(PRODUCTS.pro.features.length);
    });
  });
});

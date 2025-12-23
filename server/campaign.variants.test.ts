import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { campaigns, campaignVariants, businesses, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  generateCampaignVariants,
  saveVariantsToDatabase,
  calculatePerformanceScore,
  identifyWinningVariant,
  updateVariantStatuses,
  PSYCHOLOGICAL_ANGLES,
} from "./campaignVariants";

describe("Campaign Variants - AI Generation & Performance Tracking", () => {
  let testUserId: number;
  let testBusinessId: number;
  let testCampaignId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const userResult = await db
      .insert(users)
      .values({
        openId: `test-variant-${Date.now()}`,
        name: "Test User",
        email: `test-variant-${Date.now()}@example.com`,
        role: "user",
      });
    testUserId = Number(userResult.insertId);

    // Create test business
    const businessResult = await db
      .insert(businesses)
      .values({
        userId: testUserId,
        name: "Test Business",
        brandVoiceTone: "friendly",
        brandVoiceStyle: "concise",
        targetAudience: "Small business owners aged 25-45",
        dossier: "We sell eco-friendly office supplies",
      });
    testBusinessId = Number(businessResult.insertId);

    // Create test campaign
    const campaignResult = await db
      .insert(campaigns)
      .values({
        businessId: testBusinessId,
        userId: testUserId,
        name: "Summer Sale Campaign",
        goal: "Increase sales by 30%",
        budget: "5000",
        status: "planning",
        platforms: "Facebook, LinkedIn",
        targetAudience: "Small business owners",
      });
    testCampaignId = Number(campaignResult.insertId);
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Clean up test data
    if (testCampaignId) {
      await db.delete(campaignVariants).where(eq(campaignVariants.campaignId, testCampaignId));
      await db.delete(campaigns).where(eq(campaigns.id, testCampaignId));
    }
    if (testBusinessId) {
      await db.delete(businesses).where(eq(businesses.id, testBusinessId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  describe("Psychological Angles Framework", () => {
    it("should define 5+ psychological angles", () => {
      const angles = Object.keys(PSYCHOLOGICAL_ANGLES);
      expect(angles.length).toBeGreaterThanOrEqual(5);
    });

    it("should have required properties for each angle", () => {
      Object.values(PSYCHOLOGICAL_ANGLES).forEach((angle) => {
        expect(angle).toHaveProperty("name");
        expect(angle).toHaveProperty("description");
        expect(angle).toHaveProperty("examples");
        expect(Array.isArray(angle.examples)).toBe(true);
      });
    });

    it("should include key psychological angles", () => {
      const angles = Object.keys(PSYCHOLOGICAL_ANGLES);
      expect(angles).toContain("SCARCITY");
      expect(angles).toContain("SOCIAL_PROOF");
      expect(angles).toContain("AUTHORITY");
    });
  });

  describe("AI Variant Generation", () => {
    it("should generate 5 variants with different psychological angles", async () => {
      const variants = await generateCampaignVariants({
        campaignId: testCampaignId,
        campaignName: "Summer Sale Campaign",
        campaignGoal: "Increase sales by 30%",
        targetAudience: "Small business owners aged 25-45",
        budget: "5000",
        platforms: "Facebook, LinkedIn",
        businessName: "Test Business",
        brandVoice: "friendly",
        productService: "Eco-friendly office supplies",
      });

      expect(variants).toBeDefined();
      expect(variants.length).toBe(5);
    }, 30000); // 30s timeout for AI generation

    it("should generate variants with required fields", async () => {
      const variants = await generateCampaignVariants({
        campaignId: testCampaignId,
        campaignName: "Summer Sale Campaign",
        campaignGoal: "Increase sales by 30%",
        targetAudience: "Small business owners",
      });

      variants.forEach((variant) => {
        expect(variant).toHaveProperty("name");
        expect(variant).toHaveProperty("psychologicalAngle");
        expect(variant).toHaveProperty("adCopy");
        expect(variant).toHaveProperty("imagePrompt");
        expect(variant.name).toBeTruthy();
        expect(variant.psychologicalAngle).toBeTruthy();
        expect(variant.adCopy).toBeTruthy();
      });
    }, 30000);

    it("should save variants to database", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const testVariants = [
        {
          name: "Scarcity Test",
          psychologicalAngle: "Scarcity",
          adCopy: "Limited time offer! Only 24 hours left.",
          imagePrompt: "Countdown timer with urgency",
        },
        {
          name: "Social Proof Test",
          psychologicalAngle: "Social Proof",
          adCopy: "Join 10,000+ happy customers",
          imagePrompt: "Happy customers testimonial",
        },
      ];

      await saveVariantsToDatabase(testCampaignId, testVariants);

      const savedVariants = await db
        .select()
        .from(campaignVariants)
        .where(eq(campaignVariants.campaignId, testCampaignId));

      expect(savedVariants.length).toBeGreaterThanOrEqual(2);
      expect(savedVariants[0].status).toBe("testing");
      expect(savedVariants[0].impressions).toBe(0);
      expect(savedVariants[0].clicks).toBe(0);
    });
  });

  describe("Performance Score Calculation", () => {
    it("should return 0 for insufficient data", () => {
      const score = calculatePerformanceScore({
        impressions: 50, // Less than 100
        clicks: 5,
        conversions: 1,
        cost: 100,
      });

      expect(score).toBe(0);
    });

    it("should calculate score for valid data", () => {
      const score = calculatePerformanceScore({
        impressions: 1000,
        clicks: 50, // 5% CTR
        conversions: 10, // 20% conversion rate
        cost: 500, // £5.00 total
      });

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should give higher scores to better performing variants", () => {
      const goodVariant = calculatePerformanceScore({
        impressions: 1000,
        clicks: 100, // 10% CTR
        conversions: 30, // 30% conversion rate
        cost: 500,
      });

      const poorVariant = calculatePerformanceScore({
        impressions: 1000,
        clicks: 20, // 2% CTR
        conversions: 2, // 10% conversion rate
        cost: 500,
      });

      expect(goodVariant).toBeGreaterThan(poorVariant);
    });

    it("should handle null values gracefully", () => {
      const score = calculatePerformanceScore({
        impressions: null,
        clicks: null,
        conversions: null,
        cost: null,
      });

      expect(score).toBe(0);
    });
  });

  describe("Winner Identification", () => {
    it("should return null when no variants exist", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create a campaign with no variants
      const emptyCampaignResult = await db
        .insert(campaigns)
        .values({
          businessId: testBusinessId,
          userId: testUserId,
          name: "Empty Campaign",
          status: "draft",
        });
      const emptyCampaignId = Number(emptyCampaignResult.insertId);

      const winnerId = await identifyWinningVariant(emptyCampaignId);
      expect(winnerId).toBeNull();

      // Cleanup
      await db.delete(campaigns).where(eq(campaigns.id, emptyCampaignId));
    });

    it("should return null when variants have insufficient data", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Clear existing variants
      await db.delete(campaignVariants).where(eq(campaignVariants.campaignId, testCampaignId));

      // Create variants with insufficient data
      await db.insert(campaignVariants).values([
        {
          campaignId: testCampaignId,
          name: "Test Variant 1",
          psychologicalAngle: "Scarcity",
          adCopy: "Test copy",
          status: "testing",
          impressions: 50, // Less than 100
          clicks: 5,
          conversions: 0,
          cost: 0,
        },
      ]);

      const winnerId = await identifyWinningVariant(testCampaignId);
      expect(winnerId).toBeNull();
    });

    it("should identify winner with sufficient data", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Clear existing variants
      await db.delete(campaignVariants).where(eq(campaignVariants.campaignId, testCampaignId));

      // Create variants with performance data
      const variant1Result = await db
        .insert(campaignVariants)
        .values({
          campaignId: testCampaignId,
          name: "High Performer",
          psychologicalAngle: "Social Proof",
          adCopy: "Join 10,000+ customers",
          status: "testing",
          impressions: 1000,
          clicks: 100, // 10% CTR
          conversions: 30, // 30% conversion rate
          cost: 500,
          ctr: "10.00",
          conversionRate: "30.00",
        });
      const variant1Id = Number(variant1Result.insertId);

      await db.insert(campaignVariants).values({
        campaignId: testCampaignId,
        name: "Low Performer",
        psychologicalAngle: "Scarcity",
        adCopy: "Limited time offer",
        status: "testing",
        impressions: 1000,
        clicks: 20, // 2% CTR
        conversions: 2, // 10% conversion rate
        cost: 500,
        ctr: "2.00",
        conversionRate: "10.00",
      });

      const winnerId = await identifyWinningVariant(testCampaignId);
      expect(winnerId).toBe(variant1Id);
    });
  });

  describe("Automatic Status Updates", () => {
    it("should update variant statuses based on performance", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Clear existing variants
      await db.delete(campaignVariants).where(eq(campaignVariants.campaignId, testCampaignId));

      // Create variants with clear winner
      await db.insert(campaignVariants).values([
        {
          campaignId: testCampaignId,
          name: "Winner Variant",
          psychologicalAngle: "Social Proof",
          adCopy: "Join thousands",
          status: "testing",
          impressions: 1000,
          clicks: 100,
          conversions: 30,
          cost: 500,
          ctr: "10.00",
          conversionRate: "30.00",
        },
        {
          campaignId: testCampaignId,
          name: "Loser Variant",
          psychologicalAngle: "Scarcity",
          adCopy: "Limited time",
          status: "testing",
          impressions: 1000,
          clicks: 20,
          conversions: 2,
          cost: 500,
          ctr: "2.00",
          conversionRate: "10.00",
        },
      ]);

      await updateVariantStatuses(testCampaignId);

      const variants = await db
        .select()
        .from(campaignVariants)
        .where(eq(campaignVariants.campaignId, testCampaignId));

      const winner = variants.find((v) => v.name === "Winner Variant");
      const loser = variants.find((v) => v.name === "Loser Variant");

      expect(winner?.status).toBe("winning");
      expect(loser?.status).toBe("losing");
    });

    it("should keep status as testing when data is insufficient", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Clear existing variants
      await db.delete(campaignVariants).where(eq(campaignVariants.campaignId, testCampaignId));

      // Create variant with insufficient data
      await db.insert(campaignVariants).values({
        campaignId: testCampaignId,
        name: "Testing Variant",
        psychologicalAngle: "Curiosity",
        adCopy: "Discover the secret",
        status: "testing",
        impressions: 50,
        clicks: 3,
        conversions: 0,
        cost: 0,
      });

      await updateVariantStatuses(testCampaignId);

      const [variant] = await db
        .select()
        .from(campaignVariants)
        .where(eq(campaignVariants.campaignId, testCampaignId));

      expect(variant.status).toBe("testing");
    });
  });

  describe("Integration Test - Full Workflow", () => {
    it("should complete full variant testing workflow", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Clear existing variants
      await db.delete(campaignVariants).where(eq(campaignVariants.campaignId, testCampaignId));

      // Step 1: Generate variants
      const variants = await generateCampaignVariants({
        campaignId: testCampaignId,
        campaignName: "Integration Test Campaign",
        campaignGoal: "Test full workflow",
        targetAudience: "Test audience",
      });

      expect(variants.length).toBe(5);

      // Step 2: Save to database
      await saveVariantsToDatabase(testCampaignId, variants);

      const savedVariants = await db
        .select()
        .from(campaignVariants)
        .where(eq(campaignVariants.campaignId, testCampaignId));

      expect(savedVariants.length).toBe(5);
      expect(savedVariants.every((v) => v.status === "testing")).toBe(true);

      // Step 3: Simulate performance data with clear winner
      for (let i = 0; i < savedVariants.length; i++) {
        const variant = savedVariants[i];
        const impressions = 1000;
        
        // Create clear winner (first variant)
        const ctr = i === 0 ? 8 : 2 + Math.random() * 2; // Winner has 8% CTR, others 2-4%
        const conversionRate = i === 0 ? 25 : 10 + Math.random() * 5; // Winner has 25%, others 10-15%
        
        const clicks = Math.floor(impressions * (ctr / 100));
        const conversions = Math.floor(clicks * (conversionRate / 100));
        const cost = clicks * 100;

        await db
          .update(campaignVariants)
          .set({
            impressions,
            clicks,
            conversions,
            cost,
            ctr: ctr.toFixed(2),
            conversionRate: conversionRate.toFixed(2),
          })
          .where(eq(campaignVariants.id, variant.id));
      }

      // Step 4: Identify winner
      await updateVariantStatuses(testCampaignId);

      const finalVariants = await db
        .select()
        .from(campaignVariants)
        .where(eq(campaignVariants.campaignId, testCampaignId));

      const winners = finalVariants.filter((v) => v.status === "winning");
      const losers = finalVariants.filter((v) => v.status === "losing");

      // Should have exactly one winner
      expect(winners.length).toBeGreaterThanOrEqual(1);
      // Should have some losers
      expect(losers.length).toBeGreaterThan(0);
      // All variants should have data
      expect(finalVariants.every((v) => (v.impressions || 0) >= 100)).toBe(true);
    }, 40000); // 40s timeout for full workflow
  });
});

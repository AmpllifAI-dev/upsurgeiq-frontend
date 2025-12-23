import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Email Analytics Procedures", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    // Create a mock context with authenticated user
    const mockContext: Context = {
      user: {
        id: 1,
        openId: "test-open-id",
        name: "Test User",
        email: "test@example.com",
        loginMethod: "email",
        role: "admin",
        supportRole: "none",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };

    caller = appRouter.createCaller(mockContext);
  });

  describe("getOverview", () => {
    it("should return email analytics overview with default 30 days", async () => {
      const result = await caller.leadBehaviour.getOverview({});
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty("totalSent");
      expect(result).toHaveProperty("totalDelivered");
      expect(result).toHaveProperty("totalOpened");
      expect(result).toHaveProperty("totalClicked");
      expect(result).toHaveProperty("totalBounced");
      expect(result).toHaveProperty("totalUnsubscribed");
      expect(result).toHaveProperty("openRate");
      expect(result).toHaveProperty("clickRate");
      expect(result).toHaveProperty("bounceRate");
      
      expect(typeof result.totalSent).toBe("number");
      expect(typeof result.openRate).toBe("number");
    });

    it("should accept custom days parameter", async () => {
      const result = await caller.leadBehaviour.getOverview({ days: 7 });
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty("totalSent");
    });
  });

  describe("getCampaignPerformance", () => {
    it("should return campaign performance data", async () => {
      const result = await caller.leadBehaviour.getCampaignPerformance({});
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const campaign = result[0];
        expect(campaign).toHaveProperty("campaignId");
        expect(campaign).toHaveProperty("name");
        expect(campaign).toHaveProperty("sent");
        expect(campaign).toHaveProperty("delivered");
        expect(campaign).toHaveProperty("opened");
        expect(campaign).toHaveProperty("clicked");
        expect(campaign).toHaveProperty("bounced");
        expect(campaign).toHaveProperty("openRate");
        expect(campaign).toHaveProperty("clickRate");
      }
    });

    it("should accept campaignId parameter", async () => {
      const result = await caller.leadBehaviour.getCampaignPerformance({ 
        campaignId: 1,
        days: 30 
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getDeliverability", () => {
    it("should return deliverability metrics", async () => {
      const result = await caller.leadBehaviour.getDeliverability({});
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty("totalSent");
      expect(result).toHaveProperty("delivered");
      expect(result).toHaveProperty("bounced");
      expect(result).toHaveProperty("spamComplaints");
      expect(result).toHaveProperty("hardBounces");
      expect(result).toHaveProperty("softBounces");
      expect(result).toHaveProperty("bounceRate");
      expect(result).toHaveProperty("spamRate");
      expect(result).toHaveProperty("deliveryRate");
      
      expect(typeof result.totalSent).toBe("number");
      expect(typeof result.bounceRate).toBe("number");
      expect(typeof result.deliveryRate).toBe("number");
    });

    it("should have valid percentage rates", async () => {
      const result = await caller.leadBehaviour.getDeliverability({});
      
      expect(result.bounceRate).toBeGreaterThanOrEqual(0);
      expect(result.bounceRate).toBeLessThanOrEqual(100);
      expect(result.spamRate).toBeGreaterThanOrEqual(0);
      expect(result.spamRate).toBeLessThanOrEqual(100);
      expect(result.deliveryRate).toBeGreaterThanOrEqual(0);
      expect(result.deliveryRate).toBeLessThanOrEqual(100);
    });
  });
});

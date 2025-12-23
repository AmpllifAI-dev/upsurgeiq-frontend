import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Email Campaign Scheduling & A/B Testing", () => {
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

  describe("campaigns.create", () => {
    it("should create a basic draft campaign", async () => {
      const result = await caller.campaigns.create({
        name: "Test Campaign",
        subject: "Test Subject",
        previewText: "Test Preview",
        emailTemplate: "<h1>Test Email</h1>",
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should create a scheduled campaign", async () => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1); // Tomorrow
      
      const result = await caller.campaigns.create({
        name: "Scheduled Campaign",
        subject: "Scheduled Subject",
        emailTemplate: "<h1>Scheduled Email</h1>",
        status: "scheduled",
        scheduledAt: scheduledDate.toISOString(),
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should create a campaign with A/B testing enabled", async () => {
      const result = await caller.campaigns.create({
        name: "A/B Test Campaign",
        subject: "Variant A Subject",
        emailTemplate: "<h1>Test Email</h1>",
        abTestEnabled: 1,
        variantBSubject: "Variant B Subject",
        abTestDuration: 24,
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should create a scheduled campaign with A/B testing", async () => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 2); // Day after tomorrow
      
      const result = await caller.campaigns.create({
        name: "Scheduled A/B Test Campaign",
        subject: "Variant A Subject",
        previewText: "Test Preview",
        emailTemplate: "<h1>Test Email</h1>",
        status: "scheduled",
        scheduledAt: scheduledDate.toISOString(),
        abTestEnabled: 1,
        variantBSubject: "Variant B Subject",
        abTestDuration: 48,
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should list created campaigns", async () => {
      const campaigns = await caller.campaigns.list();
      
      expect(campaigns).toBeDefined();
      expect(Array.isArray(campaigns)).toBe(true);
      expect(campaigns.length).toBeGreaterThan(0);
      
      // Check that at least one campaign has the expected structure
      const campaign = campaigns[0];
      expect(campaign).toHaveProperty("id");
      expect(campaign).toHaveProperty("name");
      expect(campaign).toHaveProperty("subject");
      expect(campaign).toHaveProperty("status");
    });
  });
});

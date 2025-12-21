import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { emailCampaigns, newsletterSubscribers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Email Campaign Enhancements", () => {
  let testEmail: string;
  let testCampaignId: number | null = null;

  beforeAll(async () => {
    testEmail = `test-${Date.now()}@example.com`;
  });

  afterAll(async () => {
    // Cleanup test data
    const db = await getDb();
    if (!db) return;

    try {
      // Delete test campaign
      if (testCampaignId) {
        await db.delete(emailCampaigns).where(eq(emailCampaigns.id, testCampaignId));
      }
      
      // Delete test subscriber
      await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.email, testEmail));
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });

  describe("Campaign Scheduling", () => {
    it("should create a scheduled campaign with future date", async () => {
      const db = await getDb();
      expect(db).toBeTruthy();
      if (!db) return;

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now

      const result = await db.insert(emailCampaigns).values({
        name: "Test Scheduled Campaign",
        subject: "Test Subject",
        emailTemplate: "<html><body>Test</body></html>",
        status: "scheduled",
        scheduledAt: futureDate,
        createdAt: new Date(),
      });

      // MySQL returns insertId
      const insertId = (result as any)[0]?.insertId || (result as any).insertId;
      expect(insertId).toBeTruthy();
      testCampaignId = insertId;

      // Fetch the created campaign to verify
      const [campaign] = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, insertId))
        .limit(1);

      expect(campaign).toBeTruthy();
      expect(campaign.status).toBe("scheduled");
      expect(campaign.scheduledAt).toBeTruthy();
      
      // Verify scheduled date is in the future
      const scheduledTime = new Date(campaign.scheduledAt!).getTime();
      const now = Date.now();
      expect(scheduledTime).toBeGreaterThan(now - 10000); // Allow 10s margin for test execution
    });

    it("should allow immediate send with 'draft' status", async () => {
      const db = await getDb();
      if (!db) return;

      const result = await db.insert(emailCampaigns).values({
        name: "Test Immediate Campaign",
        subject: "Send Now Test",
        emailTemplate: "<html><body>Send Now</body></html>",
        status: "draft",
        createdAt: new Date(),
      });

      const insertId = (result as any)[0]?.insertId || (result as any).insertId;
      expect(insertId).toBeTruthy();

      const [campaign] = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, insertId))
        .limit(1);

      expect(campaign).toBeTruthy();
      expect(campaign.status).toBe("draft");
      expect(campaign.scheduledAt).toBeNull();

      // Cleanup
      await db.delete(emailCampaigns).where(eq(emailCampaigns.id, insertId));
    });
  });

  describe("A/B Testing", () => {
    it("should create campaign with A/B testing enabled", async () => {
      const db = await getDb();
      if (!db) return;

      const result = await db.insert(emailCampaigns).values({
        name: "Test A/B Campaign",
        subject: "Variant A Subject",
        emailTemplate: "<html><body>Test</body></html>",
        status: "draft",
        abTestEnabled: 1,
        variantBSubject: "Variant B Subject",
        abTestDuration: 24,
        createdAt: new Date(),
      });

      const insertId = (result as any)[0]?.insertId || (result as any).insertId;
      const [campaign] = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, insertId))
        .limit(1);

      expect(campaign).toBeTruthy();
      expect(campaign.abTestEnabled).toBe(1);
      expect(campaign.variantBSubject).toBe("Variant B Subject");
      expect(campaign.abTestDuration).toBe(24);

      // Cleanup
      await db.delete(emailCampaigns).where(eq(emailCampaigns.id, insertId));
    });

    it("should validate A/B test has two different subjects", async () => {
      const db = await getDb();
      if (!db) return;

      const variantA = "Unlock Your PR Potential Today";
      const variantB = "5 PR Strategies That Actually Work";

      const result = await db.insert(emailCampaigns).values({
        name: "A/B Test Validation",
        subject: variantA,
        emailTemplate: "<html><body>Test</body></html>",
        status: "draft",
        abTestEnabled: 1,
        variantBSubject: variantB,
        abTestDuration: 24,
        createdAt: new Date(),
      });

      const insertId = (result as any)[0]?.insertId || (result as any).insertId;
      const [campaign] = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, insertId))
        .limit(1);

      expect(campaign.subject).not.toBe(campaign.variantBSubject);
      expect(campaign.subject).toBe(variantA);
      expect(campaign.variantBSubject).toBe(variantB);

      // Cleanup
      await db.delete(emailCampaigns).where(eq(emailCampaigns.id, insertId));
    });
  });

  describe("Subscriber Preferences", () => {
    it("should create subscriber with default preferences (all enabled)", async () => {
      const db = await getDb();
      if (!db) return;

      const result = await db.insert(newsletterSubscribers).values({
        email: testEmail,
        status: "active",
        source: "test",
        preferPrTips: 1,
        preferMarketingInsights: 1,
        preferAiUpdates: 1,
        preferCaseStudies: 1,
        preferProductNews: 1,
        subscribedAt: new Date(),
      });

      expect(result).toBeTruthy();

      const [subscriber] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, testEmail))
        .limit(1);

      expect(subscriber).toBeTruthy();
      expect(subscriber.preferPrTips).toBe(1);
      expect(subscriber.preferMarketingInsights).toBe(1);
      expect(subscriber.preferAiUpdates).toBe(1);
      expect(subscriber.preferCaseStudies).toBe(1);
      expect(subscriber.preferProductNews).toBe(1);
    });

    it("should update subscriber preferences", async () => {
      const db = await getDb();
      if (!db) return;

      // Update preferences - disable some categories
      await db.update(newsletterSubscribers)
        .set({
          preferPrTips: 1,
          preferMarketingInsights: 0,
          preferAiUpdates: 1,
          preferCaseStudies: 0,
          preferProductNews: 1,
        })
        .where(eq(newsletterSubscribers.email, testEmail));

      // Verify update
      const [updated] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, testEmail))
        .limit(1);

      expect(updated).toBeTruthy();
      expect(updated.preferPrTips).toBe(1);
      expect(updated.preferMarketingInsights).toBe(0);
      expect(updated.preferAiUpdates).toBe(1);
      expect(updated.preferCaseStudies).toBe(0);
      expect(updated.preferProductNews).toBe(1);
    });

    it("should retrieve subscriber preferences", async () => {
      const db = await getDb();
      if (!db) return;

      const [subscriber] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, testEmail))
        .limit(1);

      expect(subscriber).toBeTruthy();
      expect(subscriber.email).toBe(testEmail);
      
      // Verify all preference fields exist
      expect(typeof subscriber.preferPrTips).toBe("number");
      expect(typeof subscriber.preferMarketingInsights).toBe("number");
      expect(typeof subscriber.preferAiUpdates).toBe("number");
      expect(typeof subscriber.preferCaseStudies).toBe("number");
      expect(typeof subscriber.preferProductNews).toBe("number");
    });

    it("should allow subscriber to opt out of all categories", async () => {
      const db = await getDb();
      if (!db) return;

      // Disable all preferences
      await db.update(newsletterSubscribers)
        .set({
          preferPrTips: 0,
          preferMarketingInsights: 0,
          preferAiUpdates: 0,
          preferCaseStudies: 0,
          preferProductNews: 0,
        })
        .where(eq(newsletterSubscribers.email, testEmail));

      const [updated] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, testEmail))
        .limit(1);

      expect(updated).toBeTruthy();
      expect(updated.preferPrTips).toBe(0);
      expect(updated.preferMarketingInsights).toBe(0);
      expect(updated.preferAiUpdates).toBe(0);
      expect(updated.preferCaseStudies).toBe(0);
      expect(updated.preferProductNews).toBe(0);
    });
  });

  describe("Combined Features", () => {
    it("should create scheduled A/B test campaign", async () => {
      const db = await getDb();
      if (!db) return;

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 48);

      const result = await db.insert(emailCampaigns).values({
        name: "Scheduled A/B Test",
        subject: "Tuesday Morning Special",
        emailTemplate: "<html><body>Test</body></html>",
        status: "scheduled",
        scheduledAt: futureDate,
        abTestEnabled: 1,
        variantBSubject: "Tuesday Exclusive Offer",
        abTestDuration: 24,
        createdAt: new Date(),
      });

      const insertId = (result as any)[0]?.insertId || (result as any).insertId;
      const [campaign] = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, insertId))
        .limit(1);

      expect(campaign).toBeTruthy();
      expect(campaign.status).toBe("scheduled");
      expect(campaign.scheduledAt).toBeTruthy();
      expect(campaign.abTestEnabled).toBe(1);
      expect(campaign.variantBSubject).toBeTruthy();

      // Cleanup
      await db.delete(emailCampaigns).where(eq(emailCampaigns.id, insertId));
    });
  });
});

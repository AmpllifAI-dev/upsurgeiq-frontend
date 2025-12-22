import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { 
  emailCampaigns, 
  campaignEvents, 
  emailWorkflows, 
  workflowSteps, 
  emailTemplateLibrary 
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Email Admin Features", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testCampaignId: number;
  let testWorkflowId: number;
  let testTemplateId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database connection failed");
  });

  describe("Email Analytics", () => {
    it("should track campaign events", async () => {
      // Create a test campaign
      const [insertResult] = await db.insert(emailCampaigns).values({
        name: "Test Analytics Campaign",
        subject: "Test Subject",
        emailTemplate: "<html><body>Test content</body></html>",
        status: "sent",
        recipientCount: 100,
        openCount: 50,
        clickCount: 25,
        bounceCount: 5,
        createdAt: new Date(),
      });

      testCampaignId = Number(insertResult.insertId);

      // Verify campaign was created
      const [campaign] = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, testCampaignId))
        .limit(1);

      expect(campaign).toBeDefined();
      expect(campaign.name).toBe("Test Analytics Campaign");
      expect(campaign.recipientCount).toBe(100);
    });

    it("should record campaign events", async () => {
      // Insert test events (use null for subscriberId since we don't have a real subscriber)
      await db.insert(campaignEvents).values([
        {
          campaignId: testCampaignId,
          subscriberId: null,
          eventType: "sent",
          createdAt: new Date(),
        },
        {
          campaignId: testCampaignId,
          subscriberId: null,
          eventType: "opened",
          createdAt: new Date(),
        },
        {
          campaignId: testCampaignId,
          subscriberId: null,
          eventType: "clicked",
          linkUrl: "https://example.com",
          createdAt: new Date(),
        },
      ]);

      // Verify events were recorded
      const events = await db
        .select()
        .from(campaignEvents)
        .where(eq(campaignEvents.campaignId, testCampaignId));

      expect(events.length).toBeGreaterThanOrEqual(3);
      expect(events.some((e) => e.eventType === "sent")).toBe(true);
      expect(events.some((e) => e.eventType === "opened")).toBe(true);
      expect(events.some((e) => e.eventType === "clicked")).toBe(true);
    });

    it("should calculate analytics metrics", async () => {
      const [campaign] = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, testCampaignId))
        .limit(1);

      const sent = campaign.recipientCount || 0;
      const opened = campaign.openCount || 0;
      const clicked = campaign.clickCount || 0;
      const bounced = campaign.bounceCount || 0;

      const openRate = sent > 0 ? (opened / sent) * 100 : 0;
      const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;
      const bounceRate = sent > 0 ? (bounced / sent) * 100 : 0;

      expect(openRate).toBe(50); // 50/100 = 50%
      expect(clickRate).toBe(25); // 25/100 = 25%
      expect(bounceRate).toBe(5); // 5/100 = 5%
    });
  });

  describe("Automated Workflows", () => {
    it("should create a workflow", async () => {
      const [insertResult] = await db.insert(emailWorkflows).values({
        name: "Welcome Series",
        description: "Automated welcome emails for new subscribers",
        triggerType: "subscription",
        status: "draft",
        isActive: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      testWorkflowId = Number(insertResult.insertId);

      const [workflow] = await db
        .select()
        .from(emailWorkflows)
        .where(eq(emailWorkflows.id, testWorkflowId))
        .limit(1);

      expect(workflow).toBeDefined();
      expect(workflow.name).toBe("Welcome Series");
      expect(workflow.triggerType).toBe("subscription");
      expect(workflow.isActive).toBe(0);
    });

    it("should add workflow steps", async () => {
      // Add multiple steps
      await db.insert(workflowSteps).values([
        {
          workflowId: testWorkflowId,
          stepOrder: 1,
          name: "Welcome Email",
          subject: "Welcome to UpsurgeIQ!",
          emailTemplate: "<h1>Welcome!</h1>",
          delayDays: 0,
          delayHours: 0,
          createdAt: new Date(),
        },
        {
          workflowId: testWorkflowId,
          stepOrder: 2,
          name: "Getting Started",
          subject: "Getting Started with UpsurgeIQ",
          emailTemplate: "<h1>Let's get started</h1>",
          delayDays: 1,
          delayHours: 0,
          createdAt: new Date(),
        },
        {
          workflowId: testWorkflowId,
          stepOrder: 3,
          name: "Tips & Tricks",
          subject: "Pro Tips for UpsurgeIQ",
          emailTemplate: "<h1>Pro tips</h1>",
          delayDays: 3,
          delayHours: 0,
          createdAt: new Date(),
        },
      ]);

      const steps = await db
        .select()
        .from(workflowSteps)
        .where(eq(workflowSteps.workflowId, testWorkflowId));

      expect(steps.length).toBe(3);
      expect(steps[0].stepOrder).toBe(1);
      expect(steps[1].stepOrder).toBe(2);
      expect(steps[2].stepOrder).toBe(3);
      expect(steps[0].delayDays).toBe(0); // Immediate
      expect(steps[1].delayDays).toBe(1); // 1 day delay
      expect(steps[2].delayDays).toBe(3); // 3 day delay
    });

    it("should activate and deactivate workflows", async () => {
      // Activate workflow
      await db
        .update(emailWorkflows)
        .set({ isActive: 1, status: "active" })
        .where(eq(emailWorkflows.id, testWorkflowId));

      let [workflow] = await db
        .select()
        .from(emailWorkflows)
        .where(eq(emailWorkflows.id, testWorkflowId))
        .limit(1);

      expect(workflow.isActive).toBe(1);
      expect(workflow.status).toBe("active");

      // Deactivate workflow
      await db
        .update(emailWorkflows)
        .set({ isActive: 0, status: "paused" })
        .where(eq(emailWorkflows.id, testWorkflowId));

      [workflow] = await db
        .select()
        .from(emailWorkflows)
        .where(eq(emailWorkflows.id, testWorkflowId))
        .limit(1);

      expect(workflow.isActive).toBe(0);
      expect(workflow.status).toBe("paused");
    });
  });

  describe("Email Template Library", () => {
    it("should create a template", async () => {
      const [insertResult] = await db.insert(emailTemplateLibrary).values({
        name: "Monthly Newsletter",
        description: "Professional newsletter template",
        category: "newsletter",
        htmlContent: "<html><body><h1>Newsletter</h1></body></html>",
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      testTemplateId = Number(insertResult.insertId);

      const [template] = await db
        .select()
        .from(emailTemplateLibrary)
        .where(eq(emailTemplateLibrary.id, testTemplateId))
        .limit(1);

      expect(template).toBeDefined();
      expect(template.name).toBe("Monthly Newsletter");
      expect(template.category).toBe("newsletter");
      expect(template.usageCount).toBe(0);
    });

    it("should duplicate a template", async () => {
      const [original] = await db
        .select()
        .from(emailTemplateLibrary)
        .where(eq(emailTemplateLibrary.id, testTemplateId))
        .limit(1);

      const [insertResult] = await db.insert(emailTemplateLibrary).values({
        name: `${original.name} (Copy)`,
        description: original.description,
        category: original.category,
        htmlContent: original.htmlContent,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const duplicateId = Number(insertResult.insertId);

      const [duplicate] = await db
        .select()
        .from(emailTemplateLibrary)
        .where(eq(emailTemplateLibrary.id, duplicateId))
        .limit(1);

      expect(duplicate.name).toBe("Monthly Newsletter (Copy)");
      expect(duplicate.htmlContent).toBe(original.htmlContent);
      expect(duplicate.usageCount).toBe(0);
    });

    it("should filter templates by category", async () => {
      // Create templates in different categories
      await db.insert(emailTemplateLibrary).values([
        {
          name: "Promotional Email",
          category: "promotional",
          htmlContent: "<html><body>Promo</body></html>",
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Welcome Email",
          category: "welcome",
          htmlContent: "<html><body>Welcome</body></html>",
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const newsletterTemplates = await db
        .select()
        .from(emailTemplateLibrary)
        .where(eq(emailTemplateLibrary.category, "newsletter"));

      const promotionalTemplates = await db
        .select()
        .from(emailTemplateLibrary)
        .where(eq(emailTemplateLibrary.category, "promotional"));

      expect(newsletterTemplates.length).toBeGreaterThanOrEqual(1);
      expect(promotionalTemplates.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Cleanup", () => {
    it("should clean up test data", async () => {
      // Delete test campaign events
      await db.delete(campaignEvents).where(eq(campaignEvents.campaignId, testCampaignId));

      // Delete test campaign
      await db.delete(emailCampaigns).where(eq(emailCampaigns.id, testCampaignId));

      // Delete test workflow steps
      await db.delete(workflowSteps).where(eq(workflowSteps.workflowId, testWorkflowId));

      // Delete test workflow
      await db.delete(emailWorkflows).where(eq(emailWorkflows.id, testWorkflowId));

      // Delete test templates
      await db.delete(emailTemplateLibrary).where(eq(emailTemplateLibrary.id, testTemplateId));

      // Verify cleanup
      const [campaign] = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, testCampaignId))
        .limit(1);

      const [workflow] = await db
        .select()
        .from(emailWorkflows)
        .where(eq(emailWorkflows.id, testWorkflowId))
        .limit(1);

      const [template] = await db
        .select()
        .from(emailTemplateLibrary)
        .where(eq(emailTemplateLibrary.id, testTemplateId))
        .limit(1);

      expect(campaign).toBeUndefined();
      expect(workflow).toBeUndefined();
      expect(template).toBeUndefined();
    });
  });
});

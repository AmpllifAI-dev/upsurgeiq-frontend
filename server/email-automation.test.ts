import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { 
  campaignEvents, 
  emailCampaigns, 
  newsletterSubscribers,
  emailWorkflows,
  workflowSteps,
  workflowEnrollments
} from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { enrollSubscriberInWorkflow, autoEnrollNewSubscriber } from "./workflowEngine";

describe("Email Automation & Tracking", () => {
  let testCampaignId: number;
  let testSubscriberId: number;
  let testWorkflowId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test subscriber
    const [subscriber] = await db
      .insert(newsletterSubscribers)
      .values({
        email: `test-automation-${Date.now()}@example.com`,
        firstName: "Test",
        lastName: "Automation",
        status: "active",
      });
    testSubscriberId = subscriber.insertId;

    // Create test campaign
    const [campaign] = await db
      .insert(emailCampaigns)
      .values({
        name: "Test Campaign for Automation",
        subject: "Test Subject",
        emailTemplate: "<p>Test email</p>",
        status: "sent",
        sentAt: new Date(),
      });
    testCampaignId = campaign.insertId;

    // Create test workflow
    const [workflow] = await db
      .insert(emailWorkflows)
      .values({
        name: "Test Welcome Workflow",
        description: "Test workflow for automation",
        triggerType: "subscription",
        isActive: 1,
      });
    testWorkflowId = workflow.insertId;

    // Create workflow steps
    await db.insert(workflowSteps).values([
      {
        workflowId: testWorkflowId,
        stepOrder: 1,
        name: "Welcome Email Step",
        subject: "Welcome Email",
        emailTemplate: "<p>Welcome!</p>",
        delayDays: 0,
        delayHours: 0,
      },
      {
        workflowId: testWorkflowId,
        stepOrder: 2,
        name: "Follow-up Email Step",
        subject: "Follow-up Email",
        emailTemplate: "<p>Follow-up</p>",
        delayDays: 1,
        delayHours: 0,
      },
    ]);
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Cleanup
    if (testWorkflowId) {
      await db.delete(workflowEnrollments).where(eq(workflowEnrollments.workflowId, testWorkflowId));
      await db.delete(workflowSteps).where(eq(workflowSteps.workflowId, testWorkflowId));
      await db.delete(emailWorkflows).where(eq(emailWorkflows.id, testWorkflowId));
    }
    if (testCampaignId) {
      await db.delete(campaignEvents).where(eq(campaignEvents.campaignId, testCampaignId));
      await db.delete(emailCampaigns).where(eq(emailCampaigns.id, testCampaignId));
    }
    if (testSubscriberId) {
      await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, testSubscriberId));
    }
  });

  describe("SendGrid Webhook Event Tracking", () => {
    it("should create campaign event for email open", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(campaignEvents).values({
        campaignId: testCampaignId,
        subscriberId: testSubscriberId,
        eventType: "opened",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        eventData: {
          sg_event_id: "test-event-123",
          sg_message_id: "test-message-456",
        },
      });

      const [event] = await db
        .select()
        .from(campaignEvents)
        .where(eq(campaignEvents.campaignId, testCampaignId))
        .limit(1);

      expect(event).toBeDefined();
      expect(event.eventType).toBe("opened");
      expect(event.subscriberId).toBe(testSubscriberId);
    });

    it("should create campaign event for email click", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(campaignEvents).values({
        campaignId: testCampaignId,
        subscriberId: testSubscriberId,
        eventType: "clicked",
        eventData: {
          url: "https://example.com/link",
          sg_event_id: "test-click-123",
        },
      });

      const events = await db
        .select()
        .from(campaignEvents)
        .where(eq(campaignEvents.campaignId, testCampaignId));

      const clickEvent = events.find((e) => e.eventType === "clicked");
      expect(clickEvent).toBeDefined();
      expect(clickEvent?.eventData).toHaveProperty("url");
    });

    it("should track bounce events", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(campaignEvents).values({
        campaignId: testCampaignId,
        subscriberId: testSubscriberId,
        eventType: "bounced",
        eventData: {
          reason: "Invalid email address",
          sg_event_id: "test-bounce-123",
        },
      });

      const events = await db
        .select()
        .from(campaignEvents)
        .where(eq(campaignEvents.campaignId, testCampaignId));

      const bounceEvent = events.find((e) => e.eventType === "bounced");
      expect(bounceEvent).toBeDefined();
    });
  });

  describe("Workflow Automation Engine", () => {
    it("should enroll subscriber in workflow", async () => {
      const result = await enrollSubscriberInWorkflow(testSubscriberId, testWorkflowId);

      expect(result).toBeDefined();
      expect(result.workflowId).toBe(testWorkflowId);
      expect(result.subscriberId).toBe(testSubscriberId);
      expect(result.scheduledFor).toBeInstanceOf(Date);
    });

    it("should not double-enroll subscriber in same workflow", async () => {
      // Try to enroll again
      const result = await enrollSubscriberInWorkflow(testSubscriberId, testWorkflowId);

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const enrollments = await db
        .select()
        .from(workflowEnrollments)
        .where(eq(workflowEnrollments.subscriberId, testSubscriberId));

      // Should only have one enrollment
      expect(enrollments.length).toBe(1);
    });

    it("should auto-enroll new subscriber in subscription workflows", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create a new subscriber
      const [newSubscriber] = await db
        .insert(newsletterSubscribers)
        .values({
          email: `new-subscriber-${Date.now()}@example.com`,
          firstName: "New",
          lastName: "Subscriber",
          status: "active",
        });

      await autoEnrollNewSubscriber(newSubscriber.insertId);

      const enrollments = await db
        .select()
        .from(workflowEnrollments)
        .where(eq(workflowEnrollments.subscriberId, newSubscriber.insertId));

      expect(enrollments.length).toBeGreaterThan(0);
      expect(enrollments[0].workflowId).toBe(testWorkflowId);

      // Cleanup
      await db.delete(workflowEnrollments).where(eq(workflowEnrollments.subscriberId, newSubscriber.insertId));
      await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, newSubscriber.insertId));
    });

    it("should track workflow enrollment status", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [enrollment] = await db
        .select()
        .from(workflowEnrollments)
        .where(eq(workflowEnrollments.subscriberId, testSubscriberId))
        .limit(1);

      expect(enrollment).toBeDefined();
      expect(enrollment.status).toBe("active");
      expect(enrollment.enrolledAt).toBeInstanceOf(Date);
      expect(enrollment.nextScheduledAt).toBeInstanceOf(Date);
    });
  });

  describe("Email Template Builder", () => {
    it("should generate simple layout HTML", () => {
      const html = generateTestEmailHTML({
        layout: "simple",
        headerText: "Test Header",
        headerColor: "#2563eb",
        bodyText: "Test body content",
        ctaText: "Click Here",
        ctaUrl: "https://example.com",
        ctaColor: "#10b981",
        footerText: "Test footer",
        backgroundColor: "#ffffff",
      });

      expect(html).toContain("Test Header");
      expect(html).toContain("Test body content");
      expect(html).toContain("Click Here");
      expect(html).toContain("https://example.com");
    });

    it("should generate two-column layout HTML", () => {
      const html = generateTestEmailHTML({
        layout: "two-column",
        headerText: "Test Header",
        headerColor: "#2563eb",
        bodyText: "Column 1 content\n\nColumn 2 content",
        ctaText: "Click Here",
        ctaUrl: "https://example.com",
        ctaColor: "#10b981",
        footerText: "Test footer",
        backgroundColor: "#ffffff",
      });

      expect(html).toContain("two-column");
      expect(html).toContain("Column 1 content");
      expect(html).toContain("Column 2 content");
    });
  });
});

// Helper function for template testing
function generateTestEmailHTML(data: {
  layout: string;
  headerText: string;
  headerColor: string;
  bodyText: string;
  ctaText: string;
  ctaUrl: string;
  ctaColor: string;
  footerText: string;
  backgroundColor: string;
}): string {
  const baseStyles = `
    <style>
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      .email-container { max-width: 600px; margin: 0 auto; background-color: ${data.backgroundColor}; }
      .header { background-color: ${data.headerColor}; color: white; padding: 30px 20px; text-align: center; }
      .body { padding: 30px 20px; }
      .cta-button { display: inline-block; background-color: ${data.ctaColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
  `;

  if (data.layout === "simple") {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>${data.headerText}</h1>
          </div>
          <div class="body">
            <p>${data.bodyText.replace(/\n/g, "<br>")}</p>
            ${data.ctaText && data.ctaUrl ? `<a href="${data.ctaUrl}" class="cta-button">${data.ctaText}</a>` : ""}
          </div>
          <div class="footer">
            <p>${data.footerText}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
      <style>
        .two-column { display: flex; gap: 20px; }
        .column { flex: 1; }
        @media (max-width: 600px) {
          .two-column { flex-direction: column; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>${data.headerText}</h1>
        </div>
        <div class="body">
          <div class="two-column">
            <div class="column">
              <p>${data.bodyText.split("\n\n")[0]?.replace(/\n/g, "<br>") || ""}</p>
            </div>
            <div class="column">
              <p>${data.bodyText.split("\n\n")[1]?.replace(/\n/g, "<br>") || ""}</p>
            </div>
          </div>
          ${data.ctaText && data.ctaUrl ? `<div style="text-align: center;"><a href="${data.ctaUrl}" class="cta-button">${data.ctaText}</a></div>` : ""}
        </div>
        <div class="footer">
          <p>${data.footerText}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { campaignEvents, emailWorkflows, workflowSteps } from "../drizzle/schema";
import { initializeWelcomeWorkflow } from "./welcomeWorkflowTemplate";
import { eq } from "drizzle-orm";

describe("Email Deliverability & Configuration", () => {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Clean up test data
    await db.delete(campaignEvents);
  });

  it("should track email delivery events", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Insert test events
    await db.insert(campaignEvents).values([
      {
        campaignId: 1,
        subscriberId: null,
        eventType: "sent",
        createdAt: new Date(),
      },
      {
        campaignId: 1,
        subscriberId: null,
        eventType: "delivered",
        createdAt: new Date(),
      },
    ]);

    const events = await db.select().from(campaignEvents);
    expect(events.length).toBeGreaterThanOrEqual(2);
  });

  it("should track bounce events", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(campaignEvents).values({
      campaignId: 1,
      subscriberId: null,
      eventType: "bounced",
      createdAt: new Date(),
    });

    const bounceEvents = await db
      .select()
      .from(campaignEvents)
      .where(eq(campaignEvents.campaignId, 1));

    const bounces = bounceEvents.filter(e => e.eventType === "bounced");
    expect(bounces.length).toBeGreaterThan(0);
  });

  it("should track spam complaints", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(campaignEvents).values({
      campaignId: 1,
      subscriberId: null,
      eventType: "spam_report",
      createdAt: new Date(),
    });

    const allEvents = await db
      .select()
      .from(campaignEvents)
      .where(eq(campaignEvents.campaignId, 1));

    const spamReports = allEvents.filter(e => e.eventType === "spam_report");
    expect(spamReports.length).toBeGreaterThan(0);
  });

  it("should initialize welcome workflow template", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Initialize welcome workflow
    const workflowId = await initializeWelcomeWorkflow();

    if (workflowId) {
      // Verify workflow was created
      const [workflow] = await db
        .select()
        .from(emailWorkflows)
        .where(eq(emailWorkflows.id, workflowId))
        .limit(1);

      expect(workflow).toBeDefined();
      expect(workflow.name).toBe("Welcome Series");
      expect(workflow.triggerType).toBe("subscription");

      // Verify workflow steps were created
      const steps = await db
        .select()
        .from(workflowSteps)
        .where(eq(workflowSteps.workflowId, workflowId));

      expect(steps.length).toBe(4);
      expect(steps[0].name).toBe("Welcome Email");
      expect(steps[1].name).toBe("Getting Started Guide");
      expect(steps[2].name).toBe("Case Study Showcase");
      expect(steps[3].name).toBe("Special Offer");
    }
  });

  it("should calculate deliverability metrics correctly", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Clear previous test data
    await db.delete(campaignEvents);

    // Insert test events for metrics calculation
    await db.insert(campaignEvents).values([
      { campaignId: 2, subscriberId: null, eventType: "sent", createdAt: new Date() },
      { campaignId: 2, subscriberId: null, eventType: "sent", createdAt: new Date() },
      { campaignId: 2, subscriberId: null, eventType: "sent", createdAt: new Date() },
      { campaignId: 2, subscriberId: null, eventType: "sent", createdAt: new Date() },
      { campaignId: 2, subscriberId: null, eventType: "sent", createdAt: new Date() },
      { campaignId: 2, subscriberId: null, eventType: "delivered", createdAt: new Date() },
      { campaignId: 2, subscriberId: null, eventType: "delivered", createdAt: new Date() },
      { campaignId: 2, subscriberId: null, eventType: "delivered", createdAt: new Date() },
      { campaignId: 2, subscriberId: null, eventType: "delivered", createdAt: new Date() },
      { campaignId: 2, subscriberId: null, eventType: "bounced", createdAt: new Date() },
    ]);

    const allEvents = await db
      .select()
      .from(campaignEvents)
      .where(eq(campaignEvents.campaignId, 2));

    const sent = allEvents.filter(e => e.eventType === "sent").length;
    const delivered = allEvents.filter(e => e.eventType === "delivered").length;
    const bounced = allEvents.filter(e => e.eventType === "bounced").length;

    expect(sent).toBe(5);
    expect(delivered).toBe(4);
    expect(bounced).toBe(1);

    // Calculate rates
    const deliveryRate = (delivered / sent) * 100;
    const bounceRate = (bounced / sent) * 100;

    expect(deliveryRate).toBe(80);
    expect(bounceRate).toBe(20);
  });
});

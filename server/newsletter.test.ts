import { describe, it, expect, beforeEach } from "vitest";
import { subscribeToNewsletter, unsubscribeFromNewsletter, getAllSubscribers, getSubscriberStats } from "./newsletter";
import { getDb } from "./db";
import { newsletterSubscribers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Newsletter System", () => {
  const testEmail = `test-${Date.now()}@example.com`;

  beforeEach(async () => {
    // Clean up test data
    const db = await getDb();
    if (db) {
      await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.email, testEmail));
    }
  });

  it("should subscribe a new email", async () => {
    const result = await subscribeToNewsletter(testEmail, "test_source");
    
    expect(result.success).toBe(true);
    expect(result.resubscribed).toBe(false);

    // Verify in database
    const db = await getDb();
    if (db) {
      const subscribers = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, testEmail));
      
      expect(subscribers.length).toBe(1);
      expect(subscribers[0].email).toBe(testEmail);
      expect(subscribers[0].status).toBe("active");
      expect(subscribers[0].source).toBe("test_source");
    }
  });

  it("should not allow duplicate subscriptions", async () => {
    // First subscription
    await subscribeToNewsletter(testEmail, "test_source");
    
    // Second subscription attempt
    const result = await subscribeToNewsletter(testEmail, "test_source");
    
    expect(result.success).toBe(false);
    expect(result.error).toBe("Already subscribed");
  });

  it("should unsubscribe an email", async () => {
    // Subscribe first
    await subscribeToNewsletter(testEmail, "test_source");
    
    // Unsubscribe
    const result = await unsubscribeFromNewsletter(testEmail);
    
    expect(result.success).toBe(true);

    // Verify in database
    const db = await getDb();
    if (db) {
      const subscribers = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, testEmail));
      
      expect(subscribers.length).toBe(1);
      expect(subscribers[0].status).toBe("unsubscribed");
      expect(subscribers[0].unsubscribedAt).toBeTruthy();
    }
  });

  it("should allow resubscription after unsubscribing", async () => {
    // Subscribe
    await subscribeToNewsletter(testEmail, "test_source");
    
    // Unsubscribe
    await unsubscribeFromNewsletter(testEmail);
    
    // Resubscribe
    const result = await subscribeToNewsletter(testEmail, "test_source");
    
    expect(result.success).toBe(true);
    expect(result.resubscribed).toBe(true);

    // Verify in database
    const db = await getDb();
    if (db) {
      const subscribers = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, testEmail));
      
      expect(subscribers.length).toBe(1);
      expect(subscribers[0].status).toBe("active");
    }
  });

  it("should get all subscribers", async () => {
    // Subscribe test email
    await subscribeToNewsletter(testEmail, "test_source");
    
    const subscribers = await getAllSubscribers();
    
    expect(Array.isArray(subscribers)).toBe(true);
    expect(subscribers.some(s => s.email === testEmail)).toBe(true);
  });

  it("should filter subscribers by status", async () => {
    // Subscribe and then unsubscribe
    await subscribeToNewsletter(testEmail, "test_source");
    await unsubscribeFromNewsletter(testEmail);
    
    const activeSubscribers = await getAllSubscribers("active");
    const unsubscribedSubscribers = await getAllSubscribers("unsubscribed");
    
    expect(activeSubscribers.some(s => s.email === testEmail)).toBe(false);
    expect(unsubscribedSubscribers.some(s => s.email === testEmail)).toBe(true);
  });

  it("should get subscriber stats", async () => {
    // Subscribe test email
    await subscribeToNewsletter(testEmail, "test_source");
    
    const stats = await getSubscriberStats();
    
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("active");
    expect(stats).toHaveProperty("unsubscribed");
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.active).toBe("number");
    expect(typeof stats.unsubscribed).toBe("number");
  });
});

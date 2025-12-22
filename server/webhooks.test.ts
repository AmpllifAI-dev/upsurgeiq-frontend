/**
 * Tests for webhook configuration and delivery system
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { webhookConfigs, webhookDeliveryLogs } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Mock admin user context
const mockAdminContext: TrpcContext = {
  user: {
    id: 1,
    openId: "admin-openid",
    email: "admin@test.com",
    name: "Test Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {
    protocol: "https",
    headers: {},
  } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

// Mock non-admin user context
const mockUserContext: TrpcContext = {
  user: {
    id: 2,
    openId: "user-openid",
    email: "user@test.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {
    protocol: "https",
    headers: {},
  } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("Webhook Configuration Tests", () => {
  let testWebhookId: number;

  // Clean up test data after all tests
  afterAll(async () => {
    const db = await getDb();
    if (db && testWebhookId) {
      await db.delete(webhookConfigs).where(eq(webhookConfigs.id, testWebhookId));
    }
  });

  it("should allow admin to list webhook configurations", async () => {
    const caller = appRouter.createCaller(mockAdminContext);
    const webhooks = await caller.webhooks.list();
    
    expect(Array.isArray(webhooks)).toBe(true);
  });

  it("should prevent non-admin from listing webhooks", async () => {
    const caller = appRouter.createCaller(mockUserContext);
    
    await expect(caller.webhooks.list()).rejects.toThrow("Only admins can manage webhooks");
  });

  it("should allow admin to create webhook configuration", async () => {
    const caller = appRouter.createCaller(mockAdminContext);
    
    const newWebhook = await caller.webhooks.create({
      name: "Test Webhook",
      eventType: "user.onboarded",
      webhookUrl: "https://hook.test.make.com/test123",
      isActive: true,
      retryAttempts: 3,
    });

    expect(newWebhook).toBeDefined();
    expect(newWebhook?.name).toBe("Test Webhook");
    expect(newWebhook?.eventType).toBe("user.onboarded");
    expect(newWebhook?.webhookUrl).toBe("https://hook.test.make.com/test123");
    expect(newWebhook?.isActive).toBe(1);
    expect(newWebhook?.retryAttempts).toBe(3);

    if (newWebhook) {
      testWebhookId = newWebhook.id;
    }
  });

  it("should prevent non-admin from creating webhooks", async () => {
    const caller = appRouter.createCaller(mockUserContext);
    
    await expect(
      caller.webhooks.create({
        name: "Unauthorized Webhook",
        eventType: "user.registered",
        webhookUrl: "https://hook.test.make.com/unauthorized",
        isActive: true,
        retryAttempts: 3,
      })
    ).rejects.toThrow("Only admins can manage webhooks");
  });

  it("should allow admin to update webhook configuration", async () => {
    const caller = appRouter.createCaller(mockAdminContext);
    
    const updated = await caller.webhooks.update({
      id: testWebhookId,
      name: "Updated Test Webhook",
      isActive: false,
    });

    expect(updated).toBeDefined();
    expect(updated?.name).toBe("Updated Test Webhook");
    expect(updated?.isActive).toBe(0);
  });

  it("should prevent non-admin from updating webhooks", async () => {
    const caller = appRouter.createCaller(mockUserContext);
    
    await expect(
      caller.webhooks.update({
        id: testWebhookId,
        name: "Unauthorized Update",
      })
    ).rejects.toThrow("Only admins can manage webhooks");
  });

  it("should allow admin to view webhook delivery logs", async () => {
    const caller = appRouter.createCaller(mockAdminContext);
    
    const logs = await caller.webhooks.logs({ limit: 50 });
    
    expect(Array.isArray(logs)).toBe(true);
  });

  it("should prevent non-admin from viewing webhook logs", async () => {
    const caller = appRouter.createCaller(mockUserContext);
    
    await expect(
      caller.webhooks.logs({ limit: 50 })
    ).rejects.toThrow("Only admins can view webhook logs");
  });

  it("should validate webhook URL format", async () => {
    const caller = appRouter.createCaller(mockAdminContext);
    
    await expect(
      caller.webhooks.create({
        name: "Invalid URL Webhook",
        eventType: "user.registered",
        webhookUrl: "not-a-valid-url",
        isActive: true,
        retryAttempts: 3,
      })
    ).rejects.toThrow();
  });

  it("should validate retry attempts range", async () => {
    const caller = appRouter.createCaller(mockAdminContext);
    
    await expect(
      caller.webhooks.create({
        name: "Invalid Retry Webhook",
        eventType: "user.registered",
        webhookUrl: "https://hook.test.make.com/test",
        isActive: true,
        retryAttempts: 10, // Max is 5
      })
    ).rejects.toThrow();
  });

  it("should allow admin to delete webhook configuration", async () => {
    const caller = appRouter.createCaller(mockAdminContext);
    
    const result = await caller.webhooks.delete({ id: testWebhookId });
    
    expect(result).toBe(true);
  });

  it("should prevent non-admin from deleting webhooks", async () => {
    const caller = appRouter.createCaller(mockUserContext);
    
    await expect(
      caller.webhooks.delete({ id: 999 })
    ).rejects.toThrow("Only admins can manage webhooks");
  });
});

describe("Webhook Test Endpoint", () => {
  // Note: These tests actually trigger webhook HTTP requests with retries, so they take longer
  it("should allow admin to trigger test webhook", { timeout: 15000 }, async () => {
    const caller = appRouter.createCaller(mockAdminContext);
    
    const result = await caller.webhooks.test({
      eventType: "user.onboarded",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.message).toContain("Test webhook triggered successfully");
    expect(result.payload).toBeDefined();
    expect(result.payload.isTest).toBe(true);
  });

  it("should prevent non-admin from triggering test webhooks", async () => {
    const caller = appRouter.createCaller(mockUserContext);
    
    await expect(
      caller.webhooks.test({ eventType: "user.onboarded" })
    ).rejects.toThrow("Only admins can test webhooks");
  });

  it("should include correct payload structure in test webhook", { timeout: 15000 }, async () => {
    const caller = appRouter.createCaller(mockAdminContext);
    
    const result = await caller.webhooks.test({
      eventType: "user.onboarded",
    });

    expect(result.payload).toHaveProperty("user");
    expect(result.payload).toHaveProperty("business");
    expect(result.payload).toHaveProperty("subscription");
    expect(result.payload).toHaveProperty("timestamp");
    expect(result.payload.user).toHaveProperty("id");
    expect(result.payload.user).toHaveProperty("email");
    expect(result.payload.business).toHaveProperty("name");
    expect(result.payload.subscription).toHaveProperty("plan");
  });
});

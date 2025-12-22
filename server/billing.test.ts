import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import type { Context } from "./_core/context";

describe("Billing Router", () => {
  let testUserId: number;
  let testContext: Context;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test user
    const userResult = await db
      .insert(await import("../drizzle/schema").then((m) => m.users))
      .values({
        openId: "test-billing-user",
        email: "billing-test@example.com",
        name: "Billing Test User",
        role: "user",
      });

    testUserId = Number(userResult[0].insertId);

    // Create mock context
    testContext = {
      user: {
        id: testUserId,
        openId: "test-billing-user",
        email: "billing-test@example.com",
        name: "Billing Test User",
        role: "user",
        createdAt: new Date(),
      },
      req: {
        headers: {
          origin: "http://localhost:3000",
        },
      } as any,
      res: {} as any,
    };
  });

  it("should return empty array when no subscription exists", async () => {
    const caller = appRouter.createCaller(testContext);
    const invoices = await caller.billing.getInvoices();
    expect(invoices).toEqual([]);
  });

  it("should return empty array for payment methods when no subscription exists", async () => {
    const caller = appRouter.createCaller(testContext);
    const paymentMethods = await caller.billing.getPaymentMethods();
    expect(paymentMethods).toEqual([]);
  });

  it("should return null for upcoming invoice when no subscription exists", async () => {
    const caller = appRouter.createCaller(testContext);
    const upcomingInvoice = await caller.billing.getUpcomingInvoice();
    expect(upcomingInvoice).toBeNull();
  });

  it("should throw error when creating billing portal session without subscription", async () => {
    const caller = appRouter.createCaller(testContext);
    await expect(caller.billing.createBillingPortalSession()).rejects.toThrow(
      "No Stripe customer found"
    );
  });

  it("should handle subscription with Stripe customer ID", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a subscription with a fake Stripe customer ID
    const subscriptions = await import("../drizzle/schema").then((m) => m.subscriptions);
    await db.insert(subscriptions).values({
      userId: testUserId,
      tier: "pro",
      status: "active",
      stripeCustomerId: "cus_test_fake_customer_id",
      stripeSubscriptionId: "sub_test_fake_subscription_id",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const caller = appRouter.createCaller(testContext);

    // These will fail to fetch from Stripe (since it's a fake ID), but should not throw database errors
    try {
      await caller.billing.getInvoices();
    } catch (error: any) {
      // Expect Stripe API error, not database error
      expect(error.message).toMatch(/No such customer|invalid/i);
    }
  });
});

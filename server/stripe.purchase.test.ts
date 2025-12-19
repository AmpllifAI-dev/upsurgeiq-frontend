import { describe, it, expect, beforeAll } from "vitest";
import { createMediaListPurchaseSession } from "./stripe";
import { ENV } from "./_core/env";

describe("Media List Purchase", () => {
  beforeAll(() => {
    // Ensure Stripe is configured
    if (!ENV.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured for tests");
    }
  });

  it("should create a checkout session for media list purchase", async () => {
    const params = {
      userId: 1,
      userEmail: "test@example.com",
      userName: "Test User",
      mediaListId: 1,
      mediaListName: "Tech Journalists UK",
      amount: 400, // £4 in pence
      origin: "http://localhost:3000",
    };

    const session = await createMediaListPurchaseSession(params);

    // Verify session was created
    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(session.url).toBeDefined();
    
    // Verify session mode is payment (one-time)
    expect(session.mode).toBe("payment");
    
    // Verify metadata
    expect(session.metadata?.payment_type).toBe("media_list_purchase");
    expect(session.metadata?.media_list_id).toBe("1");
    expect(session.metadata?.user_id).toBe("1");
    
    // Verify amount
    expect(session.amount_total).toBe(400);
    
    // Verify redirect URLs
    expect(session.success_url).toContain("/media-lists?purchase=success");
    expect(session.cancel_url).toContain("/media-lists?purchase=canceled");
  });

  it("should include press release ID in metadata when provided", async () => {
    const params = {
      userId: 1,
      userEmail: "test@example.com",
      userName: "Test User",
      mediaListId: 1,
      mediaListName: "Tech Journalists UK",
      pressReleaseId: 5,
      amount: 400,
      origin: "http://localhost:3000",
    };

    const session = await createMediaListPurchaseSession(params);

    expect(session.metadata?.press_release_id).toBe("5");
  });

  it("should handle different amounts correctly", async () => {
    const params = {
      userId: 1,
      userEmail: "test@example.com",
      userName: "Test User",
      mediaListId: 2,
      mediaListName: "Finance Journalists US",
      amount: 800, // £8 for premium list
      origin: "http://localhost:3000",
    };

    const session = await createMediaListPurchaseSession(params);

    expect(session.amount_total).toBe(800);
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { payments, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("Purchased Media Lists", () => {
  let testUserId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get or create test user
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      testUserId = existingUsers[0].id;
    } else {
      throw new Error("No test user found");
    }
  });

  it("should query purchased media list IDs from payments table", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();

    if (!db) return;

    const purchasedPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.userId, testUserId),
          eq(payments.status, "succeeded"),
          eq(payments.paymentType, "media_list_purchase")
        )
      );

    expect(Array.isArray(purchasedPayments)).toBe(true);
  });

  it("should extract media list IDs from payment metadata", async () => {
    const db = await getDb();
    if (!db) return;

    const purchasedPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.userId, testUserId),
          eq(payments.status, "succeeded"),
          eq(payments.paymentType, "media_list_purchase")
        )
      );

    const listIds = purchasedPayments
      .map(p => {
        try {
          const metadata = JSON.parse(p.metadata || "{}");
          return metadata.media_list_id ? parseInt(metadata.media_list_id) : null;
        } catch {
          return null;
        }
      })
      .filter((id): id is number => id !== null);

    expect(Array.isArray(listIds)).toBe(true);
  });

  it("should handle empty purchased lists gracefully", async () => {
    const db = await getDb();
    if (!db) return;

    // Query for a non-existent user
    const purchasedPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.userId, 999999),
          eq(payments.status, "succeeded"),
          eq(payments.paymentType, "media_list_purchase")
        )
      );

    expect(purchasedPayments).toEqual([]);
  });
});

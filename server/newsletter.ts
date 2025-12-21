import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "./db";
import { newsletterSubscribers } from "../drizzle/schema";

export async function subscribeToNewsletter(email: string, source?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already subscribed
  const existing = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].status === "unsubscribed") {
      // Resubscribe
      await db
        .update(newsletterSubscribers)
        .set({
          status: "active",
          subscribedAt: new Date(),
        })
        .where(eq(newsletterSubscribers.id, existing[0].id));
      return { success: true, resubscribed: true };
    }
    return { success: false, error: "Already subscribed" };
  }

  // Create new subscriber
  await db.insert(newsletterSubscribers).values({
    email,
    status: "active",
    source: source || "website",
    subscribedAt: new Date(),
  });

  return { success: true, resubscribed: false };
}

export async function unsubscribeFromNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(newsletterSubscribers)
    .set({
      status: "unsubscribed",
      unsubscribedAt: new Date(),
    })
    .where(eq(newsletterSubscribers.email, email));

  return { success: true };
}

export async function getAllSubscribers(status?: "active" | "unsubscribed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const query = status
    ? db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, status))
        .orderBy(desc(newsletterSubscribers.subscribedAt))
    : db
        .select()
        .from(newsletterSubscribers)
        .orderBy(desc(newsletterSubscribers.subscribedAt));

  return await query;
}

export async function getSubscriberStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const stats = await db
    .select({
      status: newsletterSubscribers.status,
      count: sql<number>`count(*)`,
    })
    .from(newsletterSubscribers)
    .groupBy(newsletterSubscribers.status);

  const total = stats.reduce((acc, s) => acc + Number(s.count), 0);
  const active = stats.find((s) => s.status === "active")?.count || 0;
  const unsubscribed = stats.find((s) => s.status === "unsubscribed")?.count || 0;

  return {
    total,
    active: Number(active),
    unsubscribed: Number(unsubscribed),
  };
}

export async function deleteSubscriber(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(newsletterSubscribers)
    .where(eq(newsletterSubscribers.id, id));

  return { success: true };
}

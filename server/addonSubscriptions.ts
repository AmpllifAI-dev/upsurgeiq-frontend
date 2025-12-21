import { getDb } from "./db";
import { addonSubscriptions, aiCreditsUsage, aiUsageLog } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Create or update add-on subscription from Stripe webhook
 */
export async function upsertAddonSubscription(data: {
  userId: number;
  addonType: "aiChat" | "aiCallIn" | "intelligentCampaignLab";
  status: "active" | "canceled" | "past_due";
  stripeSubscriptionId: string;
  stripePriceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if subscription already exists
  const existing = await db
    .select()
    .from(addonSubscriptions)
    .where(eq(addonSubscriptions.stripeSubscriptionId, data.stripeSubscriptionId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing subscription
    await db
      .update(addonSubscriptions)
      .set({
        status: data.status,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ? 1 : 0,
        updatedAt: new Date(),
      })
      .where(eq(addonSubscriptions.id, existing[0].id));

    return existing[0].id;
  } else {
    // Create new subscription
    const result = await db.insert(addonSubscriptions).values({
      userId: data.userId,
      addonType: data.addonType,
      status: data.status,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ? 1 : 0,
    });

    const subscriptionId = Number((result as any).insertId || 0);

    // Initialize credits usage for AI Chat and AI Call-in
    if (data.addonType === "aiChat" || data.addonType === "aiCallIn") {
      await initializeCreditsUsage({
        userId: data.userId,
        addonType: data.addonType,
        periodStart: data.currentPeriodStart,
        periodEnd: data.currentPeriodEnd,
      });
    }

    return subscriptionId;
  }
}

/**
 * Get user's active add-on subscriptions
 */
export async function getUserAddonSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(addonSubscriptions)
    .where(
      and(
        eq(addonSubscriptions.userId, userId),
        eq(addonSubscriptions.status, "active")
      )
    );
}

/**
 * Initialize credits usage for a new billing period
 */
export async function initializeCreditsUsage(data: {
  userId: number;
  addonType: "aiChat" | "aiCallIn";
  periodStart: Date;
  periodEnd: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const creditsTotal = 32; // Both AI Chat and AI Call-in get 32 credits/month

  await db.insert(aiCreditsUsage).values({
    userId: data.userId,
    addonType: data.addonType,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    creditsTotal,
    creditsUsed: 0,
    creditsRemaining: creditsTotal,
  });
}

/**
 * Get current credits usage for a user
 */
export async function getCurrentCreditsUsage(userId: number) {
  const db = await getDb();
  if (!db) return { aiChat: null, aiCallIn: null };

  const now = new Date();

  // Get current period usage for AI Chat
  const aiChatUsage = await db
    .select()
    .from(aiCreditsUsage)
    .where(
      and(
        eq(aiCreditsUsage.userId, userId),
        eq(aiCreditsUsage.addonType, "aiChat")
      )
    )
    .orderBy(aiCreditsUsage.periodStart)
    .limit(1);

  // Get current period usage for AI Call-in
  const aiCallInUsage = await db
    .select()
    .from(aiCreditsUsage)
    .where(
      and(
        eq(aiCreditsUsage.userId, userId),
        eq(aiCreditsUsage.addonType, "aiCallIn")
      )
    )
    .orderBy(aiCreditsUsage.periodStart)
    .limit(1);

  return {
    aiChat: aiChatUsage.length > 0 && aiChatUsage[0].periodEnd > now ? aiChatUsage[0] : null,
    aiCallIn: aiCallInUsage.length > 0 && aiCallInUsage[0].periodEnd > now ? aiCallInUsage[0] : null,
  };
}

/**
 * Log AI usage and decrement credits
 */
export async function logAiUsage(data: {
  userId: number;
  addonType: "aiChat" | "aiCallIn";
  action: string;
  creditsConsumed?: number;
  metadata?: Record<string, any>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const creditsConsumed = data.creditsConsumed || 1;

  // Log the usage
  await db.insert(aiUsageLog).values({
    userId: data.userId,
    addonType: data.addonType,
    action: data.action,
    creditsConsumed,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  });

  // Update credits usage
  const now = new Date();
  const currentUsage = await db
    .select()
    .from(aiCreditsUsage)
    .where(
      and(
        eq(aiCreditsUsage.userId, data.userId),
        eq(aiCreditsUsage.addonType, data.addonType)
      )
    )
    .orderBy(aiCreditsUsage.periodStart)
    .limit(1);

  if (currentUsage.length > 0 && currentUsage[0].periodEnd > now) {
    const newUsed = currentUsage[0].creditsUsed + creditsConsumed;
    const newRemaining = Math.max(0, currentUsage[0].creditsTotal - newUsed);

    await db
      .update(aiCreditsUsage)
      .set({
        creditsUsed: newUsed,
        creditsRemaining: newRemaining,
        updatedAt: new Date(),
      })
      .where(eq(aiCreditsUsage.id, currentUsage[0].id));
  }
}

/**
 * Cancel add-on subscription
 */
export async function cancelAddonSubscription(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(addonSubscriptions)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(addonSubscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

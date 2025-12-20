import { getDb } from "./db";
import { usageTracking, subscriptions } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";

// Tier limits
// Note: AI chat limits reduced for fair usage policy (see fair usage documentation)
export const TIER_LIMITS = {
  starter: {
    pressReleases: 10,
    socialPosts: 20,
    campaigns: 5,
    distributions: 50,
    aiImages: 10,
    aiChatMessages: 50, // Reduced from 100 for cost control
  },
  pro: {
    pressReleases: 50,
    socialPosts: 100,
    campaigns: 20,
    distributions: 500,
    aiImages: 50,
    aiChatMessages: 200, // Reduced from 1000 for cost control
  },
  scale: {
    pressReleases: -1, // Unlimited
    socialPosts: -1,
    campaigns: -1,
    distributions: -1,
    aiImages: -1,
    aiChatMessages: 500, // Cap at 500 for fair usage (was unlimited)
  },
};

export async function getCurrentUsage(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const { eq, and } = await import("drizzle-orm");
  
  // Get current period (YYYY-MM)
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [usage] = await db
    .select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.period, period)
      )
    )
    .limit(1);

  if (!usage) {
    // Create new usage record for this period
    const [newUsage] = await db
      .insert(usageTracking)
      .values({
        userId,
        period,
        pressReleasesCreated: 0,
        socialPostsCreated: 0,
        campaignsCreated: 0,
        distributionsSent: 0,
        aiImagesGenerated: 0,
        aiChatMessages: 0,
      })
      .$returningId();

    return {
      id: newUsage.id,
      userId,
      period,
      pressReleasesCreated: 0,
      socialPostsCreated: 0,
      campaignsCreated: 0,
      distributionsSent: 0,
      aiImagesGenerated: 0,
      aiChatMessages: 0,
    };
  }

  return usage;
}

export async function checkLimit(
  userId: number,
  feature: keyof typeof TIER_LIMITS.starter
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  const { eq } = await import("drizzle-orm");

  // Get user's subscription tier
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!subscription) {
    throw new TRPCError({ code: "FORBIDDEN", message: "No active subscription found" });
  }

  const tierLimits = TIER_LIMITS[subscription.plan];
  const limit = tierLimits[feature];

  // Unlimited for Scale tier
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1 };
  }

  // Get current usage
  const usage = await getCurrentUsage(userId);
  if (!usage) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get usage data" });
  }

  // Map feature to usage field
  const usageFieldMap: Record<string, keyof typeof usage> = {
    pressReleases: "pressReleasesCreated",
    socialPosts: "socialPostsCreated",
    campaigns: "campaignsCreated",
    distributions: "distributionsSent",
    aiImages: "aiImagesGenerated",
    aiChatMessages: "aiChatMessages",
  };

  const usageField = usageFieldMap[feature];
  const current = usage[usageField] as number || 0;

  return {
    allowed: current < limit,
    current,
    limit,
  };
}

export async function incrementUsage(
  userId: number,
  feature: keyof typeof TIER_LIMITS.starter
) {
  const db = await getDb();
  if (!db) return;

  const { eq, and, sql } = await import("drizzle-orm");
  
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Map feature to usage field
  const usageFieldMap: Record<string, string> = {
    pressReleases: "pressReleasesCreated",
    socialPosts: "socialPostsCreated",
    campaigns: "campaignsCreated",
    distributions: "distributionsSent",
    aiImages: "aiImagesGenerated",
    aiChatMessages: "aiChatMessages",
  };

  const field = usageFieldMap[feature];

  // Ensure usage record exists
  await getCurrentUsage(userId);

  // Increment the specific field
  await db
    .update(usageTracking)
    .set({
      [field]: sql`${usageTracking[field as keyof typeof usageTracking]} + 1`,
    })
    .where(
      and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.period, period)
      )
    );
}

export async function getUserTierLimits(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const { eq } = await import("drizzle-orm");

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!subscription) return null;

  return {
    tier: subscription.plan,
    limits: TIER_LIMITS[subscription.plan],
  };
}

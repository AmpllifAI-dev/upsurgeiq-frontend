import { getDb } from "./db";
import { usageTracking, subscriptions } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";

// Tier limits - Updated December 20, 2025 to match correct specifications
// AI chat, AI call-in, and AI images are ADD-ONS ONLY (not included in base plans)
export const TIER_LIMITS = {
  starter: {
    pressReleases: 2, // Corrected from 10
    socialChannels: 4, // All 4 platforms (Facebook, LinkedIn, Instagram, X)
    mediaLists: 3, // 3 default media lists
    campaigns: 5, // 5 campaigns per month
    // AI features are add-ons only:
    aiImages: 0, // Add-on only (£3.99-24.99 per pack)
    aiChatMessages: 0, // Add-on only (£39/month for 32 messages)
    aiCallInMessages: 0, // Add-on only (£59/month for 32 messages)
  },
  pro: {
    pressReleases: 5, // Corrected from 50
    socialChannels: 4, // All 4 platforms
    mediaLists: 5, // 3 default + 2 optional
    campaigns: 20, // 20 campaigns per month
    // AI features are add-ons only:
    aiImages: 0, // Add-on only
    aiChatMessages: 0, // Add-on only
    aiCallInMessages: 0, // Add-on only
  },
  scale: {
    pressReleases: 15, // Corrected from unlimited
    socialChannels: 4, // All 4 platforms
    mediaLists: 10, // 3 default + 7 optional
    campaigns: -1, // Unlimited (Campaign Lab INCLUDED in Scale)
    // AI features are add-ons only:
    aiImages: 0, // Add-on only
    aiChatMessages: 0, // Add-on only
    aiCallInMessages: 0, // Add-on only
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
    campaigns: "campaignsCreated",
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
    campaigns: "campaignsCreated",
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

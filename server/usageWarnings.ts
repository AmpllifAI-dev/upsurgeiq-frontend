import { getDb } from "./db";
import { getUserSubscription } from "./db";
import { pressReleases, campaigns } from "../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { TIER_LIMITS } from "./usageTracking";
import { getAvailableWordCountCredits, getAvailableImageCredits } from "./addOnCredits";

/**
 * Usage Warning System
 * 
 * Calculates and returns warnings when users approach 80% of their tier limits
 */

export interface UsageWarning {
  feature: string;
  current: number;
  limit: number;
  percentage: number;
  shouldWarn: boolean;
  message: string;
}

export interface UsageWarnings {
  pressReleases: UsageWarning;
  campaigns: UsageWarning;
  aiChatMessages: UsageWarning;
  images: UsageWarning;
  hasWarnings: boolean;
}

/**
 * Get current month's usage for a user
 */
async function getCurrentMonthUsage(userId: number) {
  const db = await getDb();
  if (!db) return { pressReleases: 0, campaigns: 0, images: 0 };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Count press releases this month
  const [prCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(pressReleases)
    .where(
      and(
        eq(pressReleases.userId, userId),
        gte(pressReleases.createdAt, startOfMonth)
      )
    );

  // Count campaigns this month
  const [campaignCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.userId, userId),
        gte(campaigns.createdAt, startOfMonth)
      )
    );

  // Count images this month (from press releases)
  const [imageCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(pressReleases)
    .where(
      and(
        eq(pressReleases.userId, userId),
        gte(pressReleases.createdAt, startOfMonth),
        sql`${pressReleases.imageUrl} IS NOT NULL`
      )
    );

  return {
    pressReleases: Number(prCount?.count || 0),
    campaigns: Number(campaignCount?.count || 0),
    images: Number(imageCount?.count || 0),
  };
}

/**
 * Create usage warning object
 */
function createWarning(
  feature: string,
  current: number,
  limit: number,
  warningThreshold: number = 0.8
): UsageWarning {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const shouldWarn = percentage >= warningThreshold * 100;

  let message = "";
  if (shouldWarn) {
    const remaining = Math.max(0, limit - current);
    message = `You've used ${current} of ${limit} ${feature}. ${remaining} remaining this month.`;
  }

  return {
    feature,
    current,
    limit,
    percentage: Math.round(percentage),
    shouldWarn,
    message,
  };
}

/**
 * Get all usage warnings for a user
 */
export async function getUserUsageWarnings(userId: number): Promise<UsageWarnings> {
  // Get user's subscription tier
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error("No active subscription found");
  }

  const tierLimits = TIER_LIMITS[subscription.plan];
  const usage = await getCurrentMonthUsage(userId);

  // Get purchased credits
  const purchasedWords = await getAvailableWordCountCredits(userId);
  const purchasedImages = await getAvailableImageCredits(userId);

  // Calculate warnings (80% threshold)
  const warnings: UsageWarnings = {
    pressReleases: createWarning(
      "press releases",
      usage.pressReleases,
      tierLimits.pressReleases
    ),
    campaigns: createWarning(
      "campaigns",
      usage.campaigns,
      tierLimits.campaigns
    ),
    aiChatMessages: createWarning(
      "AI chat messages",
      0, // TODO: Implement chat message tracking
      tierLimits.aiChatMessages
    ),
    images: createWarning(
      "images",
      usage.images,
      tierLimits.aiImages + purchasedImages
    ),
    hasWarnings: false,
  };

  // Check if any warnings should be shown
  warnings.hasWarnings =
    warnings.pressReleases.shouldWarn ||
    warnings.campaigns.shouldWarn ||
    warnings.aiChatMessages.shouldWarn ||
    warnings.images.shouldWarn;

  return warnings;
}

/**
 * Check if user has exceeded any limits
 */
export async function hasExceededLimits(userId: number): Promise<{
  exceeded: boolean;
  limits: {
    pressReleases: boolean;
    campaigns: boolean;
    aiChatMessages: boolean;
    images: boolean;
  };
}> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error("No active subscription found");
  }

  const tierLimits = TIER_LIMITS[subscription.plan];
  const usage = await getCurrentMonthUsage(userId);
  const purchasedImages = await getAvailableImageCredits(userId);

  const limits = {
    pressReleases: usage.pressReleases >= tierLimits.pressReleases,
    campaigns: usage.campaigns >= tierLimits.campaigns,
    aiChatMessages: false, // TODO: Implement chat message tracking
    images: usage.images >= tierLimits.aiImages + purchasedImages,
  };

  return {
    exceeded: Object.values(limits).some((exceeded) => exceeded),
    limits,
  };
}

/**
 * Get usage summary for dashboard
 */
export async function getUsageSummary(userId: number): Promise<{
  tier: string;
  usage: {
    pressReleases: { current: number; limit: number; percentage: number };
    campaigns: { current: number; limit: number; percentage: number };
    aiChatMessages: { current: number; limit: number; percentage: number };
    images: { current: number; limit: number; percentage: number };
  };
  purchasedCredits: {
    words: number;
    images: number;
  };
}> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error("No active subscription found");
  }

  const tierLimits = TIER_LIMITS[subscription.plan];
  const usage = await getCurrentMonthUsage(userId);
  const purchasedWords = await getAvailableWordCountCredits(userId);
  const purchasedImages = await getAvailableImageCredits(userId);

  const calculatePercentage = (current: number, limit: number) =>
    limit > 0 ? Math.round((current / limit) * 100) : 0;

  return {
    tier: subscription.plan,
    usage: {
      pressReleases: {
        current: usage.pressReleases,
        limit: tierLimits.pressReleases,
        percentage: calculatePercentage(usage.pressReleases, tierLimits.pressReleases),
      },
      campaigns: {
        current: usage.campaigns,
        limit: tierLimits.campaigns,
        percentage: calculatePercentage(usage.campaigns, tierLimits.campaigns),
      },
      aiChatMessages: {
        current: 0, // TODO: Implement chat message tracking
        limit: tierLimits.aiChatMessages,
        percentage: 0,
      },
      images: {
        current: usage.images,
        limit: tierLimits.aiImages + purchasedImages,
        percentage: calculatePercentage(usage.images, tierLimits.aiImages + purchasedImages),
      },
    },
    purchasedCredits: {
      words: purchasedWords,
      images: purchasedImages,
    },
  };
}

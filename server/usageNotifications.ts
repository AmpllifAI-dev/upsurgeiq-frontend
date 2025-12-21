import { getDb, getUserSubscription } from "./db";
import { pressReleases, campaigns, users } from "../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

/**
 * Tier limits for different subscription plans
 */
const TIER_LIMITS = {
  starter: { pressReleases: 2, campaigns: 5 },
  pro: { pressReleases: 5, campaigns: 20 },
  scale: { pressReleases: 15, campaigns: Infinity },
};

/**
 * Get usage for the current billing period
 */
async function getCurrentPeriodUsage(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return { pressReleases: 0, campaigns: 0 };
  }

  // Get start of current billing period
  const periodStart = subscription.currentPeriodStart || new Date();

  // Count press releases in current period
  const prCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(pressReleases)
    .where(
      and(
        eq(pressReleases.userId, userId),
        gte(pressReleases.createdAt, periodStart)
      )
    );

  // Count campaigns in current period
  const campaignCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.userId, userId),
        gte(campaigns.createdAt, periodStart)
      )
    );

  return {
    pressReleases: Number(prCount[0]?.count) || 0,
    campaigns: Number(campaignCount[0]?.count) || 0,
  };
}

/**
 * Check if user has reached a usage threshold and send notification
 */
export async function checkUsageThresholds(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return;
  }

  const tier = subscription.plan as "starter" | "pro" | "scale";
  const limits = TIER_LIMITS[tier];
  const usage = await getCurrentPeriodUsage(userId);

  // Get user info
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return;
  }

  const userName = user[0].name || user[0].email || "User";

  // Check press releases usage
  if (limits.pressReleases !== Infinity) {
    const prPercentage = (usage.pressReleases / limits.pressReleases) * 100;

    if (prPercentage >= 100) {
      await notifyOwner({
        title: `Usage Limit Reached: ${userName}`,
        content: `User ${userName} (ID: ${userId}) has reached their press release limit for the ${tier} tier.\n\nUsage: ${usage.pressReleases}/${limits.pressReleases} press releases\n\nThey may need to upgrade to continue using the service.`,
      });
    } else if (prPercentage >= 90) {
      await notifyOwner({
        title: `Usage Warning (90%): ${userName}`,
        content: `User ${userName} (ID: ${userId}) has used 90% of their press release allocation for the ${tier} tier.\n\nUsage: ${usage.pressReleases}/${limits.pressReleases} press releases\n\nConsider reaching out to suggest an upgrade.`,
      });
    } else if (prPercentage >= 80) {
      await notifyOwner({
        title: `Usage Alert (80%): ${userName}`,
        content: `User ${userName} (ID: ${userId}) has used 80% of their press release allocation for the ${tier} tier.\n\nUsage: ${usage.pressReleases}/${limits.pressReleases} press releases`,
      });
    }
  }

  // Check campaigns usage
  if (limits.campaigns !== Infinity) {
    const campaignPercentage = (usage.campaigns / limits.campaigns) * 100;

    if (campaignPercentage >= 100) {
      await notifyOwner({
        title: `Campaign Limit Reached: ${userName}`,
        content: `User ${userName} (ID: ${userId}) has reached their campaign limit for the ${tier} tier.\n\nUsage: ${usage.campaigns}/${limits.campaigns} campaigns\n\nThey may need to upgrade to continue using Campaign Lab.`,
      });
    } else if (campaignPercentage >= 90) {
      await notifyOwner({
        title: `Campaign Warning (90%): ${userName}`,
        content: `User ${userName} (ID: ${userId}) has used 90% of their campaign allocation for the ${tier} tier.\n\nUsage: ${usage.campaigns}/${limits.campaigns} campaigns\n\nConsider reaching out to suggest an upgrade.`,
      });
    } else if (campaignPercentage >= 80) {
      await notifyOwner({
        title: `Campaign Alert (80%): ${userName}`,
        content: `User ${userName} (ID: ${userId}) has used 80% of their campaign allocation for the ${tier} tier.\n\nUsage: ${usage.campaigns}/${limits.campaigns} campaigns`,
      });
    }
  }
}

/**
 * Check usage thresholds for all active users
 */
export async function checkAllUsersUsageThresholds(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all users with active subscriptions
  const activeUsers = await db
    .select({ userId: users.id })
    .from(users);

  console.log(`[UsageNotifications] Checking usage for ${activeUsers.length} users`);

  for (const { userId } of activeUsers) {
    try {
      await checkUsageThresholds(userId);
    } catch (error) {
      console.error(`[UsageNotifications] Error checking usage for user ${userId}:`, error);
    }
  }

  console.log(`[UsageNotifications] Usage check completed`);
}

/**
 * Get usage summary for a user
 */
export async function getUserUsageSummary(userId: number) {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return null;
  }

  const tier = subscription.plan as "starter" | "pro" | "scale";
  const limits = TIER_LIMITS[tier];
  const usage = await getCurrentPeriodUsage(userId);

  return {
    tier,
    usage,
    limits,
    percentages: {
      pressReleases: limits.pressReleases === Infinity 
        ? 0 
        : (usage.pressReleases / limits.pressReleases) * 100,
      campaigns: limits.campaigns === Infinity 
        ? 0 
        : (usage.campaigns / limits.campaigns) * 100,
    },
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
  };
}

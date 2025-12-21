import { getDb } from "./db";
import { users, addonSubscriptions, aiCreditsUsage, aiUsageLog } from "../drizzle/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { createLogger } from "./_core/logger";

const logger = createLogger("AdminCreditManagement");

/**
 * Get all users' credit usage for admin dashboard
 */
export async function getAllUsersCreditsUsage() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get all users with their add-on subscriptions and credit usage
  const usersWithCredits = await db
    .select({
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      addonType: addonSubscriptions.addonType,
      addonStatus: addonSubscriptions.status,
      creditsTotal: aiCreditsUsage.creditsTotal,
      creditsUsed: aiCreditsUsage.creditsUsed,
      creditsRemaining: aiCreditsUsage.creditsRemaining,
    })
    .from(users)
    .leftJoin(addonSubscriptions, eq(users.id, addonSubscriptions.userId))
    .leftJoin(
      aiCreditsUsage,
      and(
        eq(users.id, aiCreditsUsage.userId),
        eq(addonSubscriptions.addonType, aiCreditsUsage.addonType)
      )
    )
    .where(eq(addonSubscriptions.status, "active"));

  // Group by user
  const userMap = new Map<
    number,
    {
      userId: number;
      userName: string;
      userEmail: string;
      aiChatEnabled: boolean;
      aiChatTotal: number;
      aiChatUsed: number;
      aiChatRemaining: number;
      aiCallInEnabled: boolean;
      aiCallInTotal: number;
      aiCallInUsed: number;
      aiCallInRemaining: number;
    }
  >();

  for (const row of usersWithCredits) {
    if (!userMap.has(row.userId)) {
      userMap.set(row.userId, {
        userId: row.userId,
        userName: (row.userName || "Unknown") as string,
        userEmail: (row.userEmail || "") as string,
        aiChatEnabled: false,
        aiChatTotal: 0,
        aiChatUsed: 0,
        aiChatRemaining: 0,
        aiCallInEnabled: false,
        aiCallInTotal: 0,
        aiCallInUsed: 0,
        aiCallInRemaining: 0,
      });
    }

    const user = userMap.get(row.userId)!;

    if (row.addonType === "aiChat") {
      user.aiChatEnabled = true;
      user.aiChatTotal = row.creditsTotal || 0;
      user.aiChatUsed = row.creditsUsed || 0;
      user.aiChatRemaining = row.creditsRemaining || 0;
    } else if (row.addonType === "aiCallIn") {
      user.aiCallInEnabled = true;
      user.aiCallInTotal = row.creditsTotal || 0;
      user.aiCallInUsed = row.creditsUsed || 0;
      user.aiCallInRemaining = row.creditsRemaining || 0;
    }
  }

  return Array.from(userMap.values());
}

/**
 * Get credit usage statistics
 */
export async function getCreditUsageStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Count active users with add-ons
  const [activeUsersResult] = await db
    .select({ count: sql<number>`count(distinct ${addonSubscriptions.userId})` })
    .from(addonSubscriptions)
    .where(eq(addonSubscriptions.status, "active"));

  // Sum total AI Chat credits used
  const [aiChatUsedResult] = await db
    .select({ total: sql<number>`sum(${aiCreditsUsage.creditsUsed})` })
    .from(aiCreditsUsage)
    .where(eq(aiCreditsUsage.addonType, "aiChat"));

  // Sum total AI Call-in credits used
  const [aiCallInUsedResult] = await db
    .select({ total: sql<number>`sum(${aiCreditsUsage.creditsUsed})` })
    .from(aiCreditsUsage)
    .where(eq(aiCreditsUsage.addonType, "aiCallIn"));

  return {
    totalActiveUsers: Number(activeUsersResult?.count || 0),
    totalAiChatUsed: Number(aiChatUsedResult?.total || 0),
    totalAiCallInUsed: Number(aiCallInUsedResult?.total || 0),
  };
}

/**
 * Manually adjust user's credits (admin only)
 */
export async function adjustUserCredits(params: {
  userId: number;
  addonType: "aiChat" | "aiCallIn";
  amount: number; // Positive to add, negative to subtract
  adminNote?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get current usage
  const [currentUsage] = await db
    .select()
    .from(aiCreditsUsage)
    .where(
      and(
        eq(aiCreditsUsage.userId, params.userId),
        eq(aiCreditsUsage.addonType, params.addonType)
      )
    )
    .limit(1);

  if (!currentUsage) {
    throw new Error("User does not have this add-on subscription");
  }

  // Calculate new values
  const newUsed = Math.max(0, currentUsage.creditsUsed + params.amount);
  const newRemaining = currentUsage.creditsTotal - newUsed;

  // Update credits
  await db
    .update(aiCreditsUsage)
    .set({
      creditsUsed: newUsed,
      creditsRemaining: newRemaining,
      updatedAt: new Date(),
    })
    .where(eq(aiCreditsUsage.id, currentUsage.id));

  // Log the adjustment
  await db.insert(aiUsageLog).values({
    userId: params.userId,
    addonType: params.addonType,
    action: "admin_adjustment",
    creditsConsumed: params.amount,
    metadata: JSON.stringify({
      adminNote: params.adminNote || "Manual adjustment by admin",
      previousUsed: currentUsage.creditsUsed,
      newUsed,
    }),
  });

  logger.info("Credits adjusted by admin", {
    action: "adjustUserCredits",
    userId: params.userId,
    metadata: {
      addonType: params.addonType,
      amount: params.amount,
      newUsed,
      newRemaining,
    },
  });

  return {
    success: true,
    newUsed,
    newRemaining,
  };
}

/**
 * Export credit usage to CSV
 */
export async function exportCreditUsageToCSV() {
  const usersData = await getAllUsersCreditsUsage();

  // Create CSV header
  const headers = [
    "User ID",
    "Name",
    "Email",
    "AI Chat Enabled",
    "AI Chat Total",
    "AI Chat Used",
    "AI Chat Remaining",
    "AI Call-in Enabled",
    "AI Call-in Total",
    "AI Call-in Used",
    "AI Call-in Remaining",
  ];

  // Create CSV rows
  const rows = usersData.map((user) => [
    user.userId,
    user.userName,
    user.userEmail,
    user.aiChatEnabled ? "Yes" : "No",
    user.aiChatTotal,
    user.aiChatUsed,
    user.aiChatRemaining,
    user.aiCallInEnabled ? "Yes" : "No",
    user.aiCallInTotal,
    user.aiCallInUsed,
    user.aiCallInRemaining,
  ]);

  // Combine into CSV string
  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csv;
}

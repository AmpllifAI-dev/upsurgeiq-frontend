import { getDb } from "./db";
import { activityLogs } from "../drizzle/schema";

interface LogActivityParams {
  userId: number;
  action: string;
  entityType?: string;
  entityId?: number;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity(params: LogActivityParams) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(activityLogs).values({
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      description: params.description,
      metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  } catch (error) {
    console.error("[Activity Log] Failed to log activity:", error);
  }
}

export async function getActivityLogs(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const { desc } = await import("drizzle-orm");
  const { eq } = await import("drizzle-orm");

  return await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export async function getRecentActivity(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];

  const { desc, gte, and, eq } = await import("drizzle-orm");
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.setDate(cutoffDate.getDate() - days));

  return await db
    .select()
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.userId, userId),
        gte(activityLogs.createdAt, cutoffDate)
      )
    )
    .orderBy(desc(activityLogs.createdAt))
    .limit(100);
}

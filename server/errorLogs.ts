import { desc, eq, and, gte, sql } from "drizzle-orm";
import { getDb } from "./db";
import { errorLogs, type ErrorLog, type InsertErrorLog } from "../drizzle/schema";

/**
 * Get recent error logs with optional filtering
 */
export async function getErrorLogs(params?: {
  limit?: number;
  level?: "info" | "warn" | "error" | "debug";
  userId?: number;
  component?: string;
  since?: Date;
}): Promise<ErrorLog[]> {
  const db = await getDb();
  if (!db) return [];

  const { limit = 100, level, userId, component, since } = params || {};

  let query = db.select().from(errorLogs);

  // Build where conditions
  const conditions = [];
  if (level) conditions.push(eq(errorLogs.level, level));
  if (userId) conditions.push(eq(errorLogs.userId, userId));
  if (component) conditions.push(eq(errorLogs.component, component));
  if (since) conditions.push(gte(errorLogs.createdAt, since));

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const logs = await query
    .orderBy(desc(errorLogs.createdAt))
    .limit(limit);

  return logs;
}

/**
 * Get error statistics for dashboard
 */
export async function getErrorStats(since?: Date): Promise<{
  total: number;
  byLevel: Record<string, number>;
  byComponent: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) {
    return { total: 0, byLevel: {}, byComponent: {} };
  }

  const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(errorLogs)
    .where(gte(errorLogs.createdAt, sinceDate));

  const total = totalResult[0]?.count || 0;

  // Get counts by level
  const byLevelResult = await db
    .select({
      level: errorLogs.level,
      count: sql<number>`count(*)`,
    })
    .from(errorLogs)
    .where(gte(errorLogs.createdAt, sinceDate))
    .groupBy(errorLogs.level);

  const byLevel: Record<string, number> = {};
  byLevelResult.forEach((row) => {
    byLevel[row.level] = row.count;
  });

  // Get counts by component
  const byComponentResult = await db
    .select({
      component: errorLogs.component,
      count: sql<number>`count(*)`,
    })
    .from(errorLogs)
    .where(and(
      gte(errorLogs.createdAt, sinceDate),
      sql`${errorLogs.component} IS NOT NULL`
    ))
    .groupBy(errorLogs.component);

  const byComponent: Record<string, number> = {};
  byComponentResult.forEach((row) => {
    if (row.component) {
      byComponent[row.component] = row.count;
    }
  });

  return { total, byLevel, byComponent };
}

/**
 * Delete old error logs (for cleanup)
 */
export async function deleteOldErrorLogs(olderThan: Date): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  await db
    .delete(errorLogs)
    .where(sql`${errorLogs.createdAt} < ${olderThan}`);

  return 0; // Return value not critical for cleanup operation
}

/**
 * Get error log by ID
 */
export async function getErrorLogById(id: number): Promise<ErrorLog | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(errorLogs)
    .where(eq(errorLogs.id, id))
    .limit(1);

  return result[0];
}

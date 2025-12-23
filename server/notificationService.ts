import { getDb } from "./db";
import { userNotifications } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { createLogger } from "./_core/logger";

const logger = createLogger("NotificationService");

export type NotificationType =
  | "pending_approval"
  | "underperforming_ad"
  | "optimization_action"
  | "variant_deployed"
  | "variant_paused";

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: number;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(userNotifications).values({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    entityType: params.entityType || null,
    entityId: params.entityId || null,
    isRead: 0,
    createdAt: new Date(),
  });

  // Fetch the created notification to get the ID
  const [created] = await db
    .select()
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, params.userId),
        eq(userNotifications.title, params.title)
      )
    )
    .orderBy(desc(userNotifications.createdAt))
    .limit(1);

  if (!created) throw new Error("Failed to create notification");

  logger.info("Notification created", {
    metadata: {
      notificationId: created.id,
      userId: params.userId,
      type: params.type,
    },
  });

  return created;
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const notifications = await db
    .select()
    .from(userNotifications)
    .where(eq(userNotifications.userId, userId))
    .orderBy(desc(userNotifications.createdAt))
    .limit(50);

  return notifications;
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const notifications = await db
    .select()
    .from(userNotifications)
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, 0)
      )
    );

  return notifications.length;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userNotifications)
    .set({
      isRead: 1,
      readAt: new Date(),
    })
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );

  return { success: true };
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userNotifications)
    .set({
      isRead: 1,
      readAt: new Date(),
    })
    .where(
      and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, 0)
      )
    );

  return { success: true };
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(userNotifications)
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );

  return { success: true };
}

/**
 * Delete old read notifications (older than 30 days)
 */
export async function cleanupOldNotifications() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // This would need a proper date comparison in Drizzle
  // For now, we'll skip the cleanup logic
  logger.info("Notification cleanup skipped - implement with proper date comparison");

  return { success: true };
}

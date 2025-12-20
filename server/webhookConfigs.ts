/**
 * Database helper functions for webhook configurations
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import {
  webhookConfigs,
  webhookDeliveryLogs,
  type WebhookConfig,
  type InsertWebhookConfig,
  type WebhookDeliveryLog,
  type InsertWebhookDeliveryLog,
} from "../drizzle/schema";

/**
 * Get all webhook configurations
 */
export async function getWebhookConfigs(): Promise<WebhookConfig[]> {
  const db = await getDb();
  if (!db) return [];

  const configs = await db.select().from(webhookConfigs);
  return configs;
}

/**
 * Get active webhook configurations by event type
 */
export async function getActiveWebhooksByEvent(
  eventType: "user.registered" | "user.onboarded" | "social_media.post_created"
): Promise<WebhookConfig[]> {
  const db = await getDb();
  if (!db) return [];

  const configs = await db
    .select()
    .from(webhookConfigs)
    .where(and(eq(webhookConfigs.eventType, eventType), eq(webhookConfigs.isActive, 1)));

  return configs;
}

/**
 * Get webhook configuration by ID
 */
export async function getWebhookConfigById(id: number): Promise<WebhookConfig | null> {
  const db = await getDb();
  if (!db) return null;

  const configs = await db.select().from(webhookConfigs).where(eq(webhookConfigs.id, id)).limit(1);

  return configs[0] || null;
}

/**
 * Create webhook configuration
 */
export async function createWebhookConfig(data: InsertWebhookConfig): Promise<WebhookConfig | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(webhookConfigs).values(data);
  const insertId = Number(result[0].insertId);

  return getWebhookConfigById(insertId);
}

/**
 * Update webhook configuration
 */
export async function updateWebhookConfig(
  id: number,
  data: Partial<InsertWebhookConfig>
): Promise<WebhookConfig | null> {
  const db = await getDb();
  if (!db) return null;

  await db.update(webhookConfigs).set(data).where(eq(webhookConfigs.id, id));

  return getWebhookConfigById(id);
}

/**
 * Delete webhook configuration
 */
export async function deleteWebhookConfig(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(webhookConfigs).where(eq(webhookConfigs.id, id));
  return true;
}

/**
 * Log webhook delivery attempt
 */
export async function logWebhookDelivery(data: InsertWebhookDeliveryLog): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.insert(webhookDeliveryLogs).values(data);
  return true;
}

/**
 * Get webhook delivery logs for a configuration
 */
export async function getWebhookDeliveryLogs(
  webhookConfigId: number,
  limit: number = 50
): Promise<WebhookDeliveryLog[]> {
  const db = await getDb();
  if (!db) return [];

  const logs = await db
    .select()
    .from(webhookDeliveryLogs)
    .where(eq(webhookDeliveryLogs.webhookConfigId, webhookConfigId))
    .orderBy(webhookDeliveryLogs.createdAt)
    .limit(limit);

  return logs;
}

/**
 * Get recent webhook delivery logs (all configs)
 */
export async function getRecentWebhookLogs(limit: number = 100): Promise<WebhookDeliveryLog[]> {
  const db = await getDb();
  if (!db) return [];

  const logs = await db
    .select()
    .from(webhookDeliveryLogs)
    .orderBy(webhookDeliveryLogs.createdAt)
    .limit(limit);

  return logs;
}

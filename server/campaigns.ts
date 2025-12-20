import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  campaigns,
  Campaign,
  InsertCampaign,
  campaignVariants,
  CampaignVariant,
  InsertCampaignVariant,
} from "../drizzle/schema";

export async function createCampaign(data: InsertCampaign): Promise<Campaign> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(campaigns).values(data);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create campaign");
  return created[0]!;
}

export async function getCampaignsByBusiness(businessId: number): Promise<Campaign[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.businessId, businessId))
    .orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(id: number): Promise<Campaign | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateCampaign(
  id: number,
  updates: Partial<InsertCampaign>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(campaigns).set(updates).where(eq(campaigns.id, id));
}

export async function deleteCampaign(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(campaigns).where(eq(campaigns.id, id));
}

export async function createCampaignVariant(
  data: InsertCampaignVariant
): Promise<CampaignVariant> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(campaignVariants).values(data);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create campaign variant");
  return created[0]!;
}

export async function getVariantsByCampaign(campaignId: number): Promise<CampaignVariant[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.campaignId, campaignId))
    .orderBy(desc(campaignVariants.createdAt));
}

export async function updateCampaignVariant(
  id: number,
  updates: Partial<InsertCampaignVariant>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(campaignVariants).set(updates).where(eq(campaignVariants.id, id));
}

export async function deleteCampaignVariant(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(campaignVariants).where(eq(campaignVariants.id, id));
}

/**
 * Bulk delete campaigns
 */
export async function bulkDeleteCampaigns(ids: number[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { inArray } = await import("drizzle-orm");
  
  const result = await db.delete(campaigns).where(inArray(campaigns.id, ids));
  return result[0].affectedRows || 0;
}

/**
 * Bulk update campaign status
 */
export async function bulkUpdateCampaignStatus(
  ids: number[],
  status: "draft" | "planning" | "active" | "paused" | "completed" | "archived"
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { inArray } = await import("drizzle-orm");
  
  const result = await db
    .update(campaigns)
    .set({ status, updatedAt: new Date() })
    .where(inArray(campaigns.id, ids));
  
  return result[0].affectedRows || 0;
}

// ========================================
// CAMPAIGN MILESTONES
// ========================================

import {
  campaignMilestones,
  CampaignMilestone,
  InsertCampaignMilestone,
  campaignDeliverables,
  CampaignDeliverable,
  InsertCampaignDeliverable,
  campaignAnalytics,
  CampaignAnalytics,
  InsertCampaignAnalytics,
} from "../drizzle/schema";

export async function createMilestone(data: InsertCampaignMilestone): Promise<CampaignMilestone> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(campaignMilestones).values(data);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(campaignMilestones)
    .where(eq(campaignMilestones.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create milestone");
  return created[0]!;
}

export async function getMilestonesByCampaign(campaignId: number): Promise<CampaignMilestone[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(campaignMilestones)
    .where(eq(campaignMilestones.campaignId, campaignId))
    .orderBy(campaignMilestones.dueDate);
}

export async function updateMilestone(
  id: number,
  updates: Partial<InsertCampaignMilestone>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(campaignMilestones).set(updates).where(eq(campaignMilestones.id, id));
}

export async function deleteMilestone(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(campaignMilestones).where(eq(campaignMilestones.id, id));
}

// ========================================
// CAMPAIGN DELIVERABLES
// ========================================

export async function createDeliverable(data: InsertCampaignDeliverable): Promise<CampaignDeliverable> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(campaignDeliverables).values(data);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(campaignDeliverables)
    .where(eq(campaignDeliverables.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create deliverable");
  return created[0]!;
}

export async function getDeliverablesByCampaign(campaignId: number): Promise<CampaignDeliverable[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(campaignDeliverables)
    .where(eq(campaignDeliverables.campaignId, campaignId))
    .orderBy(campaignDeliverables.dueDate);
}

export async function getDeliverablesByMilestone(milestoneId: number): Promise<CampaignDeliverable[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(campaignDeliverables)
    .where(eq(campaignDeliverables.milestoneId, milestoneId))
    .orderBy(campaignDeliverables.dueDate);
}

export async function updateDeliverable(
  id: number,
  updates: Partial<InsertCampaignDeliverable>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(campaignDeliverables).set(updates).where(eq(campaignDeliverables.id, id));
}

export async function deleteDeliverable(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(campaignDeliverables).where(eq(campaignDeliverables.id, id));
}

// ========================================
// CAMPAIGN ANALYTICS
// ========================================

export async function createAnalyticsEntry(data: InsertCampaignAnalytics): Promise<CampaignAnalytics> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(campaignAnalytics).values(data);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(campaignAnalytics)
    .where(eq(campaignAnalytics.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create analytics entry");
  return created[0]!;
}

export async function getAnalyticsByCampaign(campaignId: number): Promise<CampaignAnalytics[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(campaignAnalytics)
    .where(eq(campaignAnalytics.campaignId, campaignId))
    .orderBy(desc(campaignAnalytics.date));
}

export async function getAnalyticsByDateRange(
  campaignId: number,
  startDate: Date,
  endDate: Date
): Promise<CampaignAnalytics[]> {
  const db = await getDb();
  if (!db) return [];

  const { gte, lte } = await import("drizzle-orm");

  return await db
    .select()
    .from(campaignAnalytics)
    .where(
      and(
        eq(campaignAnalytics.campaignId, campaignId),
        gte(campaignAnalytics.date, startDate),
        lte(campaignAnalytics.date, endDate)
      )
    )
    .orderBy(campaignAnalytics.date);
}

export async function updateAnalyticsEntry(
  id: number,
  updates: Partial<InsertCampaignAnalytics>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(campaignAnalytics).set(updates).where(eq(campaignAnalytics.id, id));
}

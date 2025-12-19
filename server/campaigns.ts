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
  status: "draft" | "active" | "paused" | "completed"
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

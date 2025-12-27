import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  campaigns,
  Campaign,
  InsertCampaign,
  campaignVariants,
  CampaignVariant,
  InsertCampaignVariant,
  users,
} from "../drizzle/schema";

/**
 * OPTIMIZED: Get campaigns with variant counts in a single query
 * Eliminates N+1 query problem by using LEFT JOIN and aggregation
 */
export async function getCampaignsWithVariantCounts(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      // Campaign fields
      id: campaigns.id,
      businessId: campaigns.businessId,
      userId: campaigns.userId,
      name: campaigns.name,
      description: campaigns.description,
      goal: campaigns.goal,
      targetAudience: campaigns.targetAudience,
      budget: campaigns.budget,
      status: campaigns.status,
      startDate: campaigns.startDate,
      endDate: campaigns.endDate,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      
      // Creator info
      creatorName: users.name,
      creatorEmail: users.email,
      
      // Variant count
      variantCount: sql<number>`COUNT(DISTINCT ${campaignVariants.id})`,
    })
    .from(campaigns)
    .leftJoin(users, eq(campaigns.userId, users.id))
    .leftJoin(campaignVariants, eq(campaigns.id, campaignVariants.campaignId))
    .where(eq(campaigns.businessId, businessId))
    .groupBy(campaigns.id)
    .orderBy(desc(campaigns.createdAt));

  return results;
}

/**
 * OPTIMIZED: Batch load variants for multiple campaigns
 * Eliminates N+1 query problem by using inArray
 */
export async function getVariantsByCampaigns(
  campaignIds: number[]
): Promise<Record<number, CampaignVariant[]>> {
  if (campaignIds.length === 0) return {};

  const db = await getDb();
  if (!db) return {};

  // Single query to fetch all variants for multiple campaigns
  const variants = await db
    .select()
    .from(campaignVariants)
    .where(inArray(campaignVariants.campaignId, campaignIds))
    .orderBy(desc(campaignVariants.createdAt));

  // Group variants by campaign ID
  const grouped: Record<number, CampaignVariant[]> = {};
  for (const variant of variants) {
    if (!grouped[variant.campaignId]) {
      grouped[variant.campaignId] = [];
    }
    grouped[variant.campaignId].push(variant);
  }

  return grouped;
}

/**
 * OPTIMIZED: Get campaign with all variants in a single operation
 */
export async function getCampaignWithVariants(id: number) {
  const db = await getDb();
  if (!db) return null;

  // Fetch campaign and variants in parallel
  const [campaignResult, variants] = await Promise.all([
    db
      .select({
        id: campaigns.id,
        businessId: campaigns.businessId,
        userId: campaigns.userId,
        name: campaigns.name,
        description: campaigns.description,
        goal: campaigns.goal,
        targetAudience: campaigns.targetAudience,
        budget: campaigns.budget,
        status: campaigns.status,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        creatorName: users.name,
        creatorEmail: users.email,
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.userId, users.id))
      .where(eq(campaigns.id, id))
      .limit(1),
    db
      .select()
      .from(campaignVariants)
      .where(eq(campaignVariants.campaignId, id))
      .orderBy(desc(campaignVariants.createdAt)),
  ]);

  if (campaignResult.length === 0) return null;

  return {
    ...campaignResult[0],
    variants,
  };
}

// ============================================
// ORIGINAL FUNCTIONS (kept for backward compatibility)
// ============================================

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
  
  const result = await db
    .update(campaigns)
    .set({ status, updatedAt: new Date() })
    .where(inArray(campaigns.id, ids));
  
  return result[0].affectedRows || 0;
}
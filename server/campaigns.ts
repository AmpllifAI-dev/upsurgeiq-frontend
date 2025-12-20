import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  campaigns,
  Campaign,
  InsertCampaign,
  campaignVariants,
  CampaignVariant,
  InsertCampaignVariant,
  campaignTemplates,
  CampaignTemplate,
  InsertCampaignTemplate,
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

// ========================================
// CAMPAIGN TEMPLATES
// ========================================

export async function createCampaignTemplate(data: InsertCampaignTemplate): Promise<CampaignTemplate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(campaignTemplates).values(data);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(campaignTemplates)
    .where(eq(campaignTemplates.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create campaign template");
  return created[0]!;
}

export async function getCampaignTemplateById(id: number): Promise<CampaignTemplate | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(campaignTemplates)
    .where(eq(campaignTemplates.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getCampaignTemplatesByUser(userId: number): Promise<CampaignTemplate[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(campaignTemplates)
    .where(eq(campaignTemplates.userId, userId))
    .orderBy(desc(campaignTemplates.createdAt));
}

export async function getPublicCampaignTemplates(): Promise<CampaignTemplate[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(campaignTemplates)
    .where(eq(campaignTemplates.isPublic, 1))
    .orderBy(desc(campaignTemplates.usageCount));
}

export async function getAllCampaignTemplates(userId: number): Promise<CampaignTemplate[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get both public templates and user's private templates
  const publicTemplates = await db
    .select()
    .from(campaignTemplates)
    .where(eq(campaignTemplates.isPublic, 1));

  const userTemplates = await db
    .select()
    .from(campaignTemplates)
    .where(eq(campaignTemplates.userId, userId));

  // Combine and sort by usage count for public, then by created date for user templates
  return [...publicTemplates, ...userTemplates].sort((a, b) => {
    if (a.isPublic && b.isPublic) {
      return (b.usageCount || 0) - (a.usageCount || 0);
    }
    if (a.isPublic) return -1;
    if (b.isPublic) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function updateCampaignTemplate(
  id: number,
  data: Partial<InsertCampaignTemplate>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(campaignTemplates)
    .set(data)
    .where(eq(campaignTemplates.id, id));
}

export async function deleteCampaignTemplate(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(campaignTemplates)
    .where(eq(campaignTemplates.id, id));
}

export async function incrementTemplateUsage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const template = await getCampaignTemplateById(id);
  if (!template) return;

  await db
    .update(campaignTemplates)
    .set({ usageCount: (template.usageCount || 0) + 1 })
    .where(eq(campaignTemplates.id, id));
}

// ========================================
// CAMPAIGN COLLABORATION
// ========================================

import {
  campaignTeamMembers,
  CampaignTeamMember,
  InsertCampaignTeamMember,
  campaignActivityLog,
  CampaignActivityLog,
  InsertCampaignActivityLog,
  users,
} from "../drizzle/schema";

export async function addCampaignTeamMember(data: {
  campaignId: number;
  userId: number;
  role: "owner" | "editor" | "viewer";
  addedBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [member] = await db.insert(campaignTeamMembers).values(data);
  return member;
}

export async function getCampaignTeamMembers(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const members = await db
    .select({
      id: campaignTeamMembers.id,
      userId: campaignTeamMembers.userId,
      role: campaignTeamMembers.role,
      createdAt: campaignTeamMembers.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(campaignTeamMembers)
    .leftJoin(users, eq(campaignTeamMembers.userId, users.id))
    .where(eq(campaignTeamMembers.campaignId, campaignId));
  return members;
}

export async function removeCampaignTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(campaignTeamMembers).where(eq(campaignTeamMembers.id, id));
}

export async function updateCampaignTeamMemberRole(id: number, role: "owner" | "editor" | "viewer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(campaignTeamMembers)
    .set({ role })
    .where(eq(campaignTeamMembers.id, id));
}

export async function checkCampaignPermission(campaignId: number, userId: number): Promise<"owner" | "editor" | "viewer" | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Check if user is campaign creator
  const [campaign] = await db
    .select({ userId: campaigns.userId })
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);
  
  if (campaign && campaign.userId === userId) {
    return "owner";
  }
  
  // Check team member role
  const [member] = await db
    .select({ role: campaignTeamMembers.role })
    .from(campaignTeamMembers)
    .where(
      and(
        eq(campaignTeamMembers.campaignId, campaignId),
        eq(campaignTeamMembers.userId, userId)
      )
    )
    .limit(1);
  
  return member ? member.role : null;
}

export async function logCampaignActivity(data: {
  campaignId: number;
  userId: number;
  action: string;
  entityType?: string;
  entityId?: number;
  changes?: Record<string, any>;
}) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(campaignActivityLog).values({
    ...data,
    changes: data.changes ? JSON.stringify(data.changes) : undefined,
  });
}

export async function getCampaignActivityLog(campaignId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const activities = await db
    .select({
      id: campaignActivityLog.id,
      action: campaignActivityLog.action,
      entityType: campaignActivityLog.entityType,
      entityId: campaignActivityLog.entityId,
      changes: campaignActivityLog.changes,
      createdAt: campaignActivityLog.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(campaignActivityLog)
    .leftJoin(users, eq(campaignActivityLog.userId, users.id))
    .where(eq(campaignActivityLog.campaignId, campaignId))
    .orderBy(desc(campaignActivityLog.createdAt))
    .limit(limit);
  
  return activities.map((a) => ({
    ...a,
    changes: a.changes ? JSON.parse(a.changes) : null,
  }));
}

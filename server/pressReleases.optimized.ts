import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  pressReleases,
  PressRelease,
  InsertPressRelease,
  socialMediaPosts,
  SocialMediaPost,
  InsertSocialMediaPost,
  users,
  approvalRequests,
} from "../drizzle/schema";

/**
 * OPTIMIZED: Get press releases with related data in a single query
 * Eliminates N+1 query problem by using JOINs
 */
export async function getPressReleasesWithRelatedData(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  // Single query with LEFT JOINs to fetch all related data
  const results = await db
    .select({
      // Press release fields
      id: pressReleases.id,
      businessId: pressReleases.businessId,
      userId: pressReleases.userId,
      title: pressReleases.title,
      subtitle: pressReleases.subtitle,
      content: pressReleases.content,
      status: pressReleases.status,
      scheduledFor: pressReleases.scheduledFor,
      publishedAt: pressReleases.publishedAt,
      createdAt: pressReleases.createdAt,
      updatedAt: pressReleases.updatedAt,
      
      // Creator info (from users table)
      creatorName: users.name,
      creatorEmail: users.email,
      
      // Aggregated counts
      socialPostCount: sql<number>`COUNT(DISTINCT ${socialMediaPosts.id})`,
      approvalRequestCount: sql<number>`COUNT(DISTINCT ${approvalRequests.id})`,
    })
    .from(pressReleases)
    .leftJoin(users, eq(pressReleases.userId, users.id))
    .leftJoin(socialMediaPosts, eq(pressReleases.id, socialMediaPosts.pressReleaseId))
    .leftJoin(approvalRequests, eq(pressReleases.id, approvalRequests.pressReleaseId))
    .where(eq(pressReleases.businessId, businessId))
    .groupBy(pressReleases.id)
    .orderBy(desc(pressReleases.createdAt));

  return results;
}

/**
 * OPTIMIZED: Batch load social media posts for multiple press releases
 * Eliminates N+1 query problem by using inArray
 */
export async function getSocialMediaPostsByPressReleases(
  pressReleaseIds: number[]
): Promise<Record<number, SocialMediaPost[]>> {
  if (pressReleaseIds.length === 0) return {};

  const db = await getDb();
  if (!db) return {};

  // Single query to fetch all posts for multiple press releases
  const posts = await db
    .select()
    .from(socialMediaPosts)
    .where(inArray(socialMediaPosts.pressReleaseId, pressReleaseIds))
    .orderBy(desc(socialMediaPosts.createdAt));

  // Group posts by press release ID
  const grouped: Record<number, SocialMediaPost[]> = {};
  for (const post of posts) {
    if (!grouped[post.pressReleaseId]) {
      grouped[post.pressReleaseId] = [];
    }
    grouped[post.pressReleaseId].push(post);
  }

  return grouped;
}

/**
 * OPTIMIZED: Get press release with all related data
 * Single query with multiple JOINs
 */
export async function getPressReleaseWithDetails(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      // Press release fields
      id: pressReleases.id,
      businessId: pressReleases.businessId,
      userId: pressReleases.userId,
      title: pressReleases.title,
      subtitle: pressReleases.subtitle,
      content: pressReleases.content,
      status: pressReleases.status,
      scheduledFor: pressReleases.scheduledFor,
      publishedAt: pressReleases.publishedAt,
      createdAt: pressReleases.createdAt,
      updatedAt: pressReleases.updatedAt,
      
      // Creator info
      creatorName: users.name,
      creatorEmail: users.email,
    })
    .from(pressReleases)
    .leftJoin(users, eq(pressReleases.userId, users.id))
    .where(eq(pressReleases.id, id))
    .limit(1);

  if (result.length === 0) return null;

  // Fetch related data in parallel
  const [socialPosts, approvals] = await Promise.all([
    db
      .select()
      .from(socialMediaPosts)
      .where(eq(socialMediaPosts.pressReleaseId, id)),
    db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.pressReleaseId, id))
      .orderBy(desc(approvalRequests.createdAt)),
  ]);

  return {
    ...result[0],
    socialMediaPosts: socialPosts,
    approvalRequests: approvals,
  };
}

// ============================================
// ORIGINAL FUNCTIONS (kept for backward compatibility)
// ============================================

export async function createPressRelease(data: InsertPressRelease): Promise<PressRelease> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(pressReleases).values(data);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(pressReleases)
    .where(eq(pressReleases.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create press release");
  return created[0]!;
}

export async function getPressReleasesByBusiness(businessId: number): Promise<PressRelease[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(pressReleases)
    .where(eq(pressReleases.businessId, businessId))
    .orderBy(desc(pressReleases.createdAt));
}

export async function getPressReleaseById(id: number): Promise<PressRelease | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(pressReleases)
    .where(eq(pressReleases.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updatePressRelease(
  id: number,
  updates: Partial<InsertPressRelease>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(pressReleases).set(updates).where(eq(pressReleases.id, id));
}

export async function deletePressRelease(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(pressReleases).where(eq(pressReleases.id, id));
}

export async function createSocialMediaPost(data: InsertSocialMediaPost): Promise<SocialMediaPost> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(socialMediaPosts).values(data);
  const insertedId = Number(result[0].insertId);

  const created = await db
    .select()
    .from(socialMediaPosts)
    .where(eq(socialMediaPosts.id, insertedId))
    .limit(1);

  if (created.length === 0) throw new Error("Failed to create social media post");
  return created[0]!;
}

export async function getSocialMediaPostsByPressRelease(
  pressReleaseId: number
): Promise<SocialMediaPost[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(socialMediaPosts)
    .where(eq(socialMediaPosts.pressReleaseId, pressReleaseId));
}

export async function getSocialMediaPostsByBusiness(
  businessId: number
): Promise<SocialMediaPost[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(socialMediaPosts)
    .where(eq(socialMediaPosts.businessId, businessId))
    .orderBy(desc(socialMediaPosts.createdAt));
}

/**
 * Bulk delete press releases
 */
export async function bulkDeletePressReleases(ids: number[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.delete(pressReleases).where(inArray(pressReleases.id, ids));
  return result[0].affectedRows || 0;
}

/**
 * Bulk update press release status
 */
export async function bulkUpdatePressReleaseStatus(
  ids: number[],
  status: "draft" | "scheduled" | "published" | "archived"
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(pressReleases)
    .set({ status, updatedAt: new Date() })
    .where(inArray(pressReleases.id, ids));
  
  return result[0].affectedRows || 0;
}
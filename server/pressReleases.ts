import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  pressReleases,
  PressRelease,
  InsertPressRelease,
  socialMediaPosts,
  SocialMediaPost,
  InsertSocialMediaPost,
} from "../drizzle/schema";

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
